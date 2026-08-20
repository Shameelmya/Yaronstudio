import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { updateWork, listenToWorks, deleteWork, listenToCustomers } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Search, Phone, Edit2, Trash2, AlertTriangle, Filter, Download } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { generateInvoice } from '@/lib/invoice';
import { NewWorkModal } from '@/components/works/NewWorkModal';
import { Modal } from '@/components/ui/Modal';
import { Work } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { format, isSameDay, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInDays, startOfDay } from 'date-fns';

export default function Works() {
  const location = useLocation();
  const navigate = useNavigate();
  const isNewWorkModalOpen = location.hash === '#new-work';
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWork, setSelectedWork] = useState<any>(null);
  const [works, setWorks] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const { activeStudioId } = useAppStore();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [workToDelete, setWorkToDelete] = useState<{id: string, title: string} | null>(null);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);


  useEffect(() => {
    if (!activeStudioId) return;
    
    const unsubCustomers = listenToCustomers(activeStudioId, (fetchedCustomers) => {
      setCustomers(fetchedCustomers);
    });
    
    const unsubscribe = listenToWorks(activeStudioId, (fetchedWorks) => {
      setWorks(fetchedWorks);
    });
    
    return () => { unsubscribe(); unsubCustomers(); };
  }, [activeStudioId]);
  
  const getCustomer = (id: string) => customers.find(c => c.id === id);

  const getWhatsAppMessage = (work: any, customer: any) => {
    const today = startOfDay(new Date());
    const daysDue = work.dueDate ? differenceInDays(today, startOfDay(work.dueDate)) : 0;
    const daysText = daysDue > 0 ? `has been pending for ${daysDue} days` : `is due soon`;
    const pending = work.totalAmount - (work.paidAmount || 0);
    const msg = `Hi ${customer?.name || ''}, this is a gentle reminder that your payment of Rs. ${pending} for ${work.title} ${daysText}. Please clear the dues. Thank you!`;
    return encodeURIComponent(msg);
  };

  const filters = [
    { id: 'all', label: 'All Works' },
    { id: 'pending', label: 'Pending' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'delivered', label: 'Delivered' },
  ];

  const filteredWorks = works.filter(work => {
    const matchesFilter = activeFilter === 'all' || work.status === activeFilter;
    const customer = getCustomer(work.customerId);
    const customerName = customer?.name || work.customerId;
    const matchesSearch = work.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          customerName.toLowerCase().includes(searchQuery.toLowerCase());
                          
    let matchesTime = true;
    if (timeFilter !== 'all' && work.dueDate) {
      const today = new Date();
      const rawDueDate = work.dueDate instanceof Date ? work.dueDate : new Date(work.dueDate);
      if (timeFilter === 'today') {
        matchesTime = isSameDay(rawDueDate, today);
      } else if (timeFilter === 'week') {
        matchesTime = isWithinInterval(rawDueDate, { start: startOfWeek(today), end: endOfWeek(today) });
      } else if (timeFilter === 'month') {
        matchesTime = isWithinInterval(rawDueDate, { start: startOfMonth(today), end: endOfMonth(today) });
      }
    } else if (timeFilter !== 'all' && !work.dueDate) {
      matchesTime = false;
    }

    return matchesFilter && matchesSearch && matchesTime;
  });

  const handleStatusChange = async (workId: string, newStatus: string) => {
    try {
      await updateWork(workId, { status: newStatus as any });
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const confirmDeleteWork = async () => {
    if (!workToDelete) return;
    setIsDeleting(true);
    try {
      await deleteWork(workToDelete.id);
      setDeleteModalOpen(false);
      setWorkToDelete(null);
      setDeleteInput('');
    } catch (error) {
      console.error("Failed to delete work", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusDropdown = (work: any) => {
    const statusClasses: Record<string, string> = {
      'pending': 'bg-yaron-orange/10 text-yaron-orange dark:bg-orange-900/30 dark:text-orange-400',
      'in_progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'completed': 'bg-yaron-purple/10 text-yaron-purple dark:bg-purple-900/30 dark:text-purple-400',
      'delivered': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'cancelled': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    };

    return (
      <select
        value={work.status}
        onChange={(e) => handleStatusChange(work.id, e.target.value)}
        className={cn(
          "px-2 py-1 rounded text-xs font-bold uppercase tracking-wider cursor-pointer outline-none border-none appearance-none",
          statusClasses[work.status] || statusClasses['pending']
        )}
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-yaron-charcoal dark:text-white">Works & Customers</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage projects and client relationships</p>
        </div>
        <Button onClick={() => navigate('#new-work')} className="w-full sm:w-auto shadow-md h-12 text-base bg-yaron-gradient border-none">
          <Plus size={20} className="mr-2" />
          New Work
        </Button>
      </div>

      <Card className="flex-1 flex flex-col min-h-[500px] dark:bg-gray-900 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative flex items-center gap-3">
            <div className="flex-1">
              <Input 
                placeholder="Search by work title, customer name..." 
                icon={<Search size={20} className="text-gray-400" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div className="relative">
              <Button variant="outline" className="h-12 px-4 border-gray-200 dark:border-gray-700" onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}>
                <Filter size={20} className="text-yaron-charcoal dark:text-gray-300" />
              </Button>
              {isFilterMenuOpen && (
                <div className="absolute right-0 top-14 w-64 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl rounded-xl p-4 z-10 flex flex-col gap-4">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Time</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['all', 'today', 'week', 'month'].map((v) => (
                        <button
                          key={v}
                          onClick={() => setTimeFilter(v as any)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-medium capitalize",
                            timeFilter === v ? "bg-yaron-magenta text-white" : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          )}
                        >
                          {v === 'all' ? 'All Time' : v}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</p>
                    <div className="flex flex-wrap gap-2">
                      {filters.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setActiveFilter(f.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap",
                            activeFilter === f.id ? "bg-yaron-charcoal dark:bg-gray-700 text-white" : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          )}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto -mx-5 px-5 pb-4">
          <table className="w-full min-w-[900px] text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
                <th className="pb-3 font-medium whitespace-nowrap">Work Title</th>
                <th className="pb-3 font-medium whitespace-nowrap">Customer</th>
                <th className="pb-3 font-medium whitespace-nowrap">Due Date</th>
                <th className="pb-3 font-medium whitespace-nowrap">Status</th>
                <th className="pb-3 font-medium whitespace-nowrap text-right">Total</th>
                <th className="pb-3 font-medium whitespace-nowrap text-right">Pending</th>
                <th className="pb-3 font-medium whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {filteredWorks.map((work) => {
                const customer = getCustomer(work.customerId);
                const pendingAmount = work.totalAmount - (work.paidAmount || 0);
                return (
                <tr key={work.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-4 pr-4">
                    <p className="font-semibold text-yaron-charcoal dark:text-white">{work.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{work.services?.join(', ')}</p>
                  </td>
                  <td className="py-4 pr-4">
                    <p className="font-medium text-yaron-charcoal dark:text-white">{customer?.name || work.customerId} {customer?.place && <span className="text-gray-500 font-normal">({customer.place})</span>}</p>
                    <div className="flex items-center space-x-3 mt-1">
                      {customer?.phone && (
                        <a href={`tel:${customer.phone}`} className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center">
                          <Phone size={12} className="mr-1" /> Call
                        </a>
                      )}
                      {customer?.whatsapp && (
                        <a href={`https://wa.me/${customer.whatsapp.replace(/\D/g, '')}?text=${getWhatsAppMessage(work, customer)}`} target="_blank" rel="noreferrer" className="text-xs text-green-600 dark:text-green-400 font-semibold hover:underline flex items-center">
                          <Phone size={12} className="mr-1" /> WhatsApp
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{work.dueDate ? format(work.dueDate instanceof Date ? work.dueDate : new Date(work.dueDate), 'MMM dd, yyyy') : 'No Date'}</span>
                  </td>
                  <td className="py-4 pr-4">
                    {getStatusDropdown(work)}
                  </td>
                  <td className="py-4 pr-4 text-right font-bold text-yaron-charcoal dark:text-white">
                    {formatCurrency(work.totalAmount)}
                  </td>
                  <td className="py-4 pr-4 text-right">
                    <span className={cn("font-bold", pendingAmount > 0 ? "text-yaron-orange" : "text-green-500")}>
                      {formatCurrency(pendingAmount)}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-green-500 dark:hover:text-green-400" title="Download Invoice" onClick={() => generateInvoice(work, customer)}>
                        <Download size={18} />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-yaron-magenta dark:hover:text-yaron-magenta" title="Edit Work" onClick={() => { setSelectedWork(work); navigate('#new-work'); }}>
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500 dark:hover:text-red-400" title="Delete Work" onClick={() => { setWorkToDelete({ id: work.id, title: work.title }); setDeleteModalOpen(true); }}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              )})}
              {filteredWorks.length === 0 && (
                 <tr>
                   <td colSpan={7} className="py-12 text-center text-gray-500 dark:text-gray-400">
                     No works found matching your filters.
                   </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <NewWorkModal 
        isOpen={isNewWorkModalOpen} 
        onClose={() => {
          setSelectedWork(null);
          navigate(-1);
        }}
        initialData={selectedWork}
      />

      <Modal isOpen={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setDeleteInput(''); }} title="Confirm Deletion">
        {workToDelete && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg flex items-start space-x-3 text-sm">
              <AlertTriangle className="shrink-0 mt-0.5 text-red-500" size={18} />
              <p>Are you sure you want to delete <strong>{workToDelete.title}</strong>? This action cannot be undone.</p>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">Type <span className="font-bold text-red-600">DELETE</span> to confirm.</p>
            
            <Input 
              placeholder="DELETE" 
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              autoFocus
            />

            <div className="pt-4 flex space-x-3">
              <Button variant="outline" className="flex-1 dark:border-gray-700" onClick={() => { setDeleteModalOpen(false); setDeleteInput(''); }} disabled={isDeleting}>Cancel</Button>
              <Button 
                variant="danger" 
                className="flex-1" 
                disabled={deleteInput !== 'DELETE' || isDeleting}
                onClick={confirmDeleteWork}
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
