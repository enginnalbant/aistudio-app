import React from 'react';
import ReactMarkdown from 'react-markdown';

const MarkdownContainer = ({ content }: { content: string }) => (
  <div className="p-8 bento-card prose prose-invert max-w-none">
    <ReactMarkdown>{content}</ReactMarkdown>
  </div>
);

export const PurchasingDashboard = () => (
  <MarkdownContainer content={`# Satınalma Modülü
Satınalma ana sayfasına hoş geldiniz. Burada genel süreçleri takip edebilirsiniz.`} />
);

export const PurchasingRequests = () => (
  <MarkdownContainer content={`# Satınalma Talepleri
Şu an aktif bir talep bulunmamaktadır. Yeni bir talep oluşturmak için sistem yöneticinizle iletişime geçin.`} />
);

export const PurchasingLists = () => (
  <MarkdownContainer content={`# Satınalma Listeleri
Kayıtlı ürün listeleri ve kategoriler burada görüntülenecektir.`} />
);

export const PurchasingQuotes = () => (
  <MarkdownContainer content={`# Fiyat Teklifleri
Tedarikçilerden gelen aktif fiyat teklifleri burada listelenecektir.`} />
);

export const PurchasingPendingOrders = () => (
  <MarkdownContainer content={`# Onay Bekleyen Siparişler
Onay sürecinde olan siparişlerin takibi için bu bölümü kullanın.`} />
);

export const PurchasingSentOrders = () => (
  <MarkdownContainer content={`# Verilen Siparişler
Tedarikçilere iletilmiş ve işleme alınmış siparişler.`} />
);

export const PurchasingAllOrders = () => (
  <MarkdownContainer content={`# Tüm Siparişler
Geçmişten günümüze tüm sipariş kayıtlarına buradan ulaşabilirsiniz.`} />
);

export const PurchasingReports = () => (
  <MarkdownContainer content={`# Raporlar
Haftalık, aylık ve yıllık satınalma raporları oluşturuluyor.`} />
);

export const PurchasingAnalytics = () => (
  <MarkdownContainer content={`# Analizler
Satınalma verimliliği ve maliyet analizleri grafiklerle sunulacaktır.`} />
);
