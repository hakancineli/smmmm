'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Payment {
  id: string;
  year: number;
  month: number;
  amount: number;
  paymentStatus: string;
  paymentDate?: string;
  notes?: string;
  createdAt: string;
  taxpayer: {
    id: string;
    tcNumber: string;
    firstName: string;
    lastName: string;
    monthlyFee: number;
  };
}

interface PaginatedResponse {
  data: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface ChargeItem {
  id: string;
  title: string;
  type?: string;
  amount: number;
  status: string;
  dueDate?: string;
  createdAt: string;
  taxpayer: { id: string; firstName: string; lastName: string; tcNumber: string };
}

interface TaxpayerLite {
  id: string;
  firstName: string;
  lastName: string;
  tcNumber: string;
  monthlyFee: number;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [charges, setCharges] = useState<ChargeItem[]>([]);
  const [taxpayers, setTaxpayers] = useState<TaxpayerLite[]>([]);
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
  const [filters, setFilters] = useState(() => {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() - 1, 1); // bir önceki ay
    return {
      year: target.getFullYear(),
      month: String(target.getMonth() + 1), // '1'..'12'
      status: '',
    };
  });
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('accessToken');
    const userType = localStorage.getItem('userType');
    
    if (!token || userType !== 'smmm') {
      router.push('/smmm/login');
      return;
    }

    loadPayments();
  }, [router, pagination.page, filters]);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        year: filters.year.toString(),
        ...(filters.month && { month: filters.month }),
        ...(filters.status && { status: filters.status }),
      });

      const response = await fetch(`/api/smmm/payments?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: PaginatedResponse = await response.json();
        setPayments(data.data);
        setPagination(data.pagination);
        // Fetch taxpayers for virtual rows (previous month logic)
        const tpRes = await fetch(`/api/smmm/taxpayers?page=1&limit=1000`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (tpRes.ok) {
          const tpd = await tpRes.json();
          setTaxpayers((tpd.data || []).map((t: any) => ({ id: t.id, firstName: t.firstName, lastName: t.lastName, tcNumber: t.tcNumber, monthlyFee: Number(t.monthlyFee || 0) })));
        }
        // fetch pending charges for context
        const chargesRes = await fetch(`/api/smmm/charges?status=PENDING`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (chargesRes.ok) {
          const c = await chargesRes.json();
          setCharges(c.data || []);
        }
      } else {
        setError('Ödemeler yüklenemedi');
      }
    } catch (error) {
      setError('Sunucu hatası');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    router.push('/smmm/login');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="badge badge-success">Ödendi</span>;
      case 'OVERDUE':
        return <span className="badge badge-danger">Gecikti</span>;
      case 'PENDING':
        return <span className="badge badge-warning">Bekliyor</span>;
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return months[month - 1];
  };

  if (isLoading && payments.length === 0) {
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
              <h1 className="text-2xl font-bold text-gray-900">Ödeme Takibi</h1>
              <p className="text-sm text-gray-600">Mükellef ödemeleri ve takibi</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/smmm/dashboard" className="btn btn-outline">
                Dashboard
              </Link>
              <Link href="/smmm/payments/new" className="btn btn-primary">
                Yeni Ödeme
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
        {/* Filters */}
        <div className="card mb-6">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="label">Yıl</label>
                <select
                  className="input"
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="label">Ay</label>
                <select
                  className="input"
                  value={filters.month}
                  onChange={(e) => handleFilterChange('month', e.target.value)}
                >
                  <option value="">Tüm Aylar</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {getMonthName(i + 1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Durum</label>
                <select
                  className="input"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">Tüm Durumlar</option>
                  <option value="PENDING">Bekliyor</option>
                  <option value="PAID">Ödendi</option>
                  <option value="OVERDUE">Gecikti</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({
                      year: new Date().getFullYear(),
                      month: '',
                      status: '',
                    });
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="btn btn-outline w-full"
                >
                  Filtreleri Temizle
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 mb-6 rounded-md">
            {error}
          </div>
        )}

        {/* Payments Table */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">
              Ödemeler ({pagination.total})
            </h2>
          </div>
          <div className="card-body p-0">
            {payments.length === 0 && taxpayers.length === 0 ? (
              <div className="empty-state py-12">
                <div className="empty-state-icon">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="empty-state-title">Henüz ödeme kaydı yok</h3>
                <p className="empty-state-description">
                  İlk ödeme kaydınızı oluşturmak için yukarıdaki butona tıklayın.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Mükellef</th>
                      <th className="table-header-cell">TC No</th>
                      <th className="table-header-cell">Dönem</th>
                      <th className="table-header-cell">Tutar</th>
                      <th className="table-header-cell">Durum</th>
                      <th className="table-header-cell">Ödeme Tarihi</th>
                      <th className="table-header-cell">Notlar</th>
                      <th className="table-header-cell">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {(() => {
                      // Merge real payments with virtual rows for the selected month (previous month by default)
                      const list: Payment[] = [...payments];
                      const year = Number(filters.year);
                      const month = Number(filters.month || '0');
                      const considerVirtual = Boolean(month);
                      if (considerVirtual && taxpayers.length > 0) {
                        const now = new Date();
                        const overdue = now.getDate() > 20;
                        taxpayers.forEach(tp => {
                          // Sum paid amounts for this taxpayer for selected year-month
                          const paidSum = payments
                            .filter(p => p.taxpayer.id === tp.id && p.year === year && p.month === month && p.paymentStatus === 'PAID')
                            .reduce((s, p) => s + Number(p.amount || 0), 0);
                          const remaining = Math.max(Number(tp.monthlyFee || 0) - paidSum, 0);
                          const hasAnyRecord = payments.some(p => p.taxpayer.id === tp.id && p.year === year && p.month === month);
                          if (remaining > 0) {
                            list.push({
                              id: `virtual-${tp.id}-${year}-${month}`,
                              year,
                              month,
                              amount: remaining,
                              paymentStatus: overdue ? 'OVERDUE' : 'PENDING',
                              paymentDate: undefined,
                              notes: '',
                              createdAt: new Date().toISOString(),
                              taxpayer: { id: tp.id, firstName: tp.firstName, lastName: tp.lastName, tcNumber: tp.tcNumber, monthlyFee: tp.monthlyFee },
                            } as Payment);
                          } else if (!hasAnyRecord) {
                            // nothing to add
                          }
                        });
                      }
                      return list.sort((a,b)=> a.taxpayer.lastName.localeCompare(b.taxpayer.lastName) || a.taxpayer.firstName.localeCompare(b.taxpayer.firstName));
                    })().map((payment) => (
                      <tr key={payment.id} className="table-row">
                        <td className="table-cell font-medium">
                          {payment.taxpayer.firstName} {payment.taxpayer.lastName}
                        </td>
                        <td className="table-cell">{payment.taxpayer.tcNumber}</td>
                        <td className="table-cell">
                          {getMonthName(payment.month)} {payment.year}
                        </td>
                        <td className="table-cell">
                          ₺{payment.amount.toLocaleString('tr-TR')}
                        </td>
                        <td className="table-cell">
                          {getStatusBadge(payment.paymentStatus)}
                        </td>
                        <td className="table-cell">
                          {payment.paymentDate 
                            ? new Date(payment.paymentDate).toLocaleDateString('tr-TR')
                            : '-'
                          }
                        </td>
                        <td className="table-cell">
                          {payment.notes || '-'}
                        </td>
                        <td className="table-cell">
                          <div className="flex space-x-2">
                            <Link
                              href={`/smmm/taxpayers/${payment.taxpayer.id}`}
                              className="btn btn-outline btn-sm"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Mükellef Detayı
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Pending Charge Items */}
        <div className="card mt-6">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Bekleyen Serbest Kalemler ({charges.length})</h2>
          </div>
          <div className="card-body p-0">
            {charges.length === 0 ? (
              <div className="empty-state py-8">
                <h3 className="empty-state-title">Bekleyen serbest kalem yok</h3>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Mükellef</th>
                      <th className="table-header-cell">TC No</th>
                      <th className="table-header-cell">Başlık</th>
                      <th className="table-header-cell">Tip</th>
                      <th className="table-header-cell">Tutar</th>
                      <th className="table-header-cell">Vade</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {charges.map((ch) => (
                      <tr key={ch.id} className="table-row">
                        <td className="table-cell font-medium">
                          {ch.taxpayer.firstName} {ch.taxpayer.lastName}
                        </td>
                        <td className="table-cell">{ch.taxpayer.tcNumber}</td>
                        <td className="table-cell">{ch.title}</td>
                        <td className="table-cell">{ch.type || '-'}</td>
                        <td className="table-cell">₺{Number(ch.amount).toLocaleString('tr-TR')}</td>
                        <td className="table-cell">{ch.dueDate ? new Date(ch.dueDate).toLocaleDateString('tr-TR') : '-'}</td>
                      </tr>
                    ))}
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
