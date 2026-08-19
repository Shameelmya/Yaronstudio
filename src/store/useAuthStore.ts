import { create } from 'zustand';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  // Listen for auth state changes
  onAuthStateChanged(auth, (user) => {
    set({ user, loading: false });
  });

  return {
    user: null,
    loading: true,
    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),
    signOut: async () => {
      try {
        await firebaseSignOut(auth);
        set({ user: null });
      } catch (error) {
        console.error("Error signing out:", error);
      }
    },
  };
});
