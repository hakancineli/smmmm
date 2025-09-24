'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SMMMLoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // If already logged in on this device, redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userType = localStorage.getItem('userType');
    if (token && userType === 'smmm') {
      router.replace('/smmm/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/smmm/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store tokens
        localStorage.setItem('accessToken', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userType', 'smmm');
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect to SMMM dashboard
        router.push('/smmm/dashboard');
      } else {
        setError(data.error || 'Giriş yapılamadı');
      }
    } catch (error) {
      setError('Sunucu hatası');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            SMMM Girişi
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Mükellef CRM Sistemine Hoş Geldiniz
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card">
          <div className="card-body">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              <div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="input"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Kullanıcı adınızı girin"
                />
              </div>

              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Şifrenizi girin"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="loading-spinner mr-2"></div>
                      Giriş yapılıyor...
                    </div>
                  ) : (
                    'Giriş Yap'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">veya</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="/"
                  className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                >
                  Ana sayfaya dön
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              <strong>Demo Giriş Bilgileri:</strong>
            </p>
            <p>Kullanıcı Adı: <code className="bg-gray-100 px-2 py-1 rounded">smmm1</code></p>
            <p>Şifre: <code className="bg-gray-100 px-2 py-1 rounded">smmm123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
