import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { updateWork } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Search, Phone, MoreVertical, Edit2 } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { NewWorkModal } from '@/components/works/NewWorkModal';

import { listenToWorks } from '@/lib/api';
import { Work } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { format } from 'date-fns';

export default function Works() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isNewWorkModalOpen, setIsNewWorkModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWork, setSelectedWork] = useState<any>(null);
  const [works, setWorks] = useState<any[]>([]);
  const { activeStudioId } = useAppStore();

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsNewWorkModalOpen(true);
      searchParams.delete('new');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!activeStudioId) return;
    const unsubscribe = listenToWorks(activeStudioId, (fetchedWorks) => {
      // transform Work to match our UI for now, or just use Work directly
      const transformedWorks = fetchedWorks.map(w => ({
        id: w.id,
        title: w.title,
        customer: w.customerId, // Should join with customers in reality, but keeping it simple
        services: w.services || [],
        phone: 'N/A', // Mocking phone since we don't have customer join yet
        status: w.status,
        total: w.totalAmount,
        pending: w.totalAmount - (w.paidAmount || 0),
        due: w.dueDate ? format(w.dueDate, 'yyyy-MM-dd') : 'No Date'
      }));
      setWorks(transformedWorks);
    });
    return () => unsubscribe();
  }, [activeStudioId]);

  const filters = [
    { id: 'all', label: 'All Works' },
    { id: 'pending', label: 'Pending' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'delivered', label: 'Delivered' },
  ];

  const filteredWorks = works.filter(work => {
    const matchesFilter = activeFilter === 'all' || work.status === activeFilter;
    const matchesSearch = work.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          work.customer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleStatusChange = async (workId: string, newStatus: string) => {
    try {
      await updateWork(workId, { status: newStatus as any });
    } catch (error) {
      console.error("Failed to update status", error);
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
        <Button onClick={() => setIsNewWorkModalOpen(true)} className="w-full sm:w-auto shadow-md h-12 text-base bg-yaron-gradient border-none">
          <Plus size={20} className="mr-2" />
          New Work
        </Button>
      </div>

      <Card className="flex-1 flex flex-col min-h-[500px] dark:bg-gray-900 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input 
              placeholder="Search by work title, customer name..." 
              icon={<Search size={20} className="text-gray-400" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 text-base"
            />
          </div>
        </div>

        <div className="flex overflow-x-auto hide-scrollbar bg-gray-50 dark:bg-gray-800 p-1 rounded-xl w-full sm:w-fit mb-4">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={cn(
                "flex-1 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                activeFilter === f.id 
                  ? "bg-white dark:bg-gray-700 text-yaron-charcoal dark:text-white shadow-sm" 
                  : "text-gray-500 dark:text-gray-400 hover:text-yaron-charcoal dark:hover:text-white"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto -mx-5 px-5">
          <table className="w-full text-left border-collapse">
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
              {filteredWorks.map((work) => (
                <tr key={work.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-4">
                    <p className="font-semibold text-yaron-charcoal dark:text-white">{work.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{work.services.join(', ')}</p>
                  </td>
                  <td className="py-4">
                    <p className="font-medium text-yaron-charcoal dark:text-white">{work.customer}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <a href={`tel:${work.phone}`} className="text-xs text-yaron-magenta font-semibold hover:underline flex items-center">
                        <Phone size={12} className="mr-1" /> Call
                      </a>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{work.due}</span>
                  </td>
                  <td className="py-4">
                    {getStatusDropdown(work)}
                  </td>
                  <td className="py-4 text-right font-bold text-yaron-charcoal dark:text-white">
                    {formatCurrency(work.total)}
                  </td>
                  <td className="py-4 text-right">
                    <span className={cn("font-bold", work.pending > 0 ? "text-yaron-orange" : "text-green-500")}>
                      {formatCurrency(work.pending)}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-yaron-magenta dark:hover:text-yaron-magenta" title="Edit Work" onClick={() => { setSelectedWork(work); setIsNewWorkModalOpen(true); }}>
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-yaron-charcoal dark:hover:text-white">
                        <MoreVertical size={18} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
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
        onClose={() => { setIsNewWorkModalOpen(false); setSelectedWork(null); }}
        initialData={selectedWork}
      />
    </div>
  );
}
