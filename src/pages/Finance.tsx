import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { IndianRupee, TrendingUp, TrendingDown, FileText, Download, Plus, Filter, Music, Video, Headphones, Mic } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { listenToWorks, listenToExpenses, listenToIncomes } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { NewExpenseModal } from '@/components/finance/NewExpenseModal';
import { NewIncomeModal } from '@/components/finance/NewIncomeModal';

export default function Finance() {
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'invoices'>('overview');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>('All');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  
  const { activeStudioId } = useAppStore();
  const [works, setWorks] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);

  useEffect(() => {
    if (!activeStudioId) return;
    
    const unsubWorks = listenToWorks(activeStudioId, (fetchedWorks) => {
      setWorks(fetchedWorks);
    });

    const unsubExpenses = listenToExpenses(activeStudioId, (fetchedExpenses) => {
      setExpenses(fetchedExpenses);
    });
    
    const unsubIncomes = listenToIncomes(activeStudioId, (fetchedIncomes: any[]) => {
      setIncomes(fetchedIncomes);
    });

    return () => { unsubWorks(); unsubExpenses(); unsubIncomes(); };
  }, [activeStudioId]);

  // Calculations for current month
  const today = new Date();
  const currentMonthStart = startOfMonth(today);
  const currentMonthEnd = endOfMonth(today);

  const netIncome = useMemo(() => {
    const worksIncome = works.reduce((sum, w) => {
      if (w.createdAt && isWithinInterval(w.createdAt, { start: currentMonthStart, end: currentMonthEnd })) {
        return sum + (w.paidAmount || 0);
      }
      return sum;
    }, 0);
    
    const miscIncome = incomes.reduce((sum, i) => {
      if (i.date && isWithinInterval(i.date, { start: currentMonthStart, end: currentMonthEnd })) {
        return sum + i.amount;
      }
      return sum;
    }, 0);
    
    return worksIncome + miscIncome;
  }, [works, incomes, currentMonthStart, currentMonthEnd]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => {
      if (e.date && isWithinInterval(e.date, { start: currentMonthStart, end: currentMonthEnd })) {
        return sum + e.amount;
      }
      return sum;
    }, 0);
  }, [expenses, currentMonthStart, currentMonthEnd]);

  const pendingRecovery = useMemo(() => {
    return works.reduce((sum, w) => {
      const pending = w.totalAmount - (w.paidAmount || 0);
      if (pending > 0 && w.status !== 'cancelled') return sum + pending;
      return sum;
    }, 0);
  }, [works]);

  // 7 Month Chart Data
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(today, i));
      const monthEnd = endOfMonth(subMonths(today, i));
      
      const monthIncome = works.reduce((sum, w) => {
        if (w.createdAt && isWithinInterval(w.createdAt, { start: monthStart, end: monthEnd })) {
          return sum + (w.paidAmount || 0);
        }
        return sum;
      }, 0);

      const monthExpense = expenses.reduce((sum, e) => {
        if (e.date && isWithinInterval(e.date, { start: monthStart, end: monthEnd })) {
          return sum + e.amount;
        }
        return sum;
      }, 0);

      data.push({
        name: format(monthStart, 'MMM'),
        income: monthIncome,
        expense: monthExpense
      });
    }
    return data;
  }, [works, expenses]);

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

  // Completed Works for Invoices
  const recentInvoices = useMemo(() => {
    return works.filter(w => w.status === 'completed' || w.status === 'delivered')
                .sort((a, b) => b.createdAt?.getTime() - a.createdAt?.getTime())
                .slice(0, 5);
  }, [works]);

  const handleDownloadReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-yaron-charcoal dark:text-white">Finance</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage income, expenses, and invoices</p>
        </div>
        <div className="flex space-x-2 w-full sm:w-auto">
          <Button onClick={() => setIsIncomeModalOpen(true)} className="flex-1 sm:flex-none shadow-md bg-green-600 hover:bg-green-700 text-white border-none h-12 px-6 font-semibold">
            <Plus size={18} className="mr-2" />
            Add Income
          </Button>
          <Button onClick={() => setIsExpenseModalOpen(true)} className="flex-1 sm:flex-none shadow-md bg-red-600 hover:bg-red-700 text-white border-none h-12 px-6 font-semibold">
            <Plus size={18} className="mr-2" />
            Add Expense
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
             <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10 border-none shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-green-900/50 flex items-center justify-center shadow-sm">
                  <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
                </div>
                <span className="text-green-900 dark:text-green-300 font-medium">Net Income (Month)</span>
              </div>
              <p className="text-3xl font-bold text-green-950 dark:text-green-400 mt-4">{formatCurrency(netIncome - totalExpenses)}</p>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-900/10 border-none shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all"></div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-red-900/50 flex items-center justify-center shadow-sm">
                  <TrendingDown className="text-red-600 dark:text-red-400" size={20} />
                </div>
                <span className="text-red-900 dark:text-red-300 font-medium">Total Expenses (Month)</span>
              </div>
              <p className="text-3xl font-bold text-red-950 dark:text-red-400 mt-4">{formatCurrency(totalExpenses)}</p>
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

          <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
            <h3 className="font-bold text-lg text-yaron-charcoal dark:text-white mb-6">Income vs Expenses (Last 7 Months)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 0, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
                  <Tooltip 
                    cursor={{fill: 'rgba(107, 114, 128, 0.1)'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    formatter={(value: any) => [formatCurrency(Number(value)), '']}
                  />
                  <Bar dataKey="income" name="Income" fill="#F45B0A" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="expense" name="Expense" fill="#C72D5C" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="space-y-6">
          <Card className="dark:bg-gray-900 dark:border-gray-800">
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

      <NewExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} />
      <NewIncomeModal isOpen={isIncomeModalOpen} onClose={() => setIsIncomeModalOpen(false)} />
    </div>
  );
}
