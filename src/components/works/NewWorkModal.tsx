import { useState, useEffect } from 'react';
import { createWork, createCustomer, updateWork, getCustomerByPhone, getLatestWorkRefNumber } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Music, Plus, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAppStore } from '@/store/useAppStore';
import { useNavigate } from 'react-router-dom';

interface NewWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

const DEFAULT_SERVICES = ['Vocal Recording', 'Mixing', 'Mastering', 'Programming', 'Video Editing'];

export function NewWorkModal({ isOpen, onClose, initialData }: NewWorkModalProps) {
  const [existingCustomer, setExistingCustomer] = useState<any>(null);
  const [isAddingService, setIsAddingService] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  
  const { customServices, addCustomService } = useAppStore();
  const navigate = useNavigate();
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm();
  
  const phone = watch('phone');
  const allServices = [...DEFAULT_SERVICES, ...customServices];

  // Auto-detect customer by phone
  useEffect(() => {
    const checkPhone = async () => {
      if (phone && phone.length >= 10) {
        const customer = await getCustomerByPhone(phone);
        if (customer) {
          setExistingCustomer(customer);
          setValue('name', customer.name);
          setValue('place', customer.place);
          setValue('whatsapp', customer.whatsapp);
        } else {
          setExistingCustomer(null);
        }
      } else {
        setExistingCustomer(null);
      }
    };
    
    // add small debounce
    const timeoutId = setTimeout(checkPhone, 500);
    return () => clearTimeout(timeoutId);
  }, [phone, setValue]);

  useEffect(() => {
    if (initialData && isOpen) {
      setExistingCustomer(initialData.customerObj || null);
      
      const workDate = initialData.dueDate instanceof Date 
        ? initialData.dueDate.toISOString().split('T')[0] 
        : (initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '');

      reset({
        phone: initialData.customerObj?.phone || '',
        name: initialData.customerObj?.name || initialData.customerId || '',
        workTitle: initialData.title || '',
        dueDate: workDate,
        services: initialData.services || [],
        totalAmount: initialData.totalAmount || '',
        paidAmount: initialData.paidAmount || 0,
        place: initialData.customerObj?.place || '',
        whatsapp: initialData.customerObj?.whatsapp || initialData.customerObj?.phone || ''
      });
    } else if (isOpen) {
      reset({
        phone: '',
        name: '',
        workTitle: '',
        dueDate: new Date().toISOString().split('T')[0],
        services: [],
        totalAmount: '',
        paidAmount: '',
        place: '',
        whatsapp: ''
      });
      setExistingCustomer(null);
      setIsAddingService(false);
    }
  }, [initialData, isOpen, reset]);

  const resetState = () => {
    setExistingCustomer(null);
    setIsAddingService(false);
    onClose();
  };

  const onSubmit = async (data: any) => {
    try {
      const studioId = useAppStore.getState().activeStudioId;
      if (!studioId) throw new Error("No active studio selected");

      const fallbackWhatsapp = data.whatsapp || data.phone;
      
      let customerId = existingCustomer?.id;

      if (!existingCustomer) {
        customerId = Date.now().toString(); // simple ID generation
        await createCustomer({
          id: customerId,
          name: data.name,
          phone: data.phone,
          place: data.place || '',
          whatsapp: fallbackWhatsapp,
          studioId,
          createdAt: new Date(),
        });
      } else if (!existingCustomer.whatsapp && fallbackWhatsapp) {
         // optionally update existing customer if whatsapp was empty
      }

      if (initialData) {
        await updateWork(initialData.id, {
          title: data.workTitle,
          dueDate: new Date(data.dueDate),
          services: data.services || [],
          totalAmount: Number(data.totalAmount),
          paidAmount: Number(data.paidAmount) || 0,
        });
      } else {
        const latestRef = await getLatestWorkRefNumber(studioId);
        const nextNum = parseInt(latestRef.replace('YSR', ''), 10) + 1;
        const nextRef = `YSR${String(nextNum).padStart(5, '0')}`;
        
        await createWork({
          id: Date.now().toString(),
          refNumber: nextRef,
          title: data.workTitle,
          customerId: customerId,
          studioId,
          services: data.services || [],
          status: 'pending',
          totalAmount: Number(data.totalAmount),
          paidAmount: Number(data.paidAmount) || 0,
          createdAt: new Date(),
          dueDate: new Date(data.dueDate),
        });
      }

      resetState();
    } catch (error) {
      console.error("Error submitting form", error);
      alert("Failed to save work");
    }
  };

  const handleAddCustomService = () => {
    if (newServiceName.trim()) {
      addCustomService(newServiceName.trim());
      setIsAddingService(false);
      setNewServiceName('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={resetState} title={initialData ? "Edit Work" : "New Work"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Input
            label="Phone Number"
            placeholder="e.g. 9876543210"
            type="tel"
            {...register('phone', { required: 'Phone is required', minLength: 10 })}
            error={errors.phone?.message as string}
            autoFocus
          />

          {existingCustomer && (
            <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 dark:border-green-900/20 flex items-center space-x-2 text-sm">
              <CheckCircle2 className="text-green-600 dark:text-green-500 shrink-0" size={16} />
              <p className="font-medium text-green-900 dark:text-green-400">Customer found: {existingCustomer.name}</p>
            </div>
          )}

          <Input
            label="Customer Name"
            placeholder=""
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message as string}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Place (Optional)"
              placeholder=""
              {...register('place')}
            />
            
            <Input
              label="WhatsApp (Optional)"
              placeholder=""
              {...register('whatsapp')}
            />
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <Input
              label="Work Title"
              placeholder=""
              {...register('workTitle', { required: 'Work Title is required' })}
              error={errors.workTitle?.message as string}
              icon={<Music size={18} className="text-gray-400" />}
            />
          </div>

          <Input
            label="Due Date"
            type="date"
            {...register('dueDate', { required: 'Due Date is required' })}
            error={errors.dueDate?.message as string}
            icon={<CalendarIcon size={18} className="text-gray-400" />}
          />
          
          <div className="pt-2">
            <div className="flex justify-between items-center mb-1.5 ml-1">
              <label className="text-sm font-medium text-yaron-charcoal dark:text-gray-300 block">
                Services (Optional)
              </label>
              {!isAddingService && (
                <button type="button" onClick={() => setIsAddingService(true)} className="text-xs text-yaron-magenta font-semibold flex items-center hover:underline">
                  <Plus size={14} className="mr-0.5" /> Custom
                </button>
              )}
            </div>
            
            {isAddingService && (
              <div className="flex space-x-2 mb-3">
                <input 
                  type="text"
                  className="flex-1 h-9 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 text-sm dark:text-white"
                  placeholder=""
                  value={newServiceName}
                  onChange={e => setNewServiceName(e.target.value)}
                />
                <Button type="button" size="sm" onClick={handleAddCustomService}>Add</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setIsAddingService(false)}>Cancel</Button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {allServices.map(service => (
                <label key={service} className="flex items-center space-x-2 p-2 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                  <input type="checkbox" value={service} {...register('services')} className="rounded text-yaron-magenta focus:ring-yaron-magenta bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{service}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
            <Input
              label="Total Amount (₹)"
              type="number"
              placeholder=""
              {...register('totalAmount', { required: true })}
            />
            <Input
              label="Advance Paid (₹)"
              type="number"
              placeholder=""
              {...register('paidAmount')}
            />
          </div>
          <div className="flex items-center space-x-2 ml-1 pb-4">
            <input 
              type="checkbox" 
              id="payLater" 
              className="rounded text-yaron-magenta focus:ring-yaron-magenta bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
              onChange={(e) => {
                if(e.target.checked) setValue('paidAmount', 0);
              }}
            />
            <label htmlFor="payLater" className="text-xs text-gray-500 dark:text-gray-400 font-medium cursor-pointer">
              Payment will be received later (Advance = 0)
            </label>
          </div>
        </div>

        {/* Pinned Bottom Button */}
        <div className="sticky bottom-0 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 mt-6 p-4 bg-white dark:bg-yaron-dark border-t border-gray-100 dark:border-gray-800 rounded-b-2xl">
          <Button type="submit" className="w-full h-12 text-base font-bold bg-yaron-gradient text-white border-none shadow-lg">
            {initialData ? 'Save Changes' : 'Create Work'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
