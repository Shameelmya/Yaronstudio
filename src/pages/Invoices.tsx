import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Download, FileText, User } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { generateInvoice, generateCustomerMasterInvoice } from '@/lib/invoice';
import { formatCurrency, cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function Invoices() {
  const [activeTab, setActiveTab] = useState<'work' | 'customer'>('work');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { activeStudioId, works, customers } = useAppStore();
  
  // For Customer tab checkbox selection
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedWorkIds, setSelectedWorkIds] = useState<Set<string>>(new Set());

  // Work-based filtered works
  const filteredWorks = useMemo(() => {
    return works.filter(work => {
      const customer = customers.find(c => c.id === work.customerId);
      const customerName = customer?.name || work.customerId;
      return work.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
             customerName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [works, customers, searchQuery]);

  // Customer-based filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
    );
  }, [customers, searchQuery]);

  // Works for the currently selected customer
  const customerWorks = useMemo(() => {
    if (!selectedCustomer) return [];
    return works.filter(w => w.customerId === selectedCustomer.id);
  }, [works, selectedCustomer]);

  const handleToggleWorkSelection = (workId: string) => {
    const nextSet = new Set(selectedWorkIds);
    if (nextSet.has(workId)) {
      nextSet.delete(workId);
    } else {
      nextSet.add(workId);
    }
    setSelectedWorkIds(nextSet);
  };

  const handleSelectAll = () => {
    if (selectedWorkIds.size === customerWorks.length) {
      setSelectedWorkIds(new Set());
    } else {
      setSelectedWorkIds(new Set(customerWorks.map(w => w.id)));
    }
  };

  const handleDownloadWorkInvoice = async (work: any) => {
    const customer = customers.find(c => c.id === work.customerId);
    await generateInvoice(work, customer);
  };

  const handleDownloadMasterInvoice = async () => {
    if (!selectedCustomer || selectedWorkIds.size === 0) return;
    const worksToInclude = customerWorks.filter(w => selectedWorkIds.has(w.id));
    await generateCustomerMasterInvoice(selectedCustomer, worksToInclude);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-yaron-charcoal dark:text-white">Invoices</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Generate professional PDF invoices</p>
        </div>
      </div>

      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-full sm:w-fit">
        <button
          onClick={() => { setActiveTab('work'); setSearchQuery(''); }}
          className={cn(
            "flex-1 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center",
            activeTab === 'work' ? "bg-white dark:bg-gray-700 text-yaron-charcoal dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          )}
        >
          <FileText size={16} className="mr-2" /> Work Invoice
        </button>
        <button
          onClick={() => { setActiveTab('customer'); setSearchQuery(''); setSelectedCustomer(null); }}
          className={cn(
            "flex-1 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center",
            activeTab === 'customer' ? "bg-white dark:bg-gray-700 text-yaron-charcoal dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          )}
        >
          <User size={16} className="mr-2" /> Master Invoice
        </button>
      </div>

      <Card className="flex-1 flex flex-col min-h-[500px] dark:bg-gray-900 dark:border-gray-800">
        
        {/* Work Tab */}
        {activeTab === 'work' && (
          <div className="flex flex-col h-full">
            <div className="mb-6">
              <Input 
                placeholder="Search by work title or customer name..." 
                icon={<Search size={20} className="text-gray-400" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div className="flex-1 overflow-x-auto -mx-5 px-5 pb-4">
              <table className="w-full min-w-[700px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
                    <th className="pb-3 font-medium">Work Title</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium text-right">Total Amount</th>
                    <th className="pb-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {filteredWorks.map((work) => {
                    const customer = customers.find(c => c.id === work.customerId);
                    return (
                      <tr key={work.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-4">
                          <p className="font-semibold text-yaron-charcoal dark:text-white">{work.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{work.dueDate ? format(work.dueDate instanceof Date ? work.dueDate : new Date(work.dueDate), 'MMM dd, yyyy') : 'No due date'}</p>
                        </td>
                        <td className="py-4 font-medium text-yaron-charcoal dark:text-gray-300">
                          {customer?.name || work.customerId}
                        </td>
                        <td className="py-4 text-right font-bold text-yaron-charcoal dark:text-white">
                          {formatCurrency(work.totalAmount)}
                        </td>
                        <td className="py-4 text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-yaron-magenta text-white border-none hover:bg-yaron-magenta/90"
                            onClick={() => handleDownloadWorkInvoice(work)}
                          >
                            <Download size={16} className="mr-2" /> Download
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredWorks.length === 0 && (
                     <tr>
                       <td colSpan={4} className="py-12 text-center text-gray-500">
                         No works found.
                       </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Customer Tab */}
        {activeTab === 'customer' && !selectedCustomer && (
          <div className="flex flex-col h-full animate-in fade-in">
            <div className="mb-6">
              <Input 
                placeholder="Search customers to generate master invoice..." 
                icon={<Search size={20} className="text-gray-400" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map(customer => (
                <div 
                  key={customer.id} 
                  className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-yaron-magenta hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => { setSelectedCustomer(customer); setSelectedWorkIds(new Set()); }}
                >
                  <p className="font-bold text-yaron-charcoal dark:text-white">{customer.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{customer.phone} {customer.place && `• ${customer.place}`}</p>
                </div>
              ))}
              {filteredCustomers.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500">
                   No customers found.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'customer' && selectedCustomer && (
          <div className="flex flex-col h-full animate-in fade-in">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <button onClick={() => setSelectedCustomer(null)} className="text-sm text-gray-500 hover:text-yaron-magenta font-semibold mb-2 block">&larr; Back to Customers</button>
                <h2 className="text-xl font-bold text-yaron-charcoal dark:text-white">Master Invoice for {selectedCustomer.name}</h2>
                <p className="text-sm text-gray-500">{customerWorks.length} works found</p>
              </div>
              <Button 
                className="bg-yaron-gradient text-white border-none shadow-md" 
                disabled={selectedWorkIds.size === 0}
                onClick={handleDownloadMasterInvoice}
              >
                <Download size={18} className="mr-2" />
                Generate Master Invoice
              </Button>
            </div>
            
            <div className="flex-1 overflow-x-auto -mx-5 px-5 pb-4">
              <table className="w-full min-w-[700px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
                    <th className="pb-3 font-medium w-12">
                      <input 
                        type="checkbox" 
                        className="rounded text-yaron-magenta focus:ring-yaron-magenta bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 w-4 h-4 cursor-pointer"
                        checked={selectedWorkIds.size === customerWorks.length && customerWorks.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="pb-3 font-medium">Work Title</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {customerWorks.map((work) => {
                    const isSelected = selectedWorkIds.has(work.id);
                    return (
                      <tr 
                        key={work.id} 
                        className={cn("group transition-colors cursor-pointer", isSelected ? "bg-yaron-magenta/5 dark:bg-yaron-magenta/10" : "hover:bg-gray-50/50 dark:hover:bg-gray-800/50")}
                        onClick={() => handleToggleWorkSelection(work.id)}
                      >
                        <td className="py-4">
                          <input 
                            type="checkbox" 
                            className="rounded text-yaron-magenta focus:ring-yaron-magenta bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 w-4 h-4 cursor-pointer"
                            checked={isSelected}
                            readOnly
                          />
                        </td>
                        <td className="py-4">
                          <p className="font-semibold text-yaron-charcoal dark:text-white">{work.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{work.services?.join(', ') || 'No services'}</p>
                        </td>
                        <td className="py-4">
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {work.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 text-right font-bold text-yaron-charcoal dark:text-white">
                          {formatCurrency(work.totalAmount)}
                        </td>
                      </tr>
                    );
                  })}
                  {customerWorks.length === 0 && (
                     <tr>
                       <td colSpan={4} className="py-12 text-center text-gray-500">
                         No works found for this customer.
                       </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </Card>
    </div>
  );
}
