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
    description: '',
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
        description: formData.description || undefined,
        amount: Number(formData.amount),
        category: 'Other',
        date: Date.now(),
      });
      setFormData({ title: '', amount: '', description: '' });
      onClose();
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
        
        <Input 
          label="Description (Optional)"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
        />
        
        <Input 
          label="Amount (₹)"
          type="number"
          value={formData.amount}
          onChange={e => setFormData({ ...formData, amount: e.target.value })}
          required
        />

        <div className="pt-4 flex space-x-3">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none" disabled={loading}>
            {loading ? 'Adding...' : 'Add Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
