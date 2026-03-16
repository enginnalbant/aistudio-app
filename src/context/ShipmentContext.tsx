import React, { createContext, useContext, useState, useEffect } from 'react';
import { Shipment, Movement } from '../types/shipment';

interface ShipmentContextType {
  shipments: Shipment[];
  addShipment: (shipment: Shipment) => void;
  updateShipment: (shipment: Shipment) => void;
  deleteShipment: (id: string) => void;
  updateStatus: (id: string, status: Shipment['status']) => void;
  addMovement: (shipmentId: string, movement: Movement) => void;
}

const ShipmentContext = createContext<ShipmentContextType | undefined>(undefined);

export function ShipmentProvider({ children }: { children: React.ReactNode }) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/shipments')
      .then(res => res.json())
      .then(data => {
        setShipments(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching shipments:', err);
        setIsLoading(false);
      });
  }, []);

  const addShipment = async (shipment: Shipment) => {
    const response = await fetch('/api/shipments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shipment)
    });
    if (response.ok) {
      const { id } = await response.json();
      setShipments(prev => [...prev, { ...shipment, id, movements: [] }]);
    }
  };

  const updateShipment = (updatedShipment: Shipment) => {
    // TODO: Implement API update
    setShipments(prev => prev.map(s => s.id === updatedShipment.id ? updatedShipment : s));
  };

  const deleteShipment = (id: string) => {
    // TODO: Implement API delete
    setShipments(prev => prev.filter(s => s.id !== id));
  };

  const updateStatus = async (id: string, status: Shipment['status']) => {
    const response = await fetch(`/api/shipments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (response.ok) {
      setShipments(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    }
  };

  const addMovement = async (shipmentId: string, movement: Movement) => {
    const response = await fetch(`/api/shipments/${shipmentId}/movements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movement)
    });
    if (response.ok) {
      const { id } = await response.json();
      setShipments(prev => prev.map(s => s.id === shipmentId ? { ...s, movements: [...s.movements, { ...movement, id, createdAt: new Date().toISOString() }] } : s));
    }
  };

  return (
    <ShipmentContext.Provider value={{ shipments, addShipment, updateShipment, deleteShipment, updateStatus, addMovement }}>
      {children}
    </ShipmentContext.Provider>
  );
}

export function useShipments() {
  const context = useContext(ShipmentContext);
  if (context === undefined) {
    throw new Error('useShipments must be used within a ShipmentProvider');
  }
  return context;
}
