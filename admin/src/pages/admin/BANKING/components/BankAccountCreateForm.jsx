import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Maximize2 } from 'lucide-react';
import { Input, Button, Select } from '@components/ui';
import { useToast } from '@components/ui/Toast';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const accountTypeOptions = [
  { value: 'current', label: 'Current' },
  { value: 'savings', label: 'Savings' },
  { value: 'cash', label: 'Cash' },
  { value: 'wallet', label: 'Wallet' },
];

const BankAccountCreateForm = ({ onClose }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      account_name: '',
      account_type: 'current',
      account_number: '',
      bank_name: '',
      branch: '',
      ifsc_code: '',
      opening_balance: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => api.post(API.BANK_ACCOUNTS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.BANK_ACCOUNTS] });
      toast.success('Bank account created successfully');
      onClose();
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Failed to create bank account';
      toast.error(message);
    },
  });

  const onSubmit = (data) => {
    const payload = {
      account_name: data.account_name.trim(),
      account_type: data.account_type,
    };
    if (data.account_number.trim()) payload.account_number = data.account_number.trim();
    if (data.bank_name.trim()) payload.bank_name = data.bank_name.trim();
    if (data.branch.trim()) payload.branch = data.branch.trim();
    if (data.ifsc_code.trim()) payload.ifsc_code = data.ifsc_code.trim();
    if (data.opening_balance) payload.opening_balance = parseFloat(data.opening_balance) || 0;

    mutation.mutate(payload);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-[#424242] flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Create Bank Account</h3>
        <button
          onClick={() => navigate('/admin/banking/accounts/create')}
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
              label="Account Name"
              required
              placeholder="e.g. SBI Current Account"
              error={errors.account_name?.message}
              size="sm"
              {...register('account_name', { required: 'Account name is required' })}
            />
            <Controller
              name="account_type"
              control={control}
              rules={{ required: 'Account type is required' }}
              render={({ field }) => (
                <Select
                  label="Account Type"
                  required
                  options={accountTypeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.account_type?.message}
                  size="sm"
                />
              )}
            />
            <Input
              label="Account Number"
              placeholder="e.g. 1234567890"
              size="sm"
              {...register('account_number')}
            />
            <Input
              label="Bank Name"
              placeholder="e.g. State Bank of India"
              size="sm"
              {...register('bank_name')}
            />
            <Input
              label="Branch"
              placeholder="e.g. MG Road Branch"
              size="sm"
              {...register('branch')}
            />
            <Input
              label="IFSC Code"
              placeholder="e.g. SBIN0001234"
              size="sm"
              {...register('ifsc_code')}
            />
            <Input
              label="Opening Balance"
              type="number"
              step="0.01"
              placeholder="0.00"
              size="sm"
              {...register('opening_balance')}
            />
          </div>
        </div>

        {/* Actions - fixed at bottom */}
        <div className="flex items-center gap-2 px-5 py-3 border-t border-gray-200 dark:border-[#424242] flex-shrink-0">
          <Button type="submit" size="sm" loading={mutation.isPending} className="flex-1">
            Create
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BankAccountCreateForm;
