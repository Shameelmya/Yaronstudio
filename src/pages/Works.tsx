import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Search, Filter, Phone, MoreVertical } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { NewWorkModal } from '@/components/works/NewWorkModal';

export default function Works() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isNewWorkModalOpen, setIsNewWorkModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsNewWorkModalOpen(true);
      searchParams.delete('new');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-yaron-charcoal">Works & Customers</h1>
          <p className="text-gray-500 text-sm">Manage projects and client relationships</p>
        </div>
        <Button onClick={() => setIsNewWorkModalOpen(true)} className="w-full sm:w-auto shadow-md">
          <Plus size={20} className="mr-2" />
          New Work
        </Button>
      </div>

      <Card className="flex-1 flex flex-col min-h-[500px]">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input 
              placeholder="Search by work title, customer name, or phone..." 
              icon={<Search size={18} />}
            />
          </div>
          <Button variant="outline" className="shrink-0">
            <Filter size={18} className="mr-2" />
            Filters
          </Button>
        </div>

        <div className="flex-1 overflow-auto -mx-5 px-5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-sm text-gray-500">
                <th className="pb-3 font-medium whitespace-nowrap">Work Title</th>
                <th className="pb-3 font-medium whitespace-nowrap">Customer</th>
                <th className="pb-3 font-medium whitespace-nowrap">Status</th>
                <th className="pb-3 font-medium whitespace-nowrap text-right">Total</th>
                <th className="pb-3 font-medium whitespace-nowrap text-right">Pending</th>
                <th className="pb-3 font-medium whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[1, 2, 3, 4, 5].map((_, i) => (
                <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-4">
                    <p className="font-semibold text-yaron-charcoal">Album Song 0{i+1}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Vocal Recording, Mixing</p>
                  </td>
                  <td className="py-4">
                    <p className="font-medium text-yaron-charcoal">Shibili Moonnakkal</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <a href="tel:9876543210" className="text-xs text-yaron-magenta hover:underline flex items-center">
                        <Phone size={12} className="mr-1" /> Call
                      </a>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">
                      Active
                    </span>
                  </td>
                  <td className="py-4 text-right font-medium text-yaron-charcoal">
                    {formatCurrency(25000)}
                  </td>
                  <td className="py-4 text-right">
                    <span className="font-medium text-red-600">{formatCurrency(5000)}</span>
                  </td>
                  <td className="py-4 text-right">
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-yaron-charcoal">
                      <MoreVertical size={18} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <NewWorkModal 
        isOpen={isNewWorkModalOpen} 
        onClose={() => setIsNewWorkModalOpen(false)} 
      />
    </div>
  );
}
