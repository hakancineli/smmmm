'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SuperuserLoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/superuser/login', {
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
        localStorage.setItem('userType', 'superuser');
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect to superuser dashboard
        router.push('/superuser/dashboard');
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
            Superuser Girişi
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            SMMM Mükellef CRM Yönetim Paneli
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
                <label htmlFor="username" className="label">
                  Kullanıcı Adı
                </label>
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
                <label htmlFor="password" className="label">
                  Şifre
                </label>
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
            <p>Kullanıcı Adı: <code className="bg-gray-100 px-2 py-1 rounded">admin</code></p>
            <p>Şifre: <code className="bg-gray-100 px-2 py-1 rounded">admin123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
