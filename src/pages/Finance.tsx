import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { IndianRupee, TrendingUp, TrendingDown, FileText, Download, Plus } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', income: 40000, expense: 24000 },
  { name: 'Feb', income: 30000, expense: 13980 },
  { name: 'Mar', income: 20000, expense: 9800 },
  { name: 'Apr', income: 27800, expense: 3908 },
  { name: 'May', income: 18900, expense: 4800 },
  { name: 'Jun', income: 23900, expense: 3800 },
  { name: 'Jul', income: 34900, expense: 4300 },
];

export default function Finance() {
  const [activeTab, setActiveTab] = useState<'overview' | 'income' | 'expenses' | 'invoices'>('overview');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-yaron-charcoal">Finance</h1>
          <p className="text-gray-500 text-sm">Manage income, expenses, and invoices</p>
        </div>
        <div className="flex space-x-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Download size={18} className="mr-2" />
            Report
          </Button>
          <Button className="flex-1 sm:flex-none shadow-md">
            <Plus size={18} className="mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      <div className="flex overflow-x-auto hide-scrollbar bg-gray-100 p-1 rounded-xl w-full sm:w-fit">
        {['overview', 'income', 'expenses', 'invoices'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              "flex-1 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap",
              activeTab === tab ? "bg-white text-yaron-charcoal shadow-sm" : "text-gray-500 hover:text-yaron-charcoal"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-none">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <TrendingUp className="text-green-600" size={20} />
                </div>
                <span className="text-green-900 font-medium">Net Income (Month)</span>
              </div>
              <p className="text-3xl font-bold text-green-950 mt-4">{formatCurrency(330000)}</p>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100/50 border-none">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <TrendingDown className="text-red-600" size={20} />
                </div>
                <span className="text-red-900 font-medium">Total Expenses</span>
              </div>
              <p className="text-3xl font-bold text-red-950 mt-4">{formatCurrency(120000)}</p>
            </Card>

            <Card className="bg-gradient-to-br from-yaron-magenta/5 to-yaron-purple/5 border-none">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <IndianRupee className="text-yaron-magenta" size={20} />
                </div>
                <span className="text-yaron-charcoal font-medium">Pending Recovery</span>
              </div>
              <p className="text-3xl font-bold text-yaron-charcoal mt-4">{formatCurrency(125000)}</p>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-bold text-lg text-yaron-charcoal mb-6">Income vs Expenses (Last 7 Months)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 5, right: 0, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
                  <Tooltip 
                    cursor={{fill: '#f9fafb'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    formatter={(value: any) => [formatCurrency(Number(value)), '']}
                  />
                  <Bar dataKey="income" name="Income" fill="#F45B0A" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="expense" name="Expense" fill="#27292B" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'invoices' && (
        <Card className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-yaron-charcoal">Recent Invoices</h2>
            <Button variant="outline" size="sm">Generate New</Button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-yaron-magenta/30 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-yaron-magenta/5 flex items-center justify-center text-yaron-magenta">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-yaron-charcoal">INV-2023-00{i+1}</p>
                    <p className="text-sm text-gray-500">Shibili Moonnakkal • Oct 12, 2023</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right hidden sm:block">
                    <p className="font-bold text-yaron-charcoal">{formatCurrency(15000)}</p>
                    <p className="text-xs text-green-600 font-medium mt-0.5">Paid</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-yaron-charcoal">
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
