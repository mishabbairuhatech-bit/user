import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Maximize2 } from 'lucide-react';
import { Input, Button, Select, MultiSelect } from '@components/ui';
import { useToast } from '@components/ui/Toast';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const timezoneOptions = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'America/New York' },
  { value: 'America/Chicago', label: 'America/Chicago' },
  { value: 'America/Denver', label: 'America/Denver' },
  { value: 'America/Los_Angeles', label: 'America/Los Angeles' },
  { value: 'Europe/London', label: 'Europe/London' },
  { value: 'Europe/Paris', label: 'Europe/Paris' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney' },
];

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
];

const initialForm = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  phone: '',
  timezone: 'UTC',
  language: ['en'],
  role_id: '',
};

const UserCreateForm = ({ onClose }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const { data: roles = [] } = useQuery({
    queryKey: [QUERY_KEY.ROLES_LIST],
    queryFn: async () => {
      const res = await api.get(API.ROLES_LIST);
      return res.data.data || res.data;
    },
  });

  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }));

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'First name is required';
    if (!form.last_name.trim()) errs.last_name = 'Last name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (data) => api.post(API.USERS_CREATE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.USERS_LIST] });
      toast.success('User created successfully');
      onClose();
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Failed to create user';
      if (err.response?.status === 409) {
        setErrors((prev) => ({ ...prev, email: message }));
      } else {
        toast.error(message);
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      password: form.password,
    };
    if (form.phone.trim()) payload.phone = form.phone.trim();
    if (form.timezone) payload.timezone = form.timezone;
    if (form.language && form.language.length > 0) payload.language = form.language[0];
    if (form.role_id) payload.role_id = form.role_id;

    mutation.mutate(payload);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-[#424242] flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Create User</h3>
        <button
          onClick={() => navigate('/admin/users/create')}
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
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="First Name"
                placeholder="John"
                value={form.first_name}
                onChange={handleChange('first_name')}
                error={errors.first_name}
                size="sm"
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                value={form.last_name}
                onChange={handleChange('last_name')}
                error={errors.last_name}
                size="sm"
              />
            </div>
            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={handleChange('email')}
              error={errors.email}
              size="sm"
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min 8 characters"
              value={form.password}
              onChange={handleChange('password')}
              error={errors.password}
              size="sm"
            />
            <Input
              label="Phone"
              placeholder="+1234567890"
              value={form.phone}
              onChange={handleChange('phone')}
              error={errors.phone}
              size="sm"
            />
            <Select
              label="Role"
              options={roleOptions}
              value={form.role_id}
              onChange={(val) => setForm((prev) => ({ ...prev, role_id: val }))}
              placeholder="Select a role"
              size="sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <Select
                label="Timezone"
                options={timezoneOptions}
                value={form.timezone}
                onChange={(val) => setForm((prev) => ({ ...prev, timezone: val }))}
                error={errors.timezone}
                size="sm"
              />
              <MultiSelect
                label="Language"
                options={languageOptions}
                value={form.language}
                onChange={(val) => setForm((prev) => ({ ...prev, language: val }))}
                error={errors.language}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Actions - fixed at bottom */}
        <div className="flex items-center gap-2 px-5 py-3 border-t border-gray-200 dark:border-[#424242] flex-shrink-0">
          <Button type="submit" size="sm" loading={mutation.isPending} className="flex-1">
            Create User
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserCreateForm;
