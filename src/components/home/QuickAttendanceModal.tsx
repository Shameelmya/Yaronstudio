import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAppStore } from '@/store/useAppStore';
import { listenToAttendance, createAttendance } from '@/lib/api';
import { format, isSameDay, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval, getMonth, getYear } from 'date-fns';
import { FileText, UserCheck, AlertTriangle, Coffee, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export const QuickAttendanceModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { staff, activeStudioId } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendances, setAttendances] = useState<any[]>([]);
  const [view, setView] = useState<'mark' | 'report'>('mark');

  // Report filters
  const [reportFilter, setReportFilter] = useState<'month' | 'week' | 'custom'>('month');
  const [customStart, setCustomStart] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    if (!activeStudioId || !isOpen) return;
    const unsub = listenToAttendance(activeStudioId, (data) => {
      setAttendances(data);
    });
    return () => unsub();
  }, [activeStudioId, isOpen]);

  // Calculate current month leave totals per staff
  const currentMonthLeaves = useMemo(() => {
    const today = new Date();
    const currentMonth = getMonth(today);
    const currentYear = getYear(today);
    
    const stats: Record<string, number> = {};
    staff.forEach(s => stats[s.id] = 0);

    attendances.forEach(a => {
      const aDate = new Date(a.date);
      if (getMonth(aDate) === currentMonth && getYear(aDate) === currentYear && (a.status === 'half_day' || a.status === 'full_day')) {
        // We use the recorded "value" (or fallbacks) to calculate total leaves taken
        const leaveValue = a.value || (a.status === 'half_day' ? 0.5 : 1);
        if (stats[a.staffId] !== undefined) {
          stats[a.staffId] += leaveValue;
        }
      }
    });
    return stats;
  }, [attendances, staff]);

  // For Mark View
  const handleSetLeave = async (staffId: string, type: 'half_day' | 'full_day' | 'present') => {
    if (!activeStudioId) return;
    
    const id = `${staffId}_${selectedDate}`;
    
    // Calculate leave value (doubled if quota exceeded, except if marking present)
    let value = 0;
    if (type !== 'present') {
      const currentTaken = currentMonthLeaves[staffId] || 0;
      const isDouble = currentTaken >= 10;
      
      if (type === 'half_day') value = isDouble ? 1 : 0.5;
      if (type === 'full_day') value = isDouble ? 2 : 1;
    }

    await createAttendance({
      id,
      studioId: activeStudioId,
      staffId,
      date: new Date(selectedDate).getTime(),
      status: type,
      value // Store the weight of the leave
    });
  };

  // For Report View
  const reportData = useMemo(() => {
    const today = new Date();
    let start = startOfMonth(today);
    let end = endOfMonth(today);

    if (reportFilter === 'week') {
      start = startOfWeek(today);
      end = endOfWeek(today);
    } else if (reportFilter === 'custom') {
      start = parseISO(customStart);
      end = parseISO(customEnd);
    }

    const filtered = attendances.filter(a => {
      const aDate = new Date(a.date);
      return isWithinInterval(aDate, { start, end });
    });

    const stats: Record<string, { present: number, leaves: number }> = {};
    
    staff.forEach(s => {
      stats[s.id] = { present: 0, leaves: 0 };
    });

    // Default assume present if no record? In a real system we'd calculate total working days.
    // For now we just sum the leaves taken in the period.
    filtered.forEach(a => {
      if (stats[a.staffId] && a.status !== 'present') {
        const leaveValue = a.value || (a.status === 'half_day' ? 0.5 : 1);
        stats[a.staffId].leaves += leaveValue;
      }
    });

    return stats;
  }, [attendances, reportFilter, customStart, customEnd, staff]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={view === 'mark' ? "Leave Management" : "Leave Report"}>
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
        <button
          onClick={() => setView('mark')}
          className={cn("flex-1 py-1.5 rounded-lg text-sm font-bold flex items-center justify-center transition-colors", view === 'mark' ? "bg-white dark:bg-gray-700 shadow-sm text-yaron-charcoal dark:text-white" : "text-gray-500")}
        >
          <UserCheck size={16} className="mr-2" /> Mark Leave
        </button>
        <button
          onClick={() => setView('report')}
          className={cn("flex-1 py-1.5 rounded-lg text-sm font-bold flex items-center justify-center transition-colors", view === 'report' ? "bg-white dark:bg-gray-700 shadow-sm text-yaron-charcoal dark:text-white" : "text-gray-500")}
        >
          <FileText size={16} className="mr-2" /> Report
        </button>
      </div>

      {view === 'mark' ? (
        <div className="space-y-4">
          <Input 
            type="date"
            label="Select Date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          <div className="space-y-4 mt-4">
            {staff.map(s => {
              const record = attendances.find(a => a.staffId === s.id && format(new Date(a.date), 'yyyy-MM-dd') === selectedDate);
              const status = record?.status || 'present';
              const leavesTaken = currentMonthLeaves[s.id] || 0;
              const limitExceeded = leavesTaken >= 10;

              return (
                <div key={s.id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/20">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-yaron-charcoal dark:text-white">{s.name}</p>
                      <p className="text-xs text-gray-500 font-medium">{s.position} • {leavesTaken}/10 Leaves</p>
                      
                      {limitExceeded && (
                        <div className="flex items-center text-red-500 mt-1">
                          <AlertTriangle size={12} className="mr-1" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Leave limit exceeded. Next leaves double.</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {status === 'present' ? (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-yaron-orange border-yaron-orange/50 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                          onClick={() => handleSetLeave(s.id, 'half_day')}
                        >
                          <Coffee size={14} className="mr-1.5" /> Half Day
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-red-600 border-red-500/50 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleSetLeave(s.id, 'full_day')}
                        >
                          <Home size={14} className="mr-1.5" /> Full Day
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white border-none"
                        onClick={() => handleSetLeave(s.id, 'present')}
                      >
                        Cancel {status === 'half_day' ? 'Half Day' : 'Full Day'} Leave
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            {staff.length === 0 && (
              <p className="text-center text-gray-500 text-sm">No staff members found.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex space-x-2 mb-4">
             {['month', 'week', 'custom'].map(f => (
               <button 
                 key={f}
                 onClick={() => setReportFilter(f as any)}
                 className={cn("px-3 py-1 text-xs font-bold rounded-lg capitalize", reportFilter === f ? "bg-yaron-charcoal text-white dark:bg-gray-700" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400")}
               >
                 {f}
               </button>
             ))}
          </div>

          {reportFilter === 'custom' && (
            <div className="flex space-x-2">
              <Input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="flex-1" />
              <Input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="flex-1" />
            </div>
          )}

          <div className="space-y-3 mt-4">
            {staff.map(s => {
              const stats = reportData[s.id] || { present: 0, leaves: 0 };
              return (
                <div key={s.id} className="p-3 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/30">
                  <p className="font-bold text-yaron-charcoal dark:text-white mb-2">{s.name}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-red-500 font-semibold">{stats.leaves} Total Leaves Deducted</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}
