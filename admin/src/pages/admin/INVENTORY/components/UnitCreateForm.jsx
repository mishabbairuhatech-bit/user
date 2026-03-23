import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Maximize2 } from 'lucide-react';
import { Input, Button } from '@components/ui';
import { useToast } from '@components/ui/Toast';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const UnitCreateForm = ({ onClose, editingUnit }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const isEdit = !!editingUnit;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: editingUnit?.name || '',
      short_name: editingUnit?.short_name || '',
    },
  });

  // Re-sync form when editingUnit changes (switching between different units)
  useEffect(() => {
    if (editingUnit) {
      reset({
        name: editingUnit.name || '',
        short_name: editingUnit.short_name || '',
      });
    } else {
      reset({
        name: '',
        short_name: '',
      });
    }
  }, [editingUnit, reset]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit
        ? api.put(`${API.UNITS}/${editingUnit.id}`, data)
        : api.post(API.UNITS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.UNITS] });
      toast.success(isEdit ? 'Unit updated successfully' : 'Unit created successfully');
      onClose();
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Failed to save unit';
      toast.error(message);
    },
  });

  const onSubmit = (data) => {
    mutation.mutate({
      name: data.name.trim(),
      short_name: data.short_name.trim(),
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-[#424242] flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          {isEdit ? 'Edit Unit' : 'Create Unit'}
        </h3>
        <div className="flex items-center gap-1">
          {!isEdit && (
            <button
              onClick={() => navigate('/admin/inventory/units/new')}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
              title="Expand to full page"
            >
              <Maximize2 size={14} className="text-gray-500" />
            </button>
          )}
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
            <Input
              label="Name"
              required
              placeholder="e.g. Kilograms"
              error={errors.name?.message}
              size="sm"
              {...register('name', { required: 'Name is required' })}
            />
            <Input
              label="Short Name"
              required
              placeholder="e.g. KG"
              error={errors.short_name?.message}
              size="sm"
              {...register('short_name', { required: 'Short name is required' })}
            />
          </div>
        </div>

        {/* Actions - fixed at bottom */}
        <div className="flex items-center gap-2 px-5 py-3 border-t border-gray-200 dark:border-[#424242] flex-shrink-0">
          <Button type="submit" size="sm" loading={mutation.isPending} className="flex-1">
            {isEdit ? 'Update Unit' : 'Create Unit'}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UnitCreateForm;
