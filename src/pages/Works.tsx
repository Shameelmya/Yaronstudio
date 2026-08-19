import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Search, Phone, MoreVertical, Edit2 } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { NewWorkModal } from '@/components/works/NewWorkModal';

const mockWorks = [
  { id: '1', title: 'Album Song 01', customer: 'Shibili Moonnakkal', services: ['Vocal Recording', 'Mixing'], phone: '9876543210', status: 'pending', total: 25000, pending: 5000, due: '2023-10-30' },
  { id: '2', title: 'Wedding Highlight BGM', customer: 'Ameen', services: ['BGM Scoring'], phone: '9123456780', status: 'in_progress', total: 15000, pending: 0, due: '2023-10-25' },
  { id: '3', title: 'Corporate Ad Music', customer: 'Yaron Studio', services: ['Programming', 'Mastering'], phone: '9988776655', status: 'completed', total: 30000, pending: 30000, due: '2023-11-05' },
  { id: '4', title: 'Short Film Dubbing', customer: 'Nishad', services: ['Dubbing', 'Foley'], phone: '9988112233', status: 'delivered', total: 8000, pending: 0, due: '2023-10-20' },
];

export default function Works() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isNewWorkModalOpen, setIsNewWorkModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWork, setSelectedWork] = useState<any>(null);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsNewWorkModalOpen(true);
      searchParams.delete('new');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const filters = [
    { id: 'all', label: 'All Works' },
    { id: 'pending', label: 'Pending' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'delivered', label: 'Delivered' },
  ];

  const filteredWorks = mockWorks.filter(work => {
    const matchesFilter = activeFilter === 'all' || work.status === activeFilter;
    const matchesSearch = work.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          work.customer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string, pendingAmount: number) => {
    const isFullyPaid = pendingAmount <= 0;
    
    let colorClass = '';
    let label = '';
    
    switch (status) {
      case 'pending': colorClass = 'bg-yaron-orange/10 text-yaron-orange dark:bg-orange-900/30 dark:text-orange-400'; label = 'Pending'; break;
      case 'in_progress': colorClass = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'; label = 'In Progress'; break;
      case 'completed': colorClass = 'bg-yaron-purple/10 text-yaron-purple dark:bg-purple-900/30 dark:text-purple-400'; label = 'Completed'; break;
      case 'delivered': colorClass = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'; label = 'Delivered'; break;
      case 'cancelled': colorClass = 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'; label = 'Cancelled'; break;
    }

    return (
      <div className="flex flex-col space-y-1 items-start">
        <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider", colorClass)}>
          {label}
        </span>
        {isFullyPaid && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-500 text-white shadow-sm">
            FULLY PAID
          </span>
        )}
      </div>
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
                    {getStatusBadge(work.status, work.pending)}
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
