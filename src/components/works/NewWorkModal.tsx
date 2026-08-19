import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { User, CheckCircle2, Music, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAppStore } from '@/store/useAppStore';

interface NewWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

type Step = 'phone' | 'customer_details' | 'work_details';

const DEFAULT_SERVICES = ['Vocal Recording', 'Mixing', 'Mastering', 'Programming', 'Video Editing'];

export function NewWorkModal({ isOpen, onClose, initialData }: NewWorkModalProps) {
  const [step, setStep] = useState<Step>('phone');
  const [existingCustomer, setExistingCustomer] = useState<any>(null);
  const [isAddingService, setIsAddingService] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  
  const { customServices, addCustomService } = useAppStore();
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm();
  
  const phone = watch('phone');
  const allServices = [...DEFAULT_SERVICES, ...customServices];

  useEffect(() => {
    if (initialData && isOpen) {
      setStep('work_details');
      setExistingCustomer({
        name: initialData.customer,
        phone: initialData.phone,
      });
      reset({
        phone: initialData.phone,
        name: initialData.customer,
        workTitle: initialData.title,
        dueDate: initialData.due,
        services: initialData.services,
        totalAmount: initialData.total,
        paidAmount: initialData.pending ? initialData.total - initialData.pending : initialData.total
      });
    }
  }, [initialData, isOpen, reset]);

  const checkPhone = () => {
    // Mock API call to check if phone exists
    if (phone === '9876543210') {
      setExistingCustomer({
        name: 'Shibili Moonnakkal',
        place: 'Kannur',
        whatsapp: '9876543210'
      });
      setStep('work_details');
    } else {
      setExistingCustomer(null);
      setStep('customer_details');
    }
  };

  const resetState = () => {
    setStep('phone');
    setExistingCustomer(null);
    setIsAddingService(false);
    onClose();
  };

  const onSubmit = (data: any) => {
    console.log("Submitting work data", data);
    // Submit to Firebase logic here
    resetState();
  };

  const handleAddCustomService = () => {
    if (newServiceName.trim()) {
      addCustomService(newServiceName.trim());
      setIsAddingService(false);
      setNewServiceName('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={resetState} title="New Work">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {step === 'phone' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Enter customer's phone number to start.</p>
            <Input
              label="Phone Number"
              placeholder="e.g. 9876543210"
              type="tel"
              {...register('phone', { required: 'Phone is required', minLength: 10 })}
              error={errors.phone?.message as string}
              autoFocus
            />
            <Button 
              type="button" 
              className="w-full h-12 text-base font-semibold" 
              onClick={checkPhone}
              disabled={!phone || phone.length < 10}
            >
              Continue
            </Button>
          </div>
        )}

        {step === 'customer_details' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 p-3 rounded-lg flex space-x-3 items-start text-sm border border-blue-100 dark:border-blue-900/50">
              <User size={18} className="mt-0.5 shrink-0" />
              <p>New customer detected. Please provide details.</p>
            </div>
            
            <Input
              label="Customer Name"
              placeholder="Full Name"
              {...register('name', { required: 'Name is required' })}
              error={errors.name?.message as string}
            />
            
            <Input
              label="Place / City"
              placeholder="e.g. Kannur"
              {...register('place', { required: 'Place is required' })}
            />
            
            <Input
              label="WhatsApp Number"
              placeholder="Same as phone if empty"
              {...register('whatsapp')}
            />
            
            <div className="flex space-x-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setStep('phone')} className="flex-1">
                Back
              </Button>
              <Button type="button" onClick={() => setStep('work_details')} className="flex-1 font-semibold">
                Next: Work Details
              </Button>
            </div>
          </div>
        )}

        {step === 'work_details' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            
            {existingCustomer && (
              <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/20 flex items-start space-x-3">
                <CheckCircle2 className="text-green-600 dark:text-green-500 mt-1 shrink-0" size={20} />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-400">Existing Customer Found</p>
                  <p className="text-sm text-green-700 dark:text-green-500 mt-1">{existingCustomer.name} • {existingCustomer.place}</p>
                </div>
              </div>
            )}

            <div className="space-y-4 pt-2">
              <Input
                label="Work Title"
                placeholder="e.g. Ente Pattu, Album Song 03"
                {...register('workTitle', { required: 'Work Title is required' })}
                error={errors.workTitle?.message as string}
                icon={<Music size={18} className="text-gray-400" />}
              />

              <Input
                label="Due Date"
                type="date"
                {...register('dueDate', { required: 'Due Date is required' })}
                error={errors.dueDate?.message as string}
                icon={<CalendarIcon size={18} className="text-gray-400" />}
              />
              
              <div>
                <div className="flex justify-between items-center mb-1.5 ml-1">
                  <label className="text-sm font-medium text-yaron-charcoal dark:text-gray-300 block">
                    Services
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
                      placeholder="e.g. BGM Scoring"
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

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Total Amount (₹)"
                  type="number"
                  placeholder="0"
                  {...register('totalAmount', { required: true })}
                />
                <Input
                  label="Advance Paid (₹)"
                  type="number"
                  placeholder="0"
                  {...register('paidAmount')}
                />
              </div>
              <div className="flex items-center space-x-2 ml-1">
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

            <div className="flex space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800 pt-6 mt-6">
              <Button type="button" variant="ghost" onClick={() => setStep(existingCustomer ? 'phone' : 'customer_details')} className="flex-1">
                Back
              </Button>
              <Button type="submit" className="flex-[2] h-12 text-base font-bold bg-yaron-gradient text-white border-none">
                Create Work
              </Button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
