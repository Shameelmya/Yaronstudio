import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Studio } from '../types';

interface AppState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  
  studios: Studio[];
  activeStudioId: string | null;
  addStudio: (studio: Studio) => void;
  updateStudio: (id: string, updates: Partial<Studio>) => void;
  setActiveStudio: (id: string) => void;

  customServices: string[];
  addCustomService: (service: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      
      studios: [
        { id: '1', name: 'Yaron Studio 1', adminName: 'Shibili' }
      ],
      activeStudioId: '1',
      
      addStudio: (studio) => set((state) => ({ studios: [...state.studios, studio] })),
      updateStudio: (id, updates) => set((state) => ({
        studios: state.studios.map(s => s.id === id ? { ...s, ...updates } : s)
      })),
      setActiveStudio: (id) => set({ activeStudioId: id }),

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
