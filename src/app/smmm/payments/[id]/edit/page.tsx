'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Payment {
  id: string;
  year: number;
  month: number;
  amount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'OVERDUE';
  paymentDate?: string;
  notes?: string;
  taxpayer: {
    id: string;
    tcNumber: string;
    firstName: string;
    lastName: string;
  };
}

export default function EditPaymentPage() {
  const [formData, setFormData] = useState({
    year: '',
    month: '',
    amount: '',
    paymentStatus: 'PENDING' as 'PENDING' | 'PAID' | 'OVERDUE',
    paymentDate: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const params = useParams();
  const paymentId = params.id as string;

  useEffect(() => {
    if (paymentId) {
      loadPaymentData();
    }
  }, [paymentId]);

  const loadPaymentData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/smmm/login');
        return;
      }

      const response = await fetch(`/api/smmm/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const payment = data.payment;
        setFormData({
          year: payment.year.toString(),
          month: payment.month.toString(),
          amount: payment.amount.toString(),
          paymentStatus: payment.paymentStatus,
          paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : '',
          notes: payment.notes || '',
        });
      } else {
        setError('Ödeme bilgileri yüklenemedi');
      }
    } catch (error) {
      setError('Sunucu hatası');
    } finally {
      setIsLoadingData(false);
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

      const response = await fetch(`/api/smmm/payments/${paymentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          year: parseInt(formData.year),
          month: parseInt(formData.month),
          amount: parseFloat(formData.amount),
          paymentStatus: formData.paymentStatus,
          paymentDate: formData.paymentDate ? new Date(formData.paymentDate).toISOString() : null,
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        setSuccess('Ödeme başarıyla güncellendi');
        setTimeout(() => {
          router.push('/smmm/payments');
        }, 1500);
      } else {
        const data = await response.json();
        setError(data.error || 'Ödeme güncellenemedi');
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

  const getMonthName = (month: number) => {
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return months[month - 1];
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
              <h1 className="text-2xl font-bold text-gray-900">Ödeme Düzenle</h1>
              <p className="text-sm text-gray-600">Ödeme bilgilerini güncelleyin</p>
            </div>
            <Link href="/smmm/payments" className="btn btn-outline">
              Geri Dön
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 mb-6 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 mb-6 rounded-md">
            {success}
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Ödeme Bilgileri</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                    Yıl *
                  </label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    required
                    min="2020"
                    max="2030"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={formData.year}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="month" className="block text-sm font-medium text-gray-700">
                    Ay *
                  </label>
                  <select
                    id="month"
                    name="month"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={formData.month}
                    onChange={handleChange}
                  >
                    <option value="">Ay seçin</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {getMonthName(i + 1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Tutar (₺) *
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={formData.amount}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700">
                  Ödeme Durumu *
                </label>
                <select
                  id="paymentStatus"
                  name="paymentStatus"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                >
                  <option value="PENDING">Bekliyor</option>
                  <option value="PAID">Ödendi</option>
                  <option value="OVERDUE">Gecikti</option>
                </select>
              </div>

              {formData.paymentStatus === 'PAID' && (
                <div>
                  <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">
                    Ödeme Tarihi
                  </label>
                  <input
                    type="date"
                    id="paymentDate"
                    name="paymentDate"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={formData.paymentDate}
                    onChange={handleChange}
                  />
                </div>
              )}

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notlar
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Ödeme ile ilgili notlar..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/smmm/payments" className="btn btn-outline">
                  İptal
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
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
