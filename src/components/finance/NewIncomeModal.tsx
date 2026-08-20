import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { addIncome, updateIncome } from '@/lib/api';
import * as import_react from 'react';
import { useAppStore } from '@/store/useAppStore';

interface NewIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: any;
}

export function NewIncomeModal({ isOpen, onClose, editData }: NewIncomeModalProps) {
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
        await updateIncome(editData.id, {
          title: formData.title,
          description: formData.description || '',
          amount: Number(formData.amount),
        });
      } else {
        await addIncome({
          id: Date.now().toString(),
          studioId: activeStudioId,
          title: formData.title,
          description: formData.description || '',
          amount: Number(formData.amount),
          date: Date.now(),
        });
      }
      setFormData({ title: '', amount: '', description: '' });
      onClose();
    } catch (error) {
      console.error(editData ? 'Failed to update income' : 'Failed to add income', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? "Edit Income" : "Add New Income"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Income Source / Title"
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
          <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white border-none" disabled={loading}>
            {loading ? 'Saving...' : (editData ? 'Save Changes' : 'Add Income')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
