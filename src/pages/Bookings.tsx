import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Calendar as CalendarIcon, Clock, User, Music, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';

export default function Bookings() {
  const [view, setView] = useState<'today' | 'week' | 'month'>('today');

  const today = new Date();
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-yaron-charcoal">Bookings</h1>
          <p className="text-gray-500 text-sm">Schedule and manage studio sessions</p>
        </div>
        <Button className="w-full sm:w-auto shadow-md">
          <Plus size={20} className="mr-2" />
          New Booking
        </Button>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-fit">
        {['today', 'week', 'month'].map((v) => (
          <button
            key={v}
            onClick={() => setView(v as any)}
            className={cn(
              "flex-1 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all capitalize",
              view === v ? "bg-white text-yaron-charcoal shadow-sm" : "text-gray-500 hover:text-yaron-charcoal"
            )}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-lg text-yaron-charcoal flex items-center">
            <CalendarIcon size={18} className="mr-2 text-yaron-magenta" />
            {view === 'today' ? "Today's Sessions" : view === 'week' ? "This Week" : "This Month"}
          </h2>
          
          {[1, 2, 3, 4].map((_, i) => (
            <Card key={i} className="hover:border-yaron-magenta/30 transition-colors cursor-pointer group p-0 overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <div className="bg-gray-50 sm:w-32 p-4 flex sm:flex-col items-center justify-between sm:justify-center border-b sm:border-b-0 sm:border-r border-gray-100">
                  <div className="text-center">
                    <p className="text-xl font-bold text-yaron-charcoal">{format(addDays(today, i > 1 ? 1 : 0), 'hh:mm')}</p>
                    <p className="text-xs font-medium text-gray-500">{format(addDays(today, i > 1 ? 1 : 0), 'a')}</p>
                  </div>
                  <div className="sm:mt-2 px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase tracking-wider">
                    Confirmed
                  </div>
                </div>
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-yaron-charcoal group-hover:text-yaron-magenta transition-colors">Vocal Recording</h3>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <Music size={14} className="mr-1.5" /> Ente Pattu
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4 text-sm">
                    <div className="flex items-center text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                      <User size={14} className="mr-1.5 text-gray-400" />
                      Shibili Moonnakkal
                    </div>
                    <div className="flex items-center text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                      <Clock size={14} className="mr-1.5 text-gray-400" />
                      2 Hours
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card className="bg-yaron-magenta/5 border-none">
            <h3 className="font-semibold text-yaron-charcoal mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Total Today</span>
                <span className="font-bold text-yaron-charcoal">4 Sessions</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Completed</span>
                <span className="font-bold text-green-600">1 Session</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Available Slots</span>
                <span className="font-bold text-yaron-orange">2 Slots</span>
              </div>
            </div>
          </Card>
          
          <Card>
             <h3 className="font-semibold text-yaron-charcoal mb-4">Mini Calendar</h3>
             <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center text-sm text-gray-400 border border-gray-100">
               [Calendar Component Placeholder]
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
