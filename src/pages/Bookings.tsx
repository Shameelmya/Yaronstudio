import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Clock, User, Phone, ArrowRight, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isSameDay } from 'date-fns';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { listenToBookings, createBooking, updateBookingStatus, createWork, getCustomerByPhone } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';

export default function Bookings() {
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [newBookingData, setNewBookingData] = useState({ title: '', customer: '', phone: '', date: '', time: '' });
  const [bookingError, setBookingError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const [moveToWorksModalOpen, setMoveToWorksModalOpen] = useState(false);
  const [bookingToMove, setBookingToMove] = useState<any>(null);
  const [isMoving, setIsMoving] = useState(false);
  
  const { activeStudioId } = useAppStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [existingCustomer, setExistingCustomer] = useState<any>(null);

  // Auto-detect customer by phone
  useEffect(() => {
    const checkPhone = async () => {
      const phone = newBookingData.phone;
      if (phone && phone.length >= 10) {
        const customer = await getCustomerByPhone(phone);
        if (customer) {
          setExistingCustomer(customer);
          setNewBookingData(prev => ({...prev, customer: customer.name}));
        } else {
          setExistingCustomer(null);
        }
      } else {
        setExistingCustomer(null);
      }
    };
    const timeoutId = setTimeout(checkPhone, 500);
    return () => clearTimeout(timeoutId);
  }, [newBookingData.phone]);

  useEffect(() => {
    if (!activeStudioId) return;
    const unsub = listenToBookings(activeStudioId, (fetchedBookings) => {
      setBookings(fetchedBookings.map(b => ({
        ...b,
        time: new Date(b.date)
      })));
    });
    return () => unsub();
  }, [activeStudioId]);

  const today = new Date();

  // Active bookings are those scheduled for today or in the future
  const activeBookings = useMemo(() => {
    return bookings.filter(b => b.status === 'scheduled')
      .sort((a, b) => a.time.getTime() - b.time.getTime());
  }, [bookings]);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');

    if (!newBookingData.date || !newBookingData.time || !newBookingData.customer || !activeStudioId) return;

    const [year, month, day] = newBookingData.date.split('-').map(Number);
    const [hour, minute] = newBookingData.time.split(':').map(Number);
    const newBookingTime = new Date(year, month - 1, day, hour, minute);
    
    // Check duplicates for the exact same hour and day
    const isDuplicate = bookings.some(b => {
      return (
        b.status === 'scheduled' &&
        b.time.getFullYear() === newBookingTime.getFullYear() &&
        b.time.getMonth() === newBookingTime.getMonth() &&
        b.time.getDate() === newBookingTime.getDate() &&
        b.time.getHours() === newBookingTime.getHours()
      );
    });

    if (isDuplicate) {
      const duplicateBooking = bookings.find(b => b.time.getHours() === newBookingTime.getHours() && b.time.getDate() === newBookingTime.getDate() && b.status === 'scheduled');
      setBookingError(`${duplicateBooking?.customerId || 'Someone'}'s work is booked for this time. No other booking allowed.`);
      return;
    }

    try {
      setIsCreating(true);
      await createBooking({
        id: Date.now().toString(),
        studioId: activeStudioId,
        date: newBookingTime.getTime(),
        service: newBookingData.title || 'Studio Session',
        customerId: newBookingData.customer,
        // Hack: store phone in workId for now since Booking type doesn't have phone
        workId: newBookingData.phone || '',
        duration: 60,
        status: 'scheduled'
      });
      setIsNewBookingOpen(false);
      setNewBookingData({ title: '', customer: '', phone: '', date: '', time: '' });
      setExistingCustomer(null);
    } catch (err) {
      setBookingError('Failed to create booking.');
    } finally {
      setIsCreating(false);
    }
  };

  const confirmMoveToWorks = async () => {
    if (!bookingToMove || !activeStudioId) return;
    setIsMoving(true);
    try {
      // 1. Create a new Work
      const newWorkId = Date.now().toString();
      await createWork({
        id: newWorkId,
        studioId: activeStudioId,
        customerId: bookingToMove.customerId,
        title: bookingToMove.service,
        services: [bookingToMove.service],
        totalAmount: 0, // Default 0, they can edit later in works
        paidAmount: 0,
        status: 'pending',
        createdAt: new Date(),
        dueDate: bookingToMove.time,
      });

      // 2. Update booking status to completed/converted
      await updateBookingStatus(bookingToMove.id, 'completed');

      setMoveToWorksModalOpen(false);
      setBookingToMove(null);
    } catch (err) {
      console.error(err);
      alert('Failed to move to works.');
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-yaron-charcoal dark:text-white">Waiting List / Bookings</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Active bookings waiting to be converted into works.</p>
        </div>
        <Button onClick={() => setIsNewBookingOpen(true)} className="w-full sm:w-auto shadow-md h-12 text-base bg-yaron-gradient border-none">
          <Plus size={20} className="mr-2" />
          Add Booking
        </Button>
      </div>

      <div className="flex-1 space-y-4">
        {activeBookings.map((booking) => (
          <Card key={booking.id} className="dark:bg-gray-900 dark:border-gray-800 hover:border-yaron-magenta/30 dark:hover:border-yaron-magenta/50 transition-colors p-0 overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              <div className="bg-gray-50 dark:bg-gray-800/50 sm:w-40 p-4 flex sm:flex-col items-center justify-between sm:justify-center border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-800">
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">{format(booking.time, 'MMM dd, yyyy')}</p>
                  <p className="text-2xl font-bold text-yaron-charcoal dark:text-white">{format(booking.time, 'hh:mm')}</p>
                  <p className="text-xs font-medium text-gray-500">{format(booking.time, 'a')}</p>
                </div>
                {isSameDay(booking.time, today) && (
                  <div className="sm:mt-2 px-2 py-1 bg-yaron-orange/10 dark:bg-orange-900/30 text-yaron-orange dark:text-orange-400 text-[10px] font-bold rounded uppercase tracking-wider">
                    Today
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-yaron-charcoal dark:text-white">{booking.customerId}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{booking.service}</p>
                  <div className="flex items-center space-x-3 mt-2">
                    <a href={`tel:${booking.workId}`} className="inline-flex items-center text-sm text-yaron-magenta font-semibold hover:underline bg-yaron-magenta/10 px-3 py-1.5 rounded-lg">
                      <Phone size={14} className="mr-1.5" /> Call: {booking.workId || 'N/A'}
                    </a>
                  </div>
                </div>
                <Button 
                  onClick={() => { setBookingToMove(booking); setMoveToWorksModalOpen(true); }}
                  className="w-full sm:w-auto bg-yaron-charcoal hover:bg-black text-white dark:bg-gray-800 dark:hover:bg-gray-700 border-none shadow-sm h-12"
                >
                  Move to Works <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {activeBookings.length === 0 && (
           <div className="text-center py-12 text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
             No active bookings in the waiting list.
           </div>
        )}
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
            label="Phone Number" 
            placeholder=""
            type="tel"
            value={newBookingData.phone}
            onChange={e => setNewBookingData({...newBookingData, phone: e.target.value})}
            required
            autoFocus
          />

          {existingCustomer && (
            <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 dark:border-green-900/20 flex items-center space-x-2 text-sm">
              <CheckCircle2 className="text-green-600 dark:text-green-500 shrink-0" size={16} />
              <p className="font-medium text-green-900 dark:text-green-400">Customer found: {existingCustomer.name}</p>
            </div>
          )}

          <Input 
            label="Customer Name" 
            placeholder=""
            value={newBookingData.customer}
            onChange={e => setNewBookingData({...newBookingData, customer: e.target.value})}
            required
          />
          <Input 
            label="Service / Description" 
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
            <Button type="submit" className="flex-1 bg-yaron-gradient text-white border-none" disabled={isCreating}>{isCreating ? 'Adding...' : 'Add Booking'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={moveToWorksModalOpen} onClose={() => setMoveToWorksModalOpen(false)} title="Move to Works">
        {bookingToMove && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">You are moving</p>
              <p className="font-bold text-yaron-charcoal dark:text-white text-lg">{bookingToMove.customerId}'s Session</p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{bookingToMove.service}</p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This will remove the session from the booking waiting list and add it to your <strong>Works</strong> dashboard as a pending work. Do you want to proceed?
            </p>
            <div className="pt-4 flex space-x-3">
              <Button variant="outline" className="flex-1 dark:border-gray-700" onClick={() => setMoveToWorksModalOpen(false)} disabled={isMoving}>Cancel</Button>
              <Button 
                className="flex-1 bg-yaron-charcoal hover:bg-black text-white dark:bg-gray-700 dark:hover:bg-gray-600 border-none shadow-sm" 
                onClick={confirmMoveToWorks}
                disabled={isMoving}
              >
                {isMoving ? 'Moving...' : 'Yes, Move to Works'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
