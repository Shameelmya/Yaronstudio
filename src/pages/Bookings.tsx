import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Calendar as CalendarIcon, Clock, User, Music, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';

export default function Bookings() {
  const [view, setView] = useState<'today' | 'week' | 'month'>('today');

  const today = new Date();
  
  // mock bookings
  const [bookings, setBookings] = useState([
    { id: 1, time: addDays(today, 0), title: 'Vocal Recording', work: 'Ente Pattu', customer: 'Shibili Moonnakkal', duration: '2 Hours', status: 'scheduled' },
    { id: 2, time: addDays(today, 0), title: 'Mixing', work: 'Wedding BGM', customer: 'Ameen', duration: '1 Hour', status: 'completed' },
    { id: 3, time: addDays(today, 1), title: 'Dubbing', work: 'Short Film', customer: 'Nishad', duration: '3 Hours', status: 'scheduled' },
    { id: 4, time: addDays(today, 2), title: 'Mastering', work: 'Ad Music', customer: 'Yaron Studio', duration: '1 Hour', status: 'missed' },
  ]);

  const updateStatus = (id: number, status: string) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
  };

  const filteredBookings = bookings.filter(b => {
    if (view === 'today') return b.time.getDate() === today.getDate();
    return true; // Simple mock for week/month
  });
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-yaron-charcoal dark:text-white">Bookings</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Schedule and manage studio sessions</p>
        </div>
        <Button className="w-full sm:w-auto shadow-md h-12 text-base bg-yaron-gradient border-none">
          <Plus size={20} className="mr-2" />
          New Booking
        </Button>
      </div>

      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-full sm:w-fit">
        {['today', 'week', 'month'].map((v) => (
          <button
            key={v}
            onClick={() => setView(v as any)}
            className={cn(
              "flex-1 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all capitalize",
              view === v ? "bg-white dark:bg-gray-700 text-yaron-charcoal dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-yaron-charcoal dark:hover:text-white"
            )}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-lg text-yaron-charcoal dark:text-white flex items-center">
            <CalendarIcon size={18} className="mr-2 text-yaron-magenta" />
            {view === 'today' ? "Today's Sessions" : view === 'week' ? "This Week" : "This Month"}
          </h2>
          
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="dark:bg-gray-900 dark:border-gray-800 hover:border-yaron-magenta/30 dark:hover:border-yaron-magenta/50 transition-colors cursor-pointer group p-0 overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <div className="bg-gray-50 dark:bg-gray-800/50 sm:w-32 p-4 flex sm:flex-col items-center justify-between sm:justify-center border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-800">
                  <div className="text-center">
                    <p className="text-xl font-bold text-yaron-charcoal dark:text-white">{format(booking.time, 'hh:mm')}</p>
                    <p className="text-xs font-medium text-gray-500">{format(booking.time, 'a')}</p>
                    <p className="text-[10px] text-gray-400 mt-1 sm:hidden">{format(booking.time, 'MMM dd')}</p>
                  </div>
                  {booking.status === 'scheduled' && (
                    <div className="sm:mt-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold rounded uppercase tracking-wider">
                      Scheduled
                    </div>
                  )}
                  {booking.status === 'completed' && (
                    <div className="sm:mt-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded uppercase tracking-wider">
                      Done
                    </div>
                  )}
                  {booking.status === 'missed' && (
                    <div className="sm:mt-2 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-bold rounded uppercase tracking-wider">
                      Missed
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-yaron-charcoal dark:text-white group-hover:text-yaron-magenta transition-colors">{booking.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                        <Music size={14} className="mr-1.5" /> {booking.work}
                      </p>
                    </div>
                    {booking.status === 'scheduled' && (
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20" onClick={() => updateStatus(booking.id, 'missed')} title="Mark as Missed">
                           <XCircle size={16} />
                        </Button>
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white border-none shadow-sm" onClick={() => updateStatus(booking.id, 'completed')}>
                          <CheckCircle2 size={16} className="mr-1.5" /> Done
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4 text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md">
                      <User size={14} className="mr-1.5 text-gray-400" />
                      {booking.customer}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md">
                      <Clock size={14} className="mr-1.5 text-gray-400" />
                      {booking.duration}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {filteredBookings.length === 0 && (
             <div className="text-center py-12 text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
               No sessions found for this view.
             </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-yaron-magenta/5 dark:bg-yaron-magenta/10 border-none">
            <h3 className="font-semibold text-yaron-charcoal dark:text-white mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Total Today</span>
                <span className="font-bold text-yaron-charcoal dark:text-white">4 Sessions</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Completed</span>
                <span className="font-bold text-green-600 dark:text-green-400">1 Session</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Missed</span>
                <span className="font-bold text-red-600 dark:text-red-400">0 Sessions</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Available Slots</span>
                <span className="font-bold text-yaron-orange">2 Slots</span>
              </div>
            </div>
          </Card>
          
          <Card className="dark:bg-gray-900 dark:border-gray-800">
             <h3 className="font-semibold text-yaron-charcoal dark:text-white mb-4">Mini Calendar</h3>
             <div className="aspect-square bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-sm text-gray-400 border border-gray-100 dark:border-gray-700">
               [Calendar Component Placeholder]
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
