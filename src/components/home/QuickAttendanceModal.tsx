import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAppStore } from '@/store/useAppStore';
import { listenToAttendance, createAttendance } from '@/lib/api';
import { format, isSameDay, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { CheckCircle2, Circle, FileText, Calendar as CalendarIcon, UserCheck } from 'lucide-react';
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

  // For Mark View
  const handleToggle = async (staffId: string, currentStatus: string) => {
    if (!activeStudioId) return;
    
    // Toggle logic: present -> absent -> present
    const newStatus = currentStatus === 'present' ? 'absent' : 'present';
    const id = `${staffId}_${selectedDate}`;
    
    await createAttendance({
      id,
      studioId: activeStudioId,
      staffId,
      date: new Date(selectedDate).getTime(),
      status: newStatus
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

    const stats: Record<string, { present: number, absent: number, total: number }> = {};
    
    staff.forEach(s => {
      stats[s.id] = { present: 0, absent: 0, total: 0 };
    });

    filtered.forEach(a => {
      if (stats[a.staffId]) {
        stats[a.staffId].total += 1;
        if (a.status === 'present') stats[a.staffId].present += 1;
        if (a.status === 'absent') stats[a.staffId].absent += 1;
      }
    });

    return stats;
  }, [attendances, reportFilter, customStart, customEnd, staff]);


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={view === 'mark' ? "Quick Attendance" : "Attendance Report"}>
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
        <button
          onClick={() => setView('mark')}
          className={cn("flex-1 py-1.5 rounded-lg text-sm font-bold flex items-center justify-center transition-colors", view === 'mark' ? "bg-white dark:bg-gray-700 shadow-sm text-yaron-charcoal dark:text-white" : "text-gray-500")}
        >
          <UserCheck size={16} className="mr-2" /> Mark
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

          <div className="space-y-3 mt-4">
            {staff.map(s => {
              const record = attendances.find(a => a.staffId === s.id && format(new Date(a.date), 'yyyy-MM-dd') === selectedDate);
              const status = record?.status || 'absent';
              const isPresent = status === 'present';

              return (
                <div key={s.id} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={() => handleToggle(s.id, status)}>
                  <div>
                    <p className="font-semibold text-yaron-charcoal dark:text-white">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.position}</p>
                  </div>
                  <div className={cn("flex items-center justify-center w-12 h-6 rounded-full transition-colors", isPresent ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700")}>
                    <div className={cn("w-5 h-5 bg-white rounded-full transition-transform", isPresent ? "translate-x-3" : "-translate-x-3")}></div>
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
              const stats = reportData[s.id] || { present: 0, absent: 0, total: 0 };
              return (
                <div key={s.id} className="p-3 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/30">
                  <p className="font-bold text-yaron-charcoal dark:text-white mb-2">{s.name}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 dark:text-green-400 font-semibold">{stats.present} Present</span>
                    <span className="text-red-500 font-semibold">{stats.absent} Absent</span>
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
