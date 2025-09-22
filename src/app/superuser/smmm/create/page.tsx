'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateSMMMPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    address: '',
    subscriptionPlan: 'BASIC',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/superuser/smmm/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('SMMM hesabı başarıyla oluşturuldu!');
        setFormData({
          companyName: '',
          username: '',
          password: '',
          email: '',
          phone: '',
          address: '',
          subscriptionPlan: 'BASIC',
        });
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/superuser/dashboard');
        }, 2000);
      } else {
        setError(data.error || 'SMMM hesabı oluşturulamadı');
      }
    } catch (error) {
      setError('Sunucu hatası');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Yeni SMMM Hesabı Oluştur</h1>
              <p className="text-sm text-gray-600">SMMM Mükellef CRM Yönetim Paneli</p>
            </div>
            <Link href="/superuser/dashboard" className="btn btn-outline">
              Geri Dön
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-md">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="companyName" className="label">
                    Şirket Adı *
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    className="input"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Şirket adını girin"
                  />
                </div>

                <div>
                  <label htmlFor="username" className="label">
                    Kullanıcı Adı *
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="input"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Kullanıcı adını girin"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Şifre *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Şifre girin"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="label">
                    E-posta
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="input"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="E-posta adresini girin"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="label">
                    Telefon
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="input"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Telefon numarasını girin"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subscriptionPlan" className="label">
                  Abonelik Planı
                </label>
                <select
                  id="subscriptionPlan"
                  name="subscriptionPlan"
                  className="input"
                  value={formData.subscriptionPlan}
                  onChange={handleChange}
                >
                  <option value="BASIC">Temel Paket</option>
                  <option value="PROFESSIONAL">Profesyonel Paket</option>
                  <option value="ENTERPRISE">Kurumsal Paket</option>
                </select>
              </div>

              <div>
                <label htmlFor="address" className="label">
                  Adres
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  className="input"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Adres bilgilerini girin"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/superuser/dashboard" className="btn btn-outline">
                  İptal
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="loading-spinner mr-2"></div>
                      Oluşturuluyor...
                    </div>
                  ) : (
                    'SMMM Hesabı Oluştur'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
