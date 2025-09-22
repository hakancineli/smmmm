# SMMM Mükellef CRM Sistemi

## Proje Açıklaması
Türkiye'deki Serbest Muhasebeci Mali Müşavirler (SMMM) için geliştirilmiş multi-tenant CRM sistemi.

## Özellikler

### 🏢 Multi-Tenant Yapı
- Superuser (geliştirici) kontrolü
- SMMM hesap yönetimi
- Veri izolasyonu

### 👥 Mükellef Yönetimi
- Mükellef kayıt ve takibi
- Aylık aidat yönetimi
- Ödeme durumu takibi

### 🔗 E-Devlet Entegrasyonları
- E-Arşiv Portal entegrasyonu
- Dijital GİB Portal entegrasyonu
- İstanbul GİB entegrasyonu

### 📱 WhatsApp Entegrasyonu
- Beyanname PDF gönderimi
- Ödeme hatırlatmaları
- Otomatik bildirimler

## Teknoloji Stack

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** JWT + Refresh Token
- **File Storage:** AWS S3
- **Real-time:** Socket.io

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Veritabanını ayarla
npm run db:migrate

# Seed verilerini yükle
npm run db:seed

# Geliştirme sunucusunu başlat
npm run dev
```

## Veritabanı Yapısı

### Ana Tablolar
- `superusers` - Superuser hesapları
- `smmm_accounts` - SMMM tenant hesapları
- `taxpayers` - Mükellef bilgileri
- `monthly_payments` - Aylık ödeme takibi
- `edevlet_credentials` - E-Devlet şifreleri

## API Endpoints

### Superuser Endpoints
- `POST /api/superuser/login` - Superuser girişi
- `POST /api/superuser/smmm/create` - SMMM hesabı oluştur
- `GET /api/superuser/smmm/list` - SMMM listesi

### SMMM Endpoints
- `POST /api/smmm/login` - SMMM girişi
- `GET /api/smmm/taxpayers` - Mükellef listesi
- `POST /api/smmm/taxpayers` - Mükellef ekle
- `GET /api/smmm/payments` - Ödeme listesi

### Mükellef Endpoints
- `GET /api/taxpayers/:id/payments` - Mükellef ödemeleri
- `POST /api/taxpayers/:id/payments` - Ödeme kaydet

## Güvenlik

- KVKK uyumlu veri şifreleme
- Multi-tenant veri izolasyonu
- JWT tabanlı kimlik doğrulama
- E-Devlet şifrelerinin güvenli saklanması

## Lisans

MIT License
