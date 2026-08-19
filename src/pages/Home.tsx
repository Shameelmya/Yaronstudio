import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { Plus, IndianRupee, Clock, TrendingUp, TrendingDown, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-yaron-charcoal">Overview</h1>
          <p className="text-gray-500 text-sm">Welcome to Yaron Studio</p>
        </div>
        <Button onClick={() => navigate('/works?new=true')} className="w-full sm:w-auto shadow-md">
          <Plus size={20} className="mr-2" />
          New Work
        </Button>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yaron-magenta/5 to-yaron-purple/5 border-none shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-yaron-magenta/10 rounded-full blur-2xl"></div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Clock className="text-yaron-magenta" size={20} />
            </div>
            <span className="text-gray-600 font-medium">Pending Payments</span>
          </div>
          <p className="text-3xl font-bold text-yaron-charcoal mt-4">{formatCurrency(125000)}</p>
        </Card>

        <Card className="bg-gradient-to-br from-yaron-orange/5 to-yaron-gold/5 border-none shadow-sm relative overflow-hidden">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-yaron-orange/10 rounded-full blur-2xl"></div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
              <TrendingUp className="text-yaron-orange" size={20} />
            </div>
            <span className="text-gray-600 font-medium">Income (This Month)</span>
          </div>
          <p className="text-3xl font-bold text-yaron-charcoal mt-4">{formatCurrency(450000)}</p>
        </Card>

        <Card>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
              <TrendingDown className="text-gray-500" size={20} />
            </div>
            <span className="text-gray-600 font-medium">Expenses</span>
          </div>
          <p className="text-2xl font-bold text-yaron-charcoal mt-4">{formatCurrency(120000)}</p>
        </Card>

        <Card>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
              <Music className="text-yaron-purple" size={20} />
            </div>
            <span className="text-gray-600 font-medium">Active Works</span>
          </div>
          <p className="text-2xl font-bold text-yaron-charcoal mt-4">24</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Sessions */}
        <Card className="flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-yaron-charcoal">Today's Sessions</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-4 flex-1">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="text-center w-16">
                    <p className="text-sm font-semibold text-yaron-magenta">10:00</p>
                    <p className="text-xs text-gray-500">AM</p>
                  </div>
                  <div>
                    <p className="font-semibold text-yaron-charcoal">Vocal Recording</p>
                    <p className="text-sm text-gray-500">Shibili Moonnakkal • Ente Pattu</p>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Works */}
        <Card className="flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-yaron-charcoal">Recent Works</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-4 flex-1">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div>
                  <p className="font-semibold text-yaron-charcoal">Album Song 0{i+1}</p>
                  <p className="text-sm text-gray-500">Pending: {formatCurrency(5000)}</p>
                </div>
                <Button variant="outline" size="sm">Receive Pay</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
