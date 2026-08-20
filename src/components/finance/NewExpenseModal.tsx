import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { addExpense, updateExpense } from '@/lib/api';
import * as import_react from 'react';
import { useAppStore } from '@/store/useAppStore';

interface NewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: any;
}

export function NewExpenseModal({ isOpen, onClose, editData }: NewExpenseModalProps) {
  const { activeStudioId } = useAppStore();
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  import_react.useEffect(() => {
    if (isOpen && editData) {
      setFormData({
        title: editData.title || '',
        amount: editData.amount?.toString() || '',
        description: editData.description || '',
      });
    } else if (isOpen) {
      setFormData({ title: '', amount: '', description: '' });
    }
  }, [isOpen, editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudioId) return;

    try {
      setLoading(true);
      if (editData) {
        await updateExpense(editData.id, {
          title: formData.title,
          description: formData.description || '',
          amount: Number(formData.amount),
        });
      } else {
        await addExpense({
          id: Date.now().toString(),
          studioId: activeStudioId,
          title: formData.title,
          description: formData.description || '',
          amount: Number(formData.amount),
          category: 'Other',
          date: Date.now(),
        });
      }
      setFormData({ title: '', amount: '', description: '' });
      onClose();
    } catch (error) {
      console.error(editData ? 'Failed to update expense' : 'Failed to add expense', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? "Edit Expense" : "Add New Expense"}>
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
            {loading ? 'Saving...' : (editData ? 'Save Changes' : 'Add Expense')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
