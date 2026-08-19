import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Users, Settings as SettingsIcon, LogOut, Shield, Database, Cloud } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
      <div>
        <h1 className="text-2xl font-bold text-yaron-charcoal">Settings & More</h1>
        <p className="text-gray-500 text-sm">Manage studio staff and app configuration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-yaron-magenta/10 flex items-center justify-center text-yaron-magenta">
              <Users size={20} />
            </div>
            <h2 className="text-lg font-bold text-yaron-charcoal">Staff Management</h2>
          </div>
          
          <div className="space-y-3 flex-1">
            <div className="flex justify-between items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
              <div>
                <p className="font-semibold text-yaron-charcoal">Ameen</p>
                <p className="text-xs text-gray-500">Audio Engineer</p>
              </div>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
          </div>
          <Button className="w-full mt-4" variant="secondary">
            <Users size={18} className="mr-2" /> Add Staff Member
          </Button>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                <SettingsIcon size={20} />
              </div>
              <h2 className="text-lg font-bold text-yaron-charcoal">Preferences</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Dark Mode</span>
                <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Notifications</span>
                <div className="w-12 h-6 bg-yaron-magenta rounded-full relative cursor-pointer">
                  <div className="absolute left-7 top-1 w-4 h-4 bg-white rounded-full transition-transform"></div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-red-50 border-red-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                <LogOut size={20} />
              </div>
              <h2 className="text-lg font-bold text-red-900">Account</h2>
            </div>
            <p className="text-sm text-red-700 mb-4">Currently logged in as admin@yaronstudio.com</p>
            <Button variant="danger" className="w-full">Sign Out</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
