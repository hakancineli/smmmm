// e-Arşiv Portal form doldurma yardımcı scripti
(function() {
  // URL parametrelerini oku
  const urlParams = new URLSearchParams(window.location.search);
  const userCode = urlParams.get('userCode');
  const password = urlParams.get('password');
  
  if (userCode && password) {
    // Sayfa yüklendikten sonra form alanlarını doldur
    function fillForm() {
      // Kullanıcı kodu alanını bul ve doldur
      const userCodeInputs = [
        document.querySelector('input[name="kullanici"]'),
        document.querySelector('input[name="userCode"]'),
        document.querySelector('input[name="username"]'),
        document.querySelector('input[name="kullaniciKodu"]'),
        document.querySelector('input[placeholder*="kullanıcı" i]'),
        document.querySelector('input[placeholder*="user" i]'),
        document.querySelector('input[type="text"]')
      ].filter(Boolean);
      
      // Şifre alanını bul ve doldur
      const passwordInputs = [
        document.querySelector('input[name="sifre"]'),
        document.querySelector('input[name="password"]'),
        document.querySelector('input[name="pass"]'),
        document.querySelector('input[type="password"]')
      ].filter(Boolean);
      
      // Kullanıcı kodu alanını doldur
      if (userCodeInputs.length > 0) {
        userCodeInputs[0].value = userCode;
        userCodeInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
        userCodeInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
        console.log('Kullanıcı kodu dolduruldu:', userCode);
      }
      
      // Şifre alanını doldur
      if (passwordInputs.length > 0) {
        passwordInputs[0].value = password;
        passwordInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
        passwordInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
        console.log('Şifre dolduruldu');
      }
      
      // Giriş butonunu bul ve tıkla (opsiyonel)
      const loginButtons = [
        document.querySelector('button[type="submit"]'),
        document.querySelector('input[type="submit"]'),
        document.querySelector('button:contains("Giriş")'),
        document.querySelector('button:contains("Login")'),
        document.querySelector('button:contains("Giriş Yap")')
      ].filter(Boolean);
      
      if (loginButtons.length > 0) {
        console.log('Giriş butonu bulundu, otomatik tıklanacak...');
        // 1 saniye bekle ve giriş butonuna tıkla
        setTimeout(() => {
          loginButtons[0].click();
        }, 1000);
      }
    }
    
    // Sayfa yüklendiğinde çalıştır
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fillForm);
    } else {
      fillForm();
    }
    
    // 2 saniye sonra tekrar dene (dinamik içerik için)
    setTimeout(fillForm, 2000);
  }
})();
