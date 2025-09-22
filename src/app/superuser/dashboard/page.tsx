'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SMMMAccount {
  id: string;
  companyName: string;
  username: string;
  email?: string;
  phone?: string;
  subscriptionPlan?: string;
  isActive: boolean;
  createdAt: string;
}

export default function SuperuserDashboard() {
  const [smmmAccounts, setSmmmAccounts] = useState<SMMMAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('accessToken');
    const userType = localStorage.getItem('userType');
    
    if (!token || userType !== 'superuser') {
      router.push('/superuser/login');
      return;
    }

    // Load SMMM accounts
    loadSMMMAccounts();
  }, [router]);

  const loadSMMMAccounts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/superuser/smmm/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSmmmAccounts(data.data || []);
      } else {
        setError('SMMM hesapları yüklenemedi');
      }
    } catch (error) {
      setError('Sunucu hatası');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    router.push('/superuser/login');
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
              <h1 className="text-2xl font-bold text-gray-900">Superuser Dashboard</h1>
              <p className="text-sm text-gray-600">SMMM Mükellef CRM Yönetim Paneli</p>
            </div>
            <div className="flex items-center space-x-4">
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
                  <div className="stat-value">{smmmAccounts.length}</div>
                  <div className="stat-label">Toplam SMMM Hesabı</div>
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
                  <div className="stat-value">{smmmAccounts.filter(acc => acc.isActive).length}</div>
                  <div className="stat-label">Aktif SMMM Hesabı</div>
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
                  <div className="stat-value">{smmmAccounts.filter(acc => !acc.isActive).length}</div>
                  <div className="stat-label">Pasif SMMM Hesabı</div>
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="stat-value">0</div>
                  <div className="stat-label">Bu Ay Yeni Hesap</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SMMM Accounts Table */}
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">SMMM Hesapları</h2>
              <Link href="/superuser/smmm/create" className="btn btn-primary">
                Yeni SMMM Hesabı Oluştur
              </Link>
            </div>
          </div>
          <div className="card-body p-0">
            {error && (
              <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 m-4 rounded-md">
                {error}
              </div>
            )}
            
            {smmmAccounts.length === 0 ? (
              <div className="empty-state py-12">
                <div className="empty-state-icon">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="empty-state-title">Henüz SMMM hesabı yok</h3>
                <p className="empty-state-description">
                  İlk SMMM hesabınızı oluşturmak için yukarıdaki butona tıklayın.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Şirket Adı</th>
                      <th className="table-header-cell">Kullanıcı Adı</th>
                      <th className="table-header-cell">E-posta</th>
                      <th className="table-header-cell">Telefon</th>
                      <th className="table-header-cell">Plan</th>
                      <th className="table-header-cell">Durum</th>
                      <th className="table-header-cell">Oluşturulma</th>
                      <th className="table-header-cell">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {smmmAccounts.map((account) => (
                      <tr key={account.id} className="table-row">
                        <td className="table-cell font-medium">{account.companyName}</td>
                        <td className="table-cell">{account.username}</td>
                        <td className="table-cell">{account.email || '-'}</td>
                        <td className="table-cell">{account.phone || '-'}</td>
                        <td className="table-cell">
                          <span className="badge badge-info">
                            {account.subscriptionPlan || 'BASIC'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className={`badge ${account.isActive ? 'badge-success' : 'badge-danger'}`}>
                            {account.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="table-cell">
                          {new Date(account.createdAt).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="table-cell">
                          <div className="flex space-x-2">
                            <button className="btn btn-outline btn-sm">
                              Düzenle
                            </button>
                            <button className="btn btn-outline btn-sm">
                              Detay
                            </button>
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
      </div>
    </div>
  );
}
