import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { Plus, IndianRupee, Clock, TrendingUp, AlertCircle, Music, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/store/useAppStore';
import { listenToWorks, listenToBookings, updateBookingStatus } from '@/lib/api';
import { format, isBefore, startOfDay } from 'date-fns';
import { UserCheck } from 'lucide-react';
import { QuickAttendanceModal } from '@/components/home/QuickAttendanceModal';

export default function Home() {
  const navigate = useNavigate();
  const [isOverdueModalOpen, setIsOverdueModalOpen] = useState(false);
  const [selectedOverdueWork, setSelectedOverdueWork] = useState<any>(null);

  const [overdueWorks, setOverdueWorks] = useState<any[]>([]);
  const [recentWorks, setRecentWorks] = useState<any[]>([]);
  const [todayBookings, setTodayBookings] = useState<any[]>([]);
  
  const [totalPendingPayments, setTotalPendingPayments] = useState(0);
  const [incomeThisMonth, setIncomeThisMonth] = useState(0);
  const [activeWorksCount, setActiveWorksCount] = useState(0);
  
  const [isQuickAttendanceOpen, setIsQuickAttendanceOpen] = useState(false);
  
  const { activeStudioId } = useAppStore();
  
  useEffect(() => {
    if (!activeStudioId) return;
    
    const unsubWorks = listenToWorks(activeStudioId, (works) => {
      const today = startOfDay(new Date());
      const overdue = works.filter(w => w.status !== 'completed' && w.status !== 'delivered' && w.dueDate && isBefore(w.dueDate, today)).map(w => ({
        id: w.id, title: w.title, customer: w.customerId, due: format(w.dueDate!, 'yyyy-MM-dd'), pending: w.totalAmount - (w.paidAmount || 0)
      }));
      setOverdueWorks(overdue);
      
      const recent = works.slice(0, 3).map(w => ({
         id: w.id, title: w.title, pending: w.totalAmount - (w.paidAmount || 0)
      }));
      setRecentWorks(recent);

      let pending = 0;
      let income = 0;
      let active = 0;
      
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      works.forEach(w => {
        const amtPending = w.totalAmount - (w.paidAmount || 0);
        if (amtPending > 0) pending += amtPending;
        if (w.status === 'pending' || w.status === 'in_progress') active++;
        
        // Very basic income calculation based on works created this month
        // In a more complex app, we'd look at payment transaction dates or the expenses collection
        if (w.createdAt && w.createdAt.getMonth() === currentMonth && w.createdAt.getFullYear() === currentYear) {
           income += (w.paidAmount || 0);
        }
      });

      setTotalPendingPayments(pending);
      setActiveWorksCount(active);
      setIncomeThisMonth(income);
    });
    
    const unsubBookings = listenToBookings(activeStudioId, (bookings) => {
      const todayString = format(new Date(), 'yyyy-MM-dd');
      const todaySessions = bookings
        .filter(b => format(new Date(b.date), 'yyyy-MM-dd') === todayString)
        .map(b => ({
          id: b.id, title: b.service, work: 'Work ID: ' + b.workId, customer: b.customerId, time: new Date(b.date), status: b.status
        }));
      setTodayBookings(todaySessions);
    });

    return () => { unsubWorks(); unsubBookings(); };
  }, [activeStudioId]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-yaron-charcoal dark:text-white">Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Welcome to Yaron Studio</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={() => setIsQuickAttendanceOpen(true)} size="icon" variant="outline" className="w-10 h-10 rounded-full border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm text-yaron-charcoal dark:text-white">
            <UserCheck size={18} />
          </Button>
          <Button onClick={() => navigate('/works?new=true')} size="icon" className="w-12 h-12 rounded-full shadow-md bg-yaron-gradient border-none hover:opacity-90">
            <Plus size={24} className="text-white" />
          </Button>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 hide-scrollbar">
        
        {/* Overdue Works Counter */}
        <Card 
          className="bg-red-500 border-none shadow-sm relative overflow-hidden cursor-pointer hover:shadow-md transition-all group min-w-[160px] flex-1 shrink-0 snap-center p-4"
          onClick={() => setIsOverdueModalOpen(true)}
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shadow-sm shrink-0">
              <AlertCircle className="text-white" size={16} />
            </div>
            <span className="text-white text-xs font-medium whitespace-nowrap">Overdue</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{overdueWorks.length}</p>
        </Card>

        <Card className="bg-yaron-magenta border-none shadow-sm relative overflow-hidden min-w-[160px] flex-1 shrink-0 snap-center p-4">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shadow-sm shrink-0">
              <Clock className="text-white" size={16} />
            </div>
            <span className="text-white text-xs font-medium whitespace-nowrap">Pending</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{formatCurrency(totalPendingPayments)}</p>
        </Card>

        <Card className="bg-yaron-orange border-none shadow-sm relative overflow-hidden min-w-[160px] flex-1 shrink-0 snap-center p-4">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shadow-sm shrink-0">
              <TrendingUp className="text-white" size={16} />
            </div>
            <span className="text-white text-xs font-medium whitespace-nowrap">Income (Mo)</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{formatCurrency(incomeThisMonth)}</p>
        </Card>

        <Card className="bg-yaron-purple border-none shadow-sm relative overflow-hidden min-w-[160px] flex-1 shrink-0 snap-center p-4">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shadow-sm shrink-0">
              <Music className="text-white" size={16} />
            </div>
            <span className="text-white text-xs font-medium whitespace-nowrap">Active</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{activeWorksCount}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Sessions */}
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">{session.customer} • {session.work}</p>
                  </div>
                </div>
                {session.status !== 'completed' ? (
                  <Button size="sm" className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white border-none shadow-sm" onClick={() => updateBookingStatus(session.id, 'completed')}>
                    <CheckCircle2 size={16} className="mr-1.5" /> Mark as Done
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

        {/* Recent Works */}
        <Card className="flex flex-col dark:bg-gray-900 dark:border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-yaron-charcoal dark:text-white">Recent Works</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/works')}>View All</Button>
          </div>
          <div className="space-y-4 flex-1">
            {recentWorks.map((work) => (
              <div key={work.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                <div>
                  <p className="font-semibold text-yaron-charcoal dark:text-white">{work.title}</p>
                  {work.pending > 0 ? (
                    <p className="text-sm font-medium text-yaron-orange mt-0.5">Pending: {formatCurrency(work.pending)}</p>
                  ) : (
                    <p className="text-sm font-bold text-green-500 mt-0.5">Fully Paid</p>
                  )}
                </div>
                {work.pending > 0 && (
                  <Button variant="outline" size="sm" className="dark:border-gray-600 dark:hover:bg-gray-700" onClick={() => navigate('/works')}>Receive Pay</Button>
                )}
              </div>
            ))}
            {recentWorks.length === 0 && (
               <div className="text-center text-gray-500 py-6">No recent works available.</div>
            )}
          </div>
        </Card>
      </div>

      <Modal isOpen={isOverdueModalOpen} onClose={() => { setIsOverdueModalOpen(false); setSelectedOverdueWork(null); }} title="Overdue Works">
        {selectedOverdueWork ? (
           <div className="space-y-4">
             <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                <h3 className="font-bold text-lg text-yaron-charcoal dark:text-white mb-1">{selectedOverdueWork.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Customer: <span className="font-semibold">{selectedOverdueWork.customer}</span></p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-red-600 dark:text-red-400">Due: {selectedOverdueWork.due}</span>
                  <span className="font-bold text-yaron-orange">Pending: {formatCurrency(selectedOverdueWork.pending)}</span>
                </div>
             </div>
             
             <div className="flex space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedOverdueWork(null)}>Back to List</Button>
                <Button className="flex-1" onClick={() => navigate('/works')}>Open Work Details</Button>
             </div>
           </div>
        ) : (
          <div className="space-y-3">
            {overdueWorks.map(work => (
              <div 
                key={work.id} 
                onClick={() => setSelectedOverdueWork(work)}
                className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-red-200 dark:hover:border-red-900/50 hover:bg-red-50/50 dark:hover:bg-red-900/10 cursor-pointer transition-all flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-yaron-charcoal dark:text-white">{work.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{work.customer} • Due: {work.due}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-yaron-orange text-sm">{formatCurrency(work.pending)}</p>
                </div>
              </div>
            ))}
            {overdueWorks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 size={32} className="mx-auto mb-2 text-green-500" />
                <p>No overdue works!</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <QuickAttendanceModal isOpen={isQuickAttendanceOpen} onClose={() => setIsQuickAttendanceOpen(false)} />
    </div>
  );
}
