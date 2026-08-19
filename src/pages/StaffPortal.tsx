import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Users, CheckCircle, IndianRupee, Calendar as CalendarIcon, Clock, XCircle, ArrowLeft } from 'lucide-react';
import { listenToAttendance, listenToSalaryPayments, createAttendance, paySalary } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, isToday } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function StaffPortal() {
  const navigate = useNavigate();
  const { staff, activeStudioId } = useAppStore();
  const [attendances, setAttendances] = useState<any[]>([]);
  const [salaryPayments, setSalaryPayments] = useState<any[]>([]);
  
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!activeStudioId) return;
    const unsubAttendance = listenToAttendance(activeStudioId, setAttendances);
    const unsubSalaries = listenToSalaryPayments(activeStudioId, setSalaryPayments);
    return () => {
      unsubAttendance();
      unsubSalaries();
    };
  }, [activeStudioId]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const currentMonthStr = format(new Date(), 'yyyy-MM');

  // Stats
  const activeStaff = staff.filter(s => s.status !== 'inactive');
  const presentToday = attendances.filter(a => format(new Date(a.date), 'yyyy-MM-dd') === todayStr && a.status === 'present').length;
  
  const currentMonthPayments = salaryPayments.filter(p => p.month === currentMonthStr && p.studioId === activeStudioId);
  const totalSalaryGivenThisMonth = currentMonthPayments.reduce((acc, curr) => acc + curr.amount, 0);

  const getStaffTodayAttendance = (staffId: string) => {
    return attendances.find(a => a.staffId === staffId && format(new Date(a.date), 'yyyy-MM-dd') === todayStr);
  };

  const getStaffMonthPayment = (staffId: string) => {
    return currentMonthPayments.find(p => p.staffId === staffId);
  };

  const markAttendance = async (staffId: string, status: 'present' | 'absent' | 'half_day') => {
    setIsProcessing(true);
    try {
      const id = `${staffId}_${todayStr}`;
      await createAttendance({
        id,
        staffId,
        date: Date.now(),
        status
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaySalary = async (staffMember: any) => {
    if (!activeStudioId) return;
    setIsProcessing(true);
    try {
      await paySalary({
        id: `${staffMember.id}_${currentMonthStr}`,
        studioId: activeStudioId,
        staffId: staffMember.id,
        month: currentMonthStr,
        amount: staffMember.salary || 0,
        datePaid: Date.now()
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} className="dark:text-gray-300">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-yaron-charcoal dark:text-white">Staff Portal</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage attendance and salaries</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center p-4 space-x-4 dark:bg-gray-900 dark:border-gray-800">
          <div className="w-12 h-12 rounded-xl bg-yaron-magenta/10 flex items-center justify-center text-yaron-magenta">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Active Staff</p>
            <p className="text-2xl font-bold text-yaron-charcoal dark:text-white">{activeStaff.length}</p>
          </div>
        </Card>
        <Card className="flex items-center p-4 space-x-4 dark:bg-gray-900 dark:border-gray-800">
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Present Today</p>
            <p className="text-2xl font-bold text-yaron-charcoal dark:text-white">{presentToday} / {activeStaff.length}</p>
          </div>
        </Card>
        <Card className="flex items-center p-4 space-x-4 dark:bg-gray-900 dark:border-gray-800">
          <div className="w-12 h-12 rounded-xl bg-yaron-orange/10 flex items-center justify-center text-yaron-orange">
            <IndianRupee size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Salary Paid ({format(new Date(), 'MMM')})</p>
            <p className="text-2xl font-bold text-yaron-charcoal dark:text-white">{formatCurrency(totalSalaryGivenThisMonth)}</p>
          </div>
        </Card>
      </div>

      <Card className="flex-1 overflow-auto dark:bg-gray-900 dark:border-gray-800">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-yaron-charcoal dark:text-white">Staff Directory</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">Date: {format(new Date(), 'dd MMM yyyy')}</span>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {activeStaff.map(member => {
            const todayAtt = getStaffTodayAttendance(member.id);
            const monthPay = getStaffMonthPayment(member.id);

            return (
              <div key={member.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={() => { setSelectedStaff(member); setIsModalOpen(true); }}>
                <div className="mb-4 md:mb-0">
                  <p className="font-bold text-yaron-charcoal dark:text-white">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.position} • Base: {formatCurrency(member.salary || 0)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1",
                    todayAtt?.status === 'present' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    todayAtt?.status === 'absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    todayAtt?.status === 'half_day' ? 'bg-yaron-orange/20 text-yaron-orange dark:bg-orange-900/30 dark:text-orange-400' :
                    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  )}>
                    <CalendarIcon size={12} />
                    <span>{todayAtt ? todayAtt.status.replace('_', ' ').toUpperCase() : 'NO ATTENDANCE LOGGED'}</span>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1",
                    monthPay ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  )}>
                    <IndianRupee size={12} />
                    <span>{monthPay ? 'SALARY PAID' : 'SALARY PENDING'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Manage: ${selectedStaff?.name}`}>
        {selectedStaff && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Today's Attendance</h3>
              <div className="flex gap-2">
                <Button 
                  disabled={isProcessing || getStaffTodayAttendance(selectedStaff.id)?.status === 'present'} 
                  onClick={() => markAttendance(selectedStaff.id, 'present')}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white border-none"
                >
                  <CheckCircle size={16} className="mr-1" /> Present
                </Button>
                <Button 
                  disabled={isProcessing || getStaffTodayAttendance(selectedStaff.id)?.status === 'half_day'} 
                  onClick={() => markAttendance(selectedStaff.id, 'half_day')}
                  className="flex-1 bg-yaron-orange hover:bg-orange-600 text-white border-none"
                >
                  <Clock size={16} className="mr-1" /> Half Day
                </Button>
                <Button 
                  disabled={isProcessing || getStaffTodayAttendance(selectedStaff.id)?.status === 'absent'} 
                  onClick={() => markAttendance(selectedStaff.id, 'absent')}
                  variant="danger" 
                  className="flex-1"
                >
                  <XCircle size={16} className="mr-1" /> Absent
                </Button>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Monthly Salary ({format(new Date(), 'MMMM yyyy')})</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-yaron-charcoal dark:text-white">{formatCurrency(selectedStaff.salary || 0)}</p>
                  <p className="text-xs text-gray-500">Base Salary</p>
                </div>
                {getStaffMonthPayment(selectedStaff.id) ? (
                  <div className="px-4 py-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg font-bold flex items-center">
                    <CheckCircle size={16} className="mr-2" /> Paid
                  </div>
                ) : (
                  <Button 
                    onClick={() => handlePaySalary(selectedStaff)} 
                    disabled={isProcessing || !selectedStaff.salary}
                    className="bg-yaron-gradient border-none text-white shadow-md"
                  >
                    Mark as Paid
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">Marking as paid will automatically log a salary expense in your Finance dashboard.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
