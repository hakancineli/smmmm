'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  address?: string;
  monthlyFee: number;
  isActive: boolean;
}

export default function EditTaxpayerPage() {
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
    isActive: true,
  });
  const [vedopData, setVedopData] = useState({
    userCode: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const params = useParams();
  const taxpayerId = params.id as string;

  useEffect(() => {
    if (taxpayerId) {
      loadTaxpayerData();
      loadVedopData();
    }
  }, [taxpayerId]);

  const loadTaxpayerData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/smmm/login');
        return;
      }

      const response = await fetch(`/api/smmm/taxpayers/${taxpayerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const taxpayer = data.taxpayer;
        setFormData({
          tcNumber: taxpayer.tcNumber,
          taxNumber: taxpayer.taxNumber || '',
          firstName: taxpayer.firstName,
          lastName: taxpayer.lastName,
          companyName: taxpayer.companyName || '',
          email: taxpayer.email || '',
          phone: taxpayer.phone || '',
          address: taxpayer.address || '',
          monthlyFee: taxpayer.monthlyFee.toString(),
          isActive: taxpayer.isActive,
        });
      } else {
        setError('Mükellef bilgileri yüklenemedi');
      }
    } catch (error) {
      setError('Sunucu hatası');
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadVedopData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/smmm/earsiv/credentials?taxpayerId=${taxpayerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setVedopData({
            userCode: data.data.userCode || '',
            password: data.data.hasPassword ? '********' : '',
          });
        }
      }
    } catch (error) {
      console.error('Vedop bilgileri yüklenemedi:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/smmm/login');
        return;
      }

      const response = await fetch(`/api/smmm/taxpayers/${taxpayerId}`, {
        method: 'PUT',
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
        // Save Vedop credentials if provided
        if (vedopData.userCode && vedopData.password && vedopData.password !== '********') {
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
        
        setSuccess('Mükellef başarıyla güncellendi!');
        // Redirect to taxpayer detail page after 2 seconds
        setTimeout(() => {
          router.push(`/smmm/taxpayers/${taxpayerId}`);
        }, 2000);
      } else {
        setError(data.error || 'Güncelleme yapılamadı');
      }
    } catch (error) {
      setError('Sunucu hatası');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleVedopChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVedopData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoadingData) {
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
              <h1 className="text-2xl font-bold text-gray-900">Mükellef Düzenle</h1>
              <p className="text-sm text-gray-600">Mükellef bilgilerini güncelleyin</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href={`/smmm/taxpayers/${taxpayerId}`} className="btn btn-outline">
                İptal
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 mb-6 rounded-md">
            {success}
          </div>
        )}

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* TC No ve Vergi No */}
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
                    className="input"
                    value={formData.tcNumber}
                    onChange={handleChange}
                    placeholder="TC Kimlik No girin"
                    maxLength={11}
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
                    className="input"
                    value={formData.taxNumber}
                    onChange={handleChange}
                    placeholder="Vergi No girin"
                    maxLength={10}
                  />
                </div>
              </div>

              {/* Ad Soyad */}
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

              {/* Şirket Ünvanı */}
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

              {/* İletişim Bilgileri */}
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
                    placeholder="E-posta adresi girin"
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
                    placeholder="Telefon numarası girin"
                  />
                </div>
              </div>

              {/* Adres */}
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

              {/* Aylık Ücret ve Durum */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="monthlyFee" className="label">
                    Aylık Ücret (₺) *
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

                <div className="flex items-center">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Aktif Mükellef
                  </label>
                </div>
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

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link
                  href={`/smmm/taxpayers/${taxpayerId}`}
                  className="btn btn-outline"
                >
                  İptal
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary"
                >
                  {isLoading ? 'Güncelleniyor...' : 'Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
