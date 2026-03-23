import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Maximize2, Plus, Trash2 } from 'lucide-react';
import { Input, Button, Select, DatePicker } from '@components/ui';
import { useToast } from '@components/ui/Toast';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';
import useAsyncOptions from '@/hooks/useAsyncOptions';

const emptyItem = { product_id: '', quantity: 1, unit_price: 0, discount_percent: 0 };

const InvoiceCreateForm = ({ onClose }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { register, handleSubmit, control, formState: { errors }, setValue } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      due_date: '',
      party_id: '',
      place_of_supply: '',
      discount_amount: 0,
      round_off: 0,
      notes: '',
      terms: '',
    },
  });

  const [items, setItems] = useState([{ ...emptyItem }]);
  const [itemsError, setItemsError] = useState('');

  const { options: customerAsyncOptions, loading: customersLoading, onSearch: onCustomerSearch } = useAsyncOptions(
    API.PARTIES,
    { type: 'customer' },
    (c) => ({ value: c.id, label: `${c.name}${c.gstin ? ` (${c.gstin})` : ''}`, data: c })
  );
  const customerOptions = [{ value: '', label: 'Walk-in Customer' }, ...customerAsyncOptions];

  const { options: productAsyncOptions, loading: productsLoading, onSearch: onProductSearch } = useAsyncOptions(
    API.PRODUCTS,
    { is_active: 'true' },
    (p) => ({ value: p.id, label: `${p.name} (${p.sku})`, data: p })
  );
  const productOptions = productAsyncOptions;

  const addItem = () => setItems((prev) => [...prev, { ...emptyItem }]);

  const removeItem = (i) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateItem = (i, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [field]: value };
      if (field === 'product_id') {
        const opt = productOptions.find((o) => o.value === value);
        if (opt?.data) updated[i].unit_price = parseFloat(opt.data.selling_price) || 0;
      }
      return updated;
    });
    if (itemsError) setItemsError('');
  };

  const formatCurrency = (val) =>
    `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const subtotal = items.reduce((sum, item) => {
    const line = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
    const disc = (line * (parseFloat(item.discount_percent) || 0)) / 100;
    return sum + line - disc;
  }, 0);

  const mutation = useMutation({
    mutationFn: (data) => api.post(API.SALES_INVOICES, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.SALES_INVOICES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.PRODUCTS] });
      toast.success('Invoice created successfully');
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create invoice');
    },
  });

  const onSubmit = (data) => {
    const hasValidItem = items.some((item) => item.product_id);
    if (!hasValidItem) {
      setItemsError('Select at least one product');
      return;
    }

    mutation.mutate({
      ...data,
      party_id: data.party_id || undefined,
      discount_amount: parseFloat(data.discount_amount) || 0,
      round_off: parseFloat(data.round_off) || 0,
      items: items.map((item) => ({
        product_id: item.product_id,
        quantity: parseFloat(item.quantity) || 0,
        unit_price: parseFloat(item.unit_price) || 0,
        discount_percent: parseFloat(item.discount_percent) || 0,
      })),
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-[#424242] flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Create Invoice</h3>
        <button
          onClick={() => navigate('/admin/sales/invoices/new')}
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
              name="party_id"
              control={control}
              render={({ field }) => (
                <Select
                  label="Customer"
                  options={customerOptions}
                  value={field.value}
                  searchable
                  onSearch={onCustomerSearch}
                  loading={customersLoading}
                  onChange={(val) => {
                    field.onChange(val);
                    const opt = customerOptions.find((o) => o.value === val);
                    if (opt?.data?.state_code) {
                      setValue('place_of_supply', opt.data.state_code);
                    }
                  }}
                  placeholder="Walk-in Customer"
                  size="sm"
                />
              )}
            />
            <div className="grid grid-cols-2 gap-2">
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
                name="due_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Due Date"
                    value={field.value}
                    onChange={field.onChange}
                    size="sm"
                  />
                )}
              />
            </div>
            <Input
              label="Place of Supply"
              placeholder="e.g. 27"
              {...register('place_of_supply')}
              size="sm"
              maxLength={2}
            />

            {/* Items */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Items</span>
                <button type="button" onClick={addItem} className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-0.5">
                  <Plus size={12} /> Add
                </button>
              </div>
              {itemsError && <p className="text-xs text-red-500 mb-1">{itemsError}</p>}
              <div className="space-y-2">
                {items.map((item, i) => {
                  const line = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
                  const disc = (line * (parseFloat(item.discount_percent) || 0)) / 100;
                  return (
                    <div key={i} className="p-2 border border-gray-100 dark:border-[#2a2a2a] rounded-lg space-y-1.5">
                      <Select
                        options={productOptions}
                        value={item.product_id}
                        onChange={(val) => updateItem(i, 'product_id', val)}
                        placeholder="Select product..."
                        searchable
                        onSearch={onProductSearch}
                        loading={productsLoading}
                        size="sm"
                      />
                      <div className="grid grid-cols-3 gap-1.5">
                        <Input
                          label="Qty"
                          type="number"
                          step="0.001"
                          value={item.quantity}
                          onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                          size="sm"
                        />
                        <Input
                          label="Price"
                          type="number"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateItem(i, 'unit_price', e.target.value)}
                          size="sm"
                        />
                        <Input
                          label="Disc %"
                          type="number"
                          step="0.01"
                          value={item.discount_percent}
                          onChange={(e) => updateItem(i, 'discount_percent', e.target.value)}
                          size="sm"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-mono">{formatCurrency(line - disc)}</span>
                        {items.length > 1 && (
                          <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Totals */}
            <div className="pt-2 space-y-1.5 border-t border-gray-100 dark:border-[#2a2a2a]">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              <Input
                label="Discount"
                type="number"
                step="0.01"
                {...register('discount_amount')}
                size="sm"
              />
              <Input
                label="Round Off"
                type="number"
                step="0.01"
                {...register('round_off')}
                size="sm"
              />
              <p className="text-[10px] text-gray-400">Tax auto-calculated from product rates + place of supply.</p>
            </div>

            {/* Notes */}
            <Input
              label="Notes"
              {...register('notes')}
              size="sm"
            />
            <Input
              label="Terms"
              {...register('terms')}
              size="sm"
            />
          </div>
        </div>

        {/* Actions - fixed at bottom */}
        <div className="flex items-center gap-2 px-5 py-3 border-t border-gray-200 dark:border-[#424242] flex-shrink-0">
          <Button type="submit" size="sm" loading={mutation.isPending} className="flex-1">
            Create Invoice
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceCreateForm;
