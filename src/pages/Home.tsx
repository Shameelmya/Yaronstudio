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

export default function Home() {
  const navigate = useNavigate();
  const [isOverdueModalOpen, setIsOverdueModalOpen] = useState(false);
  const [selectedOverdueWork, setSelectedOverdueWork] = useState<any>(null);

  const [overdueWorks, setOverdueWorks] = useState<any[]>([]);
  const [recentWorks, setRecentWorks] = useState<any[]>([]);
  const [todayBookings, setTodayBookings] = useState<any[]>([]);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-yaron-charcoal dark:text-white">Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Welcome to Yaron Studio</p>
        </div>
        <Button onClick={() => navigate('/works?new=true')} className="w-full sm:w-auto shadow-md h-12 text-base bg-yaron-gradient border-none">
          <Plus size={20} className="mr-2" />
          New Work
        </Button>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Overdue Works Counter */}
        <Card 
          className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-900/10 border-red-200 dark:border-red-900/30 shadow-sm relative overflow-hidden cursor-pointer hover:shadow-md transition-all group"
          onClick={() => setIsOverdueModalOpen(true)}
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all"></div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-red-900/50 flex items-center justify-center shadow-sm">
              <AlertCircle className="text-red-500 dark:text-red-400" size={20} />
            </div>
            <span className="text-red-900 dark:text-red-300 font-medium">Overdue Works</span>
          </div>
          <p className="text-3xl font-bold text-red-700 dark:text-red-400 mt-4">2</p>
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center">View List &rarr;</span>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yaron-magenta/5 to-yaron-purple/5 dark:from-yaron-magenta/10 dark:to-yaron-purple/10 border-none shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-yaron-magenta/10 rounded-full blur-2xl"></div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
              <Clock className="text-yaron-magenta" size={20} />
            </div>
            <span className="text-gray-600 dark:text-gray-300 font-medium">Pending Payments</span>
          </div>
          <p className="text-3xl font-bold text-yaron-charcoal dark:text-white mt-4">{formatCurrency(125000)}</p>
        </Card>

        <Card className="bg-gradient-to-br from-yaron-orange/5 to-yaron-gold/5 dark:from-yaron-orange/10 dark:to-yaron-gold/10 border-none shadow-sm relative overflow-hidden">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-yaron-orange/10 rounded-full blur-2xl"></div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
              <TrendingUp className="text-yaron-orange" size={20} />
            </div>
            <span className="text-gray-600 dark:text-gray-300 font-medium">Income (This Month)</span>
          </div>
          <p className="text-3xl font-bold text-yaron-charcoal dark:text-white mt-4">{formatCurrency(450000)}</p>
        </Card>

        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-yaron-purple/10 dark:bg-yaron-purple/20 flex items-center justify-center shadow-sm">
              <Music className="text-yaron-purple dark:text-purple-400" size={20} />
            </div>
            <span className="text-gray-600 dark:text-gray-300 font-medium">Active Works</span>
          </div>
          <p className="text-2xl font-bold text-yaron-charcoal dark:text-white mt-4">24</p>
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
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700 gap-3">
                <div className="flex items-center space-x-4">
                  <div className="text-center w-16 shrink-0 bg-white dark:bg-gray-900 py-1.5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-bold text-yaron-magenta">10:00</p>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase">AM</p>
                  </div>
                  <div>
                    <p className="font-semibold text-yaron-charcoal dark:text-white">Vocal Recording</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Shibili • Ente Pattu</p>
                  </div>
                </div>
                <Button size="sm" className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white border-none shadow-sm">
                  <CheckCircle2 size={16} className="mr-1.5" /> Mark as Done
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Works */}
        <Card className="flex flex-col dark:bg-gray-900 dark:border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-yaron-charcoal dark:text-white">Recent Works</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/works')}>View All</Button>
          </div>
          <div className="space-y-4 flex-1">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                <div>
                  <p className="font-semibold text-yaron-charcoal dark:text-white">Album Song 0{i+1}</p>
                  <p className="text-sm font-medium text-yaron-orange mt-0.5">Pending: {formatCurrency(5000)}</p>
                </div>
                <Button variant="outline" size="sm" className="dark:border-gray-600 dark:hover:bg-gray-700">Receive Pay</Button>
              </div>
            ))}
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
                <Button className="flex-1">Open Work Details</Button>
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
    </div>
  );
}
