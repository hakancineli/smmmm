'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Taxpayer {
  id: string;
  tcNumber: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  monthlyFee: number;
}

export default function NewPaymentPage() {
  const [taxpayer, setTaxpayer] = useState<Taxpayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    amount: '',
    paymentStatus: 'PENDING' as 'PENDING' | 'PAID' | 'OVERDUE',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const taxpayerId = searchParams.get('taxpayerId');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userType = localStorage.getItem('userType');

    if (!token || userType !== 'smmm') {
      router.push('/smmm/login');
      return;
    }

    if (taxpayerId) {
      loadTaxpayer();
    } else {
      setError('Mükellef ID bulunamadı');
      setIsLoading(false);
    }
  }, [taxpayerId, router]);

  const loadTaxpayer = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/smmm/taxpayers/${taxpayerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Taxpayer data:', data); // Debug için
        setTaxpayer(data);
        setFormData(prev => ({
          ...prev,
          amount: data.monthlyFee ? data.monthlyFee.toString() : '0',
        }));
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        setError('Mükellef bilgileri yüklenemedi: ' + (errorData.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      setError('Sunucu hatası');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/smmm/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          taxpayerId,
          year: parseInt(formData.year.toString()),
          month: parseInt(formData.month.toString()),
          amount: parseFloat(formData.amount.toString()),
          paymentStatus: formData.paymentStatus,
          paymentDate: formData.paymentStatus === 'PAID' ? formData.paymentDate : null,
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        router.push(`/smmm/taxpayers/${taxpayerId}`);
      } else {
        const data = await response.json();
        setError(data.error || 'Ödeme eklenirken bir hata oluştu');
      }
    } catch (error) {
      setError('Sunucu hatası');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
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
              <h1 className="text-2xl font-bold text-gray-900">Yeni Ödeme Ekle</h1>
              <p className="text-sm text-gray-600">
                {taxpayer ? `${taxpayer.firstName} ${taxpayer.lastName}` : 'Mükellef bilgileri yükleniyor...'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/smmm/payments" className="btn btn-outline">
                Ödemeler
              </Link>
              <Link href="/smmm/dashboard" className="btn btn-outline">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 mb-6 rounded-md">
            {error}
          </div>
        )}

        {taxpayer && (
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
                      value={formData.year}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="month" className="block text-sm font-medium text-gray-700">
                      Ay *
                    </label>
                    <select
                      id="month"
                      name="month"
                      value={formData.month}
                      onChange={handleChange}
                      className="input"
                      required
                    >
                      <option value={1}>Ocak</option>
                      <option value={2}>Şubat</option>
                      <option value={3}>Mart</option>
                      <option value={4}>Nisan</option>
                      <option value={5}>Mayıs</option>
                      <option value={6}>Haziran</option>
                      <option value={7}>Temmuz</option>
                      <option value={8}>Ağustos</option>
                      <option value={9}>Eylül</option>
                      <option value={10}>Ekim</option>
                      <option value={11}>Kasım</option>
                      <option value={12}>Aralık</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                      Ödeme Miktarı (₺) *
                    </label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      className="input"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700">
                      Ödeme Durumu *
                    </label>
                    <select
                      id="paymentStatus"
                      name="paymentStatus"
                      value={formData.paymentStatus}
                      onChange={handleChange}
                      className="input"
                      required
                    >
                      <option value="PENDING">Bekliyor</option>
                      <option value="PAID">Ödendi</option>
                      <option value="OVERDUE">Gecikti</option>
                    </select>
                  </div>

                  {formData.paymentStatus === 'PAID' && (
                    <div className="md:col-span-2">
                      <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">
                        Ödeme Tarihi *
                      </label>
                      <input
                        type="date"
                        id="paymentDate"
                        name="paymentDate"
                        value={formData.paymentDate}
                        onChange={handleChange}
                        className="input"
                        required
                      />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notlar
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="input"
                      placeholder="Ödeme ile ilgili notlar..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Link
                    href={`/smmm/taxpayers/${taxpayerId}`}
                    className="btn btn-outline"
                  >
                    İptal
                  </Link>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Kaydediliyor...' : 'Ödeme Ekle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
