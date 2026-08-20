import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { listenToWorks, listenToCustomers, listenToBookings, listenToExpenses, listenToIncomes } from '@/lib/api';

export default function GlobalDataProvider({ children }: { children: React.ReactNode }) {
  const { activeStudioId, setWorks, setCustomers, setExpenses, setIncomes, setBookings } = useAppStore();

  useEffect(() => {
    if (!activeStudioId) return;

    const unsubWorks = listenToWorks(activeStudioId, setWorks);
    const unsubCustomers = listenToCustomers(activeStudioId, setCustomers);
    const unsubExpenses = listenToExpenses(activeStudioId, setExpenses);
    const unsubIncomes = listenToIncomes(activeStudioId, setIncomes);
    const unsubBookings = listenToBookings(activeStudioId, setBookings);

    return () => {
      unsubWorks();
      unsubCustomers();
      unsubExpenses();
      unsubIncomes();
      unsubBookings();
    };
  }, [activeStudioId, setWorks, setCustomers, setExpenses, setIncomes, setBookings]);

  return <>{children}</>;
}
