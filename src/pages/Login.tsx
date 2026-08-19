import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { Moon, Sun, Lock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useAppStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("min-h-screen flex items-center justify-center p-4 transition-colors", theme === 'dark' ? 'dark bg-gray-950 text-white' : 'bg-yaron-light')}>
      <div className="absolute top-4 right-4">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {theme === 'dark' ? <Sun size={20} className="text-gray-400" /> : <Moon size={20} className="text-gray-500" />}
        </button>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-8">
          <img src="/yaron logo.png" alt="Yaron Studio" className="h-16 w-16 object-contain mb-4" />
          <h1 className="text-2xl font-bold text-yaron-charcoal dark:text-white">Welcome Back</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Sign in to Yaron Studio Dashboard</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm flex items-start space-x-2">
            <Lock size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="admin@yaronstudio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12"
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12"
          />
          
          <Button 
            type="submit" 
            className="w-full h-12 text-base font-bold bg-yaron-gradient border-none mt-2"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
