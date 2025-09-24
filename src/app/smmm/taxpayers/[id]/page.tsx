'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { PDFDocument, StandardFonts } from 'pdf-lib';

interface Taxpayer {
  id: string;
  tcNumber: string;
  taxNumber?: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  monthlyFee: number;
  isActive: boolean;
  createdAt: string;
  payments: {
    id: string;
    year: number;
    month: number;
    amount: number;
    paymentStatus: string;
    paymentDate?: string;
    notes?: string;
  }[];
  charges?: {
    id: string;
    title: string;
    type?: string;
    amount: number;
    status: string;
    dueDate?: string;
    createdAt: string;
  }[];
}

export default function TaxpayerDetailPage() {
  const [taxpayer, setTaxpayer] = useState<Taxpayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();
  const taxpayerId = params.id as string;

  useEffect(() => {
    if (taxpayerId) {
      loadTaxpayerDetail();
    }
  }, [taxpayerId]);

  const loadTaxpayerDetail = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/smmm/login');
        return;
      }

      const response = await fetch(`/api/smmm/taxpayers/${taxpayerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTaxpayer(data.taxpayer);
      } else {
        setError('Mükellef bilgileri yüklenemedi');
      }
    } catch (error) {
      setError('Sunucu hatası');
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentStatusText = (status: string) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'PAID':
        return 'Ödendi';
      case 'OVERDUE':
        return 'Gecikti';
      case 'PENDING':
      default:
        return 'Bekliyor';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'PAID':
        return 'text-green-600 bg-green-100';
      case 'OVERDUE':
        return 'text-red-600 bg-red-100';
      case 'PENDING':
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return months[month - 1];
  };

  const getDebtSummary = () => {
    if (!taxpayer) return { totalDebt: 0, unpaidMonths: 0 };

    // Borç hesabı aylık bazda yapılır. Her ay için (geçmiş aylar),
    // aylık ücret − o ayın ödenmiş toplamı. Negatif ise 0 kabul edilir.
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const targetYear = prev.getFullYear();
    const targetMonth = prev.getMonth() + 1;

    let totalDebt = 0;
    let unpaidMonths = 0;

    for (let m = 1; m <= targetMonth; m++) {
      const paidSumForMonth = (taxpayer.payments || [])
        .filter(p => p.year === targetYear && p.month === m && p.paymentStatus === 'PAID')
        .reduce((s, p) => s + Number(p.amount || 0), 0);
      const monthlyDebt = Math.max(Number(taxpayer.monthlyFee || 0) - paidSumForMonth, 0);
      if (monthlyDebt > 0) {
        totalDebt += monthlyDebt;
        unpaidMonths += 1;
      }
    }

    // Yeni Kalem (serbest kalem) bekleyenler de borca eklenir
    const pendingCharges = (taxpayer.charges || [])
      .filter(ch => String(ch.status).toUpperCase() !== 'PAID')
      .reduce((s, ch) => s + Number(ch.amount || 0), 0);

    return { totalDebt: totalDebt + pendingCharges, unpaidMonths };
  };

  const exportPaymentsAsCSV = () => {
    if (!taxpayer) return;
    const headers = ['Yıl', 'Ay', 'Tutar', 'Durum', 'Ödeme Tarihi'];
    const months = [
      'Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'
    ];
    const rows = taxpayer.payments
      .sort((a,b)=> b.year - a.year || b.month - a.month)
      .map(p => [
        p.year,
        months[p.month-1],
        (Number(p.amount)||0).toString().replace('.', ','),
        getPaymentStatusText(p.paymentStatus),
        p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('tr-TR') : ''
      ]);

    const csv = [headers, ...rows]
      .map(r => r.map(field => `"${String(field).replace(/"/g,'""')}"`).join(';'))
      .join('\n');

    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${taxpayer.firstName}_${taxpayer.lastName}_odeme_gecmisi.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPaymentsAsPDF = async () => {
    if (!taxpayer) return;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const normalize = (t: string) =>
      t
        .replace(/Ş/g, 'S')
        .replace(/ş/g, 's')
        .replace(/İ/g, 'I')
        .replace(/ı/g, 'i')
        .replace(/Ç/g, 'C')
        .replace(/ç/g, 'c')
        .replace(/Ğ/g, 'G')
        .replace(/ğ/g, 'g')
        .replace(/Ö/g, 'O')
        .replace(/ö/g, 'o')
        .replace(/Ü/g, 'U')
        .replace(/ü/g, 'u')
        .replace(/₺/g, 'TL ');
    let y = 800;
    const left = 40;
    const lineHeight = 16;
    const title = `${taxpayer.firstName} ${taxpayer.lastName} - Ödeme Geçmişi`;
    page.drawText(normalize(title), { x: left, y, size: 14, font });
    y -= 24;
    const headers = ['Yıl', 'Ay', 'Tutar', 'Durum', 'Ödeme Tarihi'];
    page.drawText(normalize(headers.join('    ')), { x: left, y, size: 10, font });
    y -= 12;
    page.drawLine({ start: { x: left, y }, end: { x: 555, y }, thickness: 0.5 });
    y -= 14;
    const months = [
      'Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'
    ];
    taxpayer.payments
      .sort((a,b)=> b.year - a.year || b.month - a.month)
      .forEach(p => {
        const cols = [
          String(p.year),
          months[p.month-1],
          `₺${Number(p.amount||0).toLocaleString('tr-TR')}`,
          getPaymentStatusText(p.paymentStatus),
          p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('tr-TR') : ''
        ];
        page.drawText(normalize(cols.join('    ')), { x: left, y, size: 10, font });
        y -= lineHeight;
        if (y < 60) {
          y = 800;
          const newPage = pdfDoc.addPage([595.28, 841.89]);
          newPage.drawText(normalize(title), { x: left, y, size: 14, font });
          y -= 24;
          newPage.drawText(normalize(headers.join('    ')), { x: left, y, size: 10, font });
          y -= 12;
          newPage.drawLine({ start: { x: left, y }, end: { x: 555, y }, thickness: 0.5 });
          y -= 14;
        }
      });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${taxpayer.firstName}_${taxpayer.lastName}_odeme_gecmisi.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error || !taxpayer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Hata</h2>
          <p className="text-gray-600 mb-4">{error || 'Mükellef bulunamadı'}</p>
          <Link href="/smmm/taxpayers" className="btn btn-primary">
            Mükellef Listesine Dön
          </Link>
        </div>
      </div>
    );
  }

  const debtSummary = getDebtSummary();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {taxpayer.firstName} {taxpayer.lastName}
              </h1>
              <p className="text-sm text-gray-600">Mükellef Detayları</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/smmm/taxpayers" className="btn btn-outline">
                Geri Dön
              </Link>
              <Link 
                href={`/smmm/taxpayers/${taxpayer.id}/edit`} 
                className="btn btn-primary"
              >
                Düzenle
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Kolon - Mükellef Bilgileri */}
          <div className="lg:col-span-2 space-y-6">
            {/* Temel Bilgiler */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Temel Bilgiler</h2>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ad Soyad
                    </label>
                    <p className="text-gray-900">{taxpayer.firstName} {taxpayer.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Şirket Ünvanı
                    </label>
                    <p className="text-gray-900">{taxpayer.companyName || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      TC Kimlik No
                    </label>
                    <p className="text-gray-900">{taxpayer.tcNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vergi No
                    </label>
                    <p className="text-gray-900">{taxpayer.taxNumber || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-posta
                    </label>
                    <p className="text-gray-900">{taxpayer.email || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon
                    </label>
                    <p className="text-gray-900">{taxpayer.phone || '-'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adres
                    </label>
                    <p className="text-gray-900">{taxpayer.address || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ödeme Geçmişi */}
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Ödeme Geçmişi</h2>
                <div className="flex items-center space-x-2">
                  <button className="btn btn-outline btn-sm" onClick={exportPaymentsAsCSV}>Excel</button>
                  <button className="btn btn-outline btn-sm" onClick={exportPaymentsAsPDF}>PDF</button>
                </div>
              </div>
              <div className="card-body">
                {taxpayer.payments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead className="table-header">
                        <tr>
                          <th className="table-header-cell">Yıl</th>
                          <th className="table-header-cell">Ay</th>
                          <th className="table-header-cell">Tutar</th>
                          <th className="table-header-cell">Durum</th>
                          <th className="table-header-cell">Ödeme Tarihi</th>
                        </tr>
                      </thead>
                      <tbody className="table-body">
                        {(() => {
                          const list = [...taxpayer.payments];
                          const monthlyFee = Number(taxpayer.monthlyFee || 0);
                          const now = new Date();
                          // Tüm yıl-aylar için kısmi ödeme kalanı sanal satır ekle
                          const key = (y: number, m: number) => `${y}-${m}`;
                          const uniqMonths = new Set<string>();
                          list.forEach(p => uniqMonths.add(key(p.year, p.month)));
                          uniqMonths.forEach(k => {
                            const [yStr, mStr] = k.split('-');
                            const y = Number(yStr); const m = Number(mStr);
                            const paidSum = list
                              .filter(p => p.year === y && p.month === m && p.paymentStatus === 'PAID')
                              .reduce((s, p) => s + Number(p.amount || 0), 0);
                            const remaining = Math.max(monthlyFee - paidSum, 0);
                            if (remaining > 0) {
                              const monthDate = new Date(y, m - 1, 21);
                              const isOverdue = now > monthDate;
                              list.push({
                                id: `virtual-${taxpayer.id}-${y}-${m}`,
                                year: y,
                                month: m,
                                amount: remaining,
                                paymentStatus: isOverdue ? 'OVERDUE' : 'PENDING',
                                paymentDate: undefined,
                                notes: 'Kalan bakiye',
                              });
                            }
                          });
                          return list.sort((a,b)=> b.year - a.year || b.month - a.month);
                        })()
                          .map((payment) => (
                            <tr key={payment.id} className="table-row">
                              <td className="table-cell">{payment.year}</td>
                              <td className="table-cell">{getMonthName(payment.month)}</td>
                              <td className="table-cell">
                                ₺{Number(payment.amount || 0).toLocaleString('tr-TR')}
                              </td>
                              <td className="table-cell">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.paymentStatus)}`}>
                                    {getPaymentStatusText(payment.paymentStatus)}
                                  </span>
                                  {String(payment.paymentStatus || 'PENDING').toUpperCase() !== 'PAID' && (
                                    <button
                                      className="btn btn-outline btn-xs"
                                      onClick={async () => {
                                        try {
                                          const token = localStorage.getItem('accessToken');
                                          const isVirtual = payment.id.startsWith('virtual-');
                                          const res = isVirtual
                                            ? await fetch('/api/smmm/payments', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                                body: JSON.stringify({
                                                  taxpayerId: taxpayer.id,
                                                  year: payment.year,
                                                  month: payment.month,
                                                  amount: Number(payment.amount || 0),
                                                  paymentStatus: 'PAID',
                                                  paymentDate: new Date().toISOString().split('T')[0],
                                                  notes: payment.notes || ''
                                                })
                                              })
                                            : await fetch(`/api/smmm/payments/${payment.id}`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                                body: JSON.stringify({ paymentStatus: 'PAID' })
                                              });
                                          if (res.ok) {
                                            await loadTaxpayerDetail();
                                          }
                                        } catch (e) {}
                                      }}
                                    >
                                      Ödendi İşaretle
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="table-cell">
                                {payment.paymentDate 
                                  ? new Date(payment.paymentDate).toLocaleDateString('tr-TR')
                                  : '-'
                                }
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Henüz ödeme kaydı bulunmuyor.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bekleyen Serbest Kalemler */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Bekleyen Serbest Kalemler ({taxpayer.charges?.length || 0})</h2>
              </div>
              <div className="card-body p-0">
                {!taxpayer.charges || taxpayer.charges.length === 0 ? (
                  <div className="empty-state py-6">
                    <h3 className="empty-state-title">Bekleyen kalem yok</h3>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table text-sm">
                      <thead className="table-header">
                        <tr>
                          <th className="table-header-cell px-3 py-2">Başlık</th>
                          <th className="table-header-cell hidden md:table-cell px-3 py-2">Tip</th>
                          <th className="table-header-cell px-3 py-2">Tutar</th>
                          <th className="table-header-cell hidden sm:table-cell px-3 py-2">Vade</th>
                          <th className="table-header-cell px-3 py-2">Durum</th>
                          <th className="table-header-cell px-3 py-2">İşlem</th>
                        </tr>
                      </thead>
                      <tbody className="table-body">
                        {taxpayer.charges!.map((ch) => (
                          <tr key={ch.id} className="table-row">
                            <td className="table-cell px-3 py-2">{ch.title}</td>
                            <td className="table-cell hidden md:table-cell px-3 py-2">{ch.type || '-'}</td>
                            <td className="table-cell whitespace-nowrap px-3 py-2">₺{Number(ch.amount).toLocaleString('tr-TR')}</td>
                            <td className="table-cell hidden sm:table-cell px-3 py-2">{ch.dueDate ? new Date(ch.dueDate).toLocaleDateString('tr-TR') : '-'}</td>
                            <td className="table-cell px-3 py-2">
                              {ch.status === 'PAID' ? (
                                <span className="badge badge-success">Ödendi</span>
                              ) : ch.status === 'CANCELLED' ? (
                                <span className="badge badge-gray">İptal</span>
                              ) : (
                                <span className="badge badge-warning">Bekliyor</span>
                              )}
                            </td>
                            <td className="table-cell px-3 py-2">
                              {ch.status !== 'PAID' && (
                                <button
                                  className="btn btn-outline btn-sm whitespace-nowrap"
                                  onClick={async () => {
                                    try {
                                      const token = localStorage.getItem('accessToken');
                                      const res = await fetch(`/api/smmm/charges/${ch.id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                        body: JSON.stringify({ status: 'PAID' })
                                      });
                                      if (res.ok) {
                                        await loadTaxpayerDetail();
                                      }
                                    } catch (e) {}
                                  }}
                                >
                                  Ödendi İşaretle
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sağ Kolon - Özet Bilgiler */}
          <div className="space-y-6">
            {/* Özet Kartları */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Özet</h2>
              </div>
              <div className="card-body space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Aylık Ücret:</span>
                  <span className="font-semibold text-gray-900">
                    ₺{taxpayer.monthlyFee.toLocaleString('tr-TR')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Durum:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    taxpayer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {taxpayer.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Toplam Borç:</span>
                  <span className={`font-semibold ${
                    debtSummary.totalDebt > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    ₺{debtSummary.totalDebt.toLocaleString('tr-TR')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ödenmemiş Ay:</span>
                  <span className="font-semibold text-gray-900">
                    {debtSummary.unpaidMonths} ay
                  </span>
                </div>
              </div>
            </div>

            {/* Hızlı İşlemler */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Hızlı İşlemler</h2>
              </div>
              <div className="card-body space-y-3">
                <Link 
                  href={`/smmm/payments/new?taxpayerId=${taxpayer.id}`}
                  className="btn btn-primary w-full"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Ödeme Kaydet
                </Link>
                <Link 
                  href={`/smmm/charges/new?taxpayerId=${taxpayer.id}`}
                  className="btn btn-outline w-full"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                  </svg>
                  Yeni Kalem
                </Link>
                <Link 
                  href={`/smmm/edevlet-credentials?taxpayerId=${taxpayer.id}`}
                  className="btn btn-outline w-full"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  E-Devlet Şifreleri
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
