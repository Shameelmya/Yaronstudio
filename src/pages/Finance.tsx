import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IndianRupee, TrendingUp, TrendingDown, FileText, Download, Plus, Filter, Music, Video, Headphones } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Jan', income: 40000, expense: 24000 },
  { name: 'Feb', income: 30000, expense: 13980 },
  { name: 'Mar', income: 20000, expense: 9800 },
  { name: 'Apr', income: 27800, expense: 3908 },
  { name: 'May', income: 18900, expense: 4800 },
  { name: 'Jun', income: 23900, expense: 3800 },
  { name: 'Jul', income: 34900, expense: 4300 },
];

const mockServiceData = [
  { service: 'Vocal Recording', count: 45, revenue: 135000, icon: Headphones, color: 'text-blue-500' },
  { service: 'Mixing', count: 32, revenue: 160000, icon: Music, color: 'text-yaron-purple' },
  { service: 'Mastering', count: 28, revenue: 84000, icon: Music, color: 'text-yaron-magenta' },
  { service: 'Video Editing', count: 12, revenue: 120000, icon: Video, color: 'text-yaron-orange' },
];

export default function Finance() {
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'invoices'>('overview');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>('All');

  const filteredServiceData = useMemo(() => {
    if (selectedServiceFilter === 'All') return mockServiceData;
    return mockServiceData.filter(d => d.service === selectedServiceFilter);
  }, [selectedServiceFilter]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-yaron-charcoal dark:text-white">Finance</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage income, expenses, and invoices</p>
        </div>
        <div className="flex space-x-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Download size={18} className="mr-2" />
            Report
          </Button>
          <Button className="flex-1 sm:flex-none shadow-md bg-yaron-gradient text-white border-none h-12 px-6 font-semibold">
            <Plus size={18} className="mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      <div className="flex overflow-x-auto hide-scrollbar bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-full sm:w-fit">
        {['overview', 'analysis', 'invoices'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              "flex-1 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap",
              activeTab === tab 
                ? "bg-white dark:bg-gray-700 text-yaron-charcoal dark:text-white shadow-sm" 
                : "text-gray-500 dark:text-gray-400 hover:text-yaron-charcoal dark:hover:text-white"
            )}
          >
            {tab}
          </button>
        ))}
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
              <p className="text-3xl font-bold text-green-950 dark:text-green-400 mt-4">{formatCurrency(330000)}</p>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-900/10 border-none shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all"></div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-red-900/50 flex items-center justify-center shadow-sm">
                  <TrendingDown className="text-red-600 dark:text-red-400" size={20} />
                </div>
                <span className="text-red-900 dark:text-red-300 font-medium">Total Expenses</span>
              </div>
              <p className="text-3xl font-bold text-red-950 dark:text-red-400 mt-4">{formatCurrency(120000)}</p>
            </Card>

            <Card className="bg-gradient-to-br from-yaron-magenta/5 to-yaron-purple/5 dark:from-yaron-magenta/10 dark:to-yaron-purple/10 border-none shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-yaron-magenta/10 rounded-full blur-2xl group-hover:bg-yaron-magenta/20 transition-all"></div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                  <IndianRupee className="text-yaron-magenta" size={20} />
                </div>
                <span className="text-yaron-charcoal dark:text-white font-medium">Pending Recovery</span>
              </div>
              <p className="text-3xl font-bold text-yaron-charcoal dark:text-white mt-4">{formatCurrency(125000)}</p>
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
                  <option value="Vocal Recording">Vocal Recording</option>
                  <option value="Mixing">Mixing</option>
                  <option value="Mastering">Mastering</option>
                  <option value="Video Editing">Video Editing</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredServiceData.map((data, i) => {
                const average = data.revenue / data.count;
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
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'invoices' && (
        <Card className="flex-1 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-yaron-charcoal dark:text-white">Recent Invoices</h2>
            <Button variant="outline" size="sm" className="dark:border-gray-700 dark:text-white">Generate New</Button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-yaron-magenta/30 transition-colors bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-yaron-magenta/5 dark:bg-yaron-magenta/20 flex items-center justify-center text-yaron-magenta">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-yaron-charcoal dark:text-white">INV-2023-00{i+1}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Shibili Moonnakkal • Oct 12, 2023</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right hidden sm:block">
                    <p className="font-bold text-yaron-charcoal dark:text-white">{formatCurrency(15000)}</p>
                    <p className="text-xs text-green-600 dark:text-green-400 font-bold mt-0.5 uppercase tracking-wider">Paid</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-yaron-charcoal dark:hover:text-white">
                    <Download size={18} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
