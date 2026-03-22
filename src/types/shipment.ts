export interface Product {
  id: string;
  name: string;
  dimensions?: { length: number; width: number; height: number; weight: number };
}

export interface Pallet {
  id: string;
  dimensions: { length: number; width: number; height: number; weight: number };
  products: string[]; // Product IDs
}

export interface Movement {
  id: string;
  status: string;
  location: string;
  description: string;
  movementDate: string;
  filePaths: string[];
  createdAt: string;
}

export interface Shipment {
  id: string;
  recipient: {
    name: string;
    deliveryAddress: string;
    invoiceAddress: string;
  };
  carrier: {
    name: string;
    vehicleInfo: string;
  };
  logisticsCost: {
    amount: number;
    currency: 'TRY' | 'USD' | 'EUR';
  };
  departureDate: string;
  deliveryDate: string;
  scheduledDate: string;
  priority: 'low' | 'medium' | 'high';
  products: (Product & { quantity: number; stock: number })[];
  pallets: Pallet[];
  notes: string[];
  documents: string[]; // File names or URLs
  status: 'pending' | 'in-transit' | 'delivered' | 'cancelled' | 'postponed';
  transportMethod?: string; // EXW, DAP, etc.
  shipmentType?: string; // Road, Sea, etc.
  extraDetails?: string;
  movements: Movement[];
}
