import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Maximize2, Plus, Trash2 } from 'lucide-react';
import { Input, Button, Select, DatePicker } from '@components/ui';
import { useToast } from '@components/ui/Toast';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';
import useAsyncOptions from '@/hooks/useAsyncOptions';

const emptyItem = { product_id: '', adjustment_type: 'increase', quantity: '', unit_cost: '' };

const StockAdjustmentCreateForm = ({ onClose }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      reason: '',
    },
  });

  const [items, setItems] = useState([{ ...emptyItem }]);

  const { options: productOptions, loading: productsLoading, onSearch: onProductSearch } = useAsyncOptions(
    API.PRODUCTS,
    { is_active: 'true' },
    (p) => ({ value: p.id, label: `${p.name} (${p.sku})` })
  );

  const adjustmentTypeOptions = [
    { value: 'increase', label: 'Increase' },
    { value: 'decrease', label: 'Decrease' },
  ];

  const addItem = () => setItems([...items, { ...emptyItem }]);

  const removeItem = (i) => {
    if (items.length > 1) setItems(items.filter((_, idx) => idx !== i));
  };

  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    setItems(updated);
  };

  const mutation = useMutation({
    mutationFn: (data) => api.post(API.STOCK_ADJUSTMENTS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.STOCK_ADJUSTMENTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.PRODUCTS] });
      toast.success('Stock adjustment created successfully');
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create adjustment');
    },
  });

  const onSubmit = (data) => {
    // Validate items manually
    if (!items.some((it) => it.product_id)) {
      toast.error('At least one product is required');
      return;
    }

    mutation.mutate({
      date: data.date,
      reason: data.reason.trim() || undefined,
      items: items
        .filter((it) => it.product_id)
        .map((it) => ({
          product_id: it.product_id,
          adjustment_type: it.adjustment_type,
          quantity: parseFloat(it.quantity) || 0,
          unit_cost: parseFloat(it.unit_cost) || 0,
        })),
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-[#424242] flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Create Adjustment</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate('/admin/inventory/stock-adjustments/new')}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
            title="Expand to full page"
          >
            <Maximize2 size={14} className="text-gray-500" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
            title="Close"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>
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
            <Input
              label="Reason"
              placeholder="e.g. Physical count correction"
              size="sm"
              {...register('reason')}
            />

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Items ({items.filter((it) => it.product_id).length} added)
                </label>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium flex items-center gap-0.5"
                >
                  <Plus size={12} /> Add
                </button>
              </div>

              <div className="space-y-2.5">
                {items.map((item, i) => (
                  <div key={i} className="p-2.5 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase">Item {i + 1}</span>
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <Select
                      options={productOptions}
                      value={item.product_id}
                      searchable
                      onSearch={onProductSearch}
                      loading={productsLoading}
                      onChange={(val) => updateItem(i, 'product_id', val)}
                      placeholder="Select product..."
                      size="sm"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Select
                        options={adjustmentTypeOptions}
                        value={item.adjustment_type}
                        onChange={(val) => updateItem(i, 'adjustment_type', val)}
                        size="sm"
                      />
                      <Input
                        type="number"
                        step="0.001"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                        size="sm"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Cost ₹"
                        value={item.unit_cost}
                        onChange={(e) => updateItem(i, 'unit_cost', e.target.value)}
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
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

export default StockAdjustmentCreateForm;
