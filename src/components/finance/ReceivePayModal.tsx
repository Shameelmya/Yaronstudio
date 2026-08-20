import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { updateWork } from '@/lib/api';

interface ReceivePayModalProps {
  isOpen: boolean;
  onClose: () => void;
  work: any; // The selected work object
}

export function ReceivePayModal({ isOpen, onClose, work }: ReceivePayModalProps) {
  const [payAmount, setPayAmount] = useState('');
  const [loading, setLoading] = useState(false);

  if (!work) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(payAmount);
    const pendingAmount = work.totalAmount - (work.paidAmount || 0);
    
    if (!amount || amount <= 0) return;
    if (amount > pendingAmount) {
      alert(`Amount cannot exceed the pending limit of ₹${pendingAmount}`);
      setPayAmount(String(pendingAmount));
      return;
    }

    try {
      setLoading(true);
      const newPaidAmount = (work.paidAmount || 0) + amount;
      await updateWork(work.id, {
        paidAmount: newPaidAmount
      });
      setPayAmount('');
      onClose();
    } catch (error) {
      console.error('Failed to update payment', error);
      alert('Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receive Payment">
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <p className="text-sm text-gray-500">Work</p>
        <p className="font-bold text-yaron-charcoal dark:text-white">{work.title}</p>
        <div className="flex justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm">Total: ₹{work.totalAmount}</span>
          <span className="text-sm font-bold text-yaron-orange">Pending: ₹{work.totalAmount - (work.paidAmount || 0)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-yaron-charcoal dark:text-gray-300">Amount Received (₹)</label>
          <button 
            type="button" 
            className="text-xs text-yaron-magenta font-semibold hover:underline"
            onClick={() => setPayAmount(String(work.totalAmount - (work.paidAmount || 0)))}
          >
            Full Amount
          </button>
        </div>
        <Input 
          placeholder="0"
          type="number"
          value={payAmount}
          onChange={e => {
            const val = Number(e.target.value);
            const pendingAmount = work.totalAmount - (work.paidAmount || 0);
            if (val > pendingAmount) {
               alert(`Amount cannot exceed the pending limit of ₹${pendingAmount}`);
               setPayAmount(String(pendingAmount));
            } else {
               setPayAmount(e.target.value);
            }
          }}
          max={work.totalAmount - (work.paidAmount || 0)}
          required
          autoFocus
        />

        <div className="pt-4 flex space-x-3">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white border-none" disabled={loading}>
            {loading ? 'Processing...' : 'Receive'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
