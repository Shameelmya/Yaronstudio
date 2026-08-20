import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { NewIncomeModal } from './NewIncomeModal';
import { NewExpenseModal } from './NewExpenseModal';

interface QuickTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickTransactionModal({ isOpen, onClose }: QuickTransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense' | null>(null);

  const handleClose = () => {
    setType(null);
    onClose();
  };

  if (type === 'income') return <NewIncomeModal isOpen={true} onClose={handleClose} />;
  if (type === 'expense') return <NewExpenseModal isOpen={true} onClose={handleClose} />;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Quick Log">
      <div className="grid grid-cols-2 gap-4 pb-4">
        <Button 
          className="h-24 flex flex-col items-center justify-center space-y-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/40 dark:text-green-400 dark:border-green-900/30"
          onClick={() => setType('income')}
        >
          <ArrowUpRight size={28} />
          <span className="font-bold">Income</span>
        </Button>
        <Button 
          className="h-24 flex flex-col items-center justify-center space-y-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 dark:border-red-900/30"
          onClick={() => setType('expense')}
        >
          <ArrowDownRight size={28} />
          <span className="font-bold">Expense</span>
        </Button>
      </div>
    </Modal>
  );
}
