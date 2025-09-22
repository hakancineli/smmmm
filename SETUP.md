# SMMM Mükellef CRM - Kurulum Talimatları

## Gereksinimler

- Node.js 18+ 
- PostgreSQL 14+
- npm veya yarn

## Kurulum Adımları

### 1. Projeyi Klonlayın
```bash
git clone <repository-url>
cd smmmmukellef.com
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Environment Dosyasını Oluşturun
```bash
cp env.example .env
```

`.env` dosyasını düzenleyin:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/smmmmukellef_crm?schema=public"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

### 4. Veritabanını Oluşturun
```bash
# PostgreSQL'de veritabanı oluşturun
createdb smmmmukellef_crm

# Prisma migration'larını çalıştırın
npm run db:migrate

# Seed verilerini yükleyin
npm run db:seed
```

### 5. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```

## Demo Hesaplar

### Superuser
- **Kullanıcı Adı:** admin
- **Şifre:** admin123

### SMMM Hesapları
- **Kullanıcı Adı:** smmm1
- **Şifre:** smmmm123

- **Kullanıcı Adı:** smmm2  
- **Şifre:** smmmm123

## API Endpoints

### Superuser Endpoints
- `POST /api/superuser/login` - Superuser girişi
- `POST /api/superuser/smmm/create` - SMMM hesabı oluştur

### SMMM Endpoints
- `POST /api/smmm/login` - SMMM girişi
- `GET /api/smmm/taxpayers` - Mükellef listesi
- `POST /api/smmm/taxpayers` - Mükellef ekle
- `GET /api/smmm/payments` - Ödeme listesi
- `POST /api/smmm/payments` - Ödeme kaydet
- `PUT /api/smmm/payments/[id]` - Ödeme güncelle
- `GET /api/smmm/dashboard` - Dashboard istatistikleri
- `GET /api/smmm/edevlet-credentials` - E-Devlet şifreleri
- `POST /api/smmm/edevlet-credentials` - E-Devlet şifre kaydet
- `POST /api/smmm/whatsapp` - WhatsApp mesaj gönder

## Veritabanı Yapısı

### Ana Tablolar
- `superusers` - Superuser hesapları
- `smmm_accounts` - SMMM tenant hesapları  
- `taxpayers` - Mükellef bilgileri
- `payments` - Aylık ödeme takibi
- `edevlet_credentials` - E-Devlet şifreleri
- `documents` - Doküman yönetimi
- `whatsapp_messages` - WhatsApp mesaj geçmişi

## Özellikler

### ✅ Tamamlanan
- Multi-tenant veritabanı tasarımı
- Authentication sistemi (JWT)
- Superuser ve SMMM login
- Mükellef yönetimi API'leri
- Ödeme takibi API'leri
- Dashboard istatistikleri
- E-Devlet şifre yönetimi
- WhatsApp entegrasyonu temel yapısı
- Responsive ana sayfa tasarımı

### 🚧 Geliştirilmekte
- Frontend dashboard sayfaları
- E-Devlet entegrasyonları (web scraping)
- WhatsApp Business API entegrasyonu
- Dosya yükleme sistemi
- Raporlama sayfaları
- Mobil uygulama

## Güvenlik

- JWT tabanlı kimlik doğrulama
- Multi-tenant veri izolasyonu
- E-Devlet şifrelerinin şifrelenmiş saklanması
- Input validation ve sanitization
- CORS koruması

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

MIT License
