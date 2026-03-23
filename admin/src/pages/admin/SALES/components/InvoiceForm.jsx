import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { PageHeader, Button, Input, Select, Card, DatePicker } from '@components/ui';
import { useToast } from '@components/ui/Toast';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';
import useAsyncOptions from '@/hooks/useAsyncOptions';

const emptyItem = { product_id: '', quantity: 1, unit_price: 0, discount_percent: 0, description: '' };

const InvoiceForm = () => {
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
      navigate('/admin/sales/invoices');
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
        description: item.description || undefined,
      })),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Sales Invoice"
        subtitle="Create an invoice for a customer"
        breadcrumb={{
          items: [
            { label: 'Sales Invoices', href: '/admin/sales/invoices' },
            { label: 'New Invoice' },
          ],
        }}
        sticky
      >
        <Button variant="outline" size="sm" prefixIcon={ArrowLeft} onClick={() => navigate('/admin/sales/invoices')}>
          Back
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-5xl">
        {/* Customer & Dates */}
        <Card>
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Controller
                name="party_id"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Customer (optional)"
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
            <div className="mt-4">
              <Input
                label="Place of Supply (State Code)"
                {...register('place_of_supply')}
                maxLength={2}
                placeholder="e.g. 27"
                size="sm"
                className="w-48"
              />
            </div>
          </Card.Body>
        </Card>

        {/* Line Items */}
        <Card>
          <Card.Body>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Items</h3>
              <Button variant="outline" size="sm" type="button" prefixIcon={Plus} onClick={addItem}>
                Add Item
              </Button>
            </div>
            {itemsError && <p className="text-sm text-red-500 mb-3">{itemsError}</p>}
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 px-1">
                <div className="col-span-4">Product</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Unit Price</div>
                <div className="col-span-1">Disc %</div>
                <div className="col-span-2 text-right">Line Total</div>
                <div className="col-span-1" />
              </div>
              {items.map((item, i) => {
                const line = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
                const disc = (line * (parseFloat(item.discount_percent) || 0)) / 100;
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
                      <span className="text-sm font-mono font-medium">{formatCurrency(line - disc)}</span>
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

            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#2a2a2a] flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-mono font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm gap-2">
                  <span className="text-gray-500">Discount</span>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('discount_amount')}
                    size="sm"
                    className="w-24 text-right"
                  />
                </div>
                <div className="flex items-center justify-between text-sm gap-2">
                  <span className="text-gray-500">Round Off</span>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('round_off')}
                    size="sm"
                    className="w-24 text-right"
                  />
                </div>
                <p className="text-xs text-gray-400">Tax auto-calculated from product rates + place of supply.</p>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Notes & Actions */}
        <Card>
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Notes"
                {...register('notes')}
                size="sm"
              />
              <Input
                label="Terms & Conditions"
                {...register('terms')}
                size="sm"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" type="button" size="sm" onClick={() => navigate('/admin/sales/invoices')}>
                Cancel
              </Button>
              <Button type="submit" size="sm" loading={mutation.isPending}>
                Create Invoice
              </Button>
            </div>
          </Card.Body>
        </Card>
      </form>
    </div>
  );
};

export default InvoiceForm;
