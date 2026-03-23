import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { PageHeader, Card, Button, Input, Select, DatePicker } from '@components/ui';
import { useToast } from '@components/ui/Toast';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';
import useAsyncOptions from '@/hooks/useAsyncOptions';

const emptyItem = { product_id: '', adjustment_type: 'increase', quantity: '', unit_cost: '' };

const StockAdjustmentCreatePage = () => {
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
    { value: 'increase', label: '+ Increase' },
    { value: 'decrease', label: '- Decrease' },
  ];

  const addItem = () => setItems([...items, { ...emptyItem }]);
  const removeItem = (i) => { if (items.length > 1) setItems(items.filter((_, idx) => idx !== i)); };
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
      navigate('/admin/inventory/stock-adjustments');
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
    <div className="space-y-6">
      <PageHeader
        title="Create Adjustment"
        subtitle="Record a manual stock correction"
        breadcrumb={{
          items: [
            { label: 'Inventory' },
            { label: 'Stock Adjustments', href: '/admin/inventory/stock-adjustments' },
            { label: 'Create Adjustment' },
          ],
        }}
        sticky
      >
        <Button variant="outline" size="sm" prefixIcon={ArrowLeft} onClick={() => navigate('/admin/inventory/stock-adjustments')}>
          Back
        </Button>
      </PageHeader>

      <Card>
        <Card.Body>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  />
                )}
              />
              <Input
                label="Reason"
                placeholder="e.g. Physical count correction"
                {...register('reason')}
              />
            </div>

            {/* Items */}
            <div className="pt-4 border-t border-gray-200 dark:border-[#424242]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Items</h3>
                <Button variant="outline" size="sm" type="button" prefixIcon={Plus} onClick={addItem}>Add Item</Button>
              </div>

            <div className="space-y-3">
              {/* Column headers - desktop only */}
              <div className={`hidden sm:grid ${items.length > 1 ? 'sm:grid-cols-12' : 'sm:grid-cols-11'} gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 px-1`}>
                <div className="sm:col-span-4">Product</div>
                <div className="sm:col-span-2">Type</div>
                <div className="sm:col-span-2">Qty</div>
                <div className="sm:col-span-3">Unit Cost (₹)</div>
              </div>
              {items.map((item, i) => (
                <div key={i} className={`grid grid-cols-2 ${items.length > 1 ? 'sm:grid-cols-12' : 'sm:grid-cols-11'} gap-2 items-center`}>
                  <div className="col-span-1 sm:col-span-4">
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
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <Select
                      options={adjustmentTypeOptions}
                      value={item.adjustment_type}
                      onChange={(val) => updateItem(i, 'adjustment_type', val)}
                      size="sm"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <Input
                      type="number"
                      step="0.001"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                      size="sm"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-3">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={item.unit_cost}
                      onChange={(e) => updateItem(i, 'unit_cost', e.target.value)}
                      size="sm"
                    />
                  </div>
                  {items.length > 1 && (
                    <div className="col-span-2 sm:col-span-1 flex justify-center sm:justify-center">
                      <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-[#424242]">
              <Button type="button" size="sm" variant="outline" onClick={() => navigate('/admin/inventory/stock-adjustments')}>
                Cancel
              </Button>
              <Button type="submit" size="sm" loading={mutation.isPending}>
                Create Adjustment
              </Button>
            </div>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default StockAdjustmentCreatePage;
