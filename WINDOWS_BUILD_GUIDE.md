# Windows (PC .exe) Build Kılavuzu

Bu proje, React (Vite) frontend ve Express.js + SQLite backend içeren tam yığın (full-stack) bir uygulamadır. Bu uygulamayı Windows üzerinde çalışan tek bir `.exe` dosyası haline getirmek için **Electron** ve **electron-builder** altyapısı projeye entegre edilmiştir.

Aşağıdaki adımları takip ederek projeyi kendi Windows bilgisayarınızda derleyebilir ve kurulum dosyasını (`.exe`) oluşturabilirsiniz.

## 1. Gereksinimler (Bilgisayarınızda Yüklü Olması Gerekenler)

Bu projeyi Windows'ta build alabilmek için aşağıdaki programların bilgisayarınızda kurulu olması gerekmektedir:

1. **Node.js (LTS Versiyonu):**
   - [Node.js İndir](https://nodejs.org/) adresinden **LTS** (Long Term Support) sürümünü indirip kurun. (Önerilen: v20.x veya v22.x)
   - Kurulum sırasında "Automatically install the necessary tools" (Gerekli araçları otomatik kur) seçeneğini işaretlemeniz, SQLite gibi C++ bağımlılıklarının derlenmesi için gereken Python ve Visual Studio Build Tools'un kurulmasına yardımcı olur.

2. **Git:**
   - [Git İndir](https://git-scm.com/downloads) adresinden indirip kurun.

3. **Visual Studio Code (Önerilen Editör):**
   - [VS Code İndir](https://code.visualstudio.com/) adresinden kurabilirsiniz.

4. **C++ Build Tools (SQLite için Zorunlu):**
   - Uygulama Supabase kullandığı için internet bağlantısı gerektirir.
   - Eğer Node.js kurarken otomatik araçları kurmadıysanız, yönetici (Administrator) olarak PowerShell açıp şu komutu çalıştırın:
     ```bash
     npm install --global windows-build-tools
     ```
   - Veya [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) indirip "C++ build tools" iş yükünü seçerek kurun.

## 2. Projeyi Bilgisayarınıza İndirme ve Hazırlama

1. Proje dosyalarınızı (AI Studio'dan indirdiğiniz ZIP dosyası veya Git reposu) bilgisayarınızda bir klasöre çıkartın.
2. Klasörün içinde boş bir alana sağ tıklayıp **"Open in Terminal"** (Terminalde Aç) veya VS Code üzerinden terminali açın.
3. Bağımlılıkları yüklemek için şu komutu çalıştırın:
   ```bash
   npm install
   ```

## 3. Geliştirme Modunda Çalıştırma (İsteğe Bağlı)

Uygulamanın masaüstü versiyonunu test etmek için geliştirme modunda çalıştırabilirsiniz:
```bash
npm run electron:dev
```
Bu komut, hem arka planda sunucuyu başlatacak hem de Electron penceresini açacaktır.

## 4. Windows için .exe Build Alma

Tüm hazırlıklar tamamsa, uygulamayı paketleyip `.exe` dosyası oluşturmak için terminalde şu komutu çalıştırın:

```bash
npm run electron:build
```

### Build Sürecinde Neler Oluyor?
1. `npm run build`: React (Vite) frontend kodları `dist` klasörüne derlenir.
2. `npm run build:server`: Express.js backend kodları (`server.ts`), `esbuild` kullanılarak `dist-server/server.js` dosyasına derlenir.
3. `electron-builder --win`: Electron, tüm bu derlenmiş dosyaları ve `local.db` veritabanını alır, Windows için optimize edilmiş bir kurulum dosyası (`.exe`) üretir.

### Sonuç
İşlem tamamlandığında, proje ana dizininde **`dist-electron`** adında yeni bir klasör oluşacaktır.
Bu klasörün içinde **`Nexus Purchasing Setup 0.0.0.exe`** (veya benzer bir isimde) kurulum dosyanızı bulabilirsiniz.

Bu `.exe` dosyasını istediğiniz Windows bilgisayara kopyalayıp kurarak uygulamayı çalıştırabilirsiniz.

## 5. Veritabanı (SQLite) Hakkında Önemli Not
Uygulama ilk kez kurulup açıldığında, proje içindeki boş `local.db` dosyası, kullanıcının Windows'taki `AppData/Roaming/react-example` (veya uygulamanın adı neyse) klasörüne kopyalanır.
Böylece uygulama güncellense bile kullanıcının girdiği veriler silinmez ve korunur.

## Olası Hatalar ve Çözümleri

- **`better-sqlite3` derleme hatası (node-gyp error):**
  Windows Build Tools veya Python eksik demektir. 1. adımdaki 4. maddeyi (C++ Build Tools) uyguladığınızdan emin olun.
- **`esbuild` bulunamadı hatası:**
  `npm install` komutunu çalıştırdığınızdan emin olun.
- **Beyaz ekran çıkması:**
  Uygulama açıldığında beyaz ekran çıkıyorsa, sunucu başlatılamamış olabilir. Terminaldeki hata çıktılarını kontrol edin. Genellikle `.env` dosyasındaki eksik API key'lerden kaynaklanabilir. Proje dizininde bir `.env` dosyası oluşturup gerekli API anahtarlarını eklediğinizden emin olun.
