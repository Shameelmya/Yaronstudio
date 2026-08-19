import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Calendar as CalendarIcon, Clock, User, Music, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, isSameDay } from 'date-fns';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { listenToBookings, createBooking, updateBookingStatus } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';

export default function Bookings() {
  const [view, setView] = useState<'today' | 'week' | 'month'>('today');
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [newBookingData, setNewBookingData] = useState({ title: '', customer: '', date: '', time: '' });
  const [bookingError, setBookingError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const { activeStudioId } = useAppStore();
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (!activeStudioId) return;
    const unsub = listenToBookings(activeStudioId, (fetchedBookings) => {
      // Map Firestore string dates to Date objects if needed
      setBookings(fetchedBookings.map(b => ({
        ...b,
        time: new Date(b.date) // Assuming API saves 'date' field as ISO string or timestamp
      })));
    });
    return () => unsub();
  }, [activeStudioId]);

  const today = new Date();

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateBookingStatus(id, status as any);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');

    if (!newBookingData.date || !newBookingData.time || !newBookingData.customer || !activeStudioId) return;

    const [year, month, day] = newBookingData.date.split('-').map(Number);
    const [hour, minute] = newBookingData.time.split(':').map(Number);
    const newBookingTime = new Date(year, month - 1, day, hour, minute);
    
    // Check duplicates
    const isDuplicate = bookings.some(b => {
      return (
        b.time.getFullYear() === newBookingTime.getFullYear() &&
        b.time.getMonth() === newBookingTime.getMonth() &&
        b.time.getDate() === newBookingTime.getDate() &&
        b.time.getHours() === newBookingTime.getHours()
      );
    });

    if (isDuplicate) {
      const duplicateBooking = bookings.find(b => b.time.getHours() === newBookingTime.getHours() && b.time.getDate() === newBookingTime.getDate());
      setBookingError(`${duplicateBooking?.customerId || 'Someone'}'s work is booked for this time. No other booking allowed.`);
      return;
    }

    try {
      setIsCreating(true);
      await createBooking({
        id: Date.now().toString(),
        studioId: activeStudioId,
        date: newBookingTime.getTime() as any,
        service: newBookingData.title || 'Studio Session',
        customerId: newBookingData.customer,
        workId: 'New Work',
        duration: 60,
        status: 'scheduled'
      });
      setIsNewBookingOpen(false);
      setNewBookingData({ title: '', customer: '', date: '', time: '' });
    } catch (err) {
      setBookingError('Failed to create booking.');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (view === 'today') {
        return isSameDay(b.time, today);
      } else if (view === 'week') {
        return isWithinInterval(b.time, { start: startOfWeek(today), end: endOfWeek(today) });
      } else if (view === 'month') {
        return isWithinInterval(b.time, { start: startOfMonth(today), end: endOfMonth(today) });
      }
      return true;
    }).sort((a, b) => a.time.getTime() - b.time.getTime());
  }, [bookings, view, today]);

  // Stats calculation
  const stats = useMemo(() => {
    let total = filteredBookings.length;
    let completed = 0;
    let missed = 0;
    filteredBookings.forEach(b => {
      if (b.status === 'completed') completed++;
      if (b.status === 'missed' || b.status === 'cancelled') missed++;
    });
    return { total, completed, missed, available: Math.max(0, 10 - total) }; // Mock max 10 slots
  }, [filteredBookings]);

  // Mini Calendar generation
  const calendarDays = useMemo(() => {
    const days = [];
    const start = startOfWeek(today);
    for (let i = 0; i < 7; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      const isToday = isSameDay(current, today);
      const hasBooking = bookings.some(b => isSameDay(b.time, current));
      days.push({ date: current, isToday, hasBooking });
    }
    return days;
  }, [today, bookings]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-yaron-charcoal dark:text-white">Bookings</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Schedule and manage studio sessions</p>
        </div>
        <Button onClick={() => setIsNewBookingOpen(true)} className="w-full sm:w-auto shadow-md h-12 text-base bg-yaron-gradient border-none">
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
                      <h3 className="font-bold text-lg text-yaron-charcoal dark:text-white group-hover:text-yaron-magenta transition-colors">{booking.service}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                        <Music size={14} className="mr-1.5" /> Work: {booking.workId}
                      </p>
                    </div>
                    {booking.status === 'scheduled' && (
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20" onClick={(e) => { e.stopPropagation(); handleStatusUpdate(booking.id, 'missed'); }} title="Mark as Missed">
                           <XCircle size={16} />
                        </Button>
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white border-none shadow-sm" onClick={(e) => { e.stopPropagation(); handleStatusUpdate(booking.id, 'completed'); }}>
                          <CheckCircle2 size={16} className="mr-1.5" /> Done
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4 text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md">
                      <User size={14} className="mr-1.5 text-gray-400" />
                      {booking.customerId}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md">
                      <Clock size={14} className="mr-1.5 text-gray-400" />
                      1 Hour
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
            <h3 className="font-semibold text-yaron-charcoal dark:text-white mb-4">Quick Stats ({view})</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Total Sessions</span>
                <span className="font-bold text-yaron-charcoal dark:text-white">{stats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Completed</span>
                <span className="font-bold text-green-600 dark:text-green-400">{stats.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Missed</span>
                <span className="font-bold text-red-600 dark:text-red-400">{stats.missed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Available Slots (Est)</span>
                <span className="font-bold text-yaron-orange">{stats.available}</span>
              </div>
            </div>
          </Card>
          
          <Card className="dark:bg-gray-900 dark:border-gray-800">
             <h3 className="font-semibold text-yaron-charcoal dark:text-white mb-4">This Week</h3>
             <div className="grid grid-cols-7 gap-2">
               {calendarDays.map((day, i) => (
                 <div key={i} className="flex flex-col items-center">
                   <span className="text-xs text-gray-400 mb-1">{format(day.date, 'EEEEEE')}</span>
                   <div className={cn(
                     "w-8 h-8 rounded-full flex items-center justify-center text-sm relative",
                     day.isToday ? "bg-yaron-magenta text-white font-bold" : "text-gray-600 dark:text-gray-300",
                     !day.isToday && day.hasBooking ? "bg-gray-100 dark:bg-gray-800" : ""
                   )}>
                     {format(day.date, 'd')}
                     {day.hasBooking && !day.isToday && (
                       <span className="absolute bottom-1 w-1 h-1 bg-yaron-orange rounded-full"></span>
                     )}
                   </div>
                 </div>
               ))}
             </div>
          </Card>
        </div>
      </div>
      <Modal isOpen={isNewBookingOpen} onClose={() => { setIsNewBookingOpen(false); setBookingError(''); }} title="New Booking">
        <form onSubmit={handleCreateBooking} className="space-y-4">
          {bookingError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg flex items-start space-x-2 border border-red-200 dark:border-red-900/30">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{bookingError}</p>
            </div>
          )}
          <Input 
            label="Customer Name" 
            placeholder=""
            value={newBookingData.customer}
            onChange={e => setNewBookingData({...newBookingData, customer: e.target.value})}
            required
            autoFocus
          />
          <Input 
            label="Service / Title" 
            placeholder=""
            value={newBookingData.title}
            onChange={e => setNewBookingData({...newBookingData, title: e.target.value})}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Date" 
              type="date"
              value={newBookingData.date}
              onChange={e => setNewBookingData({...newBookingData, date: e.target.value})}
              required
            />
            <Input 
              label="Time" 
              type="time"
              value={newBookingData.time}
              onChange={e => setNewBookingData({...newBookingData, time: e.target.value})}
              required
            />
          </div>
          <div className="pt-4 flex space-x-3">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => { setIsNewBookingOpen(false); setBookingError(''); }} disabled={isCreating}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-yaron-gradient text-white border-none" disabled={isCreating}>{isCreating ? 'Booking...' : 'Book Slot'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
