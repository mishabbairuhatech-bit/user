import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Maximize2 } from 'lucide-react';
import { Input, Button, Select } from '@components/ui';
import { useToast } from '@components/ui/Toast';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const balanceTypeOptions = [
  { value: 'debit', label: 'Debit (Receivable)' },
  { value: 'credit', label: 'Credit (Advance)' },
];

const CustomerCreateForm = ({ onClose }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      type: 'customer',
      phone: '',
      email: '',
      gstin: '',
      state_code: '',
      opening_balance: 0,
      opening_balance_type: 'debit',
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => api.post(API.PARTIES, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.PARTIES] });
      toast.success('Customer created successfully');
      onClose();
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Failed to create customer';
      toast.error(message);
    },
  });

  const onSubmit = (data) => {
    const payload = {
      name: data.name.trim(),
      type: 'customer',
    };
    if (data.phone.trim()) payload.phone = data.phone.trim();
    if (data.email.trim()) payload.email = data.email.trim();
    if (data.gstin.trim()) payload.gstin = data.gstin.trim();
    if (data.state_code.trim()) payload.state_code = data.state_code.trim();
    if (parseFloat(data.opening_balance)) {
      payload.opening_balance = parseFloat(data.opening_balance);
      payload.opening_balance_type = data.opening_balance_type;
    }

    mutation.mutate(payload);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-[#424242] flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Create Customer</h3>
        <button
          onClick={() => navigate('/admin/sales/customers/create')}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
          title="Expand to full page"
        >
          <Maximize2 size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4">
          <div className="space-y-3">
            <Input
              label="Name"
              required
              placeholder="Customer name"
              error={errors.name?.message}
              size="sm"
              {...register('name', { required: 'Name is required' })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Phone"
                placeholder="+91..."
                size="sm"
                {...register('phone')}
              />
              <Input
                label="Email"
                type="email"
                placeholder="email@example.com"
                error={errors.email?.message}
                size="sm"
                {...register('email', {
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email address',
                  },
                })}
              />
            </div>
            <Input
              label="GSTIN"
              placeholder="e.g. 27AABCU9603R1ZM"
              size="sm"
              {...register('gstin')}
            />
            <Input
              label="State Code"
              placeholder="e.g. 27"
              maxLength={2}
              size="sm"
              {...register('state_code')}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Opening Balance"
                type="number"
                step="0.01"
                size="sm"
                {...register('opening_balance')}
              />
              <Controller
                name="opening_balance_type"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Balance Type"
                    options={balanceTypeOptions}
                    value={field.value}
                    onChange={field.onChange}
                    size="sm"
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Actions - fixed at bottom */}
        <div className="flex items-center gap-2 px-5 py-3 border-t border-gray-200 dark:border-[#424242] flex-shrink-0">
          <Button type="submit" size="sm" loading={mutation.isPending} className="flex-1">
            Create Customer
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CustomerCreateForm;
