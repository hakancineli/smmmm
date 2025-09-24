'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface SMMMDetail {
  id: string;
  companyName: string;
  username: string;
  email?: string;
  phone?: string;
  subscriptionPlan?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { taxpayers: number };
}

export default function SMMMDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id || '');

  const [detail, setDetail] = useState<SMMMDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userType = localStorage.getItem('userType');
    if (!token || userType !== 'superuser') {
      router.push('/superuser/login');
      return;
    }

    const load = async () => {
      try {
        const res = await fetch(`/api/superuser/smmm/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || 'Kayıt yüklenemedi');
        }
        const data = await res.json();
        setDetail(data.data);
      } catch (e: any) {
        setError(e.message || 'Sunucu hatası');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) load();
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-md">{error}</div>
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SMMM Detayı</h1>
              <p className="text-sm text-gray-600">{detail.companyName}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={async () => {
                  try {
                    setIsResetting(true);
                    const token = localStorage.getItem('accessToken');
                    const res = await fetch(`/api/superuser/smmm/${id}`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ action: 'RESET_PASSWORD' }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data?.error || 'İşlem başarısız');
                    setTempPassword(data.tempPassword);
                    setShowModal(true);
                  } catch (e: any) {
                    alert(e.message || 'Hata');
                  } finally {
                    setIsResetting(false);
                  }
                }}
                className="btn btn-primary"
                disabled={isResetting}
              >
                {isResetting ? 'Oluşturuluyor…' : 'Geçici Şifre Oluştur'}
              </button>
              <button onClick={() => router.back()} className="btn btn-outline">Geri</button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showModal && tempPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-3">Geçici Şifre</h3>
              <p className="text-sm text-gray-600 mb-2">Bu şifre sadece bir kez gösterilir. Lütfen kopyalayın ve kullanıcıya iletin.</p>
              <div className="flex items-center justify-between bg-gray-100 rounded px-3 py-2 mb-4">
                <code className="font-mono text-lg">{tempPassword}</code>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => navigator.clipboard.writeText(tempPassword)}
                >
                  Kopyala
                </button>
              </div>
              <div className="flex justify-end space-x-2">
                <button className="btn btn-primary" onClick={() => setShowModal(false)}>Tamam</button>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header"><h2 className="text-lg font-semibold">Hesap Bilgileri</h2></div>
            <div className="card-body space-y-3">
              <div className="flex justify-between"><span className="text-gray-600">Kullanıcı Adı</span><span className="font-medium">{detail.username}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">E‑posta</span><span className="font-medium">{detail.email || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Telefon</span><span className="font-medium">{detail.phone || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Plan</span><span className="font-medium">{detail.subscriptionPlan || 'BASIC'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Durum</span><span className={`badge ${detail.isActive ? 'badge-success' : 'badge-danger'}`}>{detail.isActive ? 'Aktif' : 'Pasif'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Oluşturulma</span><span className="font-medium">{new Date(detail.createdAt).toLocaleDateString('tr-TR')}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Mükellef Sayısı</span><span className="font-medium">{detail._count?.taxpayers ?? 0}</span></div>
              {tempPassword && (
                <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200">
                  <div className="text-sm text-yellow-800 mb-1">Geçici Şifre (tek seferlik gösterim):</div>
                  <div className="font-mono text-lg tracking-wider">{tempPassword}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


