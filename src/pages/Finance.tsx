import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { IndianRupee, TrendingUp, TrendingDown, Plus, Filter, Music, Video, Headphones, Mic } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { startOfMonth, endOfMonth, isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import { NewExpenseModal } from '@/components/finance/NewExpenseModal';
import { NewIncomeModal } from '@/components/finance/NewIncomeModal';
import { AllTransactionsTable } from '@/components/finance/AllTransactionsTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

type TimeFilter = 'Today' | 'This Week' | 'This Month' | 'This Year' | 'All Time' | 'Custom';

export default function Finance() {
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'invoices'>('overview');
  const { works, expenses, incomes } = useAppStore();
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>('All');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('This Month');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Custom Date Range State
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] = useState(false);
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [appliedCustomDates, setAppliedCustomDates] = useState<{ start: Date; end: Date } | null>(null);

  // Calculations based on time filter
  const today = new Date();
  
  const { startDate, endDate } = useMemo(() => {
    switch (timeFilter) {
      case 'Today':
        return { startDate: startOfDay(today), endDate: endOfDay(today) };
      case 'This Week':
        return { startDate: startOfWeek(today), endDate: endOfWeek(today) };
      case 'This Month':
        return { startDate: startOfMonth(today), endDate: endOfMonth(today) };
      case 'This Year':
        return { startDate: startOfYear(today), endDate: endOfYear(today) };
      case 'Custom':
        if (appliedCustomDates) return { startDate: appliedCustomDates.start, endDate: appliedCustomDates.end };
        return { startDate: new Date(2000, 0, 1), endDate: new Date(2100, 0, 1) };
      case 'All Time':
      default:
        return { startDate: new Date(2000, 0, 1), endDate: new Date(2100, 0, 1) };
    }
  }, [timeFilter, appliedCustomDates]);

  const netIncome = useMemo(() => {
    const worksIncome = works.reduce((sum, w) => {
      if (w.createdAt && isWithinInterval(new Date(w.createdAt as any), { start: startDate, end: endDate })) {
        return sum + (w.paidAmount || 0);
      }
      return sum;
    }, 0);
    
    const miscIncome = incomes.reduce((sum, i) => {
      if (i.date && isWithinInterval(new Date(i.date), { start: startDate, end: endDate })) {
        return sum + i.amount;
      }
      return sum;
    }, 0);
    
    return worksIncome + miscIncome;
  }, [works, incomes, startDate, endDate]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => {
      if (e.date && isWithinInterval(new Date(e.date), { start: startDate, end: endDate })) {
        return sum + e.amount;
      }
      return sum;
    }, 0);
  }, [expenses, startDate, endDate]);

  const pendingRecovery = useMemo(() => {
    return works.reduce((sum, w) => {
      const pending = w.totalAmount - (w.paidAmount || 0);
      if (pending > 0 && w.status !== 'cancelled') return sum + pending;
      return sum;
    }, 0);
  }, [works]);

  // Service Analysis
  const serviceData = useMemo(() => {
    const servicesMap: Record<string, { count: number, revenue: number, icon: any, color: string }> = {};
    const iconMap: Record<string, any> = { 'Vocal Recording': Mic, 'Mixing': Music, 'Mastering': Music, 'Video Editing': Video, 'Default': Headphones };
    const colorMap: Record<string, string> = { 'Vocal Recording': 'text-blue-500', 'Mixing': 'text-yaron-purple', 'Mastering': 'text-yaron-magenta', 'Video Editing': 'text-yaron-orange', 'Default': 'text-gray-500' };

    works.forEach(w => {
      if (w.services && w.services.length > 0) {
        w.services.forEach((s: string) => {
          if (!servicesMap[s]) {
            servicesMap[s] = { count: 0, revenue: 0, icon: iconMap[s] || iconMap['Default'], color: colorMap[s] || colorMap['Default'] };
          }
          servicesMap[s].count++;
          servicesMap[s].revenue += ((w.paidAmount || 0) / w.services.length); // Approximate revenue split
        });
      }
    });

    return Object.entries(servicesMap).map(([service, data]) => ({
      service,
      ...data
    })).sort((a, b) => b.revenue - a.revenue);
  }, [works]);

  const filteredServiceData = useMemo(() => {
    if (selectedServiceFilter === 'All') return serviceData;
    return serviceData.filter(d => d.service === selectedServiceFilter);
  }, [selectedServiceFilter, serviceData]);

  const applyCustomDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (customDates.start && customDates.end) {
      setAppliedCustomDates({
        start: startOfDay(new Date(customDates.start)),
        end: endOfDay(new Date(customDates.end))
      });
      setTimeFilter('Custom');
      setIsCustomDateModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-yaron-charcoal dark:text-white">Finance</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage income, expenses, and invoices</p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto relative">
          <Button onClick={() => setIsFilterOpen(!isFilterOpen)} variant="outline" className="h-12 w-12 p-0 flex items-center justify-center shrink-0 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl relative">
            <Filter size={20} className={timeFilter !== 'This Month' && timeFilter !== 'All Time' ? "text-yaron-magenta" : "text-gray-500 dark:text-gray-400"} />
          </Button>
          
          {isFilterOpen && (
            <div className="absolute right-0 top-14 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in zoom-in-95">
              {(['Today', 'This Week', 'This Month', 'This Year', 'All Time', 'Custom'] as TimeFilter[]).map(filter => (
                <button
                  key={filter}
                  onClick={() => { 
                    if (filter === 'Custom') {
                      setIsCustomDateModalOpen(true);
                      setIsFilterOpen(false);
                    } else {
                      setTimeFilter(filter); 
                      setIsFilterOpen(false); 
                    }
                  }}
                  className={cn(
                    "w-full text-left px-4 py-3 text-sm transition-colors",
                    timeFilter === filter 
                      ? "bg-yaron-magenta/10 text-yaron-magenta font-semibold" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
          
          <Button onClick={() => setIsIncomeModalOpen(true)} className="flex-1 sm:w-auto bg-green-600 hover:bg-green-700 text-white h-12 rounded-xl border-none shadow-md px-4">
            <Plus size={18} className="mr-2" /> Income
          </Button>
          <Button onClick={() => setIsExpenseModalOpen(true)} className="flex-1 sm:w-auto bg-red-600 hover:bg-red-700 text-white h-12 rounded-xl border-none shadow-md px-4">
            <Plus size={18} className="mr-2" /> Expense
          </Button>
        </div>
      </div>

      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-full sm:w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            "flex-1 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all",
            activeTab === 'overview' 
              ? "bg-white dark:bg-gray-700 text-yaron-charcoal dark:text-white shadow-sm" 
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          )}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={cn(
            "flex-1 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all",
            activeTab === 'analysis' 
              ? "bg-white dark:bg-gray-700 text-yaron-charcoal dark:text-white shadow-sm" 
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          )}
        >
          Analysis
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <Card className="bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900 p-6 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl"></div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                  <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
                </div>
                <h3 className="font-medium text-green-800 dark:text-green-300">Net Income ({timeFilter})</h3>
              </div>
              <p className="text-4xl font-bold text-yaron-charcoal dark:text-white">{formatCurrency(netIncome)}</p>
            </Card>

            <Card className="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900 p-6 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl"></div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                  <TrendingDown className="text-red-600 dark:text-red-400" size={20} />
                </div>
                <h3 className="font-medium text-red-800 dark:text-red-300">Total Expenses ({timeFilter})</h3>
              </div>
              <p className="text-4xl font-bold text-yaron-charcoal dark:text-white">{formatCurrency(totalExpenses)}</p>
            </Card>

            <Card className="bg-gradient-to-br from-yaron-magenta/5 to-yaron-purple/5 dark:from-yaron-magenta/10 dark:to-yaron-purple/10 border-none shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-yaron-magenta/10 rounded-full blur-2xl group-hover:bg-yaron-magenta/20 transition-all"></div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                  <IndianRupee className="text-yaron-magenta" size={20} />
                </div>
                <span className="text-yaron-charcoal dark:text-white font-medium">Pending Recovery</span>
              </div>
              <p className="text-3xl font-bold text-yaron-charcoal dark:text-white mt-4">{formatCurrency(pendingRecovery)}</p>
            </Card>
          </div>

          <AllTransactionsTable startDate={startDate} endDate={endDate} />
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="space-y-6">
          <Card className="dark:bg-gray-900 dark:border-gray-800 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-lg font-bold text-yaron-charcoal dark:text-white">Service Sales Analysis</h2>
              <div className="flex items-center space-x-2">
                <Filter size={18} className="text-gray-400" />
                <select 
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm rounded-lg px-3 py-2 dark:text-white focus:outline-none"
                  value={selectedServiceFilter}
                  onChange={(e) => setSelectedServiceFilter(e.target.value)}
                >
                  <option value="All">All Services</option>
                  {serviceData.map(d => (
                    <option key={d.service} value={d.service}>{d.service}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredServiceData.map((data, i) => {
                const average = data.count > 0 ? data.revenue / data.count : 0;
                const Icon = data.icon;
                return (
                  <div key={i} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col justify-between">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={cn("w-10 h-10 rounded-lg bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center", data.color)}>
                        <Icon size={20} />
                      </div>
                      <h3 className="font-bold text-yaron-charcoal dark:text-white">{data.service}</h3>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white dark:bg-gray-900 p-3 rounded-lg text-center border border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-500 mb-1">Total Booked</p>
                        <p className="font-bold text-yaron-charcoal dark:text-white text-lg">{data.count}</p>
                      </div>
                      <div className="bg-white dark:bg-gray-900 p-3 rounded-lg text-center border border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-500 mb-1">Revenue</p>
                        <p className="font-bold text-yaron-charcoal dark:text-white">{formatCurrency(data.revenue)}</p>
                      </div>
                      <div className="bg-white dark:bg-gray-900 p-3 rounded-lg text-center border border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-500 mb-1">Average</p>
                        <p className="font-bold text-yaron-charcoal dark:text-white">{formatCurrency(average)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredServiceData.length === 0 && (
                <div className="col-span-1 md:col-span-2 text-center text-gray-500 py-8">
                  No service data available.
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      <Modal isOpen={isCustomDateModalOpen} onClose={() => setIsCustomDateModalOpen(false)} title="Select Custom Date Range">
        <form onSubmit={applyCustomDate} className="space-y-4">
          <Input 
            label="Start Date" 
            type="date" 
            value={customDates.start}
            onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })}
            required
          />
          <Input 
            label="End Date" 
            type="date" 
            value={customDates.end}
            onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })}
            required
          />
          <div className="flex pt-4 space-x-3">
            <Button variant="outline" className="flex-1" type="button" onClick={() => setIsCustomDateModalOpen(false)}>Cancel</Button>
            <Button className="flex-1 bg-yaron-magenta text-white border-none" type="submit">Apply Filter</Button>
          </div>
        </form>
      </Modal>

      <NewExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} />
      <NewIncomeModal isOpen={isIncomeModalOpen} onClose={() => setIsIncomeModalOpen(false)} />
    </div>
  );
}
