# APEXOS - Derinlemesine Analiz & Geliştirme Yol Haritası (Roadmap)

Bu döküman, **APEXOS (Apex Neural Operating Environment)** kişisel yönetim ve iş takip sisteminin derinlemesine teknik analizini, masaüstü uygulamasına (Desktop App) dönüştürülme kılavuzunu, Supabase entegrasyon stratejisini, yapay zeka genişletme planlarını ve eksik modüllerin hayata geçirilme adımlarını içermektedir.

---

## 1. Derinlemesine Mevcut Durum Analizi (Technical Audit)

APEXOS, ultra-modern bir işletim sistemi (OS) hissi veren, yüksek kaliteli cam/3D (glassmorphic) arayüze sahip, React 19 ve Node.js (Express) tabanlı tam yığın (full-stack) bir web uygulamasıdır.

### 1.1. Mimari ve Teknoloji Yığını (Tech Stack)
*   **Frontend:** React 19, Vite, Tailwind CSS 4, Framer Motion (animasyonlar), Recharts (veri görselleştirme), Lucide React (ikon seti).
*   **Backend:** Express.js, TypeScript (`tsx` ile doğrudan çalıştırma), `esbuild` (sunucu paketleme).
*   **Veri Saklama (Mevcut):** Tarayıcı tarafında `localStorage` (Kişisel Finans, Notlar, Ayarlar için), bellek (in-memory) veri modelleri.
*   **Yapay Zeka:** `@google/genai` istemcisi ile doğrudan `gemini-3.5-flash` modeline bağlantı.

### 1.2. Modül Bazlı Durum Analizi
1.  **Kişisel Finans (FİNANS):** En gelişmiş modüldür. `financeHealthEngine.ts` adında yerel bir akıllı bütçe puanlama, stres testi ve nedensellik analiz motoru içerir.
2.  **Stoklar & Cariler (STOKLAR & CARİLER):** `StockDashboard` ve `ContactDashboard` gibi görsel paneller tamamlanmış olup buralardan diğer alt sayfalara (Listeler, Raporlar) yönlendirmeler mevcuttur. Veriler statik mock data veya kısmen yerel saklamaya bağlıdır.
3.  **Notlarım & Bülten:** Gemini yapay zekası ile en çok etkileşime giren modüllerdir. Not Sihirbazı (ham düşünceleri düzenleme) ve Bülten Haber Özetleme özellikleri tam işlevsel çalışmaktadır.
4.  **Kütüphane, Fason İşler, Mutabakat:** Bu modüllerin navigasyonu ve ana konteynerleri hazır olmakla birlikte, içerik olarak `ComingSoon.tsx` veya statik "İçerik Hazırlanıyor" şablonlarını kullanmaktadırlar.

---

## 2. Masaüstü Uygulaması (Desktop App) Hazırlığı

APEXOS'u masaüstünde (Windows `.exe` veya macOS `.app`) bağımsız bir uygulama olarak çalıştırmak, daha hızlı performans, yerel dosya erişimi, çevrimdışı çalışabilme ve yerel bildirimler (OS Notifications) gibi büyük avantajlar sunar.

### 2.1. Electron ve Geliştirme Ortamı Kurulumu
Uygulamayı Electron ile sarmalamak için aşağıdaki adımlar uygulanmalıdır:

1.  **Bağımlılıkların Eklenmesi:**
    ```bash
    npm install electron electron-is-dev --save-dev
    npm install electron-builder --save-dev
    ```
2.  **Electron Giriş Dosyası (`electron.js` veya `main.js`):**
    Projenin ana dizininde Electron ana sürecini başlatan ve Express.js sunucusunu arka planda tetikleyen bir giriş dosyası oluşturulmalıdır.
3.  **`package.json` Konfigürasyonu:**
    `electron-builder` için paketleme ayarları ve başlatma scriptleri tanımlanmalıdır:
    ```json
    "main": "electron.js",
    "scripts": {
      "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:3000 && electron .\"",
      "electron:build": "npm run build && electron-builder --win"
    }
    ```

### 2.2. Yerel Veritabanı (SQLite) & Çevrimdışı (Offline-First) Çalışma
Masaüstü uygulamalarında verilerin yerel diskte güvenle saklanması için **SQLite** (örneğin `better-sqlite3` kütüphanesi) entegre edilmelidir.
*   **SQLite Entegrasyonu:** Express.js backend'inde veri tabanı bağlantısı kurularak `local.db` dosyası oluşturulur.
*   **Masaüstü Dağıtım:** Uygulama ilk kez açıldığında, gömülü boş `local.db` kullanıcının `AppData/Roaming/APEXOS/` klasörüne kopyalanır ve güncellemelerde verilerin kaybolması önlenir.

---

## 3. Supabase Entegrasyon Stratejisi (Bulut Senkronizasyonu)

Verilerin sadece yerel bilgisayarda kalmaması, web ve mobil cihazlar arasında anlık olarak senkronize edilmesi için en modern alternatif **Supabase**'dir.

```
+-------------------------------------------------+
|                   APEXOS UI                     |
|    (React / LocalState / Offline-First Cache)   |
+-------------------------------------------------+
                        |
                        v
         +-----------------------------+
         |     Supabase Sync Engine    |
         |      (supabaseService.ts)   |
         +-----------------------------+
                        |
            +-----------+-----------+
            |                       |
            v                       v
    +---------------+       +---------------+
    | Local Storage |       |  Cloud DB     |
    |   / SQLite    |       |  (PostgreSQL) |
    +---------------+       +---------------+
```

### 3.1. Neden Supabase?
*   **Realtime PostgreSQL:** Veritabanında yapılan bir değişiklik (örn. yeni bir stok kaydı veya finans harcaması) diğer tüm cihazlara anında yansır.
*   **Supabase Auth:** Google, GitHub veya E-posta ile güvenli ve kolay kullanıcı oturumu açma.
*   **Offline-First & Sync:** Kullanıcı çevrimdışıyken işlemler yerel saklama alanına (LocalStorage/SQLite) kaydedilir; internet geldiğinde otomatik olarak Supabase bulut veritabanına senkronize edilir.

### 3.2. Taslak Veritabanı Şeması (Database Schema)

Supabase üzerinde oluşturulacak temel tablolar ve ilişkileri:

#### A. `profiles` (Kullanıcı Profilleri)
*   `id` (uuid, Primary Key - auth.users referanslı)
*   `full_name` (text)
*   `avatar_url` (text)
*   `settings` (jsonb - tema, sidebar konumu, bildirim tercihleri)

#### B. `finance_transactions` (Gelir & Giderler)
*   `id` (uuid, Primary Key)
*   `user_id` (uuid, Foreign Key)
*   `title` (text)
*   `amount` (numeric)
*   `type` (text - 'income' | 'expense')
*   `category` (text)
*   `date` (date)
*   `status` (text)
*   `created_at` (timestamp)

#### C. `stocks` (Stok Kartları)
*   `id` (uuid, Primary Key)
*   `user_id` (uuid, Foreign Key)
*   `name` (text)
*   `code` (text)
*   `category` (text)
*   `quantity` (numeric)
*   `min_quantity` (numeric - kritik limit)
*   `price` (numeric)
*   `unit` (text)
*   `created_at` (timestamp)

#### D. `contacts` (Cari Kartları)
*   `id` (uuid, Primary Key)
*   `user_id` (uuid, Foreign Key)
*   `name` (text)
*   `type` (text - 'customer' | 'supplier' | 'fason')
*   `phone` (text)
*   `email` (text)
*   `balance` (numeric)
*   `created_at` (timestamp)

---

## 4. Yapay Zeka (AI) Genişletme Planı

Gemini API'sinin gücü, APEXOS'u sadece bir veri giriş aracı olmaktan çıkarıp aktif kararlar alan akıllı bir asistana dönüştürecektir.

### 4.1. Akıllı Finans ve Stok Danışmanı (AI Chatbot)
*   **İşlev:** Kullanıcının mevcut finansal durumunu (gelir/gider trendleri, borçlar, tasarruf oranları) ve stok verilerini analiz ederek kişiselleştirilmiş finansal tavsiyeler veren, soruları yanıtlayan etkileşimli bir sohbet arayüzü (Chatbot).
*   **Kazanım:** "Bu ay tasarrufumu artırmak için hangi giderimi kısmalıyım?" veya "Hangi stoklarımız kritik seviyenin altına düşmek üzere ve ne zaman sipariş vermeliyim?" gibi sorulara anında akıllı yanıtlar üretir.

### 4.2. Yapay Zeka Destekli Stok ve Satınalma Tahmincisi
*   **İşlev:** Son 30 günlük stok çıkış hareketlerini analiz ederek, belirli bir ürünün stokunun tahminen kaç gün sonra sıfırlanacağını (Runout Date) hesaplayan ve otomatik satınalma talebi oluşturan tahmin motoru.
*   **Kazanım:** Tedarik zinciri aksamalarını sıfıra indirir.

---

## 5. Eksik Modüllerin Hayata Geçirilmesi ve Geliştirme Adımları

"Coming Soon" durumundaki modüllerin hayata geçirilmesi, uygulamanın bütünlüğünü sağlayacaktır.

### 5.1. Fason İşler Modülü (Contract Manufacturing)
*   **Görünüm:** Gönderilen işler, fasoncudan beklenen teslimatlar, birim fiyatlar ve fason operasyonlarının durum takibi (Hazırlanıyor, Sevk Edildi, Fasoncuda, Tamamlandı).
*   **Teknik Detay:** `FasonDashboard`, `FasonOutgoing` ve `FasonAll` bileşenleri statik şablon yerine etkileşimli tablolara ve durum kartlarına kavuşturulacaktır.

### 5.2. Mutabakat Modülü (Reconciliation)
*   **Görünüm:** Carilerle olan hesap bakiye mutabakat süreçleri. Firmaya tek tıkla "Mutabakat Mektubu" (PDF/Excel) oluşturma ve onay durumu takibi.
*   **Teknik Detay:** PDF export yetenekleri (`jspdf`, `jspdf-autotable`) kullanılarak profesyonel mutabakat raporları üretilecektir.

---

## 6. Uygulama ve Entegrasyon Takvimi (Aksiyon Planı)

```
+--------------------------------------------------------------------------+
| FAZ 1: ALTYAPI VE ANALİZ (Tamamlandı)                                     |
| - Proje mimarisinin derinlemesine incelenmesi                            |
| - YOL_HARITASI.md oluşturulması ve Supabase / AI vizyonunun çizilmesi    |
+--------------------------------------------------------------------------+
                                    |
                                    v
+--------------------------------------------------------------------------+
| FAZ 2: BULUT VE VERİ ENTEGRASYONU (Şu anki Adım)                           |
| - src/lib/supabase.ts ile Supabase Client kurulumu                       |
| - Çevrimdışı öncelikli yerel ve bulut senkronizasyon mekanizması          |
+--------------------------------------------------------------------------+
                                    |
                                    v
+--------------------------------------------------------------------------+
| FAZ 3: YAPAY ZEKA VE ETKİLEŞİMLİ ASİSTAN                                  |
| - Akıllı Finans ve Stok Chatbot Bileşeni (AIFinanceAssistant.tsx)        |
| - Gemini API ile bütçe ve stok veri analizi                              |
+--------------------------------------------------------------------------+
                                    |
                                    v
+--------------------------------------------------------------------------+
| FAZ 4: İÇERİK HAZIRLANIYOR MODÜLLERİ VE KAPANIŞ                          |
| - Fason İşler ve Mutabakat sayfalarının aktifleştirilmesi                |
| - Masaüstü uygulaması için paketleme konfigürasyonu testleri             |
+--------------------------------------------------------------------------+
```

Bu yol haritası, APEXOS'u modern bir web platformundan, her platformda senkronize çalışan, veri güvenliği yüksek ve yapay zeka aklıyla donatılmış üst düzey bir **bütünleşik işletme ve kişisel yönetim sistemine** yükseltecektir.
