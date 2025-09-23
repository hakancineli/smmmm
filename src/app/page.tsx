import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-4">
              <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              SMMM Mükellef CRM
            </h1>
            <p className="text-lg text-primary-600 font-medium">
              Profesyonel Mali Müşavir Çözümleri
            </p>
          </div>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Serbest Muhasebeci Mali Müşavirler için geliştirilmiş <strong>multi-tenant CRM sistemi</strong>. 
            Mükellef yönetimi, ödeme takibi, E-Devlet entegrasyonları ve WhatsApp bildirimleri ile 
            işinizi dijitalleştirin ve verimliliğinizi artırın.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/smmm/login" 
              className="btn btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              SMMM Girişi
            </Link>
            <Link 
              href="/smmm/register" 
              className="btn btn-success text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Ücretsiz Kayıt Ol
            </Link>
            <Link 
              href="/superuser/login" 
              className="btn btn-outline text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Yönetici Girişi
            </Link>
          </div>

          {/* Öne Çıkan Özellikler */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Neden SMMM Mükellef CRM?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hızlı Kurulum</h3>
                <p className="text-gray-600">5 dakikada kurulum, hemen kullanmaya başlayın</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Güvenli Veri</h3>
                <p className="text-gray-600">KVKK uyumlu, şifrelenmiş veri saklama</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">7/24 Destek</h3>
                <p className="text-gray-600">Uzman ekibimiz her zaman yanınızda</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="card">
            <div className="card-body text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Mükellef Yönetimi
              </h3>
              <p className="text-gray-600">
                Mükellef bilgilerini kaydedin, düzenleyin ve takip edin. 
                TC Kimlik No ve Vergi No doğrulaması ile güvenli veri yönetimi.
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ödeme Takibi
              </h3>
              <p className="text-gray-600">
                Aylık aidat ödemelerini takip edin. Ödenmiş, bekleyen ve geciken 
                ödemeleri kolayca görüntüleyin ve yönetin.
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                E-Devlet Entegrasyonu
              </h3>
              <p className="text-gray-600">
                E-Arşiv Portal, Dijital GİB ve İstanbul GİB entegrasyonları ile 
                mükellef adına fatura kesme ve beyanname takibi.
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                WhatsApp Entegrasyonu
              </h3>
              <p className="text-gray-600">
                Mükelleflere WhatsApp üzerinden beyanname PDF'leri gönderin, 
                ödeme hatırlatmaları yapın ve iletişimi kolaylaştırın.
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Raporlama ve Analiz
              </h3>
              <p className="text-gray-600">
                Detaylı raporlar ve analizler ile işinizi daha iyi yönetin. 
                Gelir analizi, ödeme trendleri ve performans metrikleri.
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Güvenlik ve Uyumluluk
              </h3>
              <p className="text-gray-600">
                KVKK uyumlu veri şifreleme, multi-tenant veri izolasyonu ve 
                güvenli E-Devlet şifre saklama ile maksimum güvenlik.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Hemen Deneyin
          </h2>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 max-w-3xl mx-auto mb-8 shadow-lg">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-blue-900">Demo Hesabı ile Test Edin</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Kullanıcı Adı</p>
                <p className="text-lg font-mono font-semibold text-gray-900">smmm1</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Şifre</p>
                <p className="text-lg font-mono font-semibold text-gray-900">smmm123</p>
              </div>
            </div>
            <p className="text-blue-700 mb-6">
              <strong>Örnek veriler:</strong> 3 mükellef, 6 ödeme kaydı, serbest kalemler ve detaylı raporlar
            </p>
            <Link 
              href="/smmm/login" 
              className="btn btn-primary text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Demo ile Giriş Yap
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Sistem İstatistikleri
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
            <div className="card">
              <div className="card-body text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">2+</div>
                <div className="text-gray-600">Aktif SMMM</div>
              </div>
            </div>
            <div className="card">
              <div className="card-body text-center">
                <div className="text-3xl font-bold text-success-600 mb-2">3</div>
                <div className="text-gray-600">Toplam Mükellef</div>
              </div>
            </div>
            <div className="card">
              <div className="card-body text-center">
                <div className="text-3xl font-bold text-warning-600 mb-2">6</div>
                <div className="text-gray-600">Ödeme Kaydı</div>
              </div>
            </div>
            <div className="card">
              <div className="card-body text-center">
                <div className="text-3xl font-bold text-danger-600 mb-2">₺1,250</div>
                <div className="text-gray-600">Toplam Gelir</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Özellikler
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-success-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Multi-tenant mimari ile veri izolasyonu
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-success-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Responsive tasarım (Web + Mobil)
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-success-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  E-Devlet entegrasyonları
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-success-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  WhatsApp Business API entegrasyonu
                </li>
              </ul>
            </div>
            <div className="text-left">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-success-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Otomatik ödeme hatırlatmaları
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-success-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Detaylı raporlama ve analiz
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-success-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  KVKK uyumlu veri güvenliği
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-success-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  7/24 teknik destek
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 bg-gray-900 text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">SMMM Mükellef CRM</h3>
                <p className="text-gray-400">
                  Serbest Muhasebeci Mali Müşavirler için geliştirilmiş 
                  multi-tenant CRM sistemi.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Hızlı Linkler</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/smmm/login" className="text-gray-400 hover:text-white">
                      SMMM Girişi
                    </Link>
                  </li>
                  <li>
                    <Link href="/smmm/register" className="text-gray-400 hover:text-white">
                      SMMM Kayıt
                    </Link>
                  </li>
                  <li>
                    <Link href="/superuser/login" className="text-gray-400 hover:text-white">
                      Yönetici Girişi
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">İletişim</h3>
                <p className="text-gray-400">
                  Domain: smmmmukellef.com.tr<br />
                  Email: info@smmmmukellef.com.tr
                </p>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 SMMM Mükellef CRM. Tüm hakları saklıdır.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
