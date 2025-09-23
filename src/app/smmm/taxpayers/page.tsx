'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    const currentPayment = taxpayer.payments.find(
      p => p.year === currentYear && p.month === currentMonth
    );

    if (!currentPayment) return { status: 'pending', text: 'Bekliyor' };
    
    switch (currentPayment.paymentStatus) {
      case 'PAID':
        return { status: 'paid', text: 'Ödendi' };
      case 'OVERDUE':
        return { status: 'overdue', text: 'Gecikti' };
      default:
        return { status: 'pending', text: 'Bekliyor' };
    }
  };

  const getDebtBalance = (taxpayer: Taxpayer) => {
    const currentYear = new Date().getFullYear();
    
    // Bu yıl için bekleyen ve geciken ödemeleri hesapla
    const unpaidPayments = taxpayer.payments.filter(
      p => p.year === currentYear && 
           (p.paymentStatus === 'PENDING' || p.paymentStatus === 'OVERDUE')
    );
    
    const totalDebt = unpaidPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    return {
      totalDebt,
      unpaidMonths: unpaidPayments.length,
      hasDebt: totalDebt > 0
    };
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mükellef Yönetimi</h1>
              <p className="text-sm text-gray-600">Mükellef listesi ve yönetimi</p>
            </div>
            <div className="flex items-center space-x-4">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Ad Soyad</th>
                      <th className="table-header-cell hidden xl:table-cell">Şirket Ünvanı</th>
                      <th className="table-header-cell">TC No</th>
                      <th className="table-header-cell hidden xl:table-cell">Vergi No</th>
                      <th className="table-header-cell hidden lg:table-cell">E-posta</th>
                      <th className="table-header-cell hidden lg:table-cell">Telefon</th>
                      <th className="table-header-cell">Aylık Ücret</th>
                      <th className="table-header-cell">Ödeme Durumu</th>
                      <th className="table-header-cell">Borç Bakiyesi</th>
                      <th className="table-header-cell hidden md:table-cell">Durum</th>
                      <th className="table-header-cell">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {taxpayers.map((taxpayer) => {
                      const paymentStatus = getPaymentStatus(taxpayer);
                      const debtBalance = getDebtBalance(taxpayer);
                      return (
                        <tr key={taxpayer.id} className="table-row">
                          <td className="table-cell font-medium">
                            {taxpayer.firstName} {taxpayer.lastName}
                          </td>
                          <td className="table-cell hidden xl:table-cell">
                            {taxpayer.companyName || '-'}
                          </td>
                          <td className="table-cell">{taxpayer.tcNumber}</td>
                          <td className="table-cell hidden xl:table-cell">{taxpayer.taxNumber || '-'}</td>
                          <td className="table-cell hidden lg:table-cell">{taxpayer.email || '-'}</td>
                          <td className="table-cell hidden lg:table-cell">{taxpayer.phone || '-'}</td>
                          <td className="table-cell">
                            ₺{taxpayer.monthlyFee.toLocaleString('tr-TR')}
                          </td>
                          <td className="table-cell">
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
                                  {debtBalance.unpaidMonths} ay
                                </div>
                              </div>
                            ) : (
                              <span className="text-green-600 font-medium">Temiz</span>
                            )}
                          </td>
                          <td className="table-cell hidden md:table-cell">
                            <span className={`badge ${taxpayer.isActive ? 'badge-success' : 'badge-danger'}`}>
                              {taxpayer.isActive ? 'Aktif' : 'Pasif'}
                            </span>
                          </td>
                          <td className="table-cell">
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
                                className="btn btn-outline btn-sm"
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
