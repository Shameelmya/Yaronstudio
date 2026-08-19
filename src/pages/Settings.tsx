import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Users, Settings as SettingsIcon, LogOut, Moon, Sun, Plus, Building2, Pencil } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';

export default function Settings() {
  const { theme, toggleTheme, studios, addStudio } = useAppStore();
  const [isAddStudioOpen, setIsAddStudioOpen] = useState(false);
  const [newStudioName, setNewStudioName] = useState('');
  const [newStudioAdmin, setNewStudioAdmin] = useState('');

  const handleAddStudio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudioName || !newStudioAdmin) return;
    
    addStudio({
      id: Date.now().toString(),
      name: newStudioName,
      adminName: newStudioAdmin,
    });
    setNewStudioName('');
    setNewStudioAdmin('');
    setIsAddStudioOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
      <div>
        <h1 className="text-2xl font-bold text-yaron-charcoal dark:text-white">Settings & More</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Manage studio staff, multiple studios, and app configuration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="flex flex-col dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-yaron-magenta/10 flex items-center justify-center text-yaron-magenta">
                <Building2 size={20} />
              </div>
              <h2 className="text-lg font-bold text-yaron-charcoal dark:text-white">Studios Management</h2>
            </div>
            
            <div className="space-y-3 flex-1 mb-4">
              {studios.map(studio => (
                <div key={studio.id} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div>
                    <p className="font-semibold text-yaron-charcoal dark:text-white">{studio.name}</p>
                    <p className="text-xs text-gray-500">Admin: {studio.adminName}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-gray-400">
                    <Pencil size={16} />
                  </Button>
                </div>
              ))}
            </div>
            <Button className="w-full mt-auto" onClick={() => setIsAddStudioOpen(true)}>
              <Plus size={18} className="mr-2" /> Add Studio
            </Button>
          </Card>

          <Card className="flex flex-col dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-yaron-magenta/10 flex items-center justify-center text-yaron-magenta">
                <Users size={20} />
              </div>
              <h2 className="text-lg font-bold text-yaron-charcoal dark:text-white">Staff Management</h2>
            </div>
            
            <div className="space-y-3 flex-1">
              <div className="flex justify-between items-center p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div>
                  <p className="font-semibold text-yaron-charcoal dark:text-white">Ameen</p>
                  <p className="text-xs text-gray-500">Audio Engineer</p>
                </div>
                <Button variant="outline" size="sm" className="dark:border-gray-700">Manage</Button>
              </div>
            </div>
            <Button className="w-full mt-4" variant="secondary">
              <Users size={18} className="mr-2" /> Add Staff Member
            </Button>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
                <SettingsIcon size={20} />
              </div>
              <h2 className="text-lg font-bold text-yaron-charcoal dark:text-white">Preferences</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  {theme === 'dark' ? <Moon size={16} className="text-gray-400" /> : <Sun size={16} className="text-gray-500" />}
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Dark Mode</span>
                </div>
                <button 
                  onClick={toggleTheme}
                  className={cn("w-12 h-6 rounded-full relative transition-colors focus:outline-none", theme === 'dark' ? "bg-yaron-magenta" : "bg-gray-200")}
                >
                  <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-transform", theme === 'dark' ? "left-7" : "left-1")}></div>
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Notifications</span>
                <button className="w-12 h-6 bg-yaron-magenta rounded-full relative cursor-pointer focus:outline-none">
                  <div className="absolute left-7 top-1 w-4 h-4 bg-white rounded-full transition-transform"></div>
                </button>
              </div>
            </div>
          </Card>

          <Card className="bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                <LogOut size={20} />
              </div>
              <h2 className="text-lg font-bold text-red-900 dark:text-red-400">Account</h2>
            </div>
            <p className="text-sm text-red-700 dark:text-red-500 mb-4">Currently logged in as admin@yaronstudio.com</p>
            <Button variant="danger" className="w-full">Sign Out</Button>
          </Card>
        </div>
      </div>

      <Modal isOpen={isAddStudioOpen} onClose={() => setIsAddStudioOpen(false)} title="Add New Studio">
        <form onSubmit={handleAddStudio} className="space-y-4">
          <Input 
            label="Studio Name" 
            placeholder="e.g. Yaron Studio 2"
            value={newStudioName}
            onChange={e => setNewStudioName(e.target.value)}
            autoFocus
          />
          <Input 
            label="Admin Name" 
            placeholder="e.g. Shibili"
            value={newStudioAdmin}
            onChange={e => setNewStudioAdmin(e.target.value)}
          />
          <div className="pt-4 flex space-x-3">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsAddStudioOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={!newStudioName || !newStudioAdmin}>Add Studio</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
