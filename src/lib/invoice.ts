import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

const numberToWords = (num: number): string => {
  if (num === 0) return 'Zero';
  
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if ((num = num.toString().replace(/[\, ]/g, '') as any) != parseFloat(num as any)) return 'Not a number';
  let n: any = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim() + ' Rupees Only';
};

const drawInvoiceHeader = async (doc: jsPDF, invoiceId: string, customer: any) => {
  const primaryColor: [number, number, number] = [213, 55, 104]; // Yaron Magenta
  const textColor: [number, number, number] = [51, 51, 51];

  let logoImage: HTMLImageElement | null = null;
  try {
    logoImage = await loadImage('/yaron logo.png');
    doc.addImage(logoImage, 'PNG', 14, 15, 40, 40); // x, y, width, height (adjust as needed for aspect ratio)
    
    // Add watermark
    doc.saveGraphicsState();
    doc.setGState(new (doc as any).GState({opacity: 0.05}));
    doc.addImage(logoImage, 'PNG', 45, 120, 120, 120);
    doc.restoreGraphicsState();
  } catch (e) {
    console.error("Failed to load logo", e);
    // Fallback text if logo fails
    doc.setFontSize(24);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('YARON STUDIO', 14, 30);
  }

  // Invoice Title
  doc.setFontSize(28);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 140, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice ID: ${invoiceId}`, 140, 38);
  doc.text(`Date: ${format(new Date(), 'MMM dd, yyyy')}`, 140, 43);

  // Bill To
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 14, 70);
  
  doc.setFontSize(11);
  doc.text(`${customer?.name || 'Walk-in Customer'}`, 14, 77);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  if (customer?.phone) doc.text(`Phone: ${customer.phone}`, 14, 82);
  if (customer?.place) doc.text(`Place: ${customer.place}`, 14, 87);
};

export const generateInvoice = async (work: any, customer: any) => {
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [213, 55, 104]; // Yaron Magenta
  
  await drawInvoiceHeader(doc, work.refNumber || `INV-${work.id.slice(0, 8)}`, customer);

  // Work Title
  doc.setFont('helvetica', 'bold');
  doc.text('Project:', 140, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(work.title, 140, 77);
  if (work.dueDate) {
     const rawDueDate = work.dueDate instanceof Date ? work.dueDate : new Date(work.dueDate);
     doc.text(`Due Date: ${format(rawDueDate, 'MMM dd, yyyy')}`, 140, 82);
  }

  // Table Data
  const servicesList = work.services?.length ? work.services.join('\n') : 'Studio Services';
  
  const tableData = [
    [work.title, servicesList, '', `Rs ${work.totalAmount}`]
  ];
  
  const pendingAmount = work.totalAmount - (work.paidAmount || 0);

  // Generate Table
  autoTable(doc, {
    startY: 100,
    head: [['Project', 'Services', '', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 6 },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 70 },
      2: { cellWidth: 20 },
      3: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  // Summary
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Amount:`, 120, finalY);
  doc.setFont('helvetica', 'bold');
  doc.text(`Rs ${work.totalAmount}`, 196, finalY, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.text(`Paid / Advance:`, 120, finalY + 8);
  doc.text(`Rs ${work.paidAmount || 0}`, 196, finalY + 8, { align: 'right' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`Balance Due:`, 120, finalY + 20);
  doc.text(`Rs ${Math.max(0, pendingAmount)}`, 196, finalY + 20, { align: 'right' });

  // Amount in words
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 51, 51);
  doc.text(`Amount in words:`, 14, finalY + 35);
  doc.setFont('helvetica', 'bold');
  doc.text(numberToWords(work.totalAmount), 14, finalY + 41);

  // Signatory
  doc.setFont('helvetica', 'bold');
  doc.text('Shibili Moonnakkal', 196, finalY + 55, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Signatory Authority', 196, finalY + 60, { align: 'right' });

  // Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for choosing Yaron Studio!', 14, 280);
  doc.text('This is a computer-generated invoice.', 14, 285);
  
  // Save PDF
  const safeTitle = work.title.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Invoice_${safeTitle}.pdf`);
};

export const generateCustomerMasterInvoice = async (customer: any, works: any[]) => {
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [213, 55, 104]; // Yaron Magenta
  
  const invoiceId = `CINV-${Date.now().toString().slice(-6)}`;
  await drawInvoiceHeader(doc, invoiceId, customer);

  // Table Data for Multiple Works
  const tableData: any[][] = [];
  let grandTotal = 0;
  let totalPaid = 0;

  works.forEach(work => {
    grandTotal += work.totalAmount;
    totalPaid += (work.paidAmount || 0);
    
    const servicesList = work.services?.length ? work.services.join(', ') : '-';
    const pendingAmount = work.totalAmount - (work.paidAmount || 0);
    
    tableData.push([
      work.title,
      servicesList,
      `Rs ${work.totalAmount}`,
      `Rs ${work.paidAmount || 0}`,
      `Rs ${Math.max(0, pendingAmount)}`
    ]);
  });
  
  const totalBalanceDue = grandTotal - totalPaid;

  // Generate Table
  autoTable(doc, {
    startY: 100,
    head: [['Project', 'Services', 'Total', 'Paid', 'Pending']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 6 },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 50 },
      2: { cellWidth: 25, halign: 'right' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  // Summary
  doc.setFontSize(10);
  doc.setTextColor(51, 51, 51);
  doc.setFont('helvetica', 'normal');
  doc.text(`Grand Total:`, 120, finalY);
  doc.setFont('helvetica', 'bold');
  doc.text(`Rs ${grandTotal}`, 196, finalY, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.text(`Total Paid:`, 120, finalY + 8);
  doc.text(`Rs ${totalPaid}`, 196, finalY + 8, { align: 'right' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`Total Balance Due:`, 120, finalY + 20);
  doc.text(`Rs ${Math.max(0, totalBalanceDue)}`, 196, finalY + 20, { align: 'right' });

  // Amount in words
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 51, 51);
  doc.text(`Amount in words:`, 14, finalY + 35);
  doc.setFont('helvetica', 'bold');
  doc.text(numberToWords(grandTotal), 14, finalY + 41);

  // Signatory
  doc.setFont('helvetica', 'bold');
  doc.text('Shibili Moonnakkal', 196, finalY + 55, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Signatory Authority', 196, finalY + 60, { align: 'right' });

  // Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for choosing Yaron Studio!', 14, 280);
  doc.text('This is a computer-generated master invoice.', 14, 285);
  
  // Save PDF
  const safeName = customer?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Customer';
  doc.save(`Master_Invoice_${safeName}.pdf`);
};

export const generateReceipt = async (transaction: any, type: 'Income' | 'Expense') => {
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [213, 55, 104];
  
  const receiptId = `RCPT-${Date.now().toString().slice(-6)}`;
  await drawInvoiceHeader(doc, receiptId, { name: transaction.title }); // Use title as name

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${type} Receipt`, 14, 100);
  
  // Details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${format(new Date(transaction.date), 'MMM dd, yyyy')}`, 14, 110);
  doc.text(`Category: ${type === 'Expense' ? transaction.category : 'General Income'}`, 14, 118);
  if (transaction.description) {
    doc.text(`Description: ${transaction.description}`, 14, 126);
  }

  // Amount box
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(200, 200, 200);
  doc.rect(14, 140, 182, 30, 'FD');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Amount:', 20, 158);
  
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`Rs ${transaction.amount}`, 180, 158, { align: 'right' });

  // Signatory
  const finalY = 200;
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Shibili Moonnakkal', 196, finalY, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Signatory Authority', 196, finalY + 5, { align: 'right' });

  doc.save(`${type}_Receipt_${transaction.id.slice(-6)}.pdf`);
};
