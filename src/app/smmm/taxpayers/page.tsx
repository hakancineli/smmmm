'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { useRef } from 'react';

interface Taxpayer {
  id: string;
  tcNumber: string;
  taxNumber?: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  email?: string;
  phone?: string;
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
  }[];
  charges?: {
    id: string;
    amount: number;
    status: string;
  }[];
  earsivCredential?: { userCode: string } | null;
}

interface PaginatedResponse {
  data: Taxpayer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function TaxpayersPage() {
  const [taxpayers, setTaxpayers] = useState<Taxpayer[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('accessToken');
    const userType = localStorage.getItem('userType');
    
    if (!token || userType !== 'smmm') {
      router.push('/smmm/login');
      return;
    }

    loadTaxpayers();
  }, [router, pagination.page, search]);

  const loadTaxpayers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`/api/smmm/taxpayers?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: PaginatedResponse = await response.json();
        setTaxpayers(data.data);
        setPagination(data.pagination);
      } else {
        setError('Mükellefler yüklenemedi');
      }
    } catch (error) {
      setError('Sunucu hatası');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    router.push('/smmm/login');
  };

  const getPaymentStatus = (taxpayer: Taxpayer) => {
    const now = new Date();
    const overdueDay = 20; // Ayın 20'sinden sonra ödenmemişse "Gecikti"
    // Hedef ay: içinde bulunulan aydan bir önceki ay
    const target = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const targetYear = target.getFullYear();
    const targetMonth = target.getMonth() + 1; // 1-12

    const payment = taxpayer.payments.find(
      p => p.year === targetYear && p.month === targetMonth
    );

    // Önceki ay için durum
    if (payment) {
      if (payment.paymentStatus === 'PAID') return { status: 'paid', text: 'Ödendi' };
      if (payment.paymentStatus === 'OVERDUE') return { status: 'overdue', text: 'Gecikti' };
      // PENDING
      return now.getDate() > overdueDay
        ? { status: 'overdue', text: 'Gecikti' }
        : { status: 'pending', text: 'Bekliyor' };
    }

    // Kayıt yoksa: önceki ay ödenmemiş kabul edilir → 20'sinden sonra "Gecikti",
    // içinde bulunduğumuz ay için asla "Gecikti" demeyiz
    return now.getDate() > overdueDay
      ? { status: 'overdue', text: 'Gecikti' }
      : { status: 'pending', text: 'Bekliyor' };
  };

  const getDebtBalance = (taxpayer: Taxpayer) => {
    const now = new Date();
    const monthlyFee = Number((taxpayer as any).monthlyFee || 0);
    const payments = (taxpayer as any).payments || [];
    const charges = (taxpayer as any).charges || [];

    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const year = prev.getFullYear();
    const prevMonth = prev.getMonth() + 1;
    const createdAt = new Date((taxpayer as any).createdAt || now);
    const createdYear = createdAt.getFullYear();
    const startMonth = createdYear === year ? Math.max(1, createdAt.getMonth() + 1) : 1;

    let totalDebt = 0;
    let monthsCount = 0;

    // Geçmiş aylar (1..prevMonth)
    for (let m = startMonth; m <= prevMonth; m++) {
      const paidSum = payments
        .filter((p: any) => p.year === year && p.month === m)
        .reduce((s: number, p: any) => s + Number(p.amount || 0), 0);
      const remaining = Math.max(monthlyFee - paidSum, 0);
      if (remaining > 0) monthsCount += 1;
      totalDebt += remaining;
    }

    // Gelecek ay(lar) için kayıt varsa kısmi kalanlar
    const futureMonthsSet = new Set<number>(
      payments.filter((p: any) => p.year === year && p.month > prevMonth).map((p: any) => p.month)
    );
    futureMonthsSet.forEach((m) => {
      const paidSum = payments
        .filter((p: any) => p.year === year && p.month === m)
        .reduce((s: number, p: any) => s + Number(p.amount || 0), 0);
      const remaining = Math.max(monthlyFee - paidSum, 0);
      if (remaining > 0) monthsCount += 1;
      totalDebt += remaining;
    });

    // Önceki ay için hiç kayıt yoksa, varsayılan aylık ücret
    const hasPrevRecord = payments.some((p: any) => p.year === year && p.month === prevMonth);
    const prevMonthStart = new Date(year, prevMonth - 1, 1);
    if (!hasPrevRecord && createdAt <= prevMonthStart) {
      totalDebt += monthlyFee;
      monthsCount += 1;
    }

    // İçinde bulunulan ayın kalanı
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentPaidSum = payments
      .filter((p: any) => p.year === currentYear && p.month === currentMonth)
      .reduce((s: number, p: any) => s + Number(p.amount || 0), 0);
    const currentRemaining = Math.max(monthlyFee - currentPaidSum, 0);
    if (currentRemaining > 0) monthsCount += 1;
    totalDebt += currentRemaining;

    // Bekleyen serbest kalemler
    const pendingCharges = (charges || [])
      .filter((c: any) => String(c.status).toUpperCase() !== 'PAID')
      .reduce((s: number, c: any) => s + Number(c.amount || 0), 0);
    totalDebt += pendingCharges;

    const hasDebt = totalDebt > 0;
    const unpaidMonths = hasDebt ? monthsCount : 0;
    return { totalDebt, unpaidMonths, hasDebt };
  };

  // Türkçe karakterleri normalize et
  const normalize = (text: string) => {
    return text
      .replace(/Ş/g, 'S').replace(/ş/g, 's')
      .replace(/İ/g, 'I').replace(/ı/g, 'i')
      .replace(/Ç/g, 'C').replace(/ç/g, 'c')
      .replace(/Ğ/g, 'G').replace(/ğ/g, 'g')
      .replace(/Ö/g, 'O').replace(/ö/g, 'o')
      .replace(/Ü/g, 'U').replace(/ü/g, 'u')
      .replace(/₺/g, 'TL ');
  };

  const exportToExcel = () => {
    const headers = [
      'Ad Soyad',
      'Şirket Ünvanı',
      'TC No',
      'Vergi No',
      'E-posta',
      'Telefon',
      'Aylık Ücret',
      'Ödeme Durumu',
      'Borç Bakiyesi',
      'Durum'
    ];

    const csvContent = [
      headers.join(','),
      ...taxpayers.map(taxpayer => {
        const paymentStatus = getPaymentStatus(taxpayer);
        const debtBalance = getDebtBalance(taxpayer);
        
        return [
          `"${taxpayer.firstName} ${taxpayer.lastName}"`,
          `"${taxpayer.companyName || ''}"`,
          taxpayer.tcNumber,
          `"${taxpayer.taxNumber || ''}"`,
          `"${taxpayer.email || ''}"`,
          `"${taxpayer.phone || ''}"`,
          taxpayer.monthlyFee,
          `"${paymentStatus.text}"`,
          debtBalance.hasDebt ? debtBalance.totalDebt : 0,
          `"${taxpayer.isActive ? 'Aktif' : 'Pasif'}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `mukellef-listesi-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const { width, height } = page.getSize();
      const margin = 50;
      const tableWidth = width - (margin * 2);
      const rowHeight = 20;
      const headerHeight = 25;

      // Başlık
      page.drawText('Mükellef Listesi', {
        x: margin,
        y: height - margin - 20,
        size: 16,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      // Tarih
      page.drawText(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, {
        x: margin,
        y: height - margin - 40,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });

      // Tablo başlıkları
      const headers = [
        'Ad Soyad',
        'TC No',
        'Şirket',
        'E-posta',
        'Aylık Ücret',
        'Durum'
      ];

      const colWidths = [120, 80, 100, 120, 80, 60];
      let currentX = margin;

      // Header row
      headers.forEach((header, index) => {
        page.drawRectangle({
          x: currentX,
          y: height - margin - 60 - headerHeight,
          width: colWidths[index],
          height: headerHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 0.5,
        });

        page.drawText(normalize(header), {
          x: currentX + 5,
          y: height - margin - 60 - headerHeight + 5,
          size: 8,
          font: boldFont,
          color: rgb(0, 0, 0),
        });

        currentX += colWidths[index];
      });

      // Data rows
      let currentY = height - margin - 60 - headerHeight;
      taxpayers.slice(0, 30).forEach((taxpayer, rowIndex) => { // İlk 30 kayıt
        if (currentY < margin + 50) {
          // Yeni sayfa ekle
          const newPage = pdfDoc.addPage([595.28, 841.89]);
          currentY = newPage.getSize().height - margin - 20;
        }

        const paymentStatus = getPaymentStatus(taxpayer);
        const debtBalance = getDebtBalance(taxpayer);
        
        const rowData = [
          `${taxpayer.firstName} ${taxpayer.lastName}`,
          taxpayer.tcNumber,
          taxpayer.companyName || '-',
          taxpayer.email || '-',
          `TL ${taxpayer.monthlyFee.toLocaleString('tr-TR')}`,
          paymentStatus.text
        ];

        currentX = margin;
        rowData.forEach((data, colIndex) => {
          page.drawRectangle({
            x: currentX,
            y: currentY - rowHeight,
            width: colWidths[colIndex],
            height: rowHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 0.5,
          });

          page.drawText(normalize(data), {
            x: currentX + 5,
            y: currentY - rowHeight + 5,
            size: 7,
            font: font,
            color: rgb(0, 0, 0),
          });

          currentX += colWidths[colIndex];
        });

        currentY -= rowHeight;
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `mukellef-listesi-${new Date().toISOString().split('T')[0]}.pdf`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('PDF export error:', error);
      alert('PDF oluşturulurken hata oluştu');
    }
  };

  const downloadCsvTemplate = () => {
    const headers = [
      'Ad','Soyad','Şirket Ünvanı','TC No','Vergi No','E-posta','Telefon','Aylık Ücret','Vedop Kullanıcı Kodu','Vedop Şifre'
    ];
    // Excel/TR için UTF-8 BOM ve noktalı virgül ayracı kullan
    const csv = "\ufeff" + headers.join(';') + '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = 'mukellef_sablon.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const openImportDialog = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) return alert('Boş dosya');
      const delimiter = lines[0].includes(';') ? ';' : ',';
      const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase());
      const idx = (name: string) => headers.indexOf(name.toLowerCase());
      const colAd = idx('ad');
      const colSoyad = idx('soyad');
      const colSirket = idx('şirket ünvanı');
      const colTC = idx('tc no');
      const colVergi = idx('vergi no');
      const colEmail = idx('e-posta');
      const colTel = idx('telefon');
      const colUcret = idx('aylık ücret');
      const colVedopUser = idx('vedop kullanıcı kodu');
      const colVedopPass = idx('vedop şifre');
      // Zorunlu başlık: TC No ve Aylık Ücret; ayrıca (Ad+Soyad) veya (Şirket Ünvanı)
      const hasNameCols = colAd >= 0 && colSoyad >= 0;
      const hasCompanyCol = colSirket >= 0;
      if (colUcret < 0 || (!hasNameCols && !hasCompanyCol)) {
        // Şablon genel kontrolü: Aylık Ücret ve (Ad+Soyad) veya (Şirket Ünvanı) olmalı
        return alert('Zorunlu: Aylık Ücret ve (Ad+Soyad) veya (Şirket Ünvanı)');
      }
      const token = localStorage.getItem('accessToken');
      for (let i=1;i<lines.length;i++) {
        const row = lines[i].split(delimiter);
        const firstName = colAd>=0 ? (row[colAd]?.trim() || '') : '';
        const lastName = colSoyad>=0 ? (row[colSoyad]?.trim() || '') : '';
        const tcNumber = colTC>=0 ? (row[colTC]?.trim() || '') : '';
        const monthlyFee = Number((row[colUcret] || '0').toString().replace(/[^0-9.,]/g,'').replace(',','.')) || 0;
        const taxNumber = colVergi>=0 ? (row[colVergi]?.trim() || undefined) : undefined;
        const companyName = colSirket>=0 ? (row[colSirket]?.trim() || undefined) : undefined;
        const email = colEmail>=0 ? (row[colEmail]?.trim() || undefined) : undefined;
        const phone = colTel>=0 ? (row[colTel]?.trim() || undefined) : undefined;
        const vedopUser = colVedopUser>=0 ? (row[colVedopUser]?.trim() || '') : '';
        const vedopPass = colVedopPass>=0 ? (row[colVedopPass]?.trim() || '') : '';

        // Satır bazında: (Ad+Soyad) veya (Şirket Ünvanı) zorunlu
        const hasName = (!!firstName && !!lastName);
        const hasCompany = !!companyName;
        if (!hasName && !hasCompany) {
          // Bu satırı atla; kullanıcıya bilgi verilebilir
          continue;
        }
        // Kimlik: TC veya Vergi No'dan en az biri olmalı
        if (!tcNumber && !taxNumber) continue;

        // Create taxpayer
        const res = await fetch('/api/smmm/taxpayers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ firstName, lastName, tcNumber, taxNumber, companyName, email, phone, monthlyFee })
        });
        if (res.ok) {
          const data = await res.json();
          const taxpayerId = data?.data?.id;
          if (taxpayerId && vedopUser && vedopPass) {
            await fetch('/api/smmm/earsiv/credentials', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ taxpayerId, userCode: vedopUser, password: vedopPass })
            });
          }
        }
      }
      alert('İçe aktarma tamamlandı');
      setPagination(prev => ({ ...prev })); // refresh
      await loadTaxpayers();
    } catch (err) {
      console.error(err);
      alert('İçe aktarma sırasında hata oluştu');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (isLoading && taxpayers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mükellef Yönetimi</h1>
              <p className="text-sm text-gray-600">Mükellef listesi ve yönetimi</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportToExcel}
                className="btn btn-outline"
                disabled={taxpayers.length === 0}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Excel
              </button>
              <button
                onClick={exportToPDF}
                className="btn btn-outline"
                disabled={taxpayers.length === 0}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                PDF
              </button>
              <button onClick={openImportDialog} className="btn btn-outline">
                İçe Aktar (CSV)
              </button>
              <button onClick={downloadCsvTemplate} className="btn btn-outline">
                Şablon
              </button>
              <Link href="/smmm/dashboard" className="btn btn-outline">
                Dashboard
              </Link>
              <Link href="/smmm/taxpayers/new" className="btn btn-primary">
                Yeni Mükellef
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-outline"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImportFile} />
        {/* Search and Filters */}
        <div className="card mb-6">
          <div className="card-body">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Ad, soyad, şirket ünvanı, TC No veya e-posta ile ara..."
                  className="input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Ara
              </button>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="btn btn-outline"
                >
                  Temizle
                </button>
              )}
            </form>
          </div>
        </div>

        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 mb-6 rounded-md">
            {error}
          </div>
        )}

        {/* Taxpayers Table */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">
              Mükellefler ({pagination.total})
            </h2>
          </div>
          <div className="card-body p-0">
            {taxpayers.length === 0 ? (
              <div className="empty-state py-12">
                <div className="empty-state-icon">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="empty-state-title">Henüz mükellef yok</h3>
                <p className="empty-state-description">
                  İlk mükellefinizi eklemek için yukarıdaki butona tıklayın.
                </p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="table w-full">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell sticky left-0 z-10 bg-white">Ad Soyad</th>
                      <th className="table-header-cell">Şirket Ünvanı</th>
                      <th className="table-header-cell">TC No</th>
                      <th className="table-header-cell hidden xl:table-cell">Vergi No</th>
                      <th className="table-header-cell hidden lg:table-cell">E-posta</th>
                      <th className="table-header-cell hidden xl:table-cell">Telefon</th>
                      <th className="table-header-cell">Aylık Ücret</th>
                      <th className="table-header-cell">Ödeme Durumu</th>
                      <th className="table-header-cell">Borç Bakiyesi</th>
                      <th className="table-header-cell">Durum</th>
                      <th className="table-header-cell hidden md:table-cell">E‑Arşiv</th>
                      <th className="table-header-cell sticky right-0 z-10 bg-white">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {taxpayers.map((taxpayer) => {
                      const paymentStatus = getPaymentStatus(taxpayer);
                      const debtBalance = getDebtBalance(taxpayer);
                      return (
                        <tr key={taxpayer.id} className="table-row">
                          <td className="table-cell font-medium sticky left-0 z-0 bg-white break-words whitespace-normal">
                            {taxpayer.firstName} {taxpayer.lastName}
                          </td>
                          <td className="table-cell break-words whitespace-normal">
                            {taxpayer.companyName || '-'}
                          </td>
                          <td className="table-cell break-words whitespace-normal">{taxpayer.tcNumber}</td>
                          <td className="table-cell break-words whitespace-normal hidden xl:table-cell">{taxpayer.taxNumber || '-'}</td>
                          <td className="table-cell break-words whitespace-normal hidden lg:table-cell">{taxpayer.email || '-'}</td>
                          <td className="table-cell break-words whitespace-normal hidden xl:table-cell">{taxpayer.phone || '-'}</td>
                          <td className="table-cell break-words whitespace-normal">
                            ₺{taxpayer.monthlyFee.toLocaleString('tr-TR')}
                          </td>
                          <td className="table-cell break-words whitespace-normal">
                            <span className={`badge ${
                              paymentStatus.status === 'paid' ? 'badge-success' :
                              paymentStatus.status === 'overdue' ? 'badge-danger' :
                              'badge-warning'
                            }`}>
                              {paymentStatus.text}
                            </span>
                          </td>
                          <td className="table-cell">
                            {debtBalance.hasDebt ? (
                              <div className="text-right">
                                <div className="text-red-600 font-semibold">
                                  ₺{debtBalance.totalDebt.toLocaleString('tr-TR')}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Toplam: ₺{debtBalance.totalDebt.toLocaleString('tr-TR')} • {debtBalance.unpaidMonths} ay
                                </div>
                              </div>
                            ) : (
                              <span className="text-green-600 font-medium">Temiz</span>
                            )}
                          </td>
                          <td className="table-cell">
                            <span className={`badge ${taxpayer.isActive ? 'badge-success' : 'badge-danger'}`}>
                              {taxpayer.isActive ? 'Aktif' : 'Pasif'}
                            </span>
                          </td>
                          <td className="table-cell hidden md:table-cell">
                            {taxpayer.earsivCredential?.userCode ? (
                              <span className="text-green-600 text-xs">Tanımlı ({taxpayer.earsivCredential.userCode})</span>
                            ) : (
                              <Link href={`/smmm/taxpayers/${taxpayer.id}`} className="text-primary-600 text-xs underline">Bilgi Gir</Link>
                            )}
                          </td>
                          <td className="table-cell sticky right-0 z-0 bg-white">
                            <div className="flex space-x-2">
                              <Link
                                href={`/smmm/taxpayers/${taxpayer.id}`}
                                className="btn btn-outline btn-sm"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Detay
                              </Link>
                              <Link
                                href={`/smmm/taxpayers/${taxpayer.id}/edit`}
                                className="btn btn-primary btn-sm"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Düzenle
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={!pagination.hasPrev}
              className="btn btn-outline"
            >
              Önceki
            </button>
            
            <span className="text-sm text-gray-600">
              Sayfa {pagination.page} / {pagination.totalPages}
            </span>
            
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={!pagination.hasNext}
              className="btn btn-outline"
            >
              Sonraki
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
