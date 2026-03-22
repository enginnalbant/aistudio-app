import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shipment, Pallet, Product } from '../../types/shipment';
import { 
  Truck, 
  Package, 
  Calendar, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Eye, 
  Plus, 
  X, 
  Trash2, 
  Search, 
  Upload, 
  Calculator, 
  AlertTriangle,
  Box,
  Layers,
  Info,
  CheckCircle2,
  ArrowRightLeft,
  Settings2,
  History,
  MapPin
} from 'lucide-react';

interface ShipmentWizardProps {
  onSave: (shipment: Shipment) => void;
  onClose: () => void;
  initialData?: Shipment;
}

interface SelectedProduct extends Product {
  quantity: number;
  stock: number;
}

const MOCK_PRODUCTS: (Product & { stock: number })[] = [
  { id: 'PRD-001', name: 'Standart Ekipman Tip-1', dimensions: { length: 245, width: 90, height: 50, weight: 120 }, stock: 450 },
  { id: 'PRD-002', name: 'Ağır Ekipman Tip-2', dimensions: { length: 245, width: 90, height: 60, weight: 180 }, stock: 120 },
  { id: 'PRD-003', name: 'Kompakt Ünite Tip-3', dimensions: { length: 120, width: 80, height: 40, weight: 60 }, stock: 85 },
];

const PALLET_CONSTANTS = {
  STANDARD_LENGTH: 245,
  STANDARD_WIDTH: 90,
  BASE_HEIGHT: 15,
  BASE_WEIGHT: 10,
  MAX_PRODUCTS_PER_PALLET: 4,
  STANDARD_PRODUCTS_PER_PALLET: 3,
  MAX_HEIGHT: 215, // 200cm + 15cm pallet
};

interface Account {
  id: string;
  name: string;
  type: 'customer' | 'carrier' | 'supplier';
  email?: string;
  phone?: string;
  address?: string;
}

export function ShipmentWizard({ onSave, onClose, initialData }: ShipmentWizardProps) {
  const [step, setStep] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  
  const [formData, setFormData] = useState<Shipment>(initialData || {
    id: '',
    recipient: { name: '', deliveryAddress: '', invoiceAddress: '' },
    carrier: { name: '', vehicleInfo: '' },
    logisticsCost: { amount: 0, currency: 'TRY' },
    departureDate: '',
    deliveryDate: '',
    scheduledDate: '',
    priority: 'medium',
    products: [],
    pallets: [],
    notes: [''],
    documents: [],
    status: 'pending',
    movements: []
  });

  const [shipmentVisuals, setShipmentVisuals] = useState<string[]>([]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const response = await fetch('/api/accounts');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const [productSearch, setProductSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(() => {
    if (initialData) {
      // Reconstruct selectedProducts from pallets
      const productCounts: Record<string, number> = {};
      initialData.pallets.forEach(p => {
        p.products.forEach(pid => {
          productCounts[pid] = (productCounts[pid] || 0) + 1;
        });
      });

      return Object.entries(productCounts).map(([id, quantity]) => {
        const mockProd = MOCK_PRODUCTS.find(mp => mp.id === id);
        return {
          ...(mockProd || { id, name: id, dimensions: { length: 0, width: 0, height: 0, weight: 0 }, stock: 999 }),
          quantity
        };
      });
    }
    return [];
  });
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [editingPalletIndex, setEditingPalletIndex] = useState<number | null>(null);
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'soft' | 'navy' | 'forest'>('dark');
  const [intensiveLoading, setIntensiveLoading] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const steps = [
    { id: 1, title: 'Ürün & Palet', icon: <Package size={20} /> },
    { id: 2, title: 'Lojistik & Alıcı', icon: <Truck size={20} /> },
    { id: 3, title: 'Tarih', icon: <Calendar size={20} /> },
    { id: 4, title: 'Notlar & Döküman', icon: <FileText size={20} /> },
    { id: 5, title: 'Önizleme', icon: <Eye size={20} /> },
  ];

  const isStepValid = () => {
    if (step === 1) {
      if ((selectedProducts || []).length === 0) return false;
      // Check for pallet overloads
      const hasOverload = (formData.pallets || []).some(p => 
        p.dimensions.height > PALLET_CONSTANTS.MAX_HEIGHT || 
        (p.products || []).length > PALLET_CONSTANTS.MAX_PRODUCTS_PER_PALLET
      );
      if (hasOverload) {
        alert("Kapasite aşıldı! Lütfen paletleri düzenleyin.");
        return false;
      }
      
      // Check if all selected products are assigned to pallets
      const totalSelected = (selectedProducts || []).reduce((acc, p) => acc + p.quantity, 0);
      const totalAssigned = (formData.pallets || []).reduce((acc, p) => acc + (p.products || []).length, 0);
      if (totalAssigned < totalSelected) return false;
    }
    if (step === 2) {
      return formData.recipient.name && formData.carrier.name;
    }
    return true;
  };

  const handleNext = () => {
    if (isStepValid()) {
      setStep(prev => Math.min(prev + 1, steps.length));
    } else {
      if (step === 1) {
        const hasOverload = (formData.pallets || []).some(p => 
          p.dimensions.height > PALLET_CONSTANTS.MAX_HEIGHT || 
          (p.products || []).length > PALLET_CONSTANTS.MAX_PRODUCTS_PER_PALLET
        );
        if (hasOverload) {
          setCalculationError("Bazı paletlerde kapasite aşımı var. Lütfen düzeltin.");
        } else {
          setCalculationError("Lütfen tüm ürünleri paletlere yerleştirin.");
        }
      }
    }
  };
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

  const filteredProducts = MOCK_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) && 
    !selectedProducts.find(sp => sp.id === p.id)
  );

  const addProduct = (product: typeof MOCK_PRODUCTS[0], quantityToAdd: number = 1) => {
    if (quantityToAdd > product.stock) {
      alert(`Stok yetersiz. Mevcut stok: ${product.stock}`);
      return;
    }
    setSelectedProducts([...selectedProducts, { ...product, quantity: quantityToAdd }]);
    setProductSearch('');
    setIsSearchFocused(false);
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
    setFormData(prev => ({
      ...prev,
      pallets: prev.pallets.map(pallet => ({
        ...pallet,
        products: pallet.products.filter(id => id !== productId)
      }))
    }));
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    const product = selectedProducts.find(p => p.id === productId);
    if (!product) return;
    
    if (quantity < 1) return;
    if (quantity > product.stock) {
      alert(`Stok yetersiz. Mevcut stok: ${product.stock}`);
      return;
    }
    
    setSelectedProducts(selectedProducts.map(p => 
      p.id === productId ? { ...p, quantity } : p
    ));
  };

  const calculatePallets = async () => {
    setCalculationError(null);
    if (selectedProducts.length === 0) {
      setCalculationError("Lütfen önce ürün seçin.");
      return;
    }

    setIsCalculating(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const itemsToPack: Product[] = [];
    selectedProducts.forEach(sp => {
      for (let i = 0; i < sp.quantity; i++) {
        itemsToPack.push(sp);
      }
    });

    // Sort items by weight and size descending for stacking logic
    itemsToPack.sort((a, b) => {
      const weightA = a.dimensions?.weight || 0;
      const weightB = b.dimensions?.weight || 0;
      if (weightB !== weightA) return weightB - weightA;
      
      const sizeA = (a.dimensions?.length || 0) * (a.dimensions?.width || 0);
      const sizeB = (b.dimensions?.length || 0) * (b.dimensions?.width || 0);
      return sizeB - sizeA;
    });

    const totalItems = (itemsToPack || []).length;
    let palletPlan: number[] = [];

    if (totalItems > 0) {
      if (intensiveLoading) {
        // Intensive mode: Prioritize 4-packs
        const fullPallets = Math.floor(totalItems / 4);
        const remainder = totalItems % 4;
        
        if (remainder === 0) {
          palletPlan = Array(fullPallets).fill(4);
        } else if (remainder === 1) {
          if (fullPallets >= 1) {
            // 4+1 -> 3+2 or 4+1 (user prefers avoiding 1)
            palletPlan = [...Array(fullPallets - 1).fill(4), 3, 2];
          } else {
            palletPlan = [1];
          }
        } else if (remainder === 2) {
          palletPlan = [...Array(fullPallets).fill(4), 2];
        } else if (remainder === 3) {
          palletPlan = [...Array(fullPallets).fill(4), 3];
        }
      } else {
        // Standard mode: Prioritize 3-packs
        if (totalItems === 4) {
          palletPlan = [2, 2];
        } else {
          const fullPallets = Math.floor(totalItems / 3);
          const remainder = totalItems % 3;

          if (remainder === 0) {
            palletPlan = Array(fullPallets).fill(3);
          } else if (remainder === 1) {
            if (fullPallets >= 1) {
              // Convert one 3-pack to two 2-packs (e.g., 4 -> 2,2; 7 -> 3,2,2)
              palletPlan = [...Array(fullPallets - 1).fill(3), 2, 2];
            } else {
              palletPlan = [1];
            }
          } else if (remainder === 2) {
            palletPlan = [...Array(fullPallets).fill(3), 2];
          }
        }
      }
    }

    const newPallets: Pallet[] = palletPlan.map(() => ({
      id: Math.random().toString(36).substr(2, 9),
      dimensions: { 
        length: PALLET_CONSTANTS.STANDARD_LENGTH, 
        width: PALLET_CONSTANTS.STANDARD_WIDTH, 
        height: PALLET_CONSTANTS.BASE_HEIGHT, 
        weight: PALLET_CONSTANTS.BASE_WEIGHT 
      },
      products: []
    }));

    let itemIdx = 0;
    palletPlan.forEach((count, pIdx) => {
      for (let i = 0; i < count; i++) {
        if (itemIdx < (itemsToPack || []).length) {
          const item = itemsToPack[itemIdx];
          const itemDim = item.dimensions || { length: 0, width: 0, height: 0, weight: 0 };
          
          newPallets[pIdx].products.push(item.id);
          newPallets[pIdx].dimensions.height += itemDim.height;
          newPallets[pIdx].dimensions.weight += itemDim.weight;
          itemIdx++;
        }
      }
    });

    setFormData(prev => ({ ...prev, pallets: newPallets }));
    setIsCalculating(false);
  };

  const addPallet = () => {
    setFormData(prev => ({
      ...prev,
      pallets: [
        ...prev.pallets, 
        { 
          id: Math.random().toString(36).substr(2, 9), 
          dimensions: { 
            length: PALLET_CONSTANTS.STANDARD_LENGTH, 
            width: PALLET_CONSTANTS.STANDARD_WIDTH, 
            height: PALLET_CONSTANTS.BASE_HEIGHT, 
            weight: 0 
          }, 
          products: [] 
        }
      ]
    }));
  };

  const removePallet = (index: number) => {
    setFormData(prev => {
      const newPallets = [...prev.pallets];
      newPallets.splice(index, 1);
      return { ...prev, pallets: newPallets };
    });
  };

  const updatePalletDimension = (index: number, field: keyof Pallet['dimensions'], value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => {
      const newPallets = [...prev.pallets];
      newPallets[index].dimensions[field] = numValue;
      return { ...prev, pallets: newPallets };
    });
  };

  const sortPalletProducts = (productIds: string[]) => {
    return [...productIds].sort((aId, bId) => {
      const a = MOCK_PRODUCTS.find(p => p.id === aId);
      const b = MOCK_PRODUCTS.find(p => p.id === bId);
      if (!a || !b) return 0;

      const weightA = a.dimensions?.weight || 0;
      const weightB = b.dimensions?.weight || 0;
      if (weightB !== weightA) return weightB - weightA;

      const sizeA = (a.dimensions?.length || 0) * (a.dimensions?.width || 0);
      const sizeB = (b.dimensions?.length || 0) * (b.dimensions?.width || 0);
      return sizeB - sizeA;
    });
  };

  const calculatePalletDimensions = (productIds: string[]) => {
    let height = 0; // PALLET_CONSTANTS.BASE_HEIGHT;
    let weight = 0; // PALLET_CONSTANTS.BASE_WEIGHT;
    
    productIds.forEach(id => {
      const product = MOCK_PRODUCTS.find(p => p.id === id);
      if (product) {
        height += product.dimensions.height;
        weight += product.dimensions.weight;
      }
    });
    
    return { height: height + PALLET_CONSTANTS.BASE_HEIGHT, weight: weight + PALLET_CONSTANTS.BASE_WEIGHT };
  };

  const addProductToPallet = (palletIndex: number, productId: string, quantity: number = 1) => {
    setFormData(prev => {
      const newPallets = [...prev.pallets];
      const pallet = { ...newPallets[palletIndex], dimensions: { ...newPallets[palletIndex].dimensions } };
      const product = selectedProducts.find(p => p.id === productId);
      if (!product) return prev;

      const currentCountInAll = (prev.pallets || []).reduce((acc, p) => acc + (p.products?.filter(id => id === productId)?.length || 0), 0);
      const remainingGlobal = product.quantity - currentCountInAll;
      
      const actualToAdd = Math.min(quantity, remainingGlobal);
      if (actualToAdd <= 0) return prev;

      const newProducts = [...(pallet.products || [])];
      for (let i = 0; i < actualToAdd; i++) {
        newProducts.push(productId);
      }

      pallet.products = sortPalletProducts(newProducts);
      const dims = calculatePalletDimensions(pallet.products || []);
      pallet.dimensions.height = dims.height;
      pallet.dimensions.weight = dims.weight;
      
      newPallets[palletIndex] = pallet;
      return { ...prev, pallets: newPallets };
    });
  };

  const removeProductFromPallet = (palletIndex: number, productId: string, quantity: number = 1) => {
    setFormData(prev => {
      const newPallets = [...(prev.pallets || [])];
      const pallet = { ...newPallets[palletIndex], dimensions: { ...newPallets[palletIndex].dimensions } };
      const product = selectedProducts.find(p => p.id === productId);
      if (!product) return prev;

      const currentCountInPallet = (pallet.products || []).filter(id => id === productId).length;
      const actualToRemove = Math.min(quantity, currentCountInPallet);

      const newProducts = [...(pallet.products || [])];
      for (let i = 0; i < actualToRemove; i++) {
        const idx = newProducts.indexOf(productId);
        if (idx > -1) {
          newProducts.splice(idx, 1);
        }
      }

      pallet.products = sortPalletProducts(newProducts);
      const dims = calculatePalletDimensions(pallet.products || []);
      pallet.dimensions.height = dims.height;
      pallet.dimensions.weight = dims.weight;
      
      newPallets[palletIndex] = pallet;
      return { ...prev, pallets: newPallets };
    });
  };

  const toggleProductInPallet = (palletIndex: number, productId: string) => {
    setFormData(prev => {
      const newPallets = [...(prev.pallets || [])];
      const pallet = { ...newPallets[palletIndex], dimensions: { ...newPallets[palletIndex].dimensions } };
      const product = selectedProducts.find(p => p.id === productId);
      if (!product) return prev;

      const countInPallet = (pallet.products || []).filter(id => id === productId).length;
      const countInAllPallets = (prev.pallets || []).reduce((acc, p) => acc + (p.products?.filter(id => id === productId)?.length || 0), 0);

      if (countInPallet > 0) {
        const indexToRemove = (pallet.products || []).indexOf(productId);
        if (indexToRemove > -1) {
          const newProducts = [...(pallet.products || [])];
          newProducts.splice(indexToRemove, 1);
          pallet.products = sortPalletProducts(newProducts);
          const dims = calculatePalletDimensions(pallet.products || []);
          pallet.dimensions.height = dims.height;
          pallet.dimensions.weight = dims.weight;
          newPallets[palletIndex] = pallet;
        }
      } else {
        if (countInAllPallets >= (product?.quantity || 0)) return prev;
        if ((pallet.products || []).length >= PALLET_CONSTANTS.MAX_PRODUCTS_PER_PALLET) return prev;
        
        const newProducts = [...(pallet.products || []), productId];
        pallet.products = sortPalletProducts(newProducts);
        const dims = calculatePalletDimensions(pallet.products || []);
        pallet.dimensions.height = dims.height;
        pallet.dimensions.weight = dims.weight;
        newPallets[palletIndex] = pallet;
      }
      return { ...prev, pallets: newPallets };
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(f => f.name);
      setFormData(prev => ({ ...prev, documents: [...prev.documents, ...newFiles] }));
    }
  };

  const removeDocument = (index: number) => {
    setFormData(prev => {
      const newDocs = [...prev.documents];
      newDocs.splice(index, 1);
      return { ...prev, documents: newDocs };
    });
  };

  const handleVisualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setShipmentVisuals(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeVisual = (index: number) => {
    setShipmentVisuals(prev => prev.filter((_, i) => i !== index));
  };

  const saveShipment = async () => {
    // Check if we need to create new accounts
    const recipientAccount = accounts.find(a => a.name === formData.recipient.name);
    if (!recipientAccount && formData.recipient.name) {
      // Create new customer account
      await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.recipient.name,
          type: 'customer',
          address: formData.recipient.deliveryAddress
        })
      });
    }

    const carrierAccount = accounts.find(a => a.name === formData.carrier.name);
    if (!carrierAccount && formData.carrier.name) {
      // Create new carrier account
      await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.carrier.name,
          type: 'carrier'
        })
      });
    }

    onSave({
      ...formData,
      products: selectedProducts,
      id: formData.id || Math.random().toString(36).substr(2, 9),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-skel-glass/40 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-6xl bg-skel-space rounded-[2rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-skel-metal/20"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-skel-metal/10 shrink-0 bg-skel-matte/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-focus-main rounded-2xl shadow-lg shadow-focus-main/20">
              <Truck className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-display font-extrabold text-skel-glass">Sevkiyat Planlama Sihirbazı</h2>
              <p className="text-sm text-skel-metal font-medium">Akıllı lojistik ve palet optimizasyon motoru</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-skel-metal hover:text-skel-glass hover:bg-skel-matte/10 rounded-2xl transition-all duration-300">
            <X size={24} />
          </button>
        </div>
        
        {/* Progress Stepper */}
        <div className="px-12 pt-8 pb-4 shrink-0">
          <div className="flex justify-between relative">
            <div className="absolute top-6 left-0 w-full h-1 bg-skel-matte/10 -z-10 rounded-full"></div>
            <div 
              className="absolute top-6 left-0 h-1 bg-focus-main transition-all duration-700 ease-out -z-10 rounded-full" 
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
            
            {steps.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-3">
                <div 
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border-4 transition-all duration-500 ${
                    step >= s.id 
                      ? 'bg-focus-main border-skel-space text-white shadow-xl shadow-focus-main/20 scale-110' 
                      : 'bg-skel-space border-skel-matte/10 text-skel-metal'
                  }`}
                >
                  {s.icon}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-[0.15em] transition-colors duration-500 ${
                  step >= s.id ? 'text-focus-main' : 'text-skel-metal'
                }`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-skel-space">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="min-h-[450px]"
            >
              {/* STEP 1: Ürün & Palet */}
              {step === 1 && (
                <div className="space-y-10">
                  {/* Product Selection Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Box className="text-focus-main" size={20} />
                        <h3 className="font-display font-bold text-skel-glass">Ürün Seçimi</h3>
                      </div>
                      <p className="text-sm text-skel-metal leading-relaxed">
                        Sevkiyat için ürünleri stoktan seçin. AI motoru paletleri otomatik hesaplayacaktır.
                      </p>
                      
                      <div className="relative" ref={dropdownRef}>
                        <div className="relative group">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-skel-metal group-focus-within:text-focus-main transition-colors" size={20} />
                          <input 
                            type="text" 
                            placeholder="Ürün ara veya seç..." 
                            className="os-input w-full pl-12 bg-skel-matte/5 border-skel-metal/20 focus:bg-skel-space text-skel-glass" 
                            value={productSearch} 
                            onChange={e => setProductSearch(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                          />
                        </div>
                        
                        {/* Markdown Style Dropdown */}
                        <AnimatePresence>
                          {isSearchFocused && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute z-20 w-full mt-3 bg-skel-space border border-skel-metal/20 rounded-2xl shadow-2xl overflow-hidden max-h-[400px] overflow-y-auto"
                            >
                              <div className="p-3 border-b border-skel-metal/10 bg-skel-matte/5 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-skel-metal uppercase tracking-widest">Mevcut Stok Listesi</span>
                                <Info size={14} className="text-skel-metal" />
                              </div>
                              {filteredProducts.length > 0 ? (
                                filteredProducts.map(p => (
                                  <div 
                                    key={p.id} 
                                    className="p-4 hover:bg-focus-main/5 cursor-pointer border-b border-skel-metal/5 last:border-0 transition-all group flex items-center justify-between"
                                    onClick={() => addProduct(p)}
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-xl bg-skel-matte/5 flex items-center justify-center text-skel-metal group-hover:bg-focus-main/10 group-hover:text-focus-main transition-colors">
                                        <Package size={20} />
                                      </div>
                                      <div>
                                        <div className="font-bold text-skel-glass group-hover:text-focus-main">{p.name}</div>
                                        <div className="text-xs text-skel-metal flex items-center gap-2 mt-1">
                                          <span className="bg-skel-matte/10 px-1.5 py-0.5 rounded text-[10px] font-mono">{p.id}</span>
                                          <span>•</span>
                                          <span>{p.dimensions?.length}x{p.dimensions?.width}x{p.dimensions?.height} cm</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xs font-bold text-skel-metal">STOK</div>
                                      <div className={`text-sm font-bold ${p.stock < 20 ? 'text-red-500' : 'text-emerald-600'}`}>
                                        {p.stock} Adet
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="p-8 text-center text-skel-metal">
                                  <Search size={32} className="mx-auto mb-2 opacity-20" />
                                  <p className="text-sm">Ürün bulunamadı.</p>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <div className="bg-skel-matte/5 rounded-3xl p-6 border border-skel-metal/10">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="font-display font-bold text-skel-glass flex items-center gap-2">
                            <Layers className="text-focus-main" size={18} /> Seçilen Ürünler
                          </h4>
                          <span className="text-xs font-bold text-skel-metal bg-skel-space px-3 py-1 rounded-full border border-skel-metal/20">
                            {selectedProducts.length} Ürün Grubu
                          </span>
                        </div>

                        {selectedProducts.length > 0 ? (
                          <div className="overflow-hidden rounded-2xl border border-skel-metal/20 bg-skel-space shadow-sm">
                            <table className="w-full text-sm text-left">
                              <thead className="bg-skel-matte/5 border-b border-skel-metal/20">
                                <tr>
                                  <th className="px-6 py-4 font-bold text-skel-metal">Ürün</th>
                                  <th className="px-6 py-4 font-bold text-skel-metal">Ölçüler</th>
                                  <th className="px-6 py-4 font-bold text-skel-metal">Miktar</th>
                                  <th className="px-6 py-4 font-bold text-skel-metal text-right">İşlem</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-skel-metal/10">
                                {selectedProducts.map(p => (
                                  <tr key={p.id} className="hover:bg-skel-matte/5 transition-colors">
                                    <td className="px-6 py-4">
                                      <div className="font-bold text-skel-glass">{p.name}</div>
                                      <div className="text-[10px] text-skel-metal font-mono mt-0.5">{p.id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="text-skel-metal">{p.dimensions?.length}x{p.dimensions?.width}x{p.dimensions?.height} cm</div>
                                      <div className="text-[10px] text-skel-metal mt-0.5">{p.dimensions?.weight} kg</div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                        <input 
                                          type="number" 
                                          min="1" 
                                          max={p.stock}
                                          className="w-20 px-3 py-1.5 bg-skel-matte/5 border border-skel-metal/20 rounded-lg text-center font-bold text-skel-glass focus:ring-2 focus:ring-focus-main focus:outline-none" 
                                          value={p.quantity} 
                                          onChange={(e) => updateProductQuantity(p.id, parseInt(e.target.value) || 1)}
                                        />
                                        <span className="text-xs text-skel-metal font-medium">/ {p.stock}</span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <button 
                                        onClick={() => removeProduct(p.id)} 
                                        className="p-2 text-skel-metal hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                      >
                                        <Trash2 size={18}/>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-skel-space rounded-2xl border-2 border-dashed border-skel-metal/20">
                            <Box size={48} className="mx-auto mb-4 text-skel-metal/20" />
                            <p className="text-skel-metal font-medium">Henüz ürün seçilmedi.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pallet Configuration Section */}
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-xl">
                          <Layers className="text-emerald-600" size={20} />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-text-primary">Palet Yapılandırması</h3>
                          <p className="text-xs text-text-secondary">Otonom paketleme motoru ile verimli sevkiyat</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                        <div className="flex items-center gap-2 bg-skel-dark/40 px-4 py-2 rounded-xl border border-skel-metal/10">
                          <span className="text-[10px] font-black text-skel-metal uppercase tracking-widest">Yoğun Yükleme (4'lü)</span>
                          <button 
                            onClick={() => setIntensiveLoading(!intensiveLoading)}
                            className={`w-10 h-5 rounded-full relative transition-colors ${intensiveLoading ? 'bg-focus-neon' : 'bg-skel-matte/20'}`}
                          >
                            <motion.div 
                              animate={{ x: intensiveLoading ? 20 : 2 }}
                              className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-sm"
                            />
                          </button>
                        </div>
                        <button 
                          onClick={calculatePallets} 
                          disabled={isCalculating || selectedProducts.length === 0}
                          className={`os-btn flex-1 sm:flex-none h-12 px-6 rounded-2xl font-bold transition-all flex items-center gap-2 ${
                            isCalculating 
                              ? 'bg-skel-dark text-skel-metal cursor-not-allowed' 
                              : 'bg-focus-neon text-white shadow-lg shadow-focus-neon/20 hover:bg-focus-main hover:scale-[1.02]'
                          }`}
                        >
                          {isCalculating ? (
                            <motion.div 
                              animate={{ rotate: 360 }} 
                              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            >
                              <Settings2 size={18} />
                            </motion.div>
                          ) : <Calculator size={18}/>}
                          {isCalculating ? 'Hesaplanıyor...' : 'Otomatik Hesapla'}
                        </button>
                        <button onClick={addPallet} className="os-btn flex-1 sm:flex-none h-12 px-6 bg-skel-space border border-skel-metal/20 text-skel-matte rounded-2xl font-bold hover:bg-skel-dark transition-all flex items-center gap-2">
                          <Plus size={18}/> Manuel Palet
                        </button>
                      </div>
                    </div>
                    
                    {calculationError && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-crit-pale border border-crit-vivid/20 text-crit-vivid p-4 rounded-2xl flex items-center gap-3 text-sm font-medium"
                      >
                        <AlertTriangle size={20} /> {calculationError}
                      </motion.div>
                    )}
                    
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {formData.pallets.map((pallet, pIdx) => (
                        <motion.div 
                          key={pallet.id} 
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={() => setEditingPalletIndex(pIdx)}
                          className="bg-skel-space rounded-3xl p-6 border border-skel-metal/20 shadow-sm hover:shadow-md transition-all group relative overflow-hidden cursor-pointer"
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-focus-neon opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          
                          <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-focus-void flex items-center justify-center text-focus-neon font-bold">
                                {pIdx + 1}
                              </div>
                              <h4 className="font-bold text-text-primary">Palet Ünitesi</h4>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); removePallet(pIdx); }} 
                              className="p-2 text-skel-metal hover:text-crit-vivid hover:bg-crit-pale rounded-xl transition-all"
                            >
                              <Trash2 size={18}/>
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-skel-metal uppercase tracking-widest">Boyutlar (cm)</label>
                              <div className="flex items-center gap-2 bg-skel-dark/50 p-2 rounded-xl border border-skel-metal/10">
                                <input 
                                  type="number" 
                                  className="w-full bg-transparent text-sm font-bold text-text-primary focus:outline-none" 
                                  value={pallet.dimensions.length} 
                                  onChange={e => updatePalletDimension(pIdx, 'length', e.target.value)} 
                                />
                                <span className="text-skel-metal">×</span>
                                <input 
                                  type="number" 
                                  className="w-full bg-transparent text-sm font-bold text-text-primary focus:outline-none" 
                                  value={pallet.dimensions.width} 
                                  onChange={e => updatePalletDimension(pIdx, 'width', e.target.value)} 
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-skel-metal uppercase tracking-widest">Yükseklik (cm)</label>
                              <div className={`flex items-center gap-2 p-2 rounded-xl border transition-colors ${
                                pallet.dimensions.height > PALLET_CONSTANTS.MAX_HEIGHT ? 'bg-crit-pale border-crit-vivid/20 text-crit-vivid' : 'bg-skel-dark/50 border-skel-metal/10 text-text-primary'
                              }`}>
                                <input 
                                  type="number" 
                                  className="w-full bg-transparent text-sm font-bold focus:outline-none" 
                                  value={pallet.dimensions.height} 
                                  onChange={e => updatePalletDimension(pIdx, 'height', e.target.value)} 
                                />
                                <span className="text-[10px] opacity-50">/ {PALLET_CONSTANTS.MAX_HEIGHT}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-bold text-skel-metal uppercase tracking-widest">İçerik</label>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                pallet.products.length >= PALLET_CONSTANTS.MAX_PRODUCTS_PER_PALLET ? 'bg-nrg-sun/10 text-nrg-sun' : 'bg-focus-neon/10 text-focus-neon'
                              }`}>
                                {pallet.products.length} / {PALLET_CONSTANTS.MAX_PRODUCTS_PER_PALLET} Ürün
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {selectedProducts.map(prod => {
                                const countInPallet = pallet.products.filter(id => id === prod.id).length;
                                const countInAllPallets = formData.pallets.reduce((acc, p) => acc + p.products.filter(id => id === prod.id).length, 0);
                                const remaining = prod.quantity - countInAllPallets;
                                
                                return (
                                  <button
                                    key={prod.id}
                                    onClick={() => toggleProductInPallet(pIdx, prod.id)}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                                      countInPallet > 0 
                                        ? 'bg-focus-main border-focus-main text-white shadow-lg shadow-focus-main/20' 
                                        : remaining > 0 
                                          ? 'bg-skel-space border-skel-metal/20 text-skel-glass hover:border-focus-main hover:text-focus-main'
                                          : 'bg-skel-matte/5 border-skel-metal/10 text-skel-metal cursor-not-allowed'
                                    }`}
                                  >
                                    {prod.name.split(' ')[0]}
                                    {countInPallet > 0 && (
                                      <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-[10px]">
                                        {countInPallet}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      
                      {formData.pallets.length === 0 && !isCalculating && (
                        <div className="md:col-span-2 xl:col-span-3 text-center py-20 bg-skel-matte/5 rounded-[2.5rem] border-2 border-dashed border-skel-metal/20">
                          <Layers size={64} className="mx-auto mb-4 text-skel-metal/30" />
                          <h5 className="text-skel-glass font-bold text-lg">Palet Planı Hazır Değil</h5>
                          <p className="text-skel-metal max-w-md mx-auto mt-2">
                            Ürünleri seçtikten sonra "Otomatik Hesapla" butonuna basarak en verimli sevkiyat planını oluşturun.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Lojistik & Alıcı */}
              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Recipient Info */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-focus-main/10 rounded-2xl">
                        <ArrowRightLeft className="text-focus-main" size={24} />
                      </div>
                      <h3 className="text-xl font-display font-bold text-skel-glass">Alıcı & Adres Bilgileri</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-2 relative">
                        <label className="text-xs font-bold text-skel-metal uppercase tracking-widest">Alıcı Firma / Kişi</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            className="os-input w-full bg-skel-matte/5 border-skel-metal/20 text-skel-glass" 
                            placeholder="Örn: Solar Enerji A.Ş."
                            value={formData.recipient.name} 
                            onChange={e => {
                              const name = e.target.value;
                              const account = accounts.find(a => a.name === name);
                              setFormData({
                                ...formData, 
                                recipient: {
                                  ...formData.recipient, 
                                  name,
                                  deliveryAddress: account?.address || formData.recipient.deliveryAddress,
                                  invoiceAddress: account?.address || formData.recipient.invoiceAddress
                                }
                              });
                            }} 
                            list="recipient-accounts"
                          />
                          <datalist id="recipient-accounts">
                            {accounts.filter(a => a.type === 'customer').map(a => (
                              <option key={a.id} value={a.name} />
                            ))}
                          </datalist>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-skel-metal uppercase tracking-widest">Teslimat Adresi</label>
                        <textarea 
                          className="os-input w-full h-32 resize-none bg-skel-matte/5 border-skel-metal/20 text-skel-glass" 
                          placeholder="Tam teslimat adresi..."
                          value={formData.recipient.deliveryAddress} 
                          onChange={e => setFormData({...formData, recipient: {...formData.recipient, deliveryAddress: e.target.value}})} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-skel-metal uppercase tracking-widest">Fatura Adresi</label>
                        <textarea 
                          className="os-input w-full h-32 resize-none bg-skel-matte/5 border-skel-metal/20 text-skel-glass" 
                          placeholder="Fatura adresi (Teslimat ile aynıysa boş bırakın)..."
                          value={formData.recipient.invoiceAddress} 
                          onChange={e => setFormData({...formData, recipient: {...formData.recipient, invoiceAddress: e.target.value}})} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Carrier Info */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-500/10 rounded-2xl">
                        <Truck className="text-emerald-500" size={24} />
                      </div>
                      <h3 className="text-xl font-display font-bold text-skel-glass">Taşıyıcı & Lojistik</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-skel-metal uppercase tracking-widest">Taşıyıcı Firma</label>
                        <input 
                          type="text" 
                          className="os-input w-full bg-skel-matte/5 border-skel-metal/20 text-skel-glass" 
                          placeholder="Örn: Aras Kargo, DHL..."
                          value={formData.carrier.name} 
                          onChange={e => setFormData({...formData, carrier: {...formData.carrier, name: e.target.value}})} 
                          list="carrier-accounts"
                        />
                        <datalist id="carrier-accounts">
                          {accounts.filter(a => a.type === 'carrier').map(a => (
                            <option key={a.id} value={a.name} />
                          ))}
                        </datalist>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-skel-metal uppercase tracking-widest">Taşıma Yöntemi</label>
                          <input 
                            type="text" 
                            className="os-input w-full bg-skel-matte/5 border-skel-metal/20 text-skel-glass" 
                            placeholder="Örn: EXW, DAP"
                            value={formData.transportMethod || ''} 
                            onChange={e => setFormData({...formData, transportMethod: e.target.value})} 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-skel-metal uppercase tracking-widest">Sevkiyat Türü</label>
                          <input 
                            type="text" 
                            className="os-input w-full bg-skel-matte/5 border-skel-metal/20 text-skel-glass" 
                            placeholder="Örn: Karayolu, Denizyolu"
                            value={formData.shipmentType || ''} 
                            onChange={e => setFormData({...formData, shipmentType: e.target.value})} 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-skel-metal uppercase tracking-widest">Ek Detaylar</label>
                        <textarea 
                          className="os-input w-full h-24 resize-none bg-skel-matte/5 border-skel-metal/20 text-skel-glass" 
                          placeholder="Ek detay bilgileri..."
                          value={formData.extraDetails || ''} 
                          onChange={e => setFormData({...formData, extraDetails: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-skel-metal uppercase tracking-widest">Araç & Şoför Bilgisi</label>
                        <input 
                          type="text" 
                          className="os-input w-full bg-skel-matte/5 border-skel-metal/20 text-skel-glass" 
                          placeholder="Plaka, şoför adı, telefon..."
                          value={formData.carrier.vehicleInfo} 
                          onChange={e => setFormData({...formData, carrier: {...formData.carrier, vehicleInfo: e.target.value}})} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-skel-metal uppercase tracking-widest">Lojistik Maliyeti</label>
                        <div className="flex gap-3">
                          <input 
                            type="number" 
                            className="os-input w-full bg-skel-matte/5 border-skel-metal/20 text-skel-glass" 
                            placeholder="0.00"
                            value={formData.logisticsCost.amount || ''} 
                            onChange={e => setFormData({...formData, logisticsCost: {...formData.logisticsCost, amount: parseFloat(e.target.value) || 0}})} 
                          />
                          <select 
                            className="os-input w-32 bg-skel-matte/5 border-skel-metal/20 text-skel-glass font-bold" 
                            value={formData.logisticsCost.currency} 
                            onChange={e => setFormData({...formData, logisticsCost: {...formData.logisticsCost, currency: e.target.value as any}})}
                          >
                            <option value="TRY">TRY</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Tarih */}
              {step === 3 && (
                <div className="max-w-3xl mx-auto space-y-12 mt-8">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-focus-main/10 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-focus-main/10">
                      <Calendar className="text-focus-main" size={40} />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-skel-glass">Zamanlama Planı</h3>
                    <p className="text-skel-metal">Sevkiyatın çıkış ve varış tarihlerini belirleyin.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-skel-space p-8 rounded-[2.5rem] border border-skel-metal/10 shadow-sm space-y-6 hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-skel-matte/5 rounded-xl flex items-center justify-center text-skel-metal">
                          <History size={20} />
                        </div>
                        <h4 className="font-bold text-skel-glass">Çıkış Tarihi</h4>
                      </div>
                      <input 
                        type="date" 
                        className="os-input w-full text-lg p-5 bg-skel-matte/5 border-skel-metal/20 text-skel-glass font-bold" 
                        value={formData.departureDate} 
                        onChange={e => setFormData({...formData, departureDate: e.target.value})} 
                      />
                      <p className="text-xs text-skel-metal leading-relaxed">
                        Ürünlerin depodan ayrılacağı resmi tarih.
                      </p>
                    </div>

                    <div className="bg-skel-space p-8 rounded-[2.5rem] border border-skel-metal/10 shadow-sm space-y-6 hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                          <CheckCircle2 size={20} />
                        </div>
                        <h4 className="font-bold text-skel-glass">Teslimat Tarihi</h4>
                      </div>
                      <input 
                        type="date" 
                        className="os-input w-full text-lg p-5 bg-skel-matte/5 border-skel-metal/20 text-skel-glass font-bold" 
                        value={formData.deliveryDate} 
                        onChange={e => setFormData({...formData, deliveryDate: e.target.value})} 
                      />
                      <p className="text-xs text-skel-metal leading-relaxed">
                        Müşteriye ulaşması hedeflenen tahmini tarih.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Notlar & Döküman */}
              {step === 4 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-500/10 rounded-2xl">
                          <FileText className="text-amber-500" size={24} />
                        </div>
                        <h3 className="text-xl font-display font-bold text-skel-glass">Sevkiyat Notları</h3>
                      </div>
                      <button 
                        onClick={() => setFormData(prev => ({...prev, notes: [...prev.notes, '']}))} 
                        className="p-2 bg-skel-matte/5 text-skel-metal rounded-xl hover:bg-skel-matte/10 transition-all"
                      >
                        <Plus size={20}/>
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {formData.notes.map((note, idx) => (
                        <motion.div 
                          key={idx} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex gap-4 items-start"
                        >
                          <div className="flex-1 relative">
                            <textarea 
                              className="os-input w-full h-32 resize-none bg-skel-matte/5 border-skel-metal/20 text-skel-glass pt-8" 
                              placeholder="Notunuzu buraya yazın..." 
                              value={note} 
                              onChange={e => {
                                const newNotes = [...formData.notes];
                                newNotes[idx] = e.target.value;
                                setFormData({...formData, notes: newNotes});
                              }} 
                            />
                            <span className="absolute top-3 left-5 text-[10px] font-bold text-skel-metal uppercase tracking-widest">Not #{idx + 1}</span>
                          </div>
                          <button 
                            onClick={() => {
                              const newNotes = [...formData.notes];
                              newNotes.splice(idx, 1);
                              setFormData({...formData, notes: newNotes});
                            }} 
                            className="p-3 text-skel-metal hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all mt-2"
                          >
                            <Trash2 size={20}/>
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-focus-main/10 rounded-2xl">
                        <Upload className="text-focus-main" size={24} />
                      </div>
                      <h3 className="text-xl font-display font-bold text-skel-glass">Döküman Yükle</h3>
                    </div>
                    
                    <div className="border-4 border-dashed border-skel-metal/10 rounded-[2.5rem] p-16 text-center hover:border-focus-main/30 hover:bg-focus-main/5 transition-all duration-500 cursor-pointer relative group">
                      <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleFileUpload} />
                      <div className="flex flex-col items-center justify-center space-y-6 group-hover:scale-105 transition-transform duration-500">
                        <div className="w-20 h-20 bg-skel-space rounded-3xl shadow-xl flex items-center justify-center text-focus-main border border-skel-metal/10">
                          <Upload size={36} />
                        </div>
                        <div>
                          <p className="text-skel-glass font-bold text-lg">Dosyaları buraya bırakın</p>
                          <p className="text-sm text-skel-metal mt-2">PDF, Excel veya Görsel dökümanlar</p>
                        </div>
                      </div>
                    </div>

                    {formData.documents.length > 0 && (
                      <div className="grid grid-cols-1 gap-3">
                        {formData.documents.map((doc, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-skel-space p-4 rounded-2xl border border-skel-metal/10 shadow-sm">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-focus-main/10 rounded-lg text-focus-main">
                                <FileText size={18} />
                              </div>
                              <span className="text-sm font-bold text-skel-glass">{doc}</span>
                            </div>
                            <button onClick={() => removeDocument(idx)} className="p-2 text-skel-metal hover:text-red-500 transition-colors">
                              <X size={20}/>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 5: Önizleme */}
              {step === 5 && (
                <div className="space-y-8 pb-12">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-black text-skel-glass tracking-tight">Sevkiyat Özeti</h3>
                      <p className="text-skel-metal text-sm font-medium mt-1">Lütfen sevkiyat detaylarını onaylayın.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-skel-dark/40 p-1.5 rounded-2xl border border-skel-metal/10">
                      {(['dark', 'soft', 'navy', 'forest'] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setPreviewTheme(t)}
                          className={`w-8 h-8 rounded-xl transition-all border-2 ${
                            previewTheme === t ? 'border-focus-neon scale-110' : 'border-transparent opacity-40 hover:opacity-100'
                          } ${
                            t === 'dark' ? 'bg-void-black' : 
                            t === 'soft' ? 'bg-skel-matte' : 
                            t === 'navy' ? 'bg-slate-900' : 'bg-emerald-950'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className={`rounded-[3rem] overflow-hidden border border-skel-metal/10 shadow-2xl transition-colors duration-500 ${
                    previewTheme === 'dark' ? 'bg-void-black' : 
                    previewTheme === 'soft' ? 'bg-skel-matte' : 
                    previewTheme === 'navy' ? 'bg-slate-900' : 'bg-emerald-950'
                  }`}>
                    <div className="p-10 lg:p-14">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Left: Shipment Info */}
                        <div className="lg:col-span-2 space-y-10">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-focus-main/20 flex items-center justify-center text-focus-neon">
                                  <MapPin size={24} />
                                </div>
                                <div>
                                  <div className="text-[10px] font-black text-skel-metal uppercase tracking-widest">Teslimat Noktası</div>
                                  <div className="text-lg font-bold text-white">{formData.recipient.name || 'Alıcı Seçilmedi'}</div>
                                </div>
                              </div>
                              <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                                <p className="text-sm text-skel-metal leading-relaxed">
                                  {formData.recipient.deliveryAddress || 'Adres bilgisi girilmedi.'}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-grow-main/20 flex items-center justify-center text-grow-main">
                                  <Truck size={24} />
                                </div>
                                <div>
                                  <div className="text-[10px] font-black text-skel-metal uppercase tracking-widest">Lojistik Sağlayıcı</div>
                                  <div className="text-lg font-bold text-white">{formData.carrier.name || 'Taşıyıcı Seçilmedi'}</div>
                                </div>
                              </div>
                              <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-[10px] font-bold text-skel-metal uppercase tracking-widest">Araç / Şoför</span>
                                  <span className="text-xs font-bold text-white">{formData.carrier.vehicleInfo || 'Belirtilmedi'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-skel-metal uppercase tracking-widest">Sevkiyat Tarihi</span>
                                  <span className="text-xs font-bold text-white">{formData.departureDate || 'Seçilmedi'}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-black text-white uppercase tracking-widest">Yükleme Planı</h4>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-skel-metal uppercase tracking-widest">Toplam Hacim:</span>
                                <span className="text-xs font-black text-focus-neon">
                                  {formData.pallets.reduce((acc, p) => acc + p.dimensions.height, 0)} cm
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                              {formData.pallets.map((p, idx) => (
                                <motion.div
                                  key={p.id}
                                  whileHover={{ scale: 1.05, y: -5 }}
                                  onClick={() => setEditingPalletIndex(idx)}
                                  className="aspect-[3/4] bg-white/5 rounded-3xl border border-white/10 p-4 flex flex-col justify-between group cursor-pointer hover:bg-white/10 transition-all"
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-xs font-black text-white group-hover:bg-focus-main transition-colors">
                                      {idx + 1}
                                    </div>
                                    <div className="text-[10px] font-black text-skel-metal uppercase tracking-tighter">
                                      {p.products.length} Ürün
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="h-24 bg-skel-dark/40 rounded-xl border border-white/5 flex flex-col-reverse items-center p-2 gap-0.5 overflow-hidden">
                                      {p.products.map((pid, pidx) => (
                                        <div 
                                          key={pidx} 
                                          className="w-full bg-focus-main/40 border border-focus-main/20 rounded-sm"
                                          style={{ height: '15%' }}
                                        />
                                      ))}
                                      <div className="w-full h-1 bg-amber-800/40 rounded-full" />
                                    </div>
                                    <div className="text-center">
                                      <div className="text-[10px] font-black text-white">{p.dimensions.height} cm</div>
                                      <div className="text-[8px] font-bold text-skel-metal uppercase tracking-widest">{p.dimensions.weight} kg</div>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Right: Summary Sidebar */}
                        <div className="space-y-8">
                          <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 space-y-8">
                            <div className="text-center space-y-2">
                              <div className="text-[10px] font-black text-skel-metal uppercase tracking-[0.2em]">Sevkiyat Durumu</div>
                              <div className="inline-flex items-center gap-2 px-4 py-2 bg-grow-main/20 text-grow-main rounded-full text-xs font-black uppercase tracking-widest">
                                <CheckCircle2 size={14} /> Onay Bekliyor
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                <span className="text-[10px] font-bold text-skel-metal uppercase tracking-widest">Toplam Palet</span>
                                <span className="text-xl font-black text-white">{formData.pallets.length}</span>
                              </div>
                              <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                <span className="text-[10px] font-bold text-skel-metal uppercase tracking-widest">Toplam Ürün</span>
                                <span className="text-xl font-black text-white">
                                  {selectedProducts.reduce((acc, p) => acc + p.quantity, 0)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                <span className="text-[10px] font-bold text-skel-metal uppercase tracking-widest">Toplam Ağırlık</span>
                                <span className="text-xl font-black text-white">
                                  {formData.pallets.reduce((acc, p) => acc + p.dimensions.weight, 0)} kg
                                </span>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="text-[10px] font-black text-skel-metal uppercase tracking-widest mb-2">Ekli Belgeler</div>
                              <div className="grid grid-cols-2 gap-2">
                                {formData.documents.map((doc, i) => (
                                  <div key={i} className="flex items-center gap-2 p-2 bg-white/5 rounded-xl border border-white/5 text-[9px] font-bold text-white truncate">
                                    <FileText size={12} className="text-focus-neon shrink-0" />
                                    {doc}
                                  </div>
                                ))}
                                {formData.documents.length === 0 && (
                                  <div className="col-span-2 text-[10px] text-skel-metal italic text-center py-4">Belge yok</div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="p-6 bg-focus-main/10 rounded-[2rem] border border-focus-main/20">
                            <div className="flex items-start gap-3">
                              <Info size={18} className="text-focus-neon shrink-0 mt-0.5" />
                              <p className="text-[11px] text-skel-glass font-medium leading-relaxed">
                                Bu sevkiyat onaylandığında taşıyıcı firmaya ve alıcıya otomatik bilgilendirme e-postası gönderilecektir.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-skel-metal/10 bg-skel-matte/5 flex justify-between items-center shrink-0">
          <button 
            onClick={handlePrev} 
            disabled={step === 1} 
            className={`flex items-center gap-2 font-bold text-skel-metal hover:text-skel-glass transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            <ChevronLeft size={20} /> Önceki Adım
          </button>
          
          <div className="flex gap-4">
            {step < steps.length ? (
              <button 
                onClick={handleNext} 
                className="os-btn os-btn-primary px-12 h-14 rounded-2xl text-lg group"
              >
                Sonraki <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button 
                onClick={saveShipment} 
                className="os-btn bg-grow-main text-white px-12 h-14 rounded-2xl text-lg font-bold shadow-xl shadow-grow-main/20 hover:bg-grow-forest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
              >
                <Save size={20} /> Sevkiyatı Tamamla
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Pallet Detail Modal */}
      <AnimatePresence>
        {editingPalletIndex !== null && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-void-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-skel-space border border-skel-metal/10 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-8 border-b border-skel-metal/5 flex items-center justify-between bg-skel-dark/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-focus-main text-white flex items-center justify-center font-black text-xl">
                    {editingPalletIndex + 1}
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-black text-skel-glass tracking-tight">Palet Detay Yönetimi</h3>
                    <p className="text-skel-metal text-sm">Ürün dağılımını ve kapasiteyi hassas bir şekilde ayarlayın.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingPalletIndex(null)}
                  className="p-3 hover:bg-skel-matte/10 rounded-2xl transition-colors text-skel-metal"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left: Pallet Stats */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bento-card p-6 bg-focus-main/5 border-focus-main/10">
                      <h4 className="label-mono mb-4">Kapasite Durumu</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1.5">
                            <span className="text-skel-metal">Yükseklik</span>
                            <span className={formData.pallets[editingPalletIndex].dimensions.height > PALLET_CONSTANTS.MAX_HEIGHT ? 'text-crit-vivid' : 'text-focus-main'}>
                              {formData.pallets[editingPalletIndex].dimensions.height} / {PALLET_CONSTANTS.MAX_HEIGHT} cm
                            </span>
                          </div>
                          <div className="h-2 bg-skel-matte/10 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, (formData.pallets[editingPalletIndex].dimensions.height / PALLET_CONSTANTS.MAX_HEIGHT) * 100)}%` }}
                              className={`h-full ${formData.pallets[editingPalletIndex].dimensions.height > PALLET_CONSTANTS.MAX_HEIGHT ? 'bg-crit-vivid' : 'bg-focus-main'}`}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1.5">
                            <span className="text-skel-metal">Ürün Sayısı</span>
                            <span className={formData.pallets[editingPalletIndex].products.length >= PALLET_CONSTANTS.MAX_PRODUCTS_PER_PALLET ? 'text-nrg-sun' : 'text-focus-main'}>
                              {formData.pallets[editingPalletIndex].products.length} / {PALLET_CONSTANTS.MAX_PRODUCTS_PER_PALLET}
                            </span>
                          </div>
                          <div className="h-2 bg-skel-matte/10 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, (formData.pallets[editingPalletIndex].products.length / PALLET_CONSTANTS.MAX_PRODUCTS_PER_PALLET) * 100)}%` }}
                              className={`h-full ${formData.pallets[editingPalletIndex].products.length >= PALLET_CONSTANTS.MAX_PRODUCTS_PER_PALLET ? 'bg-nrg-sun' : 'bg-focus-main'}`}
                            />
                          </div>
                        </div>
                        <div className="pt-4 border-t border-skel-metal/10">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-skel-metal">Toplam Ağırlık</span>
                            <span className="text-skel-glass">{formData.pallets[editingPalletIndex].dimensions.weight} kg</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bento-card p-6">
                      <h4 className="label-mono mb-4">Yükleme Şeması</h4>
                      <div className="relative h-64 bg-skel-dark/40 rounded-2xl border border-skel-metal/10 flex flex-col-reverse items-center p-4 gap-1">
                        {/* Pallet Base */}
                        <div className="w-32 h-4 bg-amber-800/40 border border-amber-800/20 rounded-sm flex items-center justify-center">
                          <span className="text-[8px] text-amber-200/40 font-black">PALET</span>
                        </div>
                        
                        {/* Stacked Products */}
                        <AnimatePresence mode="popLayout">
                          {formData.pallets[editingPalletIndex].products.map((pId, idx) => {
                            const prod = MOCK_PRODUCTS.find(p => p.id === pId);
                            return (
                              <motion.div
                                key={`${pId}-${idx}`}
                                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="w-32 bg-focus-main/20 border border-focus-main/40 rounded-md flex flex-col items-center justify-center p-1 relative group"
                                style={{ height: `${(prod?.dimensions?.height || 50) / 2}px` }}
                              >
                                <div className="text-[8px] font-black text-focus-neon truncate w-full text-center">
                                  {prod?.name.split(' ')[0]}
                                </div>
                                <div className="text-[7px] text-skel-metal font-bold">
                                  {prod?.dimensions?.weight}kg
                                </div>
                                {idx === 0 && (
                                  <div className="absolute -left-8 bottom-0 text-[8px] text-skel-metal font-black vertical-text">TABAN</div>
                                )}
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>

                        {formData.pallets[editingPalletIndex].products.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center text-skel-metal/20 text-[10px] font-black uppercase tracking-widest">
                            Boş Palet
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-[10px] text-skel-metal font-bold">
                        <Info size={12} className="text-focus-neon" />
                        <span>Ağır ürünler otomatik olarak alta yerleştirilir.</span>
                      </div>
                    </div>

                    <div className="bento-card p-6">
                      <h4 className="label-mono mb-4">Akıllı Öneri</h4>
                      <div className="flex items-start gap-3 p-3 bg-grow-mint/30 rounded-xl border border-grow-main/10">
                        <CheckCircle2 size={18} className="text-grow-main shrink-0 mt-0.5" />
                        <p className="text-[11px] text-grow-forest font-medium leading-relaxed">
                          Bu palet şu anki haliyle %{Math.round((formData.pallets[editingPalletIndex].dimensions.height / PALLET_CONSTANTS.MAX_HEIGHT) * 100)} doluluk oranına sahip. 
                          {formData.pallets[editingPalletIndex].dimensions.height < 150 ? ' Daha fazla ürün ekleyerek taşıma maliyetini düşürebilirsiniz.' : ' İdeal doluluk oranına yakın.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Product Management */}
                  <div className="lg:col-span-2 space-y-6">
                    <h4 className="label-mono">Ürün Dağılımı</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedProducts.map(prod => {
                        const countInPallet = formData.pallets[editingPalletIndex!].products.filter(id => id === prod.id).length;
                        const countInAll = formData.pallets.reduce((acc, p) => acc + p.products.filter(id => id === prod.id).length, 0);
                        const remainingGlobal = prod.quantity - countInAll;
                        
                        return (
                          <div key={prod.id} className="flex items-center justify-between p-4 bg-skel-dark/20 rounded-2xl border border-skel-metal/10 group hover:border-focus-neon/30 transition-all">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${countInPallet > 0 ? 'bg-focus-main text-white' : 'bg-skel-matte/10 text-skel-metal'}`}>
                                <Package size={24} />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-skel-glass">{prod.name}</div>
                                <div className="text-[10px] text-skel-metal flex items-center gap-2 mt-0.5">
                                  <span>{prod.dimensions.length}x{prod.dimensions.width}x{prod.dimensions.height} cm</span>
                                  <span className="w-1 h-1 rounded-full bg-skel-metal/30" />
                                  <span>{prod.dimensions.weight} kg</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-xs font-black text-skel-glass">{countInPallet} Adet</div>
                                <div className="text-[9px] text-skel-metal uppercase font-bold tracking-tighter">Bu Palette</div>
                              </div>
                              
                              <div className="flex items-center gap-1 bg-skel-space p-1 rounded-xl border border-skel-metal/10">
                                <button 
                                  onClick={() => removeProductFromPallet(editingPalletIndex!, prod.id)}
                                  disabled={countInPallet === 0}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-crit-pale text-skel-metal hover:text-crit-vivid disabled:opacity-20 transition-all"
                                >
                                  <ChevronLeft size={18} />
                                </button>
                                <div className="w-8 text-center text-xs font-black text-focus-main">
                                  {countInPallet}
                                </div>
                                <button 
                                  onClick={() => addProductToPallet(editingPalletIndex!, prod.id)}
                                  disabled={remainingGlobal <= 0}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-grow-mint text-skel-metal hover:text-grow-main disabled:opacity-20 transition-all"
                                >
                                  <ChevronRight size={18} />
                                </button>
                              </div>

                              <div className="w-16 text-center">
                                <div className="text-[10px] font-bold text-skel-metal">Kalan</div>
                                <div className={`text-xs font-black ${remainingGlobal > 0 ? 'text-grow-main' : 'text-skel-metal/30'}`}>
                                  {remainingGlobal}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-skel-metal/5 bg-skel-dark/30 flex justify-end">
                <button 
                  onClick={() => setEditingPalletIndex(null)}
                  className="os-btn os-btn-primary px-12"
                >
                  Değişiklikleri Onayla
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
