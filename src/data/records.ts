export interface RawRecord {
  id: string;
  date: string;
  supplier: string;
  stock: string;
  outgoing: number;
  incoming: number;
}

export const rawRecords: RawRecord[] = [
  { id: '1', date: '02.01.2026', supplier: 'ZG BOYA', stock: 'EUROCLAMP 2 GİRİŞLİ', outgoing: 0, incoming: 100 },
  { id: '2', date: '02.01.2026', supplier: 'ZG BOYA', stock: 'MASA AYAĞI', outgoing: 0, incoming: 4 },
  { id: '3', date: '09.01.2026', supplier: 'ZG BOYA', stock: 'DEMİR BARREL GÖVDE', outgoing: 0, incoming: 6 },
  { id: '4', date: '09.01.2026', supplier: 'ZG BOYA', stock: 'METAL YATAK GÖVDE', outgoing: 0, incoming: 5 },
  { id: '5', date: '09.01.2026', supplier: 'ZG BOYA', stock: 'CHAIR ASKI BÜYÜK', outgoing: 0, incoming: 20 },
  { id: '6', date: '09.01.2026', supplier: 'ZG BOYA', stock: 'JUMPBOARD LAMA', outgoing: 0, incoming: 40 },
  { id: '7', date: '12.01.2026', supplier: 'ZG BOYA', stock: 'STOPER SACI', outgoing: 206, incoming: 0 },
  { id: '8', date: '13.01.2026', supplier: 'ZG BOYA', stock: 'SKOLYOZ BAR DUVAR BAĞLANTI PARÇASI', outgoing: 8, incoming: 0 },
  { id: '9', date: '15.01.2026', supplier: 'ZG BOYA', stock: 'OMUZLUK L DEMİR', outgoing: 100, incoming: 0 },
  { id: '10', date: '15.01.2026', supplier: 'ZG BOYA', stock: 'OMUZLUK KARE', outgoing: 20, incoming: 0 },
  { id: '11', date: '16.01.2026', supplier: 'ZG BOYA', stock: 'OMUZLUK L DEMİR', outgoing: 0, incoming: 100 },
  { id: '12', date: '16.01.2026', supplier: 'ZG BOYA', stock: 'SKOLYOZ BAR DUVAR BAĞLANTI PARÇASI', outgoing: 0, incoming: 8 },
  { id: '13', date: '16.01.2026', supplier: 'ZG BOYA', stock: 'OMUZLUK KARE', outgoing: 0, incoming: 20 },
  { id: '14', date: '16.01.2026', supplier: 'ZG BOYA', stock: 'STOPER SACI', outgoing: 0, incoming: 206 },
  { id: '15', date: '16.01.2026', supplier: 'ZG BOYA', stock: 'DEMİR BARREL GÖVDE', outgoing: 0, incoming: 1 },
  { id: '16', date: '16.01.2026', supplier: 'ZG BOYA', stock: 'SKOLYOZ BAR DUVAR BAĞLANTI PARÇASI', outgoing: 20, incoming: 0 },
  { id: '17', date: '16.01.2026', supplier: 'ZG BOYA', stock: 'OMUZLUK KARE', outgoing: 60, incoming: 0 },
  { id: '18', date: '19.01.2026', supplier: 'ZG BOYA', stock: 'STOPER SACI', outgoing: 198, incoming: 0 },
  { id: '19', date: '19.01.2026', supplier: 'ZG BOYA', stock: 'METAL TOWER KISA BORU', outgoing: 60, incoming: 0 },
  { id: '20', date: '19.01.2026', supplier: 'ZG BOYA', stock: 'METAL TOWER UZUN BORU', outgoing: 40, incoming: 0 },
  { id: '21', date: '19.01.2026', supplier: 'ZG BOYA', stock: '30*30*2MM 60CM METAL YATAK JUMPBOARD DEMİRİ', outgoing: 80, incoming: 0 },
  { id: '22', date: '19.01.2026', supplier: 'ZG BOYA', stock: '30*30*2MM 45CM METAL YATAK JUMPBOARD DEMİRİ', outgoing: 20, incoming: 0 },
  { id: '23', date: '19.01.2026', supplier: 'ZG BOYA', stock: 'EUROCLAMP 2 GİRİŞLİ', outgoing: 50, incoming: 0 },
  { id: '24', date: '19.01.2026', supplier: 'ZG BOYA', stock: 'EUROCLAMP 3 GİRİŞLİ', outgoing: 50, incoming: 0 },
  { id: '25', date: '21.01.2026', supplier: 'ZG BOYA', stock: 'DIŞ DÖKÜM', outgoing: 0, incoming: 54 },
  { id: '26', date: '21.01.2026', supplier: 'ZG BOYA', stock: 'TOWER DİRSEK', outgoing: 0, incoming: 6 },
  { id: '27', date: '21.01.2026', supplier: 'ZG BOYA', stock: 'FOOTBAR TARAK', outgoing: 0, incoming: 2 },
  { id: '28', date: '21.01.2026', supplier: 'ZG BOYA', stock: 'METAL TOWER KISA BORU', outgoing: 0, incoming: 1 },
  { id: '29', date: '21.01.2026', supplier: 'ZG BOYA', stock: 'EUROCLAMP 2 GİRİŞLİ', outgoing: 0, incoming: 20 },
  { id: '30', date: '21.01.2026', supplier: 'ZG BOYA', stock: 'EUROCLAMP 3 GİRİŞLİ', outgoing: 0, incoming: 20 },
  { id: '31', date: '22.01.2026', supplier: 'ZG BOYA', stock: 'EUROCLAMP 2 GİRİŞLİ', outgoing: 2, incoming: 0 },
  { id: '32', date: '22.01.2026', supplier: 'ZG BOYA', stock: 'EUROCLAMP 3 GİRİŞLİ', outgoing: 6, incoming: 0 },
  { id: '33', date: '22.01.2026', supplier: 'ZG BOYA', stock: 'EUROCLAMP KAYAR', outgoing: 6, incoming: 0 },
  { id: '34', date: '22.01.2026', supplier: 'ZG BOYA', stock: 'DIŞ DÖKÜM', outgoing: 8, incoming: 0 },
  { id: '35', date: '22.01.2026', supplier: 'ZG BOYA', stock: 'OMUZLUK L DEMİR', outgoing: 19, incoming: 0 },
  { id: '36', date: '23.01.2026', supplier: 'ZG BOYA', stock: 'EUROCLAMP 2 GİRİŞLİ', outgoing: 0, incoming: 2 },
  { id: '37', date: '23.01.2026', supplier: 'ZG BOYA', stock: 'EUROCLAMP 3 GİRİŞLİ', outgoing: 0, incoming: 6 },
  { id: '38', date: '23.01.2026', supplier: 'ZG BOYA', stock: 'EUROCLAMP KAYAR', outgoing: 0, incoming: 6 },
  { id: '39', date: '23.01.2026', supplier: 'ZG BOYA', stock: 'DIŞ DÖKÜM', outgoing: 0, incoming: 10 },
  { id: '40', date: '23.01.2026', supplier: 'ZG BOYA', stock: 'TOWER DİRSEK', outgoing: 0, incoming: 20 },
  { id: '41', date: '23.01.2026', supplier: 'ZG BOYA', stock: 'OMUZLUK KARE', outgoing: 20, incoming: 0 },
  { id: '42', date: '24.01.2026', supplier: 'ZG BOYA', stock: 'OMUZLUK L DEMİR', outgoing: 0, incoming: 19 },
  { id: '43', date: '24.01.2026', supplier: 'ZG BOYA', stock: 'METAL TOWER KISA BORU', outgoing: 0, incoming: 60 },
  { id: '44', date: '24.01.2026', supplier: 'ZG BOYA', stock: 'METAL TOWER UZUN BORU', outgoing: 0, incoming: 40 },
  { id: '45', date: '24.01.2026', supplier: 'ZG BOYA', stock: 'STOPER SACI', outgoing: 0, incoming: 198 },
  { id: '46', date: '24.01.2026', supplier: 'ZG BOYA', stock: '30*30*2MM 60CM METAL YATAK JUMPBOARD DEMİRİ', outgoing: 0, incoming: 80 },
  { id: '47', date: '24.01.2026', supplier: 'ZG BOYA', stock: '30*30*2MM 45CM METAL YATAK JUMPBOARD DEMİRİ', outgoing: 0, incoming: 20 },
  { id: '48', date: '24.01.2026', supplier: 'ZG BOYA', stock: 'EUROCLAMP 2 GİRİŞLİ', outgoing: 0, incoming: 50 },
  { id: '49', date: '24.01.2026', supplier: 'ZG BOYA', stock: 'EUROCLAMP KAYAR', outgoing: 0, incoming: 50 },
  { id: '50', date: '26.01.2026', supplier: 'ZG BOYA', stock: 'OMUZLUK L DEMİR', outgoing: 63, incoming: 0 },
  { id: '51', date: '26.01.2026', supplier: 'ZG BOYA', stock: 'CHAIR PEDAL', outgoing: 10, incoming: 0 },
  { id: '52', date: '27.01.2026', supplier: 'ZG BOYA', stock: 'OMUZLUK L DEMİR', outgoing: 0, incoming: 100 },
  { id: '53', date: '27.01.2026', supplier: 'ZG BOYA', stock: 'OMUZLUK KARE', outgoing: 0, incoming: 20 },
  { id: '54', date: '27.01.2026', supplier: 'ZG BOYA', stock: 'CHAIR PEDAL', outgoing: 0, incoming: 10 },
  { id: '55', date: '27.01.2026', supplier: 'ZG BOYA', stock: 'OMUZLUK L DEMİR', outgoing: 37, incoming: 0 },
  { id: '56', date: '27.01.2026', supplier: 'ZG BOYA', stock: 'OMUZLUK L DEMİR', outgoing: 100, incoming: 0 },
  { id: '57', date: '28.01.2026', supplier: 'ZG BOYA', stock: 'İÇ DÖKÜM', outgoing: 20, incoming: 0 },
  { id: '58', date: '30.01.2026', supplier: 'ZG BOYA', stock: 'İÇ DÖKÜM', outgoing: 16, incoming: 0 },
  { id: '59', date: '30.01.2026', supplier: 'ZG BOYA', stock: 'ANAHTAR', outgoing: 313, incoming: 0 },
  { id: '60', date: '30.01.2026', supplier: 'ZG BOYA', stock: 'KATLANIR TAŞIYICI KALDIRMA KOLU', outgoing: 100, incoming: 0 },
  { id: '61', date: '02.02.2026', supplier: 'ZG BOYA', stock: 'DEMİR BARREL GÖVDE', outgoing: 7, incoming: 0 },
  { id: '62', date: '02.02.2026', supplier: 'ZG BOYA', stock: 'MENTEŞE', outgoing: 1008, incoming: 0 },
  { id: '63', date: '02.02.2026', supplier: 'ZG BOYA', stock: 'JUMPBOARD LAMA', outgoing: 97, incoming: 0 },
  { id: '64', date: '02.02.2026', supplier: 'ZG BOYA', stock: 'OMUZLUK KARE', outgoing: 92, incoming: 0 },
  { id: '65', date: '03.02.2026', supplier: 'ZG BOYA', stock: 'MENTEŞE', outgoing: 0, incoming: 100 },
  { id: '66', date: '03.02.2026', supplier: 'ZG BOYA', stock: 'OMUZLUK KARE', outgoing: 0, incoming: 92 },
  { id: '67', date: '03.02.2026', supplier: 'ZG BOYA', stock: 'CHAİR DİKDÖRTGEN PARÇA', outgoing: 0, incoming: 16 },
  { id: '68', date: '03.02.2026', supplier: 'ZG BOYA', stock: 'KATLANIR TAŞIYICI KALDIRMA KOLU', outgoing: 0, incoming: 106 },
  { id: '69', date: '03.02.2026', supplier: 'ZG BOYA', stock: 'JUMPBOARD LAMA', outgoing: 0, incoming: 96 },
  { id: '70', date: '03.02.2026', supplier: 'ZG BOYA', stock: 'ANAHTAR', outgoing: 0, incoming: 314 },
  { id: '71', date: '04.02.2026', supplier: 'ZG BOYA', stock: 'İÇ DÖKÜM', outgoing: 129, incoming: 0 },
  { id: '72', date: '04.02.2026', supplier: 'ZG BOYA', stock: 'EUROCLAMP 3 GİRİŞLİ', outgoing: 88, incoming: 0 },
  { id: '73', date: '04.02.2026', supplier: 'ZG BOYA', stock: 'EUROCLAMP KAYAR', outgoing: 80, incoming: 0 },
  { id: '74', date: '05.02.2026', supplier: 'ZG BOYA', stock: 'ALÜMİNYUM TEKER MUHAFAZA SACI', outgoing: 165, incoming: 0 },
  { id: '75', date: '06.02.2026', supplier: 'ZG BOYA', stock: 'METAL YATAK GÖVDE', outgoing: 5, incoming: 0 },
  { id: '76', date: '06.02.2026', supplier: 'ZG BOYA', stock: 'CHAIR ASKI BÜYÜK', outgoing: 20, incoming: 0 },
  { id: '77', date: '06.02.2026', supplier: 'ZG BOYA', stock: 'JUMPBOARD LAMA', outgoing: 40, incoming: 0 },
  { id: '78', date: '06.02.2026', supplier: 'ZG BOYA', stock: 'CHAİR DİKDÖRTGEN PARÇA', outgoing: 17, incoming: 0 },
  { id: '79', date: '06.02.2026', supplier: 'ZG BOYA', stock: 'METAL TOWER UZUN BORU', outgoing: 96, incoming: 0 },
  { id: '80', date: '06.02.2026', supplier: 'ZG BOYA', stock: 'METAL TOWER KISA BORU', outgoing: 144, incoming: 0 },
  { id: '81', date: '07.02.2026', supplier: 'ZG BOYA', stock: 'İÇ DÖKÜM', outgoing: 0, incoming: 129 },
  { id: '82', date: '07.02.2026', supplier: 'ZG BOYA', stock: 'ALÜMİNYUM TEKER MUHAFAZA SACI', outgoing: 0, incoming: 165 },
  { id: '83', date: '09.02.2026', supplier: 'ZG BOYA', stock: 'EUROCLAMP 3 GİRİŞLİ', outgoing: 80, incoming: 0 },
  { id: '84', date: '11.02.2026', supplier: 'ZG BOYA', stock: 'MENTEŞE', outgoing: 0, incoming: 908 },
  { id: '85', date: '11.02.2026', supplier: 'ZG BOYA', stock: 'CHAIR İÇ DÖKÜM', outgoing: 0, incoming: 17 },
  { id: '86', date: '11.02.2026', supplier: 'ZG BOYA', stock: 'EUROCLAMP 2 GİRİŞLİ', outgoing: 0, incoming: 57 },
  { id: '87', date: '11.02.2026', supplier: 'ZG BOYA', stock: 'EUROCLAMP 3 GİRİŞLİ', outgoing: 0, incoming: 180 }
];

export const getStockSummary = () => {
  const summary: Record<string, { name: string; outgoing: number; incoming: number; balance: number }> = {};
  
  rawRecords.forEach(record => {
    if (!summary[record.stock]) {
      summary[record.stock] = { name: record.stock, outgoing: 0, incoming: 0, balance: 0 };
    }
    summary[record.stock].outgoing += record.outgoing;
    summary[record.stock].incoming += record.incoming;
    summary[record.stock].balance = summary[record.stock].outgoing - summary[record.stock].incoming;
  });
  
  return Object.values(summary).sort((a, b) => b.balance - a.balance);
};

export const getJobs = () => {
  return rawRecords.map(r => ({
    id: `IE-${r.id.padStart(4, '0')}`,
    date: r.date,
    supplier: r.supplier,
    stock: r.stock,
    type: r.outgoing > 0 ? 'ÇIKIŞ' : 'GİRİŞ',
    qty: r.outgoing > 0 ? r.outgoing : r.incoming,
    status: r.outgoing > 0 ? 'Tedarikçide' : 'Teslim Alındı'
  })).reverse();
};

export const getOpenJobs = () => {
  const stockSummary = getStockSummary();
  return stockSummary.filter(s => s.balance > 0).map((s, i) => ({
    id: `AÇIK-${i+1}`,
    supplier: 'ZG BOYA',
    stock: s.name,
    qty: s.balance,
    status: 'İşlemde'
  }));
};
