import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { addExpense } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';

interface NewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewExpenseModal({ isOpen, onClose }: NewExpenseModalProps) {
  const { activeStudioId } = useAppStore();
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Equipment',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudioId) return;

    try {
      setLoading(true);
      await addExpense({
        id: Date.now().toString(),
        studioId: activeStudioId,
        title: formData.title,
        amount: Number(formData.amount),
        category: formData.category as any,
        date: new Date(formData.date).getTime(),
      });
      onClose();
      setFormData({
        title: '',
        amount: '',
        category: 'Equipment',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Failed to add expense', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Expense">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Expense Title"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          required
          autoFocus
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Amount (₹)"
            type="number"
            value={formData.amount}
            onChange={e => setFormData({ ...formData, amount: e.target.value })}
            required
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
            <select 
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm rounded-lg px-3 h-12 dark:text-white focus:outline-none"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="Equipment">Equipment</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Rent">Rent</option>
              <option value="Salary">Salary</option>
              <option value="Marketing">Marketing</option>
              <option value="Utilities">Utilities</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <Input 
          label="Date"
          type="date"
          value={formData.date}
          onChange={e => setFormData({ ...formData, date: e.target.value })}
          required
        />

        <div className="pt-4 flex space-x-3">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" className="flex-1 bg-yaron-gradient text-white border-none" disabled={loading}>
            {loading ? 'Adding...' : 'Add Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
