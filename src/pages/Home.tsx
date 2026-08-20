import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { Plus, Clock, TrendingUp, Music, CheckCircle2, IndianRupee, Phone, CalendarHeart, MessageCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/store/useAppStore';
import { listenToBookings, updateWork, updateBookingStatus } from '@/lib/api';
import { format, startOfDay, differenceInDays } from 'date-fns';
import { UserCheck } from 'lucide-react';
import { QuickAttendanceModal } from '@/components/home/QuickAttendanceModal';
import { QuickTransactionModal } from '@/components/finance/QuickTransactionModal';
import { ReceivePayModal } from '@/components/finance/ReceivePayModal';
import { GlobalSearchModal } from '@/components/home/GlobalSearchModal';
import { Search } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [selectedReceivePayWork, setSelectedReceivePayWork] = useState<any>(null);

  const [todayBookings, setTodayBookings] = useState<any[]>([]);
  
  const [isTotalIncomeOpen, setIsTotalIncomeOpen] = useState(false);
  const [isOverdueModalOpen, setIsOverdueModalOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  
  const location = useLocation();
  const isQuickAttendanceOpen = location.hash === '#attendance';
  
  const { activeStudioId, works, customers, incomes } = useAppStore();
  
  useEffect(() => {
    if (!activeStudioId) return;
    const unsubBookings = listenToBookings(activeStudioId, (bookings) => {
      const todayString = format(new Date(), 'yyyy-MM-dd');
      const todaySessions = bookings
        .filter(b => format(new Date(b.date), 'yyyy-MM-dd') === todayString)
        .map(b => ({
          id: b.id, title: b.service, work: 'Work ID: ' + b.workId, customer: b.customerId, time: new Date(b.date), status: b.status
        }));
      setTodayBookings(todaySessions);
    });
    return () => unsubBookings();
  }, [activeStudioId]);

  const { pendingWorks, recentWorks, totalPendingPayments, activeWorksCount, overdueCount, totalIncome } = useMemo(() => {
    const today = startOfDay(new Date());
    
    let pendingAmt = 0;
    let incomeAmt = 0;
    let activeCnt = 0;
    let overdueCnt = 0;

    const pendingList = works
      .filter(w => w.status !== 'cancelled' && (w.totalAmount - (w.paidAmount || 0)) > 0)
      .map(w => ({
        ...w,
        pending: w.totalAmount - (w.paidAmount || 0),
        daysDue: w.dueDate ? differenceInDays(today, startOfDay(w.dueDate)) : 0
      }));

    const recentList = works.slice(0, 4).map(w => ({
      ...w,
      pending: w.totalAmount - (w.paidAmount || 0)
    }));

    works.forEach(w => {
      const amtPending = w.totalAmount - (w.paidAmount || 0);
      if (amtPending > 0 && w.status !== 'cancelled') pendingAmt += amtPending;
      if (w.status === 'pending' || w.status === 'in_progress') activeCnt++;
      
      incomeAmt += (w.paidAmount || 0);
      
      if (w.dueDate && (amtPending > 0 || w.status !== 'completed')) {
        const daysDue = differenceInDays(today, startOfDay(w.dueDate));
        if (daysDue > 0) overdueCnt++;
      }
    });
    
    incomes.forEach(i => {
      incomeAmt += i.amount;
    });

    return {
      pendingWorks: pendingList,
      recentWorks: recentList,
      totalPendingPayments: pendingAmt,
      activeWorksCount: activeCnt,
      overdueCount: overdueCnt,
      totalIncome: incomeAmt
    };
  }, [works, incomes]);

  const handleTogglePaid = async (workId: string, totalAmount: number) => {
    try {
      await updateWork(workId, { paidAmount: totalAmount });
    } catch (e) {
      console.error(e);
      alert('Failed to mark as paid');
    }
  };

  const getCustomer = (id: string) => customers.find(c => c.id === id);

  const getWhatsAppMessage = (work: any, customer: any) => {
    let dateText = 'is pending';
    if (work.dueDate) {
      const daysDue = differenceInDays(startOfDay(new Date()), startOfDay(work.dueDate));
      if (daysDue > 0) dateText = `is pending from ${format(new Date(work.dueDate), 'dd MMM yyyy')}`;
      else dateText = `is due on ${format(new Date(work.dueDate), 'dd MMM yyyy')}`;
    }
    const pendingAmt = work.totalAmount - (work.paidAmount || 0);
    const note = `Payment for ${work.title}`;
    const upiLink = `upi://pay?pa=shibilimoonakal-1@oksbi&pn=Shibili%20Moonnakkal&am=${pendingAmt}&cu=INR&tn=${note}`;

    const msg = `Hi ${customer?.name || ''}, this is a gentle reminder that your payment of Rs. ${pendingAmt} for ${work.title} ${dateText}. Please clear the dues 🙏\n\n💸 *Quick link to pay*: \n${upiLink}\n\n📱 *Gpay number* : 8593813313\n👤 *GPay Name* : Shibili Moonnakkal\n\nThank you!`;
    return encodeURIComponent(msg);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-yaron-charcoal dark:text-white">Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Welcome to Yaron Studio</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={() => setIsQuickLogOpen(true)} size="icon" className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 text-white border-none shadow-md transition-colors">
            <IndianRupee size={22} />
          </Button>
          <Button onClick={() => navigate('#attendance')} size="icon" className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none shadow-md transition-colors">
            <UserCheck size={22} />
          </Button>
          <Button onClick={() => navigate('/works#new-work')} size="icon" className="w-12 h-12 rounded-full shadow-md bg-yaron-gradient border-none hover:opacity-90 transition-opacity">
            <Plus size={24} className="text-white" />
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div 
          onClick={() => setIsGlobalSearchOpen(true)}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex items-center text-gray-500 cursor-text shadow-sm hover:shadow-md transition-shadow"
        >
          <Search size={20} className="mr-3 text-yaron-magenta" />
          <span className="text-sm">Search here...</span>
        </div>
      </div>

      <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 hide-scrollbar">
        <Card 
          className="bg-yaron-magenta border-none shadow-sm relative overflow-hidden cursor-pointer hover:shadow-md transition-all min-w-[160px] flex-1 shrink-0 snap-center p-4 group"
          onClick={() => setIsPendingModalOpen(true)}
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shadow-sm shrink-0">
              <Clock className="text-white" size={16} />
            </div>
            <span className="text-white text-xs font-medium whitespace-nowrap">Pending</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{formatCurrency(totalPendingPayments)}</p>
          <p className="text-white/80 text-[10px] mt-1">{pendingWorks.length} pending works</p>
        </Card>

        <Card 
          className="bg-yaron-orange border-none shadow-sm relative overflow-hidden min-w-[160px] flex-1 shrink-0 snap-center p-4 cursor-pointer hover:shadow-md transition-all group"
          onClick={() => setIsTotalIncomeOpen(true)}
        >
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shadow-sm shrink-0">
              <TrendingUp className="text-white" size={16} />
            </div>
            <span className="text-white text-xs font-medium whitespace-nowrap">Total Income</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{formatCurrency(totalIncome)}</p>
        </Card>

        <Card className="bg-yaron-purple border-none shadow-sm relative overflow-hidden min-w-[160px] flex-1 shrink-0 snap-center p-4">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shadow-sm shrink-0">
              <Music className="text-white" size={16} />
            </div>
            <span className="text-white text-xs font-medium whitespace-nowrap">Ongoing Projects</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{activeWorksCount}</p>
        </Card>
        
        <Card 
          className="bg-red-500 border-none shadow-sm relative overflow-hidden min-w-[160px] flex-1 shrink-0 snap-center p-4 cursor-pointer hover:shadow-md transition-all group"
          onClick={() => setIsOverdueModalOpen(true)}
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shadow-sm shrink-0">
              <Clock className="text-white" size={16} />
            </div>
            <span className="text-white text-xs font-medium whitespace-nowrap">Overdue</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{overdueCount}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col dark:bg-gray-900 dark:border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-yaron-charcoal dark:text-white">Recent Works</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/works')}>View All</Button>
          </div>
          <div className="space-y-4 flex-1">
            {recentWorks.map((work) => (
              <div 
                key={work.id} 
                onClick={() => setSelectedReceivePayWork(work)}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer"
              >
                <div>
                  <p className="font-semibold text-yaron-charcoal dark:text-white">{work.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{getCustomer(work.customerId)?.name || work.customerId}</p>
                </div>
                <div className="text-right">
                  {work.pending > 0 ? (
                    <>
                      <p className="text-sm font-bold text-yaron-orange">{formatCurrency(work.pending)}</p>
                      <p className="text-[10px] text-gray-500 font-medium">Pending</p>
                    </>
                  ) : (
                    <p className="text-sm font-bold text-green-500">Fully Paid</p>
                  )}
                </div>
              </div>
            ))}
            {recentWorks.length === 0 && (
               <div className="text-center text-gray-500 py-6">No recent works.</div>
            )}
          </div>
        </Card>

        <Card className="flex flex-col dark:bg-gray-900 dark:border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-yaron-charcoal dark:text-white">Today's Sessions</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/bookings')}>View All</Button>
          </div>
          <div className="space-y-4 flex-1">
            {todayBookings.map((session, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700 gap-3">
                <div className="flex items-center space-x-4">
                  <div className="text-center w-16 shrink-0 bg-white dark:bg-gray-900 py-1.5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-bold text-yaron-magenta">{format(session.time, 'hh:mm')}</p>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase">{format(session.time, 'a')}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-yaron-charcoal dark:text-white">{session.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{getCustomer(session.customer)?.name || session.customer}</p>
                  </div>
                </div>
                {session.status !== 'completed' ? (
                  <Button size="sm" className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white border-none shadow-sm" onClick={() => updateBookingStatus(session.id, 'completed')}>
                    <CheckCircle2 size={16} className="mr-1.5" /> Done
                  </Button>
                ) : (
                  <div className="sm:w-auto text-green-600 dark:text-green-400 font-bold text-sm uppercase tracking-wider flex items-center justify-center">
                    <CheckCircle2 size={16} className="mr-1" /> Done
                  </div>
                )}
              </div>
            ))}
            {todayBookings.length === 0 && (
              <div className="text-center text-gray-500 py-6">No sessions booked for today.</div>
            )}
          </div>
        </Card>
      </div>

      <Modal isOpen={isPendingModalOpen} onClose={() => setIsPendingModalOpen(false)} title="Pending Payments">
        <div className="space-y-4 pb-6">
          {pendingWorks.map(work => {
            const customer = getCustomer(work.customerId);
            return (
              <div key={work.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-yaron-charcoal dark:text-white">{work.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-0.5">{customer?.name || work.customerId}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-yaron-orange">{formatCurrency(work.pending)}</p>
                    {work.daysDue > 0 ? (
                      <p className="text-xs text-red-500 font-semibold mt-0.5">Overdue {work.daysDue} days</p>
                    ) : work.daysDue < 0 ? (
                      <p className="text-xs text-gray-500 mt-0.5">Due in {Math.abs(work.daysDue)} days</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-0.5">Due today</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  {customer?.whatsapp && (
                    <a 
                      href={`https://wa.me/${customer.whatsapp.replace(/\D/g, '')}?text=${getWhatsAppMessage(work, customer)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex justify-center items-center w-12 h-10 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle size={18} className="text-white fill-current" />
                    </a>
                  )}
                  {customer?.phone && (
                    <a 
                      href={`tel:${customer.phone}`}
                      className="inline-flex justify-center items-center w-12 h-10 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-yaron-charcoal dark:text-white rounded-lg transition-colors"
                      title="Call"
                    >
                      <Phone size={18} />
                    </a>
                  )}
                  <Button 
                    variant="outline"
                    className="flex-1 h-10 border-green-500 text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                    onClick={() => handleTogglePaid(work.id, work.totalAmount)}
                  >
                    Mark Paid
                  </Button>
                </div>
              </div>
            );
          })}
          {pendingWorks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-green-500" />
              <p>No pending payments!</p>
            </div>
          )}
        </div>
      </Modal>

      <Modal isOpen={isTotalIncomeOpen} onClose={() => setIsTotalIncomeOpen(false)} title="Total Income Overview">
        <div className="p-6 bg-yaron-orange text-white rounded-2xl text-center shadow-md">
          <p className="text-sm font-medium text-white/80 mb-2 uppercase tracking-widest">Total Revenue Generated</p>
          <p className="text-4xl font-bold">{formatCurrency(totalIncome)}</p>
          <p className="text-sm text-white/80 mt-4">This includes all completed work payments and recorded incomes.</p>
        </div>
      </Modal>

      <Modal isOpen={isOverdueModalOpen} onClose={() => setIsOverdueModalOpen(false)} title="Overdue Works">
        <div className="space-y-4">
          {pendingWorks.filter(w => w.daysDue > 0).map(work => {
            const customer = getCustomer(work.customerId);
            return (
              <div key={work.id} className="p-4 border border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-yaron-charcoal dark:text-white">{work.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{customer?.name || work.customerId}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600 dark:text-red-400">{formatCurrency(work.pending)}</p>
                    <p className="text-xs text-red-500 mt-0.5 font-medium">Overdue {work.daysDue} days</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-red-100 dark:border-red-900/50">
                  {customer?.whatsapp && (
                    <a 
                      href={`https://wa.me/${customer.whatsapp.replace(/\D/g, '')}?text=${getWhatsAppMessage(work, customer)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex justify-center items-center w-12 h-10 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle size={18} className="text-white fill-current" />
                    </a>
                  )}
                  {customer?.phone && (
                    <a 
                      href={`tel:${customer.phone}`}
                      className="inline-flex justify-center items-center w-12 h-10 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-yaron-charcoal dark:text-white rounded-lg transition-colors"
                      title="Call"
                    >
                      <Phone size={18} />
                    </a>
                  )}
                  <Button 
                    variant="outline"
                    className="flex-1 h-10 border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => handleTogglePaid(work.id, work.totalAmount)}
                  >
                    Mark Paid
                  </Button>
                </div>
              </div>
            );
          })}
          {pendingWorks.filter(w => w.daysDue > 0).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-green-500" />
              <p>No overdue works!</p>
            </div>
          )}
        </div>
      </Modal>

      <QuickAttendanceModal 
        isOpen={isQuickAttendanceOpen} 
        onClose={() => navigate(-1)} 
      />
      
      <QuickTransactionModal 
        isOpen={isQuickLogOpen} 
        onClose={() => setIsQuickLogOpen(false)}
      />
      
      <ReceivePayModal
        isOpen={!!selectedReceivePayWork}
        onClose={() => setSelectedReceivePayWork(null)}
        work={selectedReceivePayWork}
      />
      
      <GlobalSearchModal 
        isOpen={isGlobalSearchOpen} 
        onClose={() => setIsGlobalSearchOpen(false)} 
      />
    </div>
  );
}
