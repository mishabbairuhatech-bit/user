import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Maximize2 } from 'lucide-react';
import { Input, Button } from '@components/ui';
import { useToast } from '@components/ui/Toast';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const initialForm = {
  name: '',
  rate: '',
  cess_rate: '',
};

const TaxRateCreateForm = ({ onClose }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.rate && form.rate !== 0) errs.rate = 'Rate is required';
    else if (parseFloat(form.rate) < 0) errs.rate = 'Rate must be non-negative';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (data) => api.post(API.TAX_RATES, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.TAX_RATES] });
      toast.success('Tax rate created successfully');
      onClose();
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Failed to create tax rate';
      toast.error(message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      rate: parseFloat(form.rate) || 0,
      cess_rate: parseFloat(form.cess_rate) || 0,
    };

    mutation.mutate(payload);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-[#424242] flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Add Tax Rate</h3>
        <button
          onClick={() => navigate('/admin/tax/rates/create')}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
          title="Expand to full page"
        >
          <Maximize2 size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4">
          <div className="space-y-3">
            <Input
              label="Name"
              placeholder="e.g. GST 18%"
              value={form.name}
              onChange={handleChange('name')}
              error={errors.name}
              size="sm"
            />
            <Input
              label="Total GST Rate (%)"
              type="number"
              step="0.01"
              placeholder="e.g. 18"
              value={form.rate}
              onChange={handleChange('rate')}
              error={errors.rate}
              size="sm"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              CGST and SGST will be auto-calculated as half of the total rate. IGST equals the total rate.
            </p>
            <Input
              label="Cess Rate (%) - optional"
              type="number"
              step="0.01"
              placeholder="0"
              value={form.cess_rate}
              onChange={handleChange('cess_rate')}
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

export default TaxRateCreateForm;
