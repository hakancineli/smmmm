'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EditSMMMPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    companyName: '',
    email: '',
    phone: '',
    subscriptionPlan: 'BASIC',
    isActive: true,
  });
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userType = localStorage.getItem('userType');
    if (!token || userType !== 'superuser') {
      router.push('/superuser/login');
      return;
    }
    const load = async () => {
      try {
        const res = await fetch(`/api/superuser/smmm/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Kayıt yüklenemedi');
        setForm({
          companyName: data.data.companyName || '',
          email: data.data.email || '',
          phone: data.data.phone || '',
          subscriptionPlan: data.data.subscriptionPlan || 'BASIC',
          isActive: !!data.data.isActive,
        });
      } catch (e: any) {
        setError(e.message || 'Sunucu hatası');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id, router]);

  const saveProfile = async () => {
    try {
      setError('');
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/superuser/smmm/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Kaydetme başarısız');
      alert('Kaydedildi');
    } catch (e: any) {
      setError(e.message || 'Hata');
    }
  };

  const setPassword = async () => {
    try {
      setError('');
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/superuser/smmm/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'SET_PASSWORD', newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Şifre güncellenemedi');
      alert('Şifre güncellendi');
      setNewPassword('');
    } catch (e: any) {
      setError(e.message || 'Hata');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">SMMM Düzenle</h1>
          <button className="btn btn-outline" onClick={() => router.back()}>Geri</button>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-md">{error}</div>
        )}

        <div className="card">
          <div className="card-header"><h2 className="text-lg font-semibold">Profil</h2></div>
          <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Şirket Adı</label>
              <input className="input" value={form.companyName} onChange={e=>setForm({...form, companyName: e.target.value})} />
            </div>
            <div>
              <label className="label">E‑posta</label>
              <input className="input" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} />
            </div>
            <div>
              <label className="label">Telefon</label>
              <input className="input" value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} />
            </div>
            <div>
              <label className="label">Plan</label>
              <select className="input" value={form.subscriptionPlan} onChange={e=>setForm({...form, subscriptionPlan: e.target.value})}>
                <option value="BASIC">BASIC</option>
                <option value="PROFESSIONAL">PROFESSIONAL</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Durum</label>
              <div>
                <label className="inline-flex items-center gap-2 mr-4"><input type="radio" checked={form.isActive} onChange={()=>setForm({...form, isActive: true})} /> Aktif</label>
                <label className="inline-flex items-center gap-2"><input type="radio" checked={!form.isActive} onChange={()=>setForm({...form, isActive: false})} /> Pasif</label>
              </div>
            </div>
            <div className="md:col-span-2">
              <button className="btn btn-primary" onClick={saveProfile}>Kaydet</button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2 className="text-lg font-semibold">Şifre Yönetimi</h2></div>
          <div className="card-body space-y-4">
            <div>
              <label className="label">Yeni Şifre</label>
              <input className="input" type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="En az 6 karakter" />
            </div>
            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={setPassword} disabled={newPassword.length < 6}>Şifreyi Güncelle</button>
              <button className="btn btn-outline" onClick={()=>router.push(`/superuser/smmm/${id}`)}>Detay Sayfasına Git</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


