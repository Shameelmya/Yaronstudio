import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { User, CheckCircle2, Music, IndianRupee } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface NewWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'phone' | 'customer_details' | 'work_details';

export function NewWorkModal({ isOpen, onClose }: NewWorkModalProps) {
  const [step, setStep] = useState<Step>('phone');
  const [existingCustomer, setExistingCustomer] = useState<any>(null);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  
  const phone = watch('phone');

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
    onClose();
  };

  const onSubmit = (data: any) => {
    console.log("Submitting work data", data);
    // Submit to Firebase logic here
    resetState();
  };

  return (
    <Modal isOpen={isOpen} onClose={resetState} title="New Work">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {step === 'phone' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <p className="text-gray-500 text-sm">Enter customer's phone number to start.</p>
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
              className="w-full" 
              onClick={checkPhone}
              disabled={!phone || phone.length < 10}
            >
              Continue
            </Button>
          </div>
        )}

        {step === 'customer_details' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-blue-50 text-blue-700 p-3 rounded-lg flex space-x-3 items-start text-sm">
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
              <Button type="button" onClick={() => setStep('work_details')} className="flex-1">
                Next: Work Details
              </Button>
            </div>
          </div>
        )}

        {step === 'work_details' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            
            {existingCustomer ? (
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-start space-x-3">
                <CheckCircle2 className="text-green-600 mt-1 shrink-0" size={20} />
                <div>
                  <p className="font-semibold text-green-900">Existing Customer Found</p>
                  <p className="text-sm text-green-700 mt-1">{existingCustomer.name} • {existingCustomer.place}</p>
                </div>
              </div>
            ) : null}

            <div className="space-y-4 pt-2">
              <Input
                label="Work Title"
                placeholder="e.g. Ente Pattu, Album Song 03"
                {...register('workTitle', { required: 'Work Title is required' })}
                error={errors.workTitle?.message as string}
                icon={<Music size={18} className="text-gray-400" />}
              />
              
              <div>
                <label className="text-sm font-medium text-yaron-charcoal ml-1 mb-1.5 block">
                  Services
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Vocal Recording', 'Mixing', 'Mastering', 'Programming', 'Video Editing'].map(service => (
                    <label key={service} className="flex items-center space-x-2 p-2 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" value={service} {...register('services')} className="rounded text-yaron-magenta focus:ring-yaron-magenta" />
                      <span className="text-sm text-gray-700">{service}</span>
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
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setStep(existingCustomer ? 'phone' : 'customer_details')} className="flex-1">
                Back
              </Button>
              <Button type="submit" className="flex-[2]">
                Create Work
              </Button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
