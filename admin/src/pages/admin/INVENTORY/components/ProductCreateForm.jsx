import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Maximize2 } from 'lucide-react';
import { Input, Button, Select } from '@components/ui';
import { useToast } from '@components/ui/Toast';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const ProductCreateForm = ({ onClose }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { register, handleSubmit, control, formState: { errors }, setError } = useForm({
    defaultValues: {
      name: '',
      sku: '',
      barcode: '',
      category_id: '',
      unit_id: '',
      tax_rate_id: '',
      purchase_price: '',
      selling_price: '',
      minimum_stock: '',
      opening_stock: '',
      description: '',
    },
  });

  const { data: categories } = useQuery({
    queryKey: [QUERY_KEY.CATEGORIES],
    queryFn: async () => {
      const res = await api.get(API.CATEGORIES);
      return res.data.data || res.data;
    },
  });

  const { data: units } = useQuery({
    queryKey: [QUERY_KEY.UNITS],
    queryFn: async () => {
      const res = await api.get(API.UNITS);
      return res.data.data || res.data;
    },
  });

  const { data: taxRates } = useQuery({
    queryKey: [QUERY_KEY.TAX_RATES],
    queryFn: async () => {
      const res = await api.get(API.TAX_RATES);
      return res.data.data || res.data;
    },
  });

  const flatCategories = (categories || []).flatMap((c) => [
    { value: c.id, label: c.name },
    ...(c.children || []).map((ch) => ({ value: ch.id, label: `  └ ${ch.name}` })),
  ]);

  const unitOptions = (units || []).map((u) => ({
    value: u.id,
    label: `${u.name} (${u.short_name})`,
  }));

  const taxRateOptions = (taxRates || []).map((t) => ({
    value: t.id,
    label: `${t.name} (${t.rate}%)`,
  }));

  const mutation = useMutation({
    mutationFn: (data) => api.post(API.PRODUCTS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.PRODUCTS] });
      toast.success('Product created successfully');
      onClose();
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Failed to create product';
      if (err.response?.status === 409) {
        setError('sku', { message });
      } else {
        toast.error(message);
      }
    },
  });

  const onSubmit = (data) => {
    const payload = {
      name: data.name.trim(),
      sku: data.sku.trim(),
      purchase_price: parseFloat(data.purchase_price) || 0,
      selling_price: parseFloat(data.selling_price) || 0,
    };
    if (data.barcode.trim()) payload.barcode = data.barcode.trim();
    if (data.category_id) payload.category_id = data.category_id;
    if (data.unit_id) payload.unit_id = data.unit_id;
    if (data.tax_rate_id) payload.tax_rate_id = data.tax_rate_id;
    if (data.minimum_stock) payload.minimum_stock = parseFloat(data.minimum_stock) || 0;
    if (data.opening_stock) payload.opening_stock = parseFloat(data.opening_stock) || 0;
    if (data.description.trim()) payload.description = data.description.trim();

    mutation.mutate(payload);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-[#424242] flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Create Product</h3>
        <button
          onClick={() => navigate('/admin/inventory/products/new')}
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
              label="Product Name"
              required
              placeholder="Enter product name"
              error={errors.name?.message}
              size="sm"
              {...register('name', { required: 'Product name is required' })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="SKU"
                required
                placeholder="e.g. PRD-001"
                error={errors.sku?.message}
                size="sm"
                {...register('sku', { required: 'SKU is required' })}
              />
              <Input
                label="Barcode"
                placeholder="Optional"
                error={errors.barcode?.message}
                size="sm"
                {...register('barcode')}
              />
            </div>
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <Select
                  label="Category"
                  options={flatCategories}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select category"
                  size="sm"
                />
              )}
            />
            <div className="grid grid-cols-2 gap-2">
              <Controller
                name="unit_id"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Unit"
                    options={unitOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select unit"
                    size="sm"
                  />
                )}
              />
              <Controller
                name="tax_rate_id"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Tax Rate"
                    options={taxRateOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select tax rate"
                    size="sm"
                  />
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Purchase Price"
                required
                type="number"
                step="0.01"
                placeholder="0.00"
                error={errors.purchase_price?.message}
                size="sm"
                {...register('purchase_price', { required: 'Purchase price is required' })}
              />
              <Input
                label="Selling Price"
                required
                type="number"
                step="0.01"
                placeholder="0.00"
                error={errors.selling_price?.message}
                size="sm"
                {...register('selling_price', { required: 'Selling price is required' })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Minimum Stock"
                type="number"
                step="0.001"
                placeholder="0"
                error={errors.minimum_stock?.message}
                size="sm"
                {...register('minimum_stock')}
              />
              <Input
                label="Opening Stock"
                type="number"
                step="0.001"
                placeholder="0"
                error={errors.opening_stock?.message}
                size="sm"
                {...register('opening_stock')}
              />
            </div>
            <Input
              label="Description"
              placeholder="Product description"
              error={errors.description?.message}
              size="sm"
              {...register('description')}
            />
          </div>
        </div>

        {/* Actions - fixed at bottom */}
        <div className="flex items-center gap-2 px-5 py-3 border-t border-gray-200 dark:border-[#424242] flex-shrink-0">
          <Button type="submit" size="sm" loading={mutation.isPending} className="flex-1">
            Create Product
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductCreateForm;
