'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardStats {
  totalTaxpayers: number;
  activeTaxpayers: number;
  totalPayments: number;
  paidPayments: number;
  pendingPayments: number;
  overduePayments: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
}

interface PaymentChartData {
  month: string;
  paid: number;
  pending: number;
  overdue: number;
}

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
  updatedAt: string;
  payments?: {
    id: string;
    year: number;
    month: number;
    amount: number;
    paymentStatus: string;
    paymentDate?: string;
  }[];
}

export default function SMMMDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<PaymentChartData[]>([]);
  const [taxpayers, setTaxpayers] = useState<Taxpayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('accessToken');
    const userType = localStorage.getItem('userType');
    
    if (!token || userType !== 'smmm') {
      router.push('/smmm/login');
      return;
    }

    // Load dashboard data
    loadDashboardData();
    loadTaxpayers();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!token) {
        setError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        router.push('/smmm/login');
        return;
      }

      const response = await fetch('/api/smmm/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setChartData(data.chartData || []);
      } else if (response.status === 401) {
        // Token expired, try to refresh
        if (refreshToken) {
          const refreshResponse = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('accessToken', refreshData.accessToken);
            localStorage.setItem('refreshToken', refreshData.refreshToken);
            
            // Retry the original request
            const retryResponse = await fetch('/api/smmm/dashboard', {
              headers: {
                'Authorization': `Bearer ${refreshData.accessToken}`,
              },
            });

            if (retryResponse.ok) {
              const data = await retryResponse.json();
              setStats(data.stats);
              setChartData(data.chartData || []);
            } else {
              setError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
              router.push('/smmm/login');
            }
          } else {
            setError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
            router.push('/smmm/login');
          }
        } else {
          setError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
          router.push('/smmm/login');
        }
      } else {
        setError('Dashboard verileri yüklenemedi');
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      setError('Sunucu hatası');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTaxpayers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch('/api/smmm/taxpayers?page=1&limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTaxpayers(data.data || []);
      }
    } catch (error) {
      console.error('Load taxpayers error:', error);
    }
  };

  const getPaymentStatus = (taxpayer: Taxpayer) => {
    if (!taxpayer.payments || taxpayer.payments.length === 0) {
      return { status: 'PENDING', color: 'warning' };
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    const currentPayment = taxpayer.payments.find(
      p => p.year === currentYear && p.month === currentMonth
    );

    if (!currentPayment) {
      return { status: 'PENDING', color: 'warning' };
    }

    switch (currentPayment.paymentStatus) {
      case 'PAID':
        return { status: 'Ödendi', color: 'success' };
      case 'OVERDUE':
        return { status: 'Gecikti', color: 'danger' };
      default:
        return { status: 'Bekliyor', color: 'warning' };
    }
  };

  const getDebtSummary = (taxpayer: Taxpayer) => {
    const payments = (taxpayer as any).payments || (taxpayer as any).monthlyPayments || [];
    if (!payments || payments.length === 0) {
      return { total: 0, unpaid: 0 };
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    let total = 0;
    let unpaid = 0;

    for (let month = 1; month <= currentMonth; month++) {
      const payment = payments.find(
        p => p.year === currentYear && p.month === month
      );
      
      if (payment) {
        total += Number(payment.amount || 0);
        if (payment.paymentStatus !== 'PAID') {
          unpaid += Number(payment.amount || 0);
        }
      } else {
        total += Number((taxpayer as any).monthlyFee || 0);
        unpaid += Number((taxpayer as any).monthlyFee || 0);
      }
    }

    return { total, unpaid };
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    router.push('/smmm/login');
  };

  if (isLoading) {
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
              <h1 className="text-2xl font-bold text-gray-900">SMMM Dashboard</h1>
              <p className="text-sm text-gray-600">Mükellef CRM Yönetim Paneli</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/smmm/taxpayers" className="btn btn-outline">
                Mükellefler
              </Link>
              <Link href="/smmm/payments" className="btn btn-outline">
                Ödemeler
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
        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 mb-6 rounded-md">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-grid mb-8">
          <div className="stat-card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="stat-value">{stats?.totalTaxpayers || 0}</div>
                  <div className="stat-label">Toplam Mükellef</div>
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="stat-value">{stats?.paidPayments || 0}</div>
                  <div className="stat-label">Ödenmiş Ödemeler</div>
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-warning-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="stat-value">{stats?.pendingPayments || 0}</div>
                  <div className="stat-label">Bekleyen Ödemeler</div>
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-danger-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="stat-value">{stats?.overduePayments || 0}</div>
                  <div className="stat-label">Geciken Ödemeler</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aylık Gelir</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₺{stats?.monthlyRevenue?.toLocaleString('tr-TR') || '0'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Yıllık Gelir</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₺{stats?.yearlyRevenue?.toLocaleString('tr-TR') || '0'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card mb-8">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Hızlı İşlemler</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/smmm/taxpayers/new" className="btn btn-primary w-full">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Yeni Mükellef Ekle
              </Link>
              <Link href="/smmm/edevlet-credentials" className="btn btn-outline w-full">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                E-Devlet Şifreleri
              </Link>
            </div>
          </div>
        </div>

        {/* Mükellef Listesi */}
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Mükellef Listesi</h2>
              <Link href="/smmm/taxpayers" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                Tümünü Gör
              </Link>
            </div>
          </div>
          <div className="card-body">
            {taxpayers.length === 0 ? (
              <div className="empty-state py-8">
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
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mükellef
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        TC No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aylık Ücret
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Borç
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {taxpayers.map((taxpayer) => {
                      const paymentStatus = getPaymentStatus(taxpayer);
                      const debtSummary = getDebtSummary(taxpayer);
                      
                      return (
                        <tr key={taxpayer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-primary-600">
                                    {taxpayer.firstName.charAt(0)}{taxpayer.lastName.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {taxpayer.firstName} {taxpayer.lastName}
                                </div>
                                {taxpayer.companyName && (
                                  <div className="text-sm text-gray-500">
                                    {taxpayer.companyName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {taxpayer.tcNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₺{taxpayer.monthlyFee.toLocaleString('tr-TR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              paymentStatus.color === 'success' 
                                ? 'bg-success-100 text-success-800'
                                : paymentStatus.color === 'danger'
                                ? 'bg-danger-100 text-danger-800'
                                : 'bg-warning-100 text-warning-800'
                            }`}>
                              {paymentStatus.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-medium">₺{debtSummary.unpaid.toLocaleString('tr-TR')}</div>
                              <div className="text-xs text-gray-500">Toplam: ₺{debtSummary.total.toLocaleString('tr-TR')}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Link
                                href={`/smmm/taxpayers/${taxpayer.id}`}
                                className="text-primary-600 hover:text-primary-900"
                              >
                                Detay
                              </Link>
                              <Link
                                href={`/smmm/taxpayers/${taxpayer.id}/edit`}
                                className="text-gray-600 hover:text-gray-900"
                              >
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
      </div>
    </div>
  );
}
