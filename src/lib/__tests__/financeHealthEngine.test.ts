import { runFinanceHealthEngine, FinanceEngineInput } from '../financeHealthEngine';

describe('Finance Health Engine v3 Tests', () => {
  const sampleInput: FinanceEngineInput = {
    profil: {
      yas: 30,
      yasam_evresi: 'bekar_calisan',
      hane_buyuklugu: 1,
      sehir_yasam_maliyeti_endeksi: 'orta'
    },
    aylik_net_gelir: 60000,
    diger_gelirler: [
      { kaynak: 'Freelance', tutar: 15000, duzenlilik: 'degisken' }
    ],
    aylik_sabit_giderler: 20000,
    aylik_degisken_giderler: 15000,
    gelir_gecmisi: [
      { ay: '2026-01', tutar: 70000 },
      { ay: '2026-02', tutar: 72000 },
      { ay: '2026-03', tutar: 75000 }
    ],
    gider_gecmisi: [
      { ay: '2026-01', sabit: 20000, degisken: 15000 },
      { ay: '2026-02', sabit: 20000, degisken: 14000 },
      { ay: '2026-03', sabit: 20000, degisken: 15000 }
    ],
    abonelikler: [
      { ad: 'Netflix', tutar: 200, periyot: 'aylik', son_30gun_kullanim: 'aktif' },
      { ad: 'Spotify', tutar: 100, periyot: 'aylik', son_30gun_kullanim: 'aktif' },
      { ad: 'Unused Gym', tutar: 1500, periyot: 'aylik', son_30gun_kullanim: 'kullanilmiyor' }
    ],
    borclar: [
      { ad: 'Ihtiyac Kredisi', tur: 'ihtiyac_kredisi', toplam_bakiye: 50000, aylik_taksit: 5000, faiz_orani: 3.5, kalan_vade_ay: 12 }
    ],
    yatirimlar_ve_birikimler: [
      { ad: 'Altin Fonu', tutar: 250000, likidite: 'yuksek', getiri_orani_yillik: 60 },
      { ad: 'Hisse Senedi', tutar: 100000, likidite: 'orta', getiri_orani_yillik: 75 }
    ],
    planlanan_satinalmalar: [
      { ad: 'Yeni Laptop', tutar: 45000, aciliyet: 'istege_bagli', tarih: '2026-09' }
    ]
  };

  test('Calculates financial health score within valid 0-100 range', () => {
    const result = runFinanceHealthEngine(sampleInput);
    expect(result.nihai_skor).toBeGreaterThanOrEqual(0);
    expect(result.nihai_skor).toBeLessThanOrEqual(100);
    expect(['Mükemmel', 'Güçlü', 'Orta', 'Zayıf', 'Riskli']).toContain(result.skor_bandi);
  });

  test('Detects unused subscriptions and prioritizes action', () => {
    const result = runFinanceHealthEngine(sampleInput);
    const hasUnusedSubRecommendation = result.oneriler_oncelik_sirali.some(o => 
      o.metin.includes('Unused Gym') || o.seviye.includes('KOLAY')
    );
    expect(hasUnusedSubRecommendation).toBe(true);
  });

  test('Correctly calculates resilience and stress tests', () => {
    const result = runFinanceHealthEngine(sampleInput);
    expect(result.dayaniklilik_testi.dayaniklilik_indeksi).toBeGreaterThanOrEqual(0);
    expect(result.dayaniklilik_testi.senaryo_gelir_sok.durum).toBeDefined();
    expect(result.kategoriler.length).toBe(5);
  });

  test('Veto mechanism triggers when savings rate is under 5%', () => {
    const criticalInput: FinanceEngineInput = {
      ...sampleInput,
      aylik_net_gelir: 30000,
      diger_gelirler: [],
      aylik_sabit_giderler: 25000,
      aylik_degisken_giderler: 10000, // Expense (35k) > Income (30k)
      yatirimlar_ve_birikimler: []
    };
    const result = runFinanceHealthEngine(criticalInput);
    expect(result.veto_uygulandi).toBe(true);
    expect(result.nihai_skor).toBeLessThanOrEqual(40);
  });
});
