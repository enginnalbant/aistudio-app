# APEX OS - Kurulum ve Çalıştırma Kılavuzu

Bu proje; modern **React 19 (Vite)** frontend'i, **Express.js API** backend'i, **Google Gemini AI SDK**, **BlockSuite** gelişmiş not editörü ve **Firebase** entegrasyonu içeren yeni nesil tam yığın (full-stack) bir kişisel ve kurumsal yönetim işletim sistemidir.

---

## 1. Gereksinimler

Uygulamayı yerel geliştirme ortamınızda veya sunucunuzda çalıştırmak için:

1. **Node.js (v20+ LTS önerilir):** [nodejs.org](https://nodejs.org/) adresinden LTS sürümünü kurun.
2. **Paket Yöneticisi:** `npm`, `pnpm` veya `bun`.
3. **Gemini API Anahtarı (Opsiyonel / Önerilen):** AI asistanı, bülten özetleme ve BlockSuite Copilot özelliklerinin aktif çalışması için [Google AI Studio](https://aistudio.google.com/)'dan bir API key edinin.

---

## 2. Çevre Değişkenleri (.env)

Proje kök dizininde bir `.env` dosyası oluşturun ve aşağıdaki değişkenleri tanımlayın:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
NODE_ENV=development
```

---

## 3. Geliştirme Modunda Başlatma

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. Geliştirme sunucusunu (Express + Vite SSR Middleware) başlatın:
   ```bash
   npm run dev
   ```

3. Tarayıcınızda açın:
   `http://localhost:3000`

---

## 4. Üretim (Production) Derleme ve Çalıştırma

Uygulamayı yayına hazırlamak ve derlemek için:

1. Frontend ve Backend'i derleyin:
   ```bash
   npm run build
   ```
   *Bu komut frontend kodlarını `dist/` klasörüne, backend Express sunucusunu ise `esbuild` ile `dist/server.cjs` dosyasına paketler.*

2. Üretim sunucusunu çalıştırın:
   ```bash
   npm start
   ```

---

## 5. Modül Mimarisi & Özellikler

- **Kişisel Finans & Bütçe:** Gelir, gider, yatırım, abonelik, 50/30/20 kuralı ve stres testleri içeren yerel matematiksel sağlık motoru (`financeHealthEngine.ts`).
- **Knowledge Workspace:** Notlar, todolar, yer imleri, kitaplık, şifre kasası ve RSS akışları; kesintisiz `localStorage` kalıcılığı ile çalışır.
- **BlockSuite Canvas & Doc Editör:** Zengin metin, edgeless sonsuz tuval ve AI Copilot asistanı.
- **AI Komut Merkezi:** Slash (`/`) komutları ile hızlı not, gider, gelir, stok ve ajanda yönetimi.
- **RSS Proxy & Haber Motoru:** Canlı RSS XML ayrıştırıcı, otomatik feed onarımı ve bülten özetleme.
