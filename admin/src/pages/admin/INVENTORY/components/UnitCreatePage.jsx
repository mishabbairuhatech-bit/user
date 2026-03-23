import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { PageHeader, Card, Button, Input } from '@components/ui';
import { useToast } from '@components/ui/Toast';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const UnitCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      short_name: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => api.post(API.UNITS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.UNITS] });
      toast.success('Unit created successfully');
      navigate('/admin/inventory/units');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create unit');
    },
  });

  const onSubmit = (data) => {
    mutation.mutate({ name: data.name.trim(), short_name: data.short_name.trim() });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Unit"
        subtitle="Add a new unit of measurement"
        breadcrumb={{
          items: [
            { label: 'Inventory' },
            { label: 'Units', href: '/admin/inventory/units' },
            { label: 'Create Unit' },
          ],
        }}
        sticky
      >
        <Button variant="outline" size="sm" prefixIcon={ArrowLeft} onClick={() => navigate('/admin/inventory/units')}>
          Back
        </Button>
      </PageHeader>

      <Card>
        <Card.Body>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Name"
              required
              placeholder="e.g. Kilograms"
              error={errors.name?.message}
              {...register('name', { required: 'Name is required' })}
            />
            <Input
              label="Short Name"
              required
              placeholder="e.g. KG"
              error={errors.short_name?.message}
              {...register('short_name', { required: 'Short name is required' })}
            />
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-[#424242]">
              <Button type="button" size="sm" variant="outline" onClick={() => navigate('/admin/inventory/units')}>
                Cancel
              </Button>
              <Button type="submit" size="sm" loading={mutation.isPending}>
                Create Unit
              </Button>
            </div>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UnitCreatePage;
