import { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Search, Phone, MessageCircle, FileText, Download, CheckCircle2, AlertTriangle, Briefcase, User } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency, cn } from '@/lib/utils';
import { format, startOfDay, differenceInDays } from 'date-fns';
import { generateInvoice, generateCustomerMasterInvoice } from '@/lib/invoice';
import { Button } from '@/components/ui/Button';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const { works, customers } = useAppStore();

  const getWhatsAppMessage = (work: any, customer: any) => {
    let dateText = 'is pending';
    if (work.dueDate) {
      const daysDue = differenceInDays(startOfDay(new Date()), startOfDay(work.dueDate));
      if (daysDue > 0) dateText = `is pending from ${format(new Date(work.dueDate), 'dd MMM yyyy')}`;
      else dateText = `is due on ${format(new Date(work.dueDate), 'dd MMM yyyy')}`;
    }

    const pendingAmt = work.totalAmount - (work.paidAmount || 0);
    const note = `Payment for ${work.title}`;
    const upiLink = `upi://pay?pa=shibilimoonakal-1@oksbi&pn=Shibili%20Moonnakkal&am=${pendingAmt}&cu=INR&tn=${note}`;

    const msg = `Hi ${customer?.name || ''}, this is a gentle reminder that your payment of Rs. ${pendingAmt} for ${work.title} ${dateText}. Please clear the dues 🙏\n\n💸 *Quick link to pay*: \n${upiLink}\n\n📱 *Gpay number* : 8593813313\n👤 *GPay Name* : Shibili Moonnakkal\n\nThank you!`;
    return encodeURIComponent(msg);
  };

  const results = useMemo(() => {
    if (!query.trim()) return { works: [], customers: [] };
    const q = query.toLowerCase();

    const matchedCustomers = customers.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.phone.includes(q) || 
      (c.whatsapp && c.whatsapp.includes(q))
    );

    const matchedWorks = works.filter(w => 
      w.title.toLowerCase().includes(q) || 
      (w.refNumber && w.refNumber.toLowerCase().includes(q))
    );

    return { works: matchedWorks, customers: matchedCustomers };
  }, [query, works, customers]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Global Search">
      <div className="p-1 mb-4">
        <Input
          placeholder="Search here..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          icon={<Search size={18} className="text-gray-400" />}
          autoFocus
        />
      </div>

      <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-2 pb-10">
        {!query.trim() && (
          <div className="text-center text-gray-500 py-10">
            <Search size={48} className="mx-auto mb-4 opacity-20" />
            <p>Type to search instantly across all customers and works.</p>
          </div>
        )}
        
        {query.trim() && results.customers.length === 0 && results.works.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            <p>No results found for "{query}"</p>
          </div>
        )}

        {/* CUSTOMER MATCHES */}
        {results.customers.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
              <User size={16} className="mr-2" /> Customers
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {results.customers.map(customer => {
                const customerWorks = works.filter(w => w.customerId === customer.id);
                return (
                  <div key={customer.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-lg text-yaron-charcoal dark:text-white">{customer.name}</h4>
                        <p className="text-sm text-gray-500">{customer.place || 'No Location'}</p>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">{customer.phone}</p>
                      </div>
                      <div className="flex space-x-2">
                        {customer.phone && (
                          <a href={`tel:${customer.phone}`} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                            <Phone size={16} />
                          </a>
                        )}
                        {customer.whatsapp && (
                          <a href={`https://wa.me/${customer.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                            <MessageCircle size={16} />
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Recent Works ({customerWorks.length})</span>
                        {customerWorks.length > 0 && (
                          <Button variant="ghost" size="sm" onClick={() => generateCustomerMasterInvoice(customer, customerWorks)} className="text-xs py-1 h-7 text-yaron-magenta">
                            <Download size={14} className="mr-1" /> Master Invoice
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {customerWorks.slice(0, 3).map(w => (
                          <div key={w.id} className="flex justify-between items-center text-sm">
                            <span className="truncate max-w-[150px] font-medium text-gray-700 dark:text-gray-300">{w.title}</span>
                            <span className={w.totalAmount - (w.paidAmount || 0) > 0 ? "text-yaron-orange font-bold" : "text-green-500 font-bold"}>
                              {formatCurrency(w.totalAmount - (w.paidAmount || 0))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WORK MATCHES */}
        {results.works.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
              <Briefcase size={16} className="mr-2" /> Works
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {results.works.map(work => {
                const customer = customers.find(c => c.id === work.customerId);
                const pending = work.totalAmount - (work.paidAmount || 0);
                const isOverdue = work.dueDate && pending > 0 && differenceInDays(startOfDay(new Date()), startOfDay(work.dueDate)) > 0;
                
                return (
                  <div key={work.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-lg text-yaron-charcoal dark:text-white leading-tight">{work.title}</h4>
                        <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 mt-1 inline-block">
                          {work.refNumber || `INV-${work.id.slice(0, 8)}`}
                        </span>
                      </div>
                      {isOverdue && <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">OVERDUE</span>}
                    </div>
                    
                    <div className="flex justify-between items-end mt-4 mb-3 pb-3 border-b border-gray-50 dark:border-gray-700">
                      <div>
                        <p className="text-xs text-gray-500">Customer</p>
                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{customer?.name || 'Unknown'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Pending</p>
                        <p className={cn("font-bold", pending > 0 ? "text-yaron-orange" : "text-green-500")}>
                          {formatCurrency(pending)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between space-x-2">
                       <Button variant="outline" size="sm" onClick={() => generateInvoice(work, customer)} className="flex-1 py-1 h-8 text-xs bg-white dark:bg-gray-800">
                         <Download size={14} className="mr-1" /> Invoice
                       </Button>
                       {customer?.whatsapp && (
                          <a href={`https://wa.me/${customer.whatsapp.replace(/\D/g, '')}?text=${getWhatsAppMessage(work, customer)}`} target="_blank" rel="noreferrer" className="flex-1 inline-flex justify-center items-center py-1 h-8 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 font-semibold">
                            <MessageCircle size={14} className="mr-1" /> WhatsApp
                          </a>
                        )}
                        {customer?.phone && !customer?.whatsapp && (
                          <a href={`tel:${customer.phone}`} className="flex-1 inline-flex justify-center items-center py-1 h-8 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-semibold">
                            <Phone size={14} className="mr-1" /> Call
                          </a>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
