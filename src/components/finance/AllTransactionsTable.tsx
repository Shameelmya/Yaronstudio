import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency } from '@/lib/utils';
import { Edit, Trash, Printer, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { generateInvoice, generateReceipt } from '@/lib/invoice';
import { deleteIncome, deleteExpense } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Search } from 'lucide-react';
import { NewIncomeModal } from '@/components/finance/NewIncomeModal';
import { NewExpenseModal } from '@/components/finance/NewExpenseModal';

interface AllTransactionsTableProps {
  startDate: Date;
  endDate: Date;
}

export function AllTransactionsTable({ startDate, endDate }: AllTransactionsTableProps) {
  const { works, incomes, expenses, customers, activeStudioId } = useAppStore();
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; type: string; id: string; title: string }>({ isOpen: false, type: '', id: '', title: '' });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit State
  const [editIncomeModalOpen, setEditIncomeModalOpen] = useState(false);
  const [editExpenseModalOpen, setEditExpenseModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const transactions = useMemo(() => {
    const all = [
      ...works
        .filter(w => w.paidAmount > 0 && w.createdAt && new Date(w.createdAt as any) >= startDate && new Date(w.createdAt as any) <= endDate)
        .map(w => {
          const customer = customers.find(c => c.id === w.customerId);
          return {
            id: w.id,
            type: 'work',
            person: customer?.name || 'Unknown',
            phone: customer?.phone || '',
            description: `Payment for ${w.title}`,
            amount: w.paidAmount,
            date: new Date(w.createdAt as any).getTime(),
            original: w,
            customer
          };
        }),
      ...incomes
        .filter(i => i.date >= startDate.getTime() && i.date <= endDate.getTime())
        .map(i => ({
          id: i.id,
          type: 'income',
          person: i.title,
          phone: '',
          description: i.description || 'Manual Income',
          amount: i.amount,
          date: i.date,
          original: i
        })),
      ...expenses
        .filter(e => e.date >= startDate.getTime() && e.date <= endDate.getTime())
        .map(e => ({
          id: e.id,
          type: 'expense',
          person: e.title,
          phone: '',
          description: e.description || e.category,
          amount: e.amount,
          date: e.date,
          original: e
        }))
    ];
    
    const sorted = all.sort((a, b) => b.date - a.date);
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return sorted.filter(t => 
        t.person.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q) ||
        t.phone.toLowerCase().includes(q)
      );
    }
    return sorted;
  }, [works, incomes, expenses, customers, startDate, endDate, searchQuery]);

  const handleDelete = async () => {
    if (deleteModal.type === 'income') {
      await deleteIncome(deleteModal.id);
    } else if (deleteModal.type === 'expense') {
      await deleteExpense(deleteModal.id);
    }
    setDeleteModal({ isOpen: false, type: '', id: '', title: '' });
  };

  const handlePrint = (tx: any) => {
    if (tx.type === 'work') {
      generateInvoice(tx.original, tx.customer);
    } else if (tx.type === 'income') {
      generateReceipt(tx.original, 'Income');
    } else if (tx.type === 'expense') {
      generateReceipt(tx.original, 'Expense');
    }
  };

  const handleEdit = (tx: any) => {
    setEditData(tx.original);
    if (tx.type === 'income') {
      setEditIncomeModalOpen(true);
    } else if (tx.type === 'expense') {
      setEditExpenseModalOpen(true);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mt-6">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="font-bold text-lg text-yaron-charcoal dark:text-white">All Transactions</h3>
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yaron-magenta/50 dark:text-white transition-all"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm">
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Name / Title</th>
              <th className="p-4 font-medium">Description</th>
              <th className="p-4 font-medium">Phone</th>
              <th className="p-4 font-medium">Amount</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-800">
            {transactions.map(tx => (
              <tr key={`${tx.type}-${tx.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="p-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                  {format(new Date(tx.date), 'dd MMM yyyy, hh:mm a')}
                </td>
                <td className="p-4 font-medium text-yaron-charcoal dark:text-white">
                  {tx.person}
                </td>
                <td className="p-4 text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                  {tx.description}
                </td>
                <td className="p-4 text-gray-500 dark:text-gray-400">
                  {tx.phone || '-'}
                </td>
                <td className={`p-4 font-bold ${tx.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                  {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button 
                      onClick={() => handlePrint(tx)}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-transform duration-100 active:scale-90"
                      title="Print"
                    >
                      <Printer size={16} />
                    </button>
                    {tx.type !== 'work' && (
                      <>
                        <button 
                          onClick={() => handleEdit(tx)}
                          className="p-2 text-gray-400 hover:text-yaron-magenta hover:bg-yaron-magenta/10 dark:hover:bg-yaron-magenta/20 rounded-lg transition-transform duration-100 active:scale-90"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => setDeleteModal({ isOpen: true, type: tx.type, id: tx.id, title: tx.person })}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-transform duration-100 active:scale-90"
                          title="Delete"
                        >
                          <Trash size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <FileText size={32} className="text-gray-300 dark:text-gray-600" />
                    <p>No transactions found for the selected period.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })} title="Confirm Deletion">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete <strong className="text-yaron-charcoal dark:text-white">{deleteModal.title}</strong>? This action cannot be undone.
          </p>
          <div className="pt-4 flex space-x-3">
            <Button variant="outline" className="flex-1 dark:border-gray-700" onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}>Cancel</Button>
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none" 
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      <NewIncomeModal 
        isOpen={editIncomeModalOpen} 
        onClose={() => { setEditIncomeModalOpen(false); setEditData(null); }} 
        editData={editData} 
      />
      <NewExpenseModal 
        isOpen={editExpenseModalOpen} 
        onClose={() => { setEditExpenseModalOpen(false); setEditData(null); }} 
        editData={editData} 
      />
    </div>
  );
}
