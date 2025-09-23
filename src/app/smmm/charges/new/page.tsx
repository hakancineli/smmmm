'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface TaxpayerOption {
  id: string;
  firstName: string;
  lastName: string;
  companyName?: string;
}

export default function NewChargePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTaxpayerId = searchParams.get('taxpayerId') || '';

  const [taxpayers, setTaxpayers] = useState<TaxpayerOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    taxpayerId: initialTaxpayerId,
    title: '',
    type: '',
    amount: '0',
    dueDate: '',
    notes: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userType = localStorage.getItem('userType');
    if (!token || userType !== 'smmm') {
      router.push('/smmm/login');
      return;
    }
    loadTaxpayers();
  }, [router]);

  const loadTaxpayers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/smmm/taxpayers?page=1&limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTaxpayers(
          (data.data || []).map((t: any) => ({ id: t.id, firstName: t.firstName, lastName: t.lastName, companyName: t.companyName }))
        );
      }
    } catch (e) {}
    finally { setIsLoading(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/smmm/charges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          taxpayerId: formData.taxpayerId,
          title: formData.title.trim(),
          type: formData.type.trim() || undefined,
          amount: Number(formData.amount),
          dueDate: formData.dueDate || undefined,
          notes: formData.notes || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/smmm/taxpayers/${data.data.taxpayerId}`);
      } else {
        const err = await res.json();
        setError(err.error || 'Kalem eklenemedi');
      }
    } catch (e) {
      setError('Sunucu hatası');
    } finally {
      setIsSubmitting(false);
    }
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
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Yeni Kalem</h1>
              <p className="text-sm text-gray-600">Mükellefe serbest kalem borç ekleyin</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/smmm/dashboard" className="btn btn-outline">Dashboard</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 mb-6 rounded-md">{error}</div>
        )}

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Kalem Bilgileri</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mükellef *</label>
                  <select
                    name="taxpayerId"
                    value={formData.taxpayerId}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="" disabled>Seçiniz</option>
                    {taxpayers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.firstName} {t.lastName}{t.companyName ? ` - ${t.companyName}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Başlık *</label>
                  <input name="title" className="input" value={formData.title} onChange={handleChange} required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tip (opsiyonel)</label>
                  <input name="type" className="input" value={formData.type} onChange={handleChange} placeholder="Örn: Ceza, Hizmet, Masraf" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tutar (₺) *</label>
                  <input name="amount" type="number" step="0.01" className="input" value={formData.amount} onChange={handleChange} required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Vade (opsiyonel)</label>
                  <input name="dueDate" type="date" className="input" value={formData.dueDate} onChange={handleChange} />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Notlar</label>
                  <textarea name="notes" rows={3} className="input" value={formData.notes} onChange={handleChange} />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/smmm/dashboard" className="btn btn-outline">İptal</Link>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}


