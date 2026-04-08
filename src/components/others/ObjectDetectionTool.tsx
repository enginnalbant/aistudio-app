import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Trash2, 
  FileText, 
  PackagePlus, 
  PackageMinus,
  Maximize2,
  Scan,
  LayoutGrid,
  X,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Box,
  ClipboardCheck,
  Zap,
  Edit3,
  Plus,
  Minus,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Type } from "@google/genai";
import { getAI } from '../../services/aiConfig';
import clsx from 'clsx';

interface Marker {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  size?: number; // relative size 1-10
  label?: string;
}

interface DetectionResult {
  material: string;
  count: number;
  confidence: string;
  stockMatch?: string;
  notes?: string;
  markers?: Marker[];
}

type WizardStep = 'capture' | 'analyze' | 'review' | 'confirm';

export function ObjectDetectionTool() {
  const [step, setStep] = useState<WizardStep>('capture');
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<DetectionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [processType, setProcessType] = useState<'entry' | 'exit'>('entry');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingResultIndex, setEditingResultIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [markerScale, setMarkerScale] = useState(1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const editImageRef = useRef<HTMLDivElement>(null);

  // Camera handling
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Kamera başlatılamadı:", err);
      setError("Kameraya erişilemedi. Lütfen izinleri kontrol edin.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImage(dataUrl);
        stopCamera();
        setStep('analyze');
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setStep('analyze');
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const ai = getAI();
      if (!ai) {
        throw new Error('API anahtarı bulunamadı. Lütfen ayarlar menüsünden Gemini API anahtarınızı girin.');
      }
      const base64Data = image.split(',')[1];
      
      const prompt = `
        Sen bir endüstriyel envanter sayım uzmanısın. Bu görseli analiz et:
        1. Arka planı (duvar, yer, masa, gökyüzü vb.) tanı ve kapsam dışında bırak.
        2. Resmin merkezinde istiflenmiş veya bir arada duran nesnelere odaklan.
        3. Bu nesneleri şu stok kategorileriyle eşleştir: Borular, Profiller, L Köşebentler, Paletler, Ahşap Paneller, Vida/Cıvatalar, Metal Parçalar.
        4. ÖNEMLİ (BORU SAYIMI): Eğer sayılacak nesne bir "Boru" (Pipe) ise, resimdeki boruların YUVARLAK AĞIZLARINI (circular openings) tespit et. Her bir yuvarlak ağzın TAM MERKEZİNE bir işaret koy.
        5. Tespit ettiğin HER BİR nesneyi tek tek say ve işaretle.
        6. Her bir nesne için resim üzerindeki TAM MERKEZ koordinatlarını (x ve y yüzdesi olarak 0-100 arası) ve nesnenin büyüklüğüne göre bir boyut (1-10 arası) belirt.
        7. İşaretler birbirinin üzerine binmemeli (üst üste gelmemeli), her biri ayrı bir nesnenin tam orta noktasını temsil etmelidir.
        8. ÖNEMLİ: "count" değeri ile "markers" dizisindeki eleman sayısı TAM OLARAK AYNI OLMALIDIR. Eğer 235 nesne varsa, 235 adet marker koordinatı dönmelisin.
        9. Sonucu şu JSON formatında döndür:
        [
          {
            "material": "Malzeme Adı",
            "count": sayı,
            "confidence": "%oran",
            "stockMatch": "Stok Kodu veya Kategorisi",
            "notes": "Tespit notu",
            "markers": [
              { "id": "unique_id", "x": percentage_x, "y": percentage_y, "size": size_1_to_10 }
            ]
          }
        ]
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Data,
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                material: { type: Type.STRING },
                count: { type: Type.INTEGER },
                confidence: { type: Type.STRING },
                stockMatch: { type: Type.STRING },
                notes: { type: Type.STRING },
                markers: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER },
                      size: { type: Type.NUMBER }
                    },
                    required: ["id", "x", "y", "size"]
                  }
                }
              },
              required: ["material", "count", "confidence", "stockMatch", "markers"]
            }
          }
        }
      });

      const data = JSON.parse(response.text);
      setResults(data);
      setStep('review');
    } catch (err) {
      console.error("Analiz hatası:", err);
      setError("Görsel analiz edilirken bir hata oluştu. Lütfen tekrar deneyin.");
      setStep('capture');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const processInventory = async () => {
    setIsProcessing(true);
    // Simulate API call to update stocks and open jobs
    await new Promise(resolve => setTimeout(resolve, 2000));
    setStep('confirm');
    setIsProcessing(false);
  };

  const resetWizard = () => {
    setImage(null);
    setResults([]);
    setError(null);
    setStep('capture');
    setIsCameraActive(false);
  };

  const handleAddMarker = (e: React.MouseEvent) => {
    if (editingResultIndex === null || !editImageRef.current) return;
    
    const rect = editImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newMarker: Marker = {
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
      size: 5 // Default size for manual markers
    };
    
    const updatedResults = [...results];
    updatedResults[editingResultIndex].markers = [
      ...(updatedResults[editingResultIndex].markers || []),
      newMarker
    ];
    updatedResults[editingResultIndex].count = updatedResults[editingResultIndex].markers.length;
    setResults(updatedResults);
  };

  const handleRemoveMarker = (markerId: string) => {
    if (editingResultIndex === null) return;
    
    const updatedResults = [...results];
    updatedResults[editingResultIndex].markers = updatedResults[editingResultIndex].markers?.filter(m => m.id !== markerId);
    updatedResults[editingResultIndex].count = updatedResults[editingResultIndex].markers?.length || 0;
    setResults(updatedResults);
  };

  const updateStockMatch = (index: number, value: string) => {
    const updatedResults = [...results];
    updatedResults[index].stockMatch = value;
    setResults(updatedResults);
  };

  const handlePanStart = (e: React.MouseEvent) => {
    if (e.button !== 1 && !e.shiftKey) return; // Middle click or shift+click to pan
    setIsPanning(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  };

  const handlePanMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handlePanEnd = () => {
    setIsPanning(false);
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(0.5, prev + delta), 5));
  };

  const resetZoomPan = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const updateCountManually = (index: number, delta: number) => {
    const updatedResults = [...results];
    updatedResults[index].count = Math.max(0, updatedResults[index].count + delta);
    setResults(updatedResults);
  };

  useEffect(() => {
    if (!isEditModalOpen) {
      resetZoomPan();
    }
  }, [isEditModalOpen]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Wizard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-black text-text-primary tracking-tight flex items-center gap-3">
            <Zap className="text-focus-neon" /> AI Sayım Sihirbazı
          </h2>
          <p className="text-text-secondary opacity-70 font-medium">Akıllı nesne tespiti ve otomatik stok işleme.</p>
        </div>
        
        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {(['capture', 'analyze', 'review', 'confirm'] as WizardStep[]).map((s, idx) => (
            <React.Fragment key={s}>
              <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all",
                step === s ? "bg-focus-main border-focus-main text-pure-white scale-110" : 
                idx < ['capture', 'analyze', 'review', 'confirm'].indexOf(step) ? "bg-grow-main/20 border-grow-main text-grow-main" :
                "bg-skel-matte/5 border-skel-metal/20 text-skel-metal"
              )}>
                {idx + 1}
              </div>
              {idx < 3 && <div className="w-4 h-0.5 bg-skel-metal/20" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="bento-card overflow-hidden min-h-[500px] flex flex-col">
        <AnimatePresence mode="wait">
          {/* STEP 1: CAPTURE */}
          {step === 'capture' && (
            <motion.div 
              key="capture"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 p-8 flex flex-col items-center justify-center space-y-8"
            >
              {!isCameraActive ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                  <button 
                    onClick={startCamera}
                    className="flex flex-col items-center gap-6 p-10 rounded-3xl bg-focus-main/5 border-2 border-dashed border-focus-main/20 hover:border-focus-main/50 hover:bg-focus-main/10 transition-all group"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-focus-main/10 flex items-center justify-center text-focus-neon group-hover:scale-110 transition-transform">
                      <Camera size={40} />
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-display font-black text-text-primary tracking-tight">Kamera ile Çek</p>
                      <p className="text-xs text-text-secondary opacity-60 mt-1 uppercase tracking-widest font-bold">Canlı görüntü üzerinden sayım</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-6 p-10 rounded-3xl bg-skel-matte/5 border-2 border-dashed border-skel-metal/20 hover:border-focus-neon/30 hover:bg-skel-matte/10 transition-all group"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-skel-matte/10 flex items-center justify-center text-text-secondary group-hover:scale-110 transition-transform">
                      <Upload size={40} />
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-display font-black text-text-primary tracking-tight">Görsel Yükle</p>
                      <p className="text-xs text-text-secondary opacity-60 mt-1 uppercase tracking-widest font-bold">Dosya seç veya sürükle</p>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="relative w-full max-w-3xl aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none">
                    <div className="w-full h-full border-2 border-focus-neon/30 border-dashed rounded-xl" />
                  </div>
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6">
                    <button 
                      onClick={stopCamera}
                      className="w-14 h-14 rounded-full bg-black/50 text-pure-white flex items-center justify-center hover:bg-crit-blood transition-colors"
                    >
                      <X size={24} />
                    </button>
                    <button 
                      onClick={capturePhoto}
                      className="w-20 h-20 rounded-full bg-pure-white p-1 shadow-xl hover:scale-110 active:scale-95 transition-all"
                    >
                      <div className="w-full h-full rounded-full border-4 border-focus-main flex items-center justify-center text-focus-main">
                        <div className="w-12 h-12 rounded-full bg-focus-main" />
                      </div>
                    </button>
                    <button 
                      className="w-14 h-14 rounded-full bg-black/50 text-pure-white flex items-center justify-center hover:bg-focus-main transition-colors"
                    >
                      <RefreshCw size={24} />
                    </button>
                  </div>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
              <canvas ref={canvasRef} className="hidden" />
            </motion.div>
          )}

          {/* STEP 2: ANALYZE */}
          {step === 'analyze' && (
            <motion.div 
              key="analyze"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 p-8 flex flex-col items-center justify-center space-y-8"
            >
              <div className="relative w-full max-w-xl aspect-video rounded-3xl overflow-hidden shadow-2xl">
                <img src={image!} alt="To analyze" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-10 space-y-6">
                  <div className="relative">
                    <motion.div 
                      animate={{ y: [0, 200, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute top-0 left-0 right-0 h-1 bg-focus-neon shadow-[0_0_15px_rgba(0,255,255,0.8)] z-10"
                    />
                    <div className="w-24 h-24 rounded-full border-4 border-focus-neon/20 border-t-focus-neon animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-focus-neon">
                      <Scan size={32} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-black text-pure-white tracking-tight">Görsel Analiz Ediliyor</h3>
                    <p className="text-sm text-pure-white/60 mt-1">Arka plan ayıklanıyor ve nesneler sayılıyor...</p>
                  </div>
                </div>
              </div>
              {!isAnalyzing && (
                <button 
                  onClick={analyzeImage}
                  className="px-10 py-4 bg-focus-main text-pure-white rounded-2xl font-display font-black tracking-tighter hover:scale-105 transition-all shadow-xl shadow-focus-main/20"
                >
                  ANALİZİ BAŞLAT
                </button>
              )}
            </motion.div>
          )}

          {/* STEP 3: REVIEW */}
          {step === 'review' && (
            <motion.div 
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 p-8 flex flex-col lg:flex-row gap-8"
            >
              <div className="lg:w-1/2 space-y-4">
                <div className="relative aspect-square rounded-3xl overflow-hidden shadow-xl border border-skel-metal/10">
                  <img src={image!} alt="Analyzed" className="w-full h-full object-cover" />
                  
                  {/* Visual Markers Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    {results.flatMap((res, resIdx) => 
                      res.markers?.map((marker, mIdx) => (
                        <div 
                          key={marker.id}
                          className="absolute rounded-full bg-focus-neon text-black font-black flex items-center justify-center shadow-[0_0_10px_rgba(0,255,255,0.5)] border border-white/50"
                          style={{ 
                            left: `${marker.x}%`, 
                            top: `${marker.y}%`,
                            width: `${((marker.size || 5) * 1.5 + 10) * markerScale}px`,
                            height: `${((marker.size || 5) * 1.5 + 10) * markerScale}px`,
                            transform: 'translate(-50%, -50%)',
                            fontSize: `${((marker.size || 5) + 4) * markerScale}px`
                          }}
                        >
                          <div className="absolute w-1 h-1 bg-black rounded-full" />
                          {resIdx + 1}.{mIdx + 1}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                    <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-[10px] font-black text-pure-white uppercase tracking-widest">
                      Analiz Görünümü
                    </div>
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 p-1 pointer-events-auto">
                      <span className="text-[8px] font-black text-pure-white/60 uppercase px-2">Boyut</span>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="2" 
                        step="0.1" 
                        value={markerScale}
                        onChange={(e) => setMarkerScale(parseFloat(e.target.value))}
                        className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-focus-neon"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setStep('capture')}
                    className="flex-1 py-3 bg-skel-matte/5 border border-skel-metal/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-skel-matte/10 transition-all"
                  >
                    YENİDEN ÇEK
                  </button>
                </div>
              </div>

              <div className="lg:w-1/2 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-display font-black text-text-primary tracking-tight">Sayım Sonuçları</h3>
                  <div className="flex bg-skel-matte/5 p-1 rounded-xl border border-skel-metal/10">
                    <button 
                      onClick={() => setProcessType('entry')}
                      className={clsx(
                        "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                        processType === 'entry' ? "bg-grow-main text-pure-white" : "text-text-secondary"
                      )}
                    >
                      EKLE
                    </button>
                    <button 
                      onClick={() => setProcessType('exit')}
                      className={clsx(
                        "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                        processType === 'exit' ? "bg-crit-blood text-pure-white" : "text-text-secondary"
                      )}
                    >
                      ÇIKAR
                    </button>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                  {results.map((res, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-skel-matte/2 border border-skel-metal/5 flex flex-col gap-4 group hover:border-focus-neon/30 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-skel-matte/5 flex items-center justify-center text-skel-metal group-hover:text-focus-neon transition-colors">
                            <Box size={24} />
                          </div>
                          <div>
                            <p className="text-sm font-display font-bold text-text-primary tracking-tight">{res.material}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] font-black text-grow-main bg-grow-main/5 px-2 py-0.5 rounded-md">{res.confidence}</span>
                              <span className="text-[9px] font-black text-focus-neon bg-focus-neon/5 px-2 py-0.5 rounded-md">#{idx + 1}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center bg-skel-matte/5 rounded-xl border border-skel-metal/10 overflow-hidden">
                            <button 
                              onClick={() => updateCountManually(idx, -1)}
                              className="p-2 hover:bg-skel-matte/10 text-text-secondary"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-3 text-lg font-mono font-black text-focus-neon min-w-[40px] text-center">{res.count}</span>
                            <button 
                              onClick={() => updateCountManually(idx, 1)}
                              className="p-2 hover:bg-skel-matte/10 text-text-secondary"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button 
                            onClick={() => {
                              setEditingResultIndex(idx);
                              setIsEditModalOpen(true);
                            }}
                            className="p-2 rounded-xl bg-focus-main/10 text-focus-main hover:bg-focus-main hover:text-pure-white transition-all"
                          >
                            <Edit3 size={18} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Stock Intervention */}
                      <div className="flex items-center gap-3 pt-3 border-t border-skel-metal/5">
                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest whitespace-nowrap">Stok Eşleşme:</span>
                        <input 
                          type="text"
                          value={res.stockMatch}
                          onChange={(e) => updateStockMatch(idx, e.target.value)}
                          className="flex-1 bg-skel-matte/5 border border-skel-metal/10 rounded-lg px-3 py-1.5 text-xs font-bold text-text-primary focus:outline-none focus:border-focus-neon/50 transition-all"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-focus-main/5 rounded-3xl border border-focus-main/10 space-y-4">
                  <p className="text-sm font-medium text-text-primary leading-relaxed">
                    Tespit edilen <span className="font-black text-focus-neon">{results.reduce((acc, r) => acc + r.count, 0)}</span> adet nesne stoklara 
                    <span className={clsx("font-black mx-1", processType === 'entry' ? "text-grow-main" : "text-crit-vivid")}>
                      {processType === 'entry' ? 'GİRİŞ' : 'ÇIKIŞ'}
                    </span> 
                    olarak işlenecek ve "Açık İşler" sayfasına kayıt düşülecektir. Onaylıyor musunuz?
                  </p>
                  <button 
                    onClick={processInventory}
                    disabled={isProcessing}
                    className={clsx(
                      "w-full py-4 rounded-2xl font-display font-black text-sm tracking-tighter flex items-center justify-center gap-3 transition-all shadow-xl",
                      processType === 'entry' ? "bg-grow-main text-pure-white shadow-grow-main/20" : "bg-crit-blood text-pure-white shadow-crit-blood/20"
                    )}
                  >
                    {isProcessing ? <Loader2 className="animate-spin" /> : <ClipboardCheck size={20} />}
                    İŞLEMİ ONAYLA VE KAYDET
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: CONFIRM */}
          {step === 'confirm' && (
            <motion.div 
              key="confirm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="w-24 h-24 rounded-full bg-grow-main/10 flex items-center justify-center text-grow-main mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12 }}
                >
                  <CheckCircle2 size={64} />
                </motion.div>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-display font-black text-text-primary tracking-tight">İşlem Başarıyla Tamamlandı</h3>
                <p className="text-text-secondary max-w-md mx-auto">
                  Sayım sonuçları stoklara işlendi ve "Açık İşler" modülünde yeni bir operasyon kaydı oluşturuldu.
                </p>
              </div>
              <div className="flex gap-4 pt-6">
                <button 
                  onClick={resetWizard}
                  className="px-8 py-3 bg-skel-matte/5 border border-skel-metal/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-skel-matte/10 transition-all"
                >
                  YENİ SAYIM BAŞLAT
                </button>
                <button 
                  className="px-8 py-3 bg-focus-main text-pure-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-focus-main/20"
                >
                  AÇIK İŞLERE GİT
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Manual Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingResultIndex !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-7xl h-[90vh] bg-skel-matte rounded-[40px] border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
              {/* Image Interaction Area */}
              <div 
                className={clsx(
                  "md:w-2/3 bg-black relative flex items-center justify-center overflow-hidden",
                  isPanning ? "cursor-grabbing" : "cursor-crosshair"
                )}
                onMouseDown={handlePanStart}
                onMouseMove={handlePanMove}
                onMouseUp={handlePanEnd}
                onMouseLeave={handlePanEnd}
              >
                <div 
                  ref={editImageRef}
                  onClick={handleAddMarker}
                  onWheel={(e) => {
                    e.preventDefault();
                    const delta = e.deltaY > 0 ? -0.1 : 0.1;
                    handleZoom(delta);
                  }}
                  className="relative transition-transform duration-75 ease-out"
                  style={{ 
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: 'center'
                  }}
                >
                  <img src={image!} alt="Editing" className="max-w-full max-h-[80vh] object-contain pointer-events-none" />
                  
                  {/* Interactive Markers */}
                  {results[editingResultIndex].markers?.map((marker, mIdx) => (
                    <div 
                      key={marker.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveMarker(marker.id);
                      }}
                      className="absolute rounded-full bg-focus-neon/80 text-black font-black flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,0.6)] border-2 border-white/50 hover:bg-crit-blood hover:text-pure-white transition-all group/marker backdrop-blur-[1px]"
                      style={{ 
                        left: `${marker.x}%`, 
                        top: `${marker.y}%`,
                        width: `${((marker.size || 5) * 2 + 15) * markerScale}px`,
                        height: `${((marker.size || 5) * 2 + 15) * markerScale}px`,
                        transform: 'translate(-50%, -50%)',
                        fontSize: `${((marker.size || 5) * 1.5 + 6) * markerScale}px`
                      }}
                    >
                      <div className="absolute w-1.5 h-1.5 bg-black/40 rounded-full group-hover/marker:hidden" />
                      <span className="group-hover/marker:hidden">{mIdx + 1}</span>
                      <X size={16} className="hidden group-hover/marker:block" />
                    </div>
                  ))}
                </div>
                
                <div className="absolute top-6 left-6 flex flex-col gap-3">
                  <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 text-[10px] font-black text-pure-white uppercase tracking-widest flex items-center gap-2">
                    <Edit3 size={14} className="text-focus-neon" /> Manuel Düzenleme Modu
                  </div>
                  
                  {/* Zoom Controls */}
                  <div className="flex bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 p-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleZoom(0.2); }}
                      className="p-2 hover:bg-white/10 rounded-xl text-pure-white transition-colors"
                      title="Yakınlaştır"
                    >
                      <Plus size={18} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleZoom(-0.2); }}
                      className="p-2 hover:bg-white/10 rounded-xl text-pure-white transition-colors"
                      title="Uzaklaştır"
                    >
                      <Minus size={18} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); resetZoomPan(); }}
                      className="p-2 hover:bg-white/10 rounded-xl text-pure-white transition-colors"
                      title="Sıfırla"
                    >
                      <Maximize2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex justify-center">
                  <div className="px-6 py-3 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 text-[10px] font-black text-pure-white/60 uppercase tracking-widest text-center">
                    Tıkla: <span className="text-focus-neon">İŞARET EKLE</span> | Shift+Sürükle: <span className="text-focus-neon">KAYDIR</span> | Tekerlek: <span className="text-focus-neon">ZOOM</span>
                  </div>
                </div>
              </div>

              {/* Control Panel */}
              <div className="md:w-1/3 p-8 flex flex-col justify-between border-l border-white/5">
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-display font-black text-text-primary tracking-tight">Düzenle</h3>
                      <p className="text-sm text-text-secondary opacity-60 font-medium">{results[editingResultIndex].material}</p>
                    </div>
                    <button 
                      onClick={() => setIsEditModalOpen(false)}
                      className="p-2 rounded-xl bg-skel-matte/10 text-text-secondary hover:bg-skel-matte/20 transition-all"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-3xl bg-skel-matte/5 border border-white/5 text-center">
                      <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2">Toplam Sayım</p>
                      <p className="text-4xl font-mono font-black text-focus-neon">{results[editingResultIndex].count}</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-skel-matte/5 border border-white/5 text-center">
                      <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2">İşaret Sayısı</p>
                      <p className="text-4xl font-mono font-black text-grow-main">{results[editingResultIndex].markers?.length || 0}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Manuel Sayım Ayarı</label>
                    <div className="flex items-center justify-between p-4 bg-skel-matte/5 rounded-2xl border border-white/5">
                      <button 
                        onClick={() => updateCountManually(editingResultIndex, -1)}
                        className="w-12 h-12 rounded-xl bg-skel-matte/10 flex items-center justify-center text-text-primary hover:bg-crit-blood hover:text-pure-white transition-all"
                      >
                        <Minus size={20} />
                      </button>
                      <span className="text-3xl font-mono font-black text-text-primary">{results[editingResultIndex].count}</span>
                      <button 
                        onClick={() => updateCountManually(editingResultIndex, 1)}
                        className="w-12 h-12 rounded-xl bg-skel-matte/10 flex items-center justify-center text-text-primary hover:bg-grow-main hover:text-pure-white transition-all"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-full py-5 bg-focus-main text-pure-white rounded-3xl font-display font-black text-sm tracking-widest uppercase flex items-center justify-center gap-3 shadow-2xl shadow-focus-main/20 hover:scale-[1.02] transition-all"
                >
                  <Save size={20} /> DEĞİŞİKLİKLERİ KAYDET
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
