import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Play, Pause, Lock, Unlock, Download, ShieldCheck, Headphones, Film } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function DeliveryPortal() {
  const { id } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false); // Controlled by payment status

  // Mock data
  const work = {
    title: 'Ente Pattu',
    customerName: 'Shibili Moonnakkal',
    pendingAmount: 15000,
    files: [
      { id: 1, type: 'audio', name: 'Ente_Pattu_Master.wav', size: '45 MB' },
      { id: 2, type: 'audio', name: 'Ente_Pattu_Master.mp3', size: '8 MB' },
      { id: 3, type: 'video', name: 'Instagram_Reel.mp4', size: '24 MB' }
    ]
  };

  const handlePay = () => {
    // Open payment gateway and then verify backend
    setTimeout(() => {
      setIsUnlocked(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="w-full bg-white shadow-sm border-b border-gray-100 flex justify-center py-4">
        <img src="/yaron logo.png" alt="Yaron Studio" className="h-10 object-contain" />
      </div>

      <div className="w-full max-w-2xl px-4 py-8 sm:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-yaron-magenta tracking-wider uppercase mb-2">Project Ready</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-yaron-charcoal mb-2">{work.title}</h1>
          <p className="text-gray-500">Prepared for {work.customerName}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-8 relative">
          
          <div className="p-6 sm:p-8 border-b border-gray-100 bg-gradient-to-br from-yaron-magenta/5 to-yaron-purple/5">
            <h2 className="text-lg font-bold text-yaron-charcoal mb-4 flex items-center">
              <Headphones size={20} className="mr-2 text-yaron-magenta" />
              Audio Preview (30s limit)
            </h2>
            
            <div className="bg-white rounded-2xl p-4 flex items-center space-x-4 shadow-sm">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-14 h-14 shrink-0 rounded-full bg-yaron-charcoal text-white flex items-center justify-center hover:bg-black transition-all"
              >
                {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
              </button>
              
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-yaron-charcoal">Ente_Pattu_Master.mp3</span>
                  <span className="text-gray-500">00:00 / 00:30</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-yaron-gradient rounded-full"></div>
                </div>
              </div>
            </div>

            {!isUnlocked && (
               <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start border border-red-100">
                 <ShieldCheck size={16} className="shrink-0 mr-2 mt-0.5" />
                 <p>Preview ends at 30 seconds. Full access requires pending payment.</p>
               </div>
            )}
          </div>

          <div className="p-6 sm:p-8">
            <h2 className="text-lg font-bold text-yaron-charcoal mb-4">Project Files</h2>
            
            <div className="space-y-3">
              {work.files.map(file => (
                <div key={file.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-500">
                      {file.type === 'audio' ? <Headphones size={18} /> : <Film size={18} />}
                    </div>
                    <div>
                      <p className="font-medium text-yaron-charcoal text-sm">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.size}</p>
                    </div>
                  </div>
                  
                  {isUnlocked ? (
                    <Button variant="ghost" size="icon" className="text-yaron-magenta hover:bg-yaron-magenta/10">
                      <Download size={18} />
                    </Button>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                      <Lock size={14} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Payment Gate overlay */}
          {!isUnlocked && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent pt-12 flex flex-col items-center justify-end">
              <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full border border-gray-100 text-center">
                <Lock size={32} className="mx-auto text-yaron-orange mb-3" />
                <h3 className="text-xl font-bold text-yaron-charcoal mb-1">Unlock Full Access</h3>
                <p className="text-gray-500 text-sm mb-4">Complete pending payment to download files</p>
                
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl mb-6">
                  <span className="font-semibold text-gray-700">Pending Amount</span>
                  <span className="text-xl font-bold text-yaron-charcoal">{formatCurrency(work.pendingAmount)}</span>
                </div>
                
                <Button onClick={handlePay} className="w-full text-lg h-14 bg-yaron-gradient border-none">
                  PAY & UNLOCK
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <p className="text-center text-sm text-gray-400">
          Secure digital delivery powered by <span className="font-semibold">Yaron Studio</span>
        </p>
      </div>
    </div>
  );
}
