'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

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
    switch (status) {
      case 'PAID':
        return 'Ödendi';
      case 'PENDING':
        return 'Bekliyor';
      case 'OVERDUE':
        return 'Gecikti';
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'text-green-600 bg-green-100';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'OVERDUE':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
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

    const currentYear = new Date().getFullYear();
    const unpaidPayments = taxpayer.payments.filter(
      p => p.year === currentYear && 
           (p.paymentStatus === 'PENDING' || p.paymentStatus === 'OVERDUE')
    );
    
    const totalDebt = unpaidPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    return {
      totalDebt,
      unpaidMonths: unpaidPayments.length
    };
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
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Ödeme Geçmişi</h2>
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
                        {taxpayer.payments
                          .sort((a, b) => b.year - a.year || b.month - a.month)
                          .map((payment) => (
                            <tr key={payment.id} className="table-row">
                              <td className="table-cell">{payment.year}</td>
                              <td className="table-cell">{getMonthName(payment.month)}</td>
                              <td className="table-cell">
                                ₺{payment.amount.toLocaleString('tr-TR')}
                              </td>
                              <td className="table-cell">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.paymentStatus)}`}>
                                  {getPaymentStatusText(payment.paymentStatus)}
                                </span>
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
