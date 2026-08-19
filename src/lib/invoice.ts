import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const generateInvoice = (work: any) => {
  const doc = new jsPDF();
  
  // Colors and Styles
  const primaryColor: [number, number, number] = [213, 55, 104]; // Yaron Magenta
  const textColor: [number, number, number] = [51, 51, 51];
  
  // Header
  doc.setFontSize(24);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('INVOICE', 14, 25);
  
  // Studio Info (Could be dynamic from store later)
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('Yaron Studio', 14, 35);
  doc.text('Music Production & Recording', 14, 40);
  
  // Invoice Details
  doc.setFontSize(10);
  doc.text(`Invoice ID: INV-${work.id.slice(0, 8)}`, 140, 25);
  doc.text(`Date: ${format(new Date(), 'MMM dd, yyyy')}`, 140, 30);
  doc.text(`Due Date: ${work.due}`, 140, 35);
  
  // Customer Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 14, 55);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Name: ${work.customer}`, 14, 62);
  doc.text(`Phone: ${work.phone}`, 14, 67);
  
  // Work Title
  doc.setFont('helvetica', 'bold');
  doc.text('Project:', 140, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(work.title, 140, 62);

  // Table Data
  const tableData = [
    ['Total Project Amount', '', '', `Rs ${work.total}`]
  ];
  
  let balance = work.pending;
  
  if (work.total > work.pending) {
     const paid = work.total - work.pending;
     tableData.push([`Advance/Paid Amount`, '', '', `- Rs ${paid}`]);
  }

  // Generate Table
  autoTable(doc, {
    startY: 85,
    head: [['Description', 'Qty', 'Unit Price', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255 },
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  // Summary
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Pending Balance: Rs ${Math.max(0, balance)}`, 140, finalY);

  // Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for choosing Yaron Studio!', 14, finalY + 30);
  
  // Save PDF
  doc.save(`Invoice_${work.title.replace(/[^a-zA-Z0-9]/g, '_')}_${work.customer.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
};
