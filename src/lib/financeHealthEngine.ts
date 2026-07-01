// Financial Health Score Calculation Engine v3
// Advanced local engine executing offline mathematical formulas

export interface UserProfile {
  yas: number;
  yasam_evresi: 'ogrenci' | 'bekar_calisan' | 'evli_cocuksuz' | 'evli_cocuklu' | 'emekliligeYakin' | 'emekli';
  hane_buyuklugu: number;
  sehir_yasam_maliyeti_endeksi: 'dusuk' | 'orta' | 'yuksek';
}

export interface HistoryItem {
  ay: string; // YYYY-MM
  tutar: number;
}

export interface ExpenseHistoryItem {
  ay: string; // YYYY-MM
  sabit: number;
  degisken: number;
}

export interface OtherIncome {
  kaynak: string;
  tutar: number;
  duzenlilik: 'sabit' | 'degisken';
}

export interface SubscriptionItem {
  ad: string;
  tutar: number;
  periyot: 'aylik' | 'yillik';
  son_30gun_kullanim: 'aktif' | 'dusuk' | 'kullanilmiyor';
}

export interface DebtItem {
  ad: string;
  tur: 'kredi_karti' | 'ihtiyac_kredisi' | 'konut_kredisi' | 'tasit_kredisi' | 'diger';
  toplam_bakiye: number;
  aylik_taksit: number;
  faiz_orani: number; // e.g. 4.5 for %4.5
  kalan_vade_ay: number;
}

export interface InvestmentItem {
  ad: string;
  tutar: number;
  likidite: 'yuksek' | 'orta' | 'dusuk';
  getiri_orani_yillik: number; // e.g. 55 for %55
}

export interface PlannedPurchase {
  ad: string;
  tutar: number;
  aciliyet: 'zorunlu' | 'istege_bagli';
  tarih: string; // YYYY-MM
}

export interface FinanceEngineInput {
  profil: UserProfile;
  gelir_gecmisi: HistoryItem[];
  gider_gecmisi: ExpenseHistoryItem[];
  aylik_net_gelir: number;
  diger_gelirler: OtherIncome[];
  aylik_sabit_giderler: number;
  aylik_degisken_giderler: number;
  abonelikler: SubscriptionItem[];
  borclar: DebtItem[];
  yatirimlar_ve_birikimler: InvestmentItem[];
  planlanan_satinalmalar: PlannedPurchase[];
}

export interface EngineCategoryResult {
  ad: string;
  puan: number;
  max: number;
  yuzde: number;
  en_zayif_metrik: string;
}

export interface EngineOutput {
  nihai_skor: number;
  skor_bandi: 'Mükemmel' | 'Güçlü' | 'Orta' | 'Zayıf' | 'Riskli';
  profil_uyumlu_agirliklar: {
    gelirler: number;
    giderler: number;
    abonelik_borc: number;
    yatirim_birikim: number;
    satinalma_planlama: number;
  };
  veto_uygulandi: boolean;
  veto_nedeni: string | null;
  dayaniklilik_testi: {
    senaryo_gelir_sok: { yeni_tasarruf_orani: number; durum: 'kritik' | 'riskli' | 'guvenli' };
    senaryo_faiz_artisi: { yeni_dsr: number; durum: 'kritik' | 'riskli' | 'guvenli' };
    senaryo_beklenmedik_gider: { kalan_runway_ay: number; durum: 'kritik' | 'riskli' | 'guvenli' };
    dayaniklilik_indeksi: number;
  };
  trend: {
    egim_aylik: number;
    yorum: 'iyileşiyor' | 'stabil' | 'kötüleşiyor';
  };
  kategoriler: EngineCategoryResult[];
  nedensellik_analizi: string;
  oneriler_oncelik_sirali: {
    seviye: 'KOLAY & YÜKSEK ETKİ' | 'ORTA & YÜKSEK ETKİ' | 'ZOR & YÜKSEK ETKİ' | 'UYARI - MOMENTUM' | 'UYARI - DAYANIKLILIK';
    metin: string;
    etki_puani: number | null;
  }[];
}

// Math helpers
function calculateStdev(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  const sumOfSquares = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
  return Math.sqrt(sumOfSquares / (values.length - 1));
}

function calculateLinearRegressionSlope(values: number[]): number {
  if (values.length < 2) return 0;
  const n = values.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i++) {
    const x = i;
    const y = values[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }
  const numerator = n * sumXY - sumX * sumY;
  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return 0;
  return numerator / denominator;
}

export function runFinanceHealthEngine(input: FinanceEngineInput): EngineOutput {
  const safeInput = {
    profil: input?.profil || { yas: 28, yasam_evresi: 'bekar_calisan', hane_buyuklugu: 1, sehir_yasam_maliyeti_endeksi: 'orta' },
    gelir_gecmisi: Array.isArray(input?.gelir_gecmisi) ? input.gelir_gecmisi : [],
    gider_gecmisi: Array.isArray(input?.gider_gecmisi) ? input.gider_gecmisi : [],
    aylik_net_gelir: Number(input?.aylik_net_gelir || 0),
    diger_gelirler: Array.isArray(input?.diger_gelirler) ? input.diger_gelirler : [],
    aylik_sabit_giderler: Number(input?.aylik_sabit_giderler || 0),
    aylik_degisken_giderler: Number(input?.aylik_degisken_giderler || 0),
    abonelikler: Array.isArray(input?.abonelikler) ? input.abonelikler : [],
    borclar: Array.isArray(input?.borclar) ? input.borclar : [],
    yatirimlar_ve_birikimler: Array.isArray(input?.yatirimlar_ve_birikimler) ? input.yatirimlar_ve_birikimler : [],
    planlanan_satinalmalar: Array.isArray(input?.planlanan_satinalmalar) ? input.planlanan_satinalmalar : [],
  };

  const {
    profil,
    gelir_gecmisi,
    gider_gecmisi,
    aylik_net_gelir,
    diger_gelirler,
    aylik_sabit_giderler,
    aylik_degisken_giderler,
    abonelikler,
    borclar,
    yatirimlar_ve_birikimler,
    planlanan_satinalmalar,
  } = safeInput;

  const yasamEvresi = profil?.yasam_evresi || 'bekar_calisan';

  // 1. Dynamic Weighting Engine
  const temelAgirliklar = {
    gelirler: 10,
    giderler: 25,
    abonelik_borc: 25,
    yatirim_birikim: 25,
    satinalma_planlama: 15,
  };

  const profilCarpanlari: Record<string, Record<string, number>> = {
    ogrenci: { gelirler: 1.3, giderler: 1.1, abonelik_borc: 0.8, yatirim_birikim: 0.7, satinalma_planlama: 1.1 },
    bekar_calisan: { gelirler: 1.0, giderler: 1.0, abonelik_borc: 1.0, yatirim_birikim: 1.0, satinalma_planlama: 1.0 },
    evli_cocuksuz: { gelirler: 0.9, giderler: 1.0, abonelik_borc: 1.0, yatirim_birikim: 1.1, satinalma_planlama: 1.0 },
    evli_cocuklu: { gelirler: 0.9, giderler: 1.1, abonelik_borc: 1.1, yatirim_birikim: 1.0, satinalma_planlama: 0.9 },
    emekliligeYakin: { gelirler: 0.8, giderler: 0.9, abonelik_borc: 1.0, yatirim_birikim: 1.4, satinalma_planlama: 0.9 },
    emekli: { gelirler: 0.7, giderler: 1.0, abonelik_borc: 1.1, yatirim_birikim: 1.3, satinalma_planlama: 0.9 },
  };

  const carpanlar = profilCarpanlari[yasamEvresi] || profilCarpanlari.bekar_calisan;
  
  const hamAgirlik = {
    gelirler: temelAgirliklar.gelirler * carpanlar.gelirler,
    giderler: temelAgirliklar.giderler * carpanlar.giderler,
    abonelik_borc: temelAgirliklar.abonelik_borc * carpanlar.abonelik_borc,
    yatirim_birikim: temelAgirliklar.yatirim_birikim * carpanlar.yatirim_birikim,
    satinalma_planlama: temelAgirliklar.satinalma_planlama * carpanlar.satinalma_planlama,
  };

  const sumHam = hamAgirlik.gelirler + hamAgirlik.giderler + hamAgirlik.abonelik_borc + hamAgirlik.yatirim_birikim + hamAgirlik.satinalma_planlama;
  
  const nihaiAgirliklar = {
    gelirler: Math.round((100 * hamAgirlik.gelirler / sumHam) * 10) / 10,
    giderler: Math.round((100 * hamAgirlik.giderler / sumHam) * 10) / 10,
    abonelik_borc: Math.round((100 * hamAgirlik.abonelik_borc / sumHam) * 10) / 10,
    yatirim_birikim: Math.round((100 * hamAgirlik.yatirim_birikim / sumHam) * 10) / 10,
    satinalma_planlama: Math.round((100 * hamAgirlik.satinalma_planlama / sumHam) * 10) / 10,
  };

  // --- SUB-METRICS CALCULATION ---

  // 3.1 GELİRLER (dinamik max)
  // Metric A: Gelir çeşitliliği
  const kaynakSayisi = 1 + diger_gelirler.filter(g => g.tutar > 0).length;
  const cesitlilikSkoru = Math.min(1, kaynakSayisi / 3);

  // Metric B: Gelir istikrarı (CV)
  let istikrarSkoru = 1.0;
  if (gelir_gecmisi.length >= 2) {
    const tutarlar = gelir_gecmisi.map(g => g.tutar);
    const meanGelir = tutarlar.reduce((s, t) => s + t, 0) / tutarlar.length;
    if (meanGelir > 0) {
      const cv = calculateStdev(tutarlar, meanGelir) / meanGelir;
      istikrarSkoru = Math.max(0, 1 - cv);
    }
  }

  // Metric C: Gelir trendi
  let trendSkoru = 0.5; // Neutral
  if (gelir_gecmisi.length >= 6) {
    const son3 = gelir_gecmisi.slice(-3).map(g => g.tutar);
    const onceki3 = gelir_gecmisi.slice(-6, -3).map(g => g.tutar);
    const son3Ort = son3.reduce((s, t) => s + t, 0) / 3;
    const onceki3Ort = onceki3.reduce((s, t) => s + t, 0) / 3;
    if (onceki3Ort > 0) {
      const degisim = (son3Ort - onceki3Ort) / onceki3Ort;
      trendSkoru = Math.max(0, Math.min(1, 0.5 + degisim)); // e.g. +20% growth gives 0.7 score
    }
  }

  const gelirKategoriSkoru = 0.4 * cesitlilikSkoru + 0.4 * istikrarSkoru + 0.2 * trendSkoru;
  const gelirKategoriEnZayif = cesitlilikSkoru < istikrarSkoru ? "gelir_cesitliligi" : "gelir_istikrari";

  // 3.2 GİDERLER (dinamik max)
  // Metric A: Net tasarruf oranı
  const toplamDigerGelir = diger_gelirler.reduce((sum, g) => sum + g.tutar, 0);
  const toplamAylikGelir = aylik_net_gelir + toplamDigerGelir;
  const toplamSabitGider = aylik_sabit_giderler;
  const toplamDegiskenGider = aylik_degisken_giderler;
  const toplamGider = toplamSabitGider + toplamDegiskenGider;
  const netTasarrufOrani = toplamAylikGelir > 0 ? (toplamAylikGelir - toplamGider) / toplamAylikGelir : 0;
  
  const tasarrufOraniSkoru = netTasarrufOrani >= 0.35 
    ? 1 
    : (netTasarrufOrani <= 0 ? 0 : Math.pow(netTasarrufOrani / 0.35, 1.5));

  // Metric B: Sabit/Değişken gider oranı
  const sabitGiderOrani = toplamGider > 0 ? toplamSabitGider / toplamGider : 0;
  const esneklikSkoru = sabitGiderOrani <= 0.5 
    ? 1 
    : (sabitGiderOrani >= 0.8 ? 0 : 1 - (sabitGiderOrani - 0.5) / 0.3);

  // Metric C: 50/30/20 kural sapması
  const degiskenGiderOrani = toplamGider > 0 ? toplamDegiskenGider / toplamGider : 0;
  const sapma = Math.abs(sabitGiderOrani - 0.50) + Math.abs(degiskenGiderOrani - 0.30);
  const kural_50_30_20_skoru = Math.max(0, 1 - sapma);

  // Metric D: Gider volatilitesi
  let giderVolatiliteSkoru = 1.0; // Stabil by default
  if (gider_gecmisi.length >= 2) {
    const giderler = gider_gecmisi.map(g => g.sabit + g.degisken);
    const meanGider = giderler.reduce((s, g) => s + g, 0) / giderler.length;
    if (meanGider > 0) {
      const cv = calculateStdev(giderler, meanGider) / meanGider;
      giderVolatiliteSkoru = Math.max(0, 1 - cv);
    }
  }

  const giderKategoriSkoru = 0.55 * tasarrufOraniSkoru + 0.20 * esneklikSkoru + 0.15 * kural_50_30_20_skoru + 0.10 * giderVolatiliteSkoru;
  
  let giderKategoriEnZayif = "net_tasarruf_orani";
  const minGiderMetrik = Math.min(tasarrufOraniSkoru, esneklikSkoru, kural_50_30_20_skoru, giderVolatiliteSkoru);
  if (minGiderMetrik === esneklikSkoru) giderKategoriEnZayif = "esneklik_riski";
  else if (minGiderMetrik === kural_50_30_20_skoru) giderKategoriEnZayif = "50_30_20_kural_sapmasi";
  else if (minGiderMetrik === giderVolatiliteSkoru) giderKategoriEnZayif = "gider_volatilitesi";


  // 3.3 ABONELİK VE BORÇLAR (dinamik max)
  // Metric A: Borç/Gelir Oranı (Yıllık)
  const riskCarpanlari = { kredi_karti: 1.5, ihtiyac_kredisi: 1.2, konut_kredisi: 0.8, tasit_kredisi: 0.8, diger: 1.0 };
  const riskAgirlikliBorc = borclar.reduce((sum, b) => {
    const carp = riskCarpanlari[b.tur] || 1.0;
    return sum + (b.toplam_bakiye * carp);
  }, 0);
  const yillikGelir = toplamAylikGelir * 12;
  const borcPuani = yillikGelir > 0 ? Math.max(0, 1 - (riskAgirlikliBorc / (yillikGelir * 0.5))) : (riskAgirlikliBorc > 0 ? 0 : 1);

  // Metric B: DSR (borç servis oranı)
  const aylikBorcOdeme = borclar.reduce((sum, b) => sum + b.aylik_taksit, 0);
  const dsr = toplamAylikGelir > 0 ? aylikBorcOdeme / toplamAylikGelir : (aylikBorcOdeme > 0 ? 1 : 0);
  const dsrPuani = Math.max(0, 1 - (dsr / 0.40));

  // Metric C: Ağırlıklı Efektif Faiz Yükü
  const toplamBorcBakiye = borclar.reduce((sum, b) => sum + b.toplam_bakiye, 0);
  let agirlikliEfektifFaiz = 0;
  if (toplamBorcBakiye > 0) {
    const sumFaizBakiye = borclar.reduce((sum, b) => sum + (b.toplam_bakiye * (b.faiz_orani / 100)), 0);
    agirlikliEfektifFaiz = sumFaizBakiye / toplamBorcBakiye;
  }
  const faizPuani = toplamBorcBakiye > 0 ? Math.max(0, 1 - (agirlikliEfektifFaiz / 0.35)) : 1.0;

  // Metric D: Kullanılmayan abonelik oranı
  const toplamAbonelikCost = abonelikler.reduce((sum, s) => {
    const cost = s.periyot === 'yillik' ? s.tutar / 12 : s.tutar;
    return sum + cost;
  }, 0);
  const kullanilmayanAbonelikCost = abonelikler.filter(s => s.son_30gun_kullanim === 'kullanilmiyor').reduce((sum, s) => {
    const cost = s.periyot === 'yillik' ? s.tutar / 12 : s.tutar;
    return sum + cost;
  }, 0);
  const kullanilmayanAbonelikOrani = toplamAbonelikCost > 0 ? kullanilmayanAbonelikCost / toplamAbonelikCost : 0;
  const abonelikIsrafPuani = 1 - kullanilmayanAbonelikOrani;

  const abonelikBorcKategoriSkoru = 0.25 * borcPuani + 0.25 * dsrPuani + 0.25 * faizPuani + 0.25 * abonelikIsrafPuani;
  
  let abonelikBorcEnZayif = "kullanilmayan_abonelik_orani";
  const minBorcMetrik = Math.min(borcPuani, dsrPuani, faizPuani, abonelikIsrafPuani);
  if (minBorcMetrik === borcPuani) abonelikBorcEnZayif = "borc_gelir_orani";
  else if (minBorcMetrik === dsrPuani) abonelikBorcEnZayif = "dsr_oran_sapmasi";
  else if (minBorcMetrik === faizPuani) abonelikBorcEnZayif = "agirlikli_efektif_faiz";


  // 3.4 YATIRIM VE BİRİKİMLER (dinamik max)
  const liquidAssets = yatirimlar_ve_birikimler.reduce((sum, y) => {
    const weight = y.likidite === 'yuksek' ? 1.0 : y.likidite === 'orta' ? 0.6 : 0.2;
    return sum + (y.tutar * weight);
  }, 0);
  const toplamYatirim = yatirimlar_ve_birikimler.reduce((sum, y) => sum + y.tutar, 0);

  // Metric A: Likit rezerv runway
  const coverMonths = toplamGider > 0 ? liquidAssets / toplamGider : (liquidAssets > 0 ? 12 : 0);
  const runwaySkoru = Math.min(1, coverMonths / 6);

  // Metric B: Likidite kalite skoru
  const likiditeKaliteSkoru = toplamYatirim > 0 ? liquidAssets / toplamYatirim : 1.0;

  // Metric C: Reel getiri koruması
  let agirlikliGetiri = 0;
  if (toplamYatirim > 0) {
    const sumGetiri = yatirimlar_ve_birikimler.reduce((sum, y) => sum + (y.tutar * y.getiri_orani_yillik), 0);
    agirlikliGetiri = sumGetiri / toplamYatirim;
  }
  const reelGetiri = agirlikliGetiri - 45; // Enflasyon varsayımı %45
  const reelGetiriSkoru = reelGetiri >= 0 ? 1.0 : Math.max(0, 1 - Math.abs(reelGetiri) / 45);

  // Metric D: Birikim büyüme momentumu
  let momentumSkoru = 1.0;
  let egim = 0;
  if (gider_gecmisi.length >= 3 && gelir_gecmisi.length >= 3) {
    const tasarrufSerisi = [];
    // Align dates
    const limits = Math.min(gider_gecmisi.length, gelir_gecmisi.length);
    for (let i = limits - 1; i >= 0; i--) {
      const gel = gelir_gecmisi[i].tutar;
      const gid = gider_gecmisi[i].sabit + gider_gecmisi[i].degisken;
      const rate = gel > 0 ? (gel - gid) / gel : 0;
      tasarrufSerisi.push(rate);
    }
    egim = calculateLinearRegressionSlope(tasarrufSerisi);
    momentumSkoru = egim >= 0 ? 1.0 : Math.max(0, 1 - Math.abs(egim) * 5);
  }

  const yatirimBirikimKategoriSkoru = 0.45 * runwaySkoru + 0.20 * likiditeKaliteSkoru + 0.15 * reelGetiriSkoru + 0.20 * momentumSkoru;
  
  let yatirimBirikimEnZayif = "momentum_skoru";
  const minYatirimMetrik = Math.min(runwaySkoru, likiditeKaliteSkoru, reelGetiriSkoru, momentumSkoru);
  if (minYatirimMetrik === runwaySkoru) yatirimBirikimEnZayif = "likit_rezerv_runway";
  else if (minYatirimMetrik === likiditeKaliteSkoru) yatirimBirikimEnZayif = "likidite_kalite_skoru";
  else if (minYatirimMetrik === reelGetiriSkoru) yatirimBirikimEnZayif = "reel_getiri_skoru";


  // 3.5 SATINALMA PLANLAMASI (dinamik max)
  const toplamPlanlanan = planlanan_satinalmalar.reduce((sum, p) => sum + p.tutar, 0);

  // Metric A: Karşılanabilirlik oranı
  const karsilanabilirlik = toplamPlanlanan > 0 ? liquidAssets / toplamPlanlanan : 1.0;
  const karsilanabilirlikSkoru = Math.min(1, karsilanabilirlik);

  // Metric B: Fırsat maliyeti skoru
  const firsatMaliyeti = liquidAssets > 0 ? toplamPlanlanan / liquidAssets : (toplamPlanlanan > 0 ? 1 : 0);
  const firsatMaliyetiSkoru = Math.max(0, 1 - firsatMaliyeti);

  // Metric C: Aciliyet-disiplin uyumu
  let aciliyetDisiplinUyumu = 1.0;
  if (netTasarrufOrani < 0.05 && toplamPlanlanan > 0) {
    const istegeBagliTutari = planlanan_satinalmalar.filter(p => p.aciliyet === 'istege_bagli').reduce((sum, p) => sum + p.tutar, 0);
    aciliyetDisiplinUyumu = Math.max(0, 1 - (istegeBagliTutari / toplamPlanlanan));
  }

  const satinalmaPlanlamaKategoriSkoru = 0.4 * karsilanabilirlikSkoru + 0.3 * firsatMaliyetiSkoru + 0.3 * aciliyetDisiplinUyumu;
  
  let satinalmaEnZayif = "aciliyet_disiplin_uyumu";
  if (karsilanabilirlikSkoru < firsatMaliyetiSkoru && karsilanabilirlikSkoru < aciliyetDisiplinUyumu) {
    satinalmaEnZayif = "karsilanabilirlik_orani";
  } else if (firsatMaliyetiSkoru < karsilanabilirlikSkoru && firsatMaliyetiSkoru < aciliyetDisiplinUyumu) {
    satinalmaEnZayif = "firsat_maliyeti_skoru";
  }


  // --- STRESS TEST / RESILIENCE INDEX ---
  // Scenario A: Income drops by 20%
  const yeniGelirA = 0.8 * toplamAylikGelir;
  const yeniTasarrufOraniA = yeniGelirA > 0 ? (yeniGelirA - toplamGider) / yeniGelirA : -1.0;
  const senaryo_A_sonucu_normalize = yeniTasarrufOraniA < 0 
    ? Math.max(0, 1 + yeniTasarrufOraniA) * 50 
    : Math.min(100, (0.5 + yeniTasarrufOraniA * 1.5) * 100);

  // Scenario B: Interest rates hike by 5% (Affects variable debts, or acts as a dynamic modifier on DSR)
  const yeniBorcOdemeB = aylikBorcOdeme * 1.15; // Simulate a 15% shock in debt payment levels
  const yeniDsrB = toplamAylikGelir > 0 ? yeniBorcOdemeB / toplamAylikGelir : 1.0;
  const senaryo_B_sonucu_normalize = Math.max(0, Math.min(100, (0.45 - yeniDsrB) * 222));

  // Scenario C: Unexpected expense = 1 month of expense
  const kalanRunwayC = toplamGider > 0 ? Math.max(0, liquidAssets - toplamGider) / toplamGider : 0;
  const senaryo_C_sonucu_normalize = Math.min(100, (kalanRunwayC / 6) * 100);

  const dayaniklilikIndeksi = Math.round((senaryo_A_sonucu_normalize + senaryo_B_sonucu_normalize + senaryo_C_sonucu_normalize) / 3);

  // Category point sums
  const catGelirPuan = Math.round(gelirKategoriSkoru * nihaiAgirliklar.gelirler * 10) / 10;
  const catGiderPuan = Math.round(giderKategoriSkoru * nihaiAgirliklar.giderler * 10) / 10;
  const catBorcPuan = Math.round(abonelikBorcKategoriSkoru * nihaiAgirliklar.abonelik_borc * 10) / 10;
  const catYatirimPuan = Math.round(yatirimBirikimKategoriSkoru * nihaiAgirliklar.yatirim_birikim * 10) / 10;
  const catSatinalmaPuan = Math.round(satinalmaPlanlamaKategoriSkoru * nihaiAgirliklar.satinalma_planlama * 10) / 10;

  const agirlikliKategoriToplami = catGelirPuan + catGiderPuan + catBorcPuan + catYatirimPuan + catSatinalmaPuan;

  // Final score core formula
  let nihaiSkorV3 = 0.90 * agirlikliKategoriToplami + 0.10 * dayaniklilikIndeksi;

  // Trend Momentum Multiplier
  let momentumBonusCeza = 0;
  if (egim > 0.01) {
    momentumBonusCeza = 3;
  } else if (egim < -0.01) {
    momentumBonusCeza = -5;
  }

  nihaiSkorV3 += momentumBonusCeza;

  // 6. Genişletilmiş Non-Compensatory Veto Katmanı
  let vetoUygulandi = false;
  let vetoNedeni = null;
  let skorTavani = 100;

  if (netTasarrufOrani < 0.05) {
    skorTavani = Math.min(skorTavani, 30);
    vetoUygulandi = true;
    vetoNedeni = `Net tasarruf oranı %5'in altında (Şu an: %${Math.round(netTasarrufOrani * 100)}) → Skor tavanı 30`;
  }

  if (dayaniklilikIndeksi < 20) {
    skorTavani = Math.min(skorTavani, 40);
    vetoUygulandi = true;
    vetoNedeni = `Finansal dayanıklılık endeksi aşırı düşük (${dayaniklilikIndeksi} < 20) → Skor tavanı 40`;
  }

  if (agirlikliEfektifFaiz > 0.60) {
    skorTavani = Math.min(skorTavani, 35);
    vetoUygulandi = true;
    vetoNedeni = `Yüksek faizli borç sarmalı riski (Ağırlıklı faiz: %${Math.round(agirlikliEfektifFaiz * 100)}) → Skor tavanı 35`;
  }

  if (egim < -0.02 && netTasarrufOrani < 0.10) {
    skorTavani = Math.min(skorTavani, 25);
    vetoUygulandi = true;
    vetoNedeni = `Birikim momentumu negatif VE tasarruf oranı %10'un altında (Kritik Tablo) → Skor tavanı 25`;
  }

  const nihaiSkor = Math.round(Math.min(nihaiSkorV3, skorTavani));

  const skorBandi = nihaiSkor >= 85 ? 'Mükemmel' :
                    nihaiSkor >= 70 ? 'Güçlü' :
                    nihaiSkor >= 50 ? 'Orta' :
                    nihaiSkor >= 30 ? 'Zayıf' : 'Riskli';

  // Categories results array
  const kategoriler: EngineCategoryResult[] = [
    { ad: 'Gelirler', puan: catGelirPuan, max: nihaiAgirliklar.gelirler, yuzde: Math.round((catGelirPuan / nihaiAgirliklar.gelirler) * 100), en_zayif_metrik: gelirKategoriEnZayif },
    { ad: 'Giderler', puan: catGiderPuan, max: nihaiAgirliklar.giderler, yuzde: Math.round((catGiderPuan / nihaiAgirliklar.giderler) * 100), en_zayif_metrik: giderKategoriEnZayif },
    { ad: 'Abonelik ve Borçlar', puan: catBorcPuan, max: nihaiAgirliklar.abonelik_borc, yuzde: Math.round((catBorcPuan / nihaiAgirliklar.abonelik_borc) * 100), en_zayif_metrik: abonelikBorcEnZayif },
    { ad: 'Yatırım ve Birikimler', puan: catYatirimPuan, max: nihaiAgirliklar.yatirim_birikim, yuzde: Math.round((catYatirimPuan / nihaiAgirliklar.yatirim_birikim) * 100), en_zayif_metrik: yatirimBirikimEnZayif },
    { ad: 'Satınalma Planlamam', puan: catSatinalmaPuan, max: nihaiAgirliklar.satinalma_planlama, yuzde: Math.round((catSatinalmaPuan / nihaiAgirliklar.satinalma_planlama) * 100), en_zayif_metrik: satinalmaEnZayif },
  ];

  // Nedensellik Analizi Narrative
  const sortedCats = [...kategoriler].sort((a, b) => a.yuzde - b.yuzde);
  const anaNeden = sortedCats[0];
  const ikincilNeden = sortedCats[1];
  
  const iliskiHaritasi: Record<string, string> = {
    "Giderler_Yatırım ve Birikimler": "elde kalan gelir olmadığı için birikim büyüyemiyor ve yatırım hızı yavaşlıyor",
    "Abonelik ve Borçlar_Giderler": "yüksek kredi ve taksit yükü esnek harcama alanını daraltarak bütçeyi tıkıyor",
    "Giderler_Satınalma Planlamam": "mevcut yüksek harcamalar planlanan gelecek yatırımlarını veya satın almaları tehlikeye sokuyor",
  };

  const keyRelation = `${anaNeden.ad}_${ikincilNeden.ad}`;
  const iliskiAciklamasi = iliskiHaritasi[keyRelation] || "gelir-gider dengesi ve birikim yetersizliği diğer alanları da doğrudan baskılıyor";
  
  const nedensellik_analizi = `En zayıf kategori ${anaNeden.ad} (%${anaNeden.yuzde} başarı) — bu durum dolaylı olarak ${ikincilNeden.ad} kategorisini de baskılıyor çünkü ${iliskiAciklamasi}.`;

  // Recommendations Prioritization Matrix
  const oneriler_oncelik_sirali: EngineOutput['oneriler_oncelik_sirali'] = [];

  // Low Hanging Fruits: Unused subscriptions
  const unusedSubs = abonelikler.filter(s => s.son_30gun_kullanim === 'kullanilmiyor');
  if (unusedSubs.length > 0) {
    const sub = unusedSubs[0];
    const tutarAylik = sub.periyot === 'yillik' ? sub.tutar / 12 : sub.tutar;
    oneriler_oncelik_sirali.push({
      seviye: 'KOLAY & YÜKSEK ETKİ',
      metin: `Kullanılmayan "${sub.ad}" aboneliğini iptal ederseniz aylık ₺${tutarAylik.toLocaleString('tr-TR')}, yıllık ₺${(tutarAylik * 12).toLocaleString('tr-TR')} net tasarruf ve sağlık skorunuz üzerinde doğrudan pozitif etki sağlarsınız.`,
      etki_puani: 4.5,
    });
  } else {
    oneriler_oncelik_sirali.push({
      seviye: 'KOLAY & YÜKSEK ETKİ',
      metin: `Bütçenizdeki tüm dijital abonelikler aktif olarak kullanılıyor, israf bulunmuyor. Bu tasarruf disiplinini koruyun.`,
      etki_puani: 2.0,
    });
  }

  // Medium: Debt high interest prioritization
  const highInterestDebt = [...borclar].sort((a, b) => b.faiz_orani - a.faiz_orani)[0];
  if (highInterestDebt) {
    const yeniDsrTahmini = toplamAylikGelir > 0 ? Math.max(0, (aylikBorcOdeme - highInterestDebt.aylik_taksit) / toplamAylikGelir) : 0;
    oneriler_oncelik_sirali.push({
      seviye: 'ORTA & YÜKSEK ETKİ',
      metin: `En yüksek faizli borcunuz olan "${highInterestDebt.ad}" (%${highInterestDebt.faiz_orani} faiz) kapatılmasına öncelik verirseniz, aylık borç servis oranınız (DSR) %${Math.round(yeniDsrTahmini * 100)} seviyesine düşecek ve borç yükünüz hafifleyecektir.`,
      etki_puani: 5.8,
    });
  }

  // Hard: Savings rate / Variable expense optimization
  if (netTasarrufOrani < 0.20) {
    oneriler_oncelik_sirali.push({
      seviye: 'ZOR & YÜKSEK ETKİ',
      metin: `Net tasarruf oranınız %${Math.round(netTasarrufOrani * 100)}. Değişken harcamalarınızda (yeme-içme, eğlence vb.) yapacağınız %15 oranında bir kesinti, tasarruf oranınızı %20'nin üzerine taşıyarak birikim hızınızı iki katına çıkarabilir.`,
      etki_puani: 7.5,
    });
  }

  // Warnings - Momentum
  if (egim < -0.01) {
    oneriler_oncelik_sirali.push({
      seviye: 'UYARI - MOMENTUM',
      metin: `Son aylarda tasarruf oranınız aşağı yönlü (kötüleşiyor) bir trend sergiliyor. Bu negatif ivme devam ederse acil durum fonlarınızdan tüketmeye başlamak zorunda kalabilirsiniz.`,
      etki_puani: null,
    });
  }

  // Warnings - Resilience
  if (coverMonths < 3) {
    oneriler_oncelik_sirali.push({
      seviye: 'UYARI - DAYANIKLILIK',
      metin: `Gelirinizin %20 azalması durumunda likit rezerviniz sadece ${coverMonths.toFixed(1)} ay yetecektir. Bu seviye, acil durumlar için önerilen kritik 3 aylık sınırın altındadır.`,
      etki_puani: null,
    });
  }

  return {
    nihai_skor: nihaiSkor,
    skor_bandi: skorBandi,
    profil_uyumlu_agirliklar: nihaiAgirliklar,
    veto_uygulandi: vetoUygulandi,
    veto_nedeni: vetoNedeni,
    dayaniklilik_testi: {
      senaryo_gelir_sok: {
        yeni_tasarruf_orani: Math.round(yeniTasarrufOraniA * 100) / 100,
        durum: yeniTasarrufOraniA < 0 ? 'kritik' : yeniTasarrufOraniA < 0.10 ? 'riskli' : 'guvenli',
      },
      senaryo_faiz_artisi: {
        yeni_dsr: Math.round(yeniDsrB * 100) / 100,
        durum: yeniDsrB > 0.40 ? 'kritik' : yeniDsrB > 0.25 ? 'riskli' : 'guvenli',
      },
      senaryo_beklenmedik_gider: {
        kalan_runway_ay: Math.round(kalanRunwayC * 10) / 10,
        durum: kalanRunwayC < 1 ? 'kritik' : kalanRunwayC < 3 ? 'riskli' : 'guvenli',
      },
      dayaniklilik_indeksi: dayaniklilikIndeksi,
    },
    trend: {
      egim_aylik: Math.round(egim * 1000) / 1000,
      yorum: egim > 0.01 ? 'iyileşiyor' : egim < -0.01 ? 'kötüleşiyor' : 'stabil',
    },
    kategoriler,
    nedensellik_analizi,
    oneriler_oncelik_sirali,
  };
}
