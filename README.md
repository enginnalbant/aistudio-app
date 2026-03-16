<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Nexus OS - Üretim Takip Sistemi

Akıllı ve dinamik bir üretim takip ve envanter yönetim sistemi. Web uygulaması olarak veya masaüstü uygulaması (Electron) olarak çalıştırılabilir.

**AI Studio:** https://ai.studio/apps/2cb0c450-5907-4f7c-a9c8-de8445b9d92b

---

## Özellikler

- Üretim iş emri takibi
- Stok ve envanter yönetimi
- Cari hesap yönetimi
- Bütçe ve finans takibi
- Sevkiyat ve lojistik yönetimi
- Satınalma yönetimi
- Takvim ve planlayıcı
- Yapay zeka destekli asistan (Google Gemini)
- PDF ve Excel rapor üretimi
- 3D görselleştirme
- Karanlık/aydınlık tema desteği

---

## Gereksinimler

- **Node.js** v18 veya üzeri
- **npm** v9 veya üzeri

---

## Web Uygulaması Olarak Çalıştırma

```bash
# Bağımlılıkları yükle
npm install

# .env.local dosyasına GEMINI_API_KEY değerini ayarla
# Geliştirme sunucusunu başlat
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

### Üretim Derlemesi (Web)

```bash
npm run build
npm run start
```

---

## Masaüstü Uygulaması (Electron)

### Geliştirme Modunda Çalıştırma

```bash
# Bağımlılıkları yükle
npm install

# Electron geliştirme modunda başlat
npm run electron:dev
```

Bu komut Express backend sunucusunu başlatır ve uygulamayı bir Electron penceresinde açar.

### Masaüstü Uygulaması Derleme

```bash
# Windows için derleme (.exe kurulum dosyası)
npm run electron:build:win

# macOS için derleme (.dmg)
npm run electron:build:mac

# Linux için derleme (.AppImage, .deb)
npm run electron:build:linux

# Tüm platformlar için derleme
npm run electron:build
```

Derlenen dosyalar `release/` klasöründe oluşturulur.

### Windows Kurulum Dosyası

Windows derlemesi sonucunda `release/` klasöründe bir NSIS kurulum dosyası (.exe) oluşur. Bu dosya:
- Masaüstü kısayolu oluşturur
- Başlat menüsüne ekler
- Kurulum dizinini seçmenize izin verir

---

## Uygulama İkonu

`public/icon.png` dosyasını kendi uygulama ikonunuzla değiştirin. Önerilen boyut: **512x512 piksel** PNG formatında.

---

## Proje Yapısı

```
├── electron/
│   ├── main.js          # Electron ana işlem (main process)
│   └── preload.js       # Electron preload betiği
├── src/
│   ├── App.tsx           # Ana React bileşeni
│   ├── main.tsx          # React giriş noktası
│   ├── components/       # UI bileşenleri
│   ├── context/          # React context'ler
│   ├── services/         # Veritabanı servisleri
│   └── utils/            # Yardımcı fonksiyonlar
├── server.ts             # Express backend sunucusu
├── electron-builder.json # Electron Builder yapılandırması
├── vite.config.ts        # Vite yapılandırması
└── package.json          # Proje bağımlılıkları ve betikler
```

---

## Kullanılan Teknolojiler

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Backend:** Express.js, better-sqlite3
- **Masaüstü:** Electron
- **3D:** Three.js, React Three Fiber
- **Yapay Zeka:** Google Gemini AI
- **Bulut:** Firebase, Supabase (opsiyonel)

---

## Lisans

Bu proje özel kullanım içindir.
