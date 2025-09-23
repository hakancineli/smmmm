'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DebugPage() {
  const [tokens, setTokens] = useState<any>({});
  const [apiTest, setApiTest] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Get tokens from localStorage
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userType = localStorage.getItem('userType');
    const user = localStorage.getItem('user');

    setTokens({
      accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : 'Yok',
      refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : 'Yok',
      userType,
      user: user ? JSON.parse(user) : null,
    });
  }, []);

  const testDashboardAPI = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setApiTest({ error: 'Token bulunamadı' });
        return;
      }

      const response = await fetch('/api/smmm/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setApiTest({
        status: response.status,
        ok: response.ok,
        data: data,
      });
    } catch (error) {
      setApiTest({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    setTokens({});
    setApiTest(null);
  };

  const goToLogin = () => {
    router.push('/smmm/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Sayfası</h1>
        
        {/* Token Bilgileri */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">LocalStorage Token Bilgileri</h2>
          <div className="space-y-2">
            <p><strong>Access Token:</strong> {tokens.accessToken}</p>
            <p><strong>Refresh Token:</strong> {tokens.refreshToken}</p>
            <p><strong>User Type:</strong> {tokens.userType}</p>
            <p><strong>User:</strong> {tokens.user ? JSON.stringify(tokens.user, null, 2) : 'Yok'}</p>
          </div>
        </div>

        {/* API Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Test</h2>
          <button
            onClick={testDashboardAPI}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-4"
          >
            Dashboard API Test Et
          </button>
          {apiTest && (
            <div className="mt-4">
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(apiTest, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">İşlemler</h2>
          <div className="space-x-4">
            <button
              onClick={clearTokens}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Token'ları Temizle
            </button>
            <button
              onClick={goToLogin}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Login Sayfasına Git
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
