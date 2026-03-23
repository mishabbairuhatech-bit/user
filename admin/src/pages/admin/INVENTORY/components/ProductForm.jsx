import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { PageHeader, Button, Card, Input, Select } from '@components/ui';
import { useToast } from '@components/ui/Toast';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const queryClient = useQueryClient();
  const toast = useToast();

  const { register, handleSubmit, control, reset, formState: { errors }, setError } = useForm({
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

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: [QUERY_KEY.PRODUCT_DETAIL, id],
    queryFn: async () => {
      const res = await api.get(`${API.PRODUCTS}/${id}`);
      return res.data.data || res.data;
    },
    enabled: isEdit,
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
      const result = res.data.data || res.data;
      return result.items || result;
    },
  });

  const { data: taxRates } = useQuery({
    queryKey: [QUERY_KEY.TAX_RATES],
    queryFn: async () => {
      const res = await api.get(API.TAX_RATES);
      return res.data.data || res.data;
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        category_id: product.category_id || '',
        unit_id: product.unit_id || '',
        tax_rate_id: product.tax_rate_id || '',
        purchase_price: product.purchase_price || '',
        selling_price: product.selling_price || '',
        minimum_stock: product.minimum_stock || '',
        opening_stock: product.opening_stock || '',
        description: product.description || '',
      });
    }
  }, [product, reset]);

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
    mutationFn: (data) =>
      isEdit ? api.put(`${API.PRODUCTS}/${id}`, data) : api.post(API.PRODUCTS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.PRODUCTS] });
      toast.success(isEdit ? 'Product updated successfully' : 'Product created successfully');
      navigate('/admin/inventory/products');
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Failed to save product';
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
    if (!isEdit && data.opening_stock) payload.opening_stock = parseFloat(data.opening_stock) || 0;
    if (data.description.trim()) payload.description = data.description.trim();

    mutation.mutate(payload);
  };

  if (isEdit && productLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Edit Product' : 'Create Product'}
        subtitle={isEdit ? product?.name : 'Add a new product to inventory'}
        breadcrumb={{
          items: [
            { label: 'Products', href: '/admin/inventory/products' },
            { label: isEdit ? 'Edit Product' : 'Create Product' },
          ],
        }}
        sticky
      >
        <Button variant="outline" size="sm" prefixIcon={ArrowLeft} onClick={() => navigate('/admin/inventory/products')}>
          Back
        </Button>
      </PageHeader>

      <Card>
        <Card.Body>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Product Name"
                required
                placeholder="Enter product name"
                error={errors.name?.message}
                {...register('name', { required: 'Product name is required' })}
              />
              <Input
                label="SKU"
                required
                placeholder="e.g. PRD-001"
                error={errors.sku?.message}
                disabled={isEdit}
                {...register('sku', { required: 'SKU is required' })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Barcode"
                placeholder="Optional"
                error={errors.barcode?.message}
                {...register('barcode')}
              />
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
                  />
                )}
              />
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
                  />
                )}
              />
            </div>
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
                />
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Purchase Price"
                required
                type="number"
                step="0.01"
                placeholder="0.00"
                error={errors.purchase_price?.message}
                {...register('purchase_price', { required: 'Purchase price is required' })}
              />
              <Input
                label="Selling Price"
                required
                type="number"
                step="0.01"
                placeholder="0.00"
                error={errors.selling_price?.message}
                {...register('selling_price', { required: 'Selling price is required' })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Minimum Stock"
                type="number"
                step="0.001"
                placeholder="0"
                error={errors.minimum_stock?.message}
                {...register('minimum_stock')}
              />
              {!isEdit && (
                <Input
                  label="Opening Stock"
                  type="number"
                  step="0.001"
                  placeholder="0"
                  error={errors.opening_stock?.message}
                  {...register('opening_stock')}
                />
              )}
            </div>
            <Input
              label="Description"
              placeholder="Product description"
              error={errors.description?.message}
              {...register('description')}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-[#424242]">
              <Button type="button" size="sm" variant="outline" onClick={() => navigate('/admin/inventory/products')}>
                Cancel
              </Button>
              <Button type="submit" size="sm" loading={mutation.isPending}>
                {isEdit ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProductForm;
