import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Studio, Staff, Work, Customer, Expense } from '../types';

interface AppState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  
  works: Work[];
  setWorks: (works: Work[]) => void;
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  expenses: Expense[];
  setExpenses: (expenses: Expense[]) => void;
  incomes: any[];
  setIncomes: (incomes: any[]) => void;
  bookings: any[];
  setBookings: (bookings: any[]) => void;
  
  studios: Studio[];
  setStudios: (studios: Studio[]) => void;
  activeStudioId: string | null;
  addStudio: (studio: Studio) => void;
  updateStudio: (id: string, updates: Partial<Studio>) => void;
  deleteStudio: (id: string) => void;
  setActiveStudio: (id: string) => void;

  staff: Staff[];
  setStaff: (staff: Staff[]) => void;
  addStaff: (staffMember: Staff) => void;
  updateStaff: (id: string, updates: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;

  customServices: string[];
  addCustomService: (service: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      
      works: [],
      setWorks: (works) => set({ works }),
      customers: [],
      setCustomers: (customers) => set({ customers }),
      expenses: [],
      setExpenses: (expenses) => set({ expenses }),
      incomes: [],
      setIncomes: (incomes) => set({ incomes }),
      bookings: [],
      setBookings: (bookings) => set({ bookings }),
      
      studios: [],
      setStudios: (studios) => set((state) => {
        // If there's no active studio and we loaded some, pick the first one
        if (!state.activeStudioId && studios.length > 0) {
          return { studios, activeStudioId: studios[0].id };
        }
        // If active studio was deleted, pick the first one
        if (state.activeStudioId && !studios.find(s => s.id === state.activeStudioId) && studios.length > 0) {
          return { studios, activeStudioId: studios[0].id };
        }
        return { studios };
      }),
      activeStudioId: null,
      
      addStudio: (studio) => set((state) => ({ studios: [...state.studios, studio] })),
      updateStudio: (id, updates) => set((state) => ({
        studios: state.studios.map(s => s.id === id ? { ...s, ...updates } : s)
      })),
      deleteStudio: (id) => set((state) => ({
        studios: state.studios.filter(s => s.id !== id),
        activeStudioId: state.activeStudioId === id ? (state.studios.find(s => s.id !== id)?.id || null) : state.activeStudioId
      })),
      setActiveStudio: (id) => set({ activeStudioId: id }),

      staff: [],
      setStaff: (staff) => set({ staff }),
      addStaff: (staffMember) => set((state) => ({ staff: [...state.staff, staffMember] })),
      updateStaff: (id, updates) => set((state) => ({
        staff: state.staff.map(s => s.id === id ? { ...s, ...updates } : s)
      })),
      deleteStaff: (id) => set((state) => ({ staff: state.staff.filter(s => s.id !== id) })),

      customServices: [],
      addCustomService: (service) => set((state) => {
        if (!state.customServices.includes(service)) {
          return { customServices: [...state.customServices, service] };
        }
        return state;
      }),
    }),
    {
      name: 'yaron-app-storage',
    }
  )
);
