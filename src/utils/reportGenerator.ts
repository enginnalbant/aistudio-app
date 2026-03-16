import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Shipment } from '../types/shipment';

export const generateShipmentReport = (shipments: Shipment[], format: 'pdf' | 'excel', title: string) => {
  if (format === 'pdf') {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(20);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Oluşturulma Tarihi: ${new Date().toLocaleString('tr-TR')}`, 14, 30);

    const tableData = shipments.map(s => [
      s.id,
      s.recipient?.name || 'Belirtilmemiş',
      s.carrier?.name || 'Belirtilmemiş',
      s.scheduledDate || 'Belirtilmemiş',
      s.departureDate || 'Belirtilmemiş',
      s.deliveryDate || 'Belirtilmemiş',
      s.pallets?.length || 0,
      s.status === 'pending' ? 'Beklemede' : s.status === 'in-transit' ? 'Yolda' : s.status === 'delivered' ? 'Teslim Edildi' : s.status === 'cancelled' ? 'İptal' : 'Ertelendi',
      `${s.logisticsCost?.amount || 0} ${s.logisticsCost?.currency || 'TRY'}`
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['ID', 'Alıcı', 'Taşıyıcı', 'Planlanan', 'Çıkış', 'Teslim', 'Palet', 'Durum', 'Maliyet']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [10, 10, 10] },
      styles: { font: 'helvetica', fontSize: 9 }
    });

    doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().getTime()}.pdf`);
  } else {
    const worksheet = XLSX.utils.json_to_sheet(shipments.map(s => ({
      'Sevkiyat ID': s.id,
      'Alıcı': s.recipient?.name,
      'Taşıyıcı': s.carrier?.name,
      'Planlanan Tarih': s.scheduledDate,
      'Çıkış Tarihi': s.departureDate,
      'Teslim Tarihi': s.deliveryDate,
      'Palet Sayısı': s.pallets?.length || 0,
      'Durum': s.status,
      'Maliyet': `${s.logisticsCost?.amount || 0} ${s.logisticsCost?.currency || 'TRY'}`
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sevkiyatlar");
    XLSX.writeFile(workbook, `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().getTime()}.xlsx`);
  }
};
