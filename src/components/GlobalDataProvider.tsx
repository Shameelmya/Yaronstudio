import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { listenToWorks, listenToCustomers, listenToBookings, listenToExpenses, listenToIncomes } from '@/lib/api';

export default function GlobalDataProvider({ children }: { children: React.ReactNode }) {
  const { activeStudioId, setWorks, setCustomers, setExpenses, setIncomes } = useAppStore();

  useEffect(() => {
    if (!activeStudioId) return;

    const unsubWorks = listenToWorks(activeStudioId, setWorks);
    const unsubCustomers = listenToCustomers(activeStudioId, setCustomers);
    const unsubExpenses = listenToExpenses(activeStudioId, setExpenses);
    const unsubIncomes = listenToIncomes(activeStudioId, setIncomes);

    // Currently Bookings aren't globally needed everywhere but let's keep it here if we want or just let Bookings page load it.
    // For now, works and customers are the biggest ones causing lag.

    return () => {
      unsubWorks();
      unsubCustomers();
      unsubExpenses();
      unsubIncomes();
    };
  }, [activeStudioId, setWorks, setCustomers, setExpenses, setIncomes]);

  return <>{children}</>;
}
