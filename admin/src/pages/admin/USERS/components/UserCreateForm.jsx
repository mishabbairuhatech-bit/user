import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
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

const UserCreateForm = ({ onClose }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { register, handleSubmit, control, formState: { errors }, setError } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      phone: '',
      timezone: 'UTC',
      language: ['en'],
      role_id: '',
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: [QUERY_KEY.ROLES_LIST],
    queryFn: async () => {
      const res = await api.get(API.ROLES_LIST);
      return res.data.data || res.data;
    },
  });

  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }));

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
        setError('email', { message });
      } else {
        toast.error(message);
      }
    },
  });

  const onSubmit = (data) => {
    const payload = {
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      email: data.email.trim(),
      password: data.password,
    };
    if (data.phone.trim()) payload.phone = data.phone.trim();
    if (data.timezone) payload.timezone = data.timezone;
    if (data.language && data.language.length > 0) payload.language = data.language[0];
    if (data.role_id) payload.role_id = data.role_id;

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
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="First Name"
                required
                placeholder="John"
                error={errors.first_name?.message}
                size="sm"
                {...register('first_name', { required: 'First name is required' })}
              />
              <Input
                label="Last Name"
                required
                placeholder="Doe"
                error={errors.last_name?.message}
                size="sm"
                {...register('last_name', { required: 'Last name is required' })}
              />
            </div>
            <Input
              label="Email"
              required
              type="email"
              placeholder="john@example.com"
              error={errors.email?.message}
              size="sm"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email address',
                },
              })}
            />
            <Input
              label="Password"
              required
              type="password"
              placeholder="Min 8 characters"
              error={errors.password?.message}
              size="sm"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
              })}
            />
            <Input
              label="Phone"
              placeholder="+1234567890"
              error={errors.phone?.message}
              size="sm"
              {...register('phone')}
            />
            <Controller
              name="role_id"
              control={control}
              render={({ field }) => (
                <Select
                  label="Role"
                  options={roleOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select a role"
                  size="sm"
                />
              )}
            />
            <div className="grid grid-cols-2 gap-2">
              <Controller
                name="timezone"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Timezone"
                    options={timezoneOptions}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.timezone?.message}
                    size="sm"
                  />
                )}
              />
              <Controller
                name="language"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    label="Language"
                    options={languageOptions}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.language?.message}
                    size="sm"
                  />
                )}
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
