import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { PageHeader, Card, Button, Input, Select, DatePicker } from '@components/ui';
import { useToast } from '@components/ui/Toast';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';
import useAsyncOptions from '@/hooks/useAsyncOptions';

const emptyItem = { product_id: '', quantity: 1, unit_price: 0, discount_percent: 0 };

const PurchaseBillForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { register, handleSubmit, control, formState: { errors }, setValue } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      due_date: '',
      vendor_bill_number: '',
      party_id: '',
      place_of_supply: '',
      round_off: 0,
      notes: '',
    },
  });

  const [items, setItems] = useState([{ ...emptyItem }]);
  const [itemsError, setItemsError] = useState('');

  const { options: vendorOptions, loading: vendorsLoading, onSearch: onVendorSearch } = useAsyncOptions(
    API.PARTIES,
    { type: 'vendor' },
    (v) => ({ value: v.id, label: `${v.name}${v.gstin ? ` (${v.gstin})` : ''}`, data: v })
  );

  const { options: productOptions, loading: productsLoading, onSearch: onProductSearch } = useAsyncOptions(
    API.PRODUCTS,
    { is_active: 'true' },
    (p) => ({ value: p.id, label: `${p.name} (${p.sku})`, data: p })
  );

  const addItem = () => setItems((prev) => [...prev, { ...emptyItem }]);

  const removeItem = (i) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, idx) => idx !== i));
    }
  };

  const updateItem = (i, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [field]: value };

      if (field === 'product_id') {
        const opt = productOptions.find((o) => o.value === value);
        if (opt?.data) updated[i].unit_price = parseFloat(opt.data.purchase_price) || 0;
      }

      return updated;
    });
    if (itemsError) setItemsError('');
  };

  const fmt = (val) => `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const subtotal = items.reduce((sum, item) => {
    const lineTotal = (item.quantity || 0) * (item.unit_price || 0);
    const discount = (lineTotal * (item.discount_percent || 0)) / 100;
    return sum + lineTotal - discount;
  }, 0);

  const createMutation = useMutation({
    mutationFn: (data) => api.post(API.PURCHASE_BILLS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.PURCHASE_BILLS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.PRODUCTS] });
      toast.success('Purchase bill created successfully');
      navigate('/admin/purchases/bills');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create bill');
    },
  });

  const onSubmit = (data) => {
    if (items.length === 0 || !items.some((it) => it.product_id)) {
      setItemsError('At least one item is required');
      return;
    }

    createMutation.mutate({
      ...data,
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
    <div className="space-y-6">
      <PageHeader
        title="Create Bill"
        subtitle="Record a new purchase bill"
        breadcrumb={{
          items: [
            { label: 'Bills', href: '/admin/purchases/bills' },
            { label: 'Create Bill' },
          ],
        }}
        sticky
      >
        <Button variant="outline" size="sm" prefixIcon={ArrowLeft} onClick={() => navigate('/admin/purchases/bills')}>
          Back
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-5xl">
        <Card>
          <Card.Body>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Controller
                  name="party_id"
                  control={control}
                  rules={{ required: 'Vendor is required' }}
                  render={({ field }) => (
                    <Select
                      label="Vendor *"
                      required
                      options={vendorOptions}
                      value={field.value}
                      searchable
                      onSearch={onVendorSearch}
                      loading={vendorsLoading}
                      onChange={(val) => {
                        field.onChange(val);
                        const opt = vendorOptions.find((o) => o.value === val);
                        setValue('place_of_supply', opt?.data?.state_code || '');
                      }}
                      placeholder="Select vendor..."
                      error={errors.party_id?.message}
                      size="sm"
                    />
                  )}
                />
                <Controller
                  name="date"
                  control={control}
                  rules={{ required: 'Date is required' }}
                  render={({ field }) => (
                    <DatePicker
                      label="Date *"
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Vendor Bill #"
                  placeholder="Vendor's invoice number"
                  {...register('vendor_bill_number')}
                  size="sm"
                />
                <Input
                  label="Place of Supply (State Code)"
                  placeholder="e.g. 27"
                  {...register('place_of_supply')}
                  maxLength={2}
                  size="sm"
                />
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Items */}
        <Card>
          <Card.Body>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Items</h3>
              <Button variant="outline" size="sm" type="button" prefixIcon={Plus} onClick={addItem}>
                Add Item
              </Button>
            </div>
            {itemsError && (
              <p className="text-sm text-red-600 mb-3">{itemsError}</p>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 px-1">
                <div className="col-span-4">Product</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Unit Price</div>
                <div className="col-span-1">Disc %</div>
                <div className="col-span-2 text-right">Line Total</div>
                <div className="col-span-1"></div>
              </div>
              {items.map((item, i) => {
                const lineSubtotal = (item.quantity || 0) * (item.unit_price || 0);
                const discount = (lineSubtotal * (item.discount_percent || 0)) / 100;
                const lineTotal = lineSubtotal - discount;
                return (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4">
                      <Select
                        options={productOptions}
                        value={item.product_id}
                        onChange={(val) => updateItem(i, 'product_id', val)}
                        placeholder="Select..."
                        searchable
                        onSearch={onProductSearch}
                        loading={productsLoading}
                        size="sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="0.001"
                        value={item.quantity}
                        onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                        size="sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(i, 'unit_price', e.target.value)}
                        size="sm"
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        step="0.01"
                        value={item.discount_percent}
                        onChange={(e) => updateItem(i, 'discount_percent', e.target.value)}
                        size="sm"
                      />
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">{fmt(lineTotal)}</span>
                    </div>
                    <div className="col-span-1 text-center">
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#2a2a2a] flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-mono font-medium">{fmt(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm gap-2">
                  <span className="text-gray-500">Round Off</span>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('round_off')}
                    className="w-24 text-right"
                    size="sm"
                  />
                </div>
                <p className="text-xs text-gray-400">Tax will be auto-calculated based on product tax rates and place of supply.</p>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Notes & Submit */}
        <Card>
          <Card.Body>
            <div className="space-y-4">
              <Input
                label="Notes"
                {...register('notes')}
                placeholder="Add any notes..."
                size="sm"
              />
              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" size="sm" onClick={() => navigate('/admin/purchases/bills')}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" loading={createMutation.isPending}>
                  Create Purchase Bill
                </Button>
              </div>
              {createMutation.isError && (
                <p className="text-sm text-red-600">{createMutation.error?.response?.data?.message || 'Failed to create bill.'}</p>
              )}
            </div>
          </Card.Body>
        </Card>
      </form>
    </div>
  );
};

export default PurchaseBillForm;
