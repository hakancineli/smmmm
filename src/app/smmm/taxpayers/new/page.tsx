'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewTaxpayerPage() {
  const [formData, setFormData] = useState({
    tcNumber: '',
    taxNumber: '',
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    monthlyFee: '',
  });
  const [vedopData, setVedopData] = useState({
    userCode: '',
    password: '',
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
      const response = await fetch('/api/smmm/taxpayers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          monthlyFee: parseFloat(formData.monthlyFee),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const taxpayerId = data?.data?.id;
        
        // Save Vedop credentials if provided
        if (taxpayerId && vedopData.userCode && vedopData.password) {
          try {
            await fetch('/api/smmm/earsiv/credentials', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ taxpayerId, userCode: vedopData.userCode, password: vedopData.password })
            });
          } catch (err) {
            console.error('Vedop bilgileri kaydedilemedi:', err);
          }
        }
        
        setSuccess('Mükellef başarıyla eklendi!');
        setFormData({
          tcNumber: '',
          taxNumber: '',
          firstName: '',
          lastName: '',
          companyName: '',
          email: '',
          phone: '',
          address: '',
          monthlyFee: '',
        });
        setVedopData({
          userCode: '',
          password: '',
        });
        // Redirect to taxpayers list after 2 seconds
        setTimeout(() => {
          router.push('/smmm/taxpayers');
        }, 2000);
      } else {
        setError(data.error || 'Mükellef eklenemedi');
      }
    } catch (error) {
      setError('Sunucu hatası');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleVedopChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVedopData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    router.push('/smmm/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Yeni Mükellef Ekle</h1>
              <p className="text-sm text-gray-600">Mükellef bilgilerini girin</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/smmm/taxpayers" className="btn btn-outline">
                Mükellefler
              </Link>
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
                  <label htmlFor="tcNumber" className="label">
                    TC Kimlik No *
                  </label>
                  <input
                    id="tcNumber"
                    name="tcNumber"
                    type="text"
                    required
                    maxLength={11}
                    className="input"
                    value={formData.tcNumber}
                    onChange={handleChange}
                    placeholder="TC Kimlik No girin"
                  />
                </div>

                <div>
                  <label htmlFor="taxNumber" className="label">
                    Vergi No
                  </label>
                  <input
                    id="taxNumber"
                    name="taxNumber"
                    type="text"
                    maxLength={10}
                    className="input"
                    value={formData.taxNumber}
                    onChange={handleChange}
                    placeholder="Vergi No girin"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="label">
                    Ad *
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="input"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Ad girin"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="label">
                    Soyad *
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="input"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Soyad girin"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="companyName" className="label">
                  Şirket Ünvanı
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  className="input"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Şirket ünvanını girin (opsiyonel)"
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
                <label htmlFor="monthlyFee" className="label">
                  Aylık Ücret *
                </label>
                <input
                  id="monthlyFee"
                  name="monthlyFee"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="input"
                  value={formData.monthlyFee}
                  onChange={handleChange}
                  placeholder="Aylık ücret girin"
                />
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

              {/* Vedop Bilgileri */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Vedop Giriş Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="vedopUserCode" className="label">
                      Vedop Kullanıcı Kodu
                    </label>
                    <input
                      id="vedopUserCode"
                      name="userCode"
                      type="text"
                      className="input"
                      value={vedopData.userCode}
                      onChange={handleVedopChange}
                      placeholder="Vedop kullanıcı kodunu girin"
                    />
                  </div>

                  <div>
                    <label htmlFor="vedopPassword" className="label">
                      Vedop Şifre
                    </label>
                    <input
                      id="vedopPassword"
                      name="password"
                      type="password"
                      className="input"
                      value={vedopData.password}
                      onChange={handleVedopChange}
                      placeholder="Vedop şifresini girin"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/smmm/taxpayers" className="btn btn-outline">
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
                      Ekleniyor...
                    </div>
                  ) : (
                    'Mükellef Ekle'
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
