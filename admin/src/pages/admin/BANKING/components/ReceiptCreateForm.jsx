import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Maximize2 } from 'lucide-react';
import { Input, Button, Select, DatePicker } from '@components/ui';
import { useToast } from '@components/ui/Toast';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';
import useAsyncOptions from '@/hooks/useAsyncOptions';

const paymentModeOptions = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
];

const ReceiptCreateForm = ({ onClose }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      party_id: '',
      bank_account_id: '',
      amount: '',
      payment_mode: 'bank_transfer',
      transaction_ref: '',
      narration: '',
    },
  });

  const { options: customerOptions, loading: customersLoading, onSearch: onCustomerSearch } = useAsyncOptions(
    API.PARTIES,
    { type: 'customer' },
    (c) => ({ value: c.id, label: c.name })
  );

  const { options: bankAccountOptions, loading: bankAccountsLoading, onSearch: onBankAccountSearch } = useAsyncOptions(
    API.BANK_ACCOUNTS,
    {},
    (a) => ({ value: a.id, label: a.account_name })
  );

  const mutation = useMutation({
    mutationFn: (data) => api.post(API.RECEIPTS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.PAYMENT_RECEIPTS_LIST] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.BANK_ACCOUNTS] });
      toast.success('Receipt recorded successfully');
      onClose();
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Failed to record receipt';
      toast.error(message);
    },
  });

  const onSubmit = (data) => {
    const payload = {
      date: data.date,
      party_id: data.party_id,
      bank_account_id: data.bank_account_id,
      amount: parseFloat(data.amount),
      payment_mode: data.payment_mode,
    };
    if (data.transaction_ref.trim()) payload.transaction_ref = data.transaction_ref.trim();
    if (data.narration.trim()) payload.narration = data.narration.trim();

    mutation.mutate(payload);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-[#424242] flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Record Receipt</h3>
        <button
          onClick={() => navigate('/admin/banking/receipts/create')}
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
            <Controller
              name="date"
              control={control}
              rules={{ required: 'Date is required' }}
              render={({ field }) => (
                <DatePicker
                  label="Date"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.date?.message}
                  size="sm"
                />
              )}
            />
            <Controller
              name="party_id"
              control={control}
              rules={{ required: 'Customer is required' }}
              render={({ field }) => (
                <Select
                  label="Customer"
                  required
                  options={customerOptions}
                  value={field.value}
                  searchable
                  onSearch={onCustomerSearch}
                  loading={customersLoading}
                  onChange={field.onChange}
                  placeholder="Select customer"
                  error={errors.party_id?.message}
                  size="sm"
                />
              )}
            />
            <Controller
              name="bank_account_id"
              control={control}
              rules={{ required: 'Bank account is required' }}
              render={({ field }) => (
                <Select
                  label="Bank Account"
                  required
                  options={bankAccountOptions}
                  value={field.value}
                  searchable
                  onSearch={onBankAccountSearch}
                  loading={bankAccountsLoading}
                  onChange={field.onChange}
                  placeholder="Select account"
                  error={errors.bank_account_id?.message}
                  size="sm"
                />
              )}
            />
            <Input
              label="Amount"
              required
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount', {
                required: 'Valid amount is required',
                validate: (value) => (parseFloat(value) > 0) || 'Valid amount is required',
              })}
              error={errors.amount?.message}
              size="sm"
            />
            <Controller
              name="payment_mode"
              control={control}
              render={({ field }) => (
                <Select
                  label="Payment Mode"
                  options={paymentModeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  size="sm"
                />
              )}
            />
            <Input
              label="Transaction Ref / UTR"
              placeholder="e.g. UTR123456"
              {...register('transaction_ref')}
              size="sm"
            />
            <Input
              label="Narration"
              placeholder="Receipt note..."
              {...register('narration')}
              size="sm"
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

export default ReceiptCreateForm;
