'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface EDevletCredential {
  id: string;
  platform: string;
  username?: string;
  isActive: boolean;
  createdAt: string;
  taxpayer: {
    id: string;
    tcNumber: string;
    firstName: string;
    lastName: string;
  };
}

interface PaginatedResponse {
  data: EDevletCredential[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function EDevletCredentialsPage() {
  const [credentials, setCredentials] = useState<EDevletCredential[]>([]);
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
  const [filters, setFilters] = useState({
    platform: '',
    taxpayerId: '',
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

    loadCredentials();
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userType = localStorage.getItem('userType');
    
    if (token && userType === 'smmm') {
      loadCredentials();
    }
  }, [pagination.page, filters.platform, filters.taxpayerId]);

  const loadCredentials = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.platform && { platform: filters.platform }),
        ...(filters.taxpayerId && { taxpayerId: filters.taxpayerId }),
      });

      const response = await fetch(`/api/smmm/edevlet-credentials?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: PaginatedResponse = await response.json();
        setCredentials(data.data);
        setPagination(data.pagination);
      } else {
        setError('E-Devlet şifreleri yüklenemedi');
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

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'EARSIV_PORTAL':
        return 'E-Arşiv Portal';
      case 'DIJITAL_GIB':
        return 'Dijital GİB';
      case 'ISTANBUL_GIB':
        return 'İstanbul GİB';
      default:
        return platform;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'EARSIV_PORTAL':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'DIJITAL_GIB':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
          </svg>
        );
      case 'ISTANBUL_GIB':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
    }
  };

  if (isLoading && credentials.length === 0) {
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
              <h1 className="text-2xl font-bold text-gray-900">E-Devlet Şifreleri</h1>
              <p className="text-sm text-gray-600">Mükellef E-Devlet platform şifreleri</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/smmm/dashboard" className="btn btn-outline">
                Dashboard
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Platform</label>
                <select
                  className="input"
                  value={filters.platform}
                  onChange={(e) => handleFilterChange('platform', e.target.value)}
                >
                  <option value="">Tüm Platformlar</option>
                  <option value="EARSIV_PORTAL">E-Arşiv Portal</option>
                  <option value="DIJITAL_GIB">Dijital GİB</option>
                  <option value="ISTANBUL_GIB">İstanbul GİB</option>
                </select>
              </div>

              <div>
                <label className="label">Mükellef</label>
                <input
                  type="text"
                  className="input"
                  placeholder="TC No ile ara..."
                  value={filters.taxpayerId}
                  onChange={(e) => handleFilterChange('taxpayerId', e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({
                      platform: '',
                      taxpayerId: '',
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

        {/* Credentials Table */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">
              E-Devlet Şifreleri ({pagination.total})
            </h2>
          </div>
          <div className="card-body p-0">
            {credentials.length === 0 ? (
              <div className="empty-state py-12">
                <div className="empty-state-icon">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="empty-state-title">Henüz E-Devlet şifresi yok</h3>
                <p className="empty-state-description">
                  Mükellefler için E-Devlet şifrelerini ekleyebilirsiniz.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Platform</th>
                      <th className="table-header-cell">Mükellef</th>
                      <th className="table-header-cell">TC No</th>
                      <th className="table-header-cell">Kullanıcı Adı</th>
                      <th className="table-header-cell">Durum</th>
                      <th className="table-header-cell">Oluşturulma</th>
                      <th className="table-header-cell">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {credentials.map((credential) => (
                      <tr key={credential.id} className="table-row">
                        <td className="table-cell">
                          <div className="flex items-center">
                            {getPlatformIcon(credential.platform)}
                            <span className="ml-2 font-medium">
                              {getPlatformName(credential.platform)}
                            </span>
                          </div>
                        </td>
                        <td className="table-cell font-medium">
                          {credential.taxpayer.firstName} {credential.taxpayer.lastName}
                        </td>
                        <td className="table-cell">{credential.taxpayer.tcNumber}</td>
                        <td className="table-cell">
                          {credential.username || '-'}
                        </td>
                        <td className="table-cell">
                          <span className={`badge ${credential.isActive ? 'badge-success' : 'badge-danger'}`}>
                            {credential.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="table-cell">
                          {new Date(credential.createdAt).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="table-cell">
                          <div className="flex space-x-2">
                            <button className="btn btn-outline btn-sm">
                              Düzenle
                            </button>
                            <button className="btn btn-outline btn-sm">
                              Test Et
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
