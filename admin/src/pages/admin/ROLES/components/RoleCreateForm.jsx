import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Maximize2 } from 'lucide-react';
import { Input, Button, Collapse, Checkbox } from '@components/ui';
import { useToast } from '@components/ui/Toast';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const RoleCreateForm = ({ onClose }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [errors, setErrors] = useState({});

  const { data: permissionsGrouped = {} } = useQuery({
    queryKey: [QUERY_KEY.PERMISSIONS_GROUPED],
    queryFn: () => api.get(API.PERMISSIONS_GROUPED).then((res) => res.data.data || res.data),
  });

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugManuallyEdited && name) {
      setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''));
    }
  }, [name, slugManuallyEdited]);

  const moduleNames = useMemo(() => Object.keys(permissionsGrouped).sort(), [permissionsGrouped]);

  const togglePermission = (permId) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  };

  const toggleSelectAllModule = (moduleName, perms) => {
    const permIds = perms.map((p) => p.id);
    const allSelected = permIds.every((id) => selectedPermissions.has(id));
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (allSelected) permIds.forEach((id) => next.delete(id));
      else permIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!slug.trim()) errs.slug = 'Slug is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (data) => api.post(API.ROLES_CREATE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.ROLES_LIST] });
      toast.success('Role created successfully');
      onClose();
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Failed to create role';
      toast.error(message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate({
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      permission_ids: Array.from(selectedPermissions),
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-[#424242] flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Create Role</h3>
        <button
          onClick={() => navigate('/admin/roles/create')}
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
              placeholder="e.g. Manager"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              size="sm"
            />
            <Input
              label="Slug"
              placeholder="e.g. manager"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugManuallyEdited(true); }}
              error={errors.slug}
              size="sm"
            />
            <Input
              label="Description"
              placeholder="What is this role for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              size="sm"
            />

          {/* Permissions Picker */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Permissions ({selectedPermissions.size} selected)
            </label>
            <div className="space-y-1.5 max-h-[320px] overflow-y-auto scrollbar-hide">
              {moduleNames.map((moduleName) => {
                const perms = permissionsGrouped[moduleName];
                const permIds = perms.map((p) => p.id);
                const allSelected = permIds.every((id) => selectedPermissions.has(id));
                const selectedCount = permIds.filter((id) => selectedPermissions.has(id)).length;

                return (
                  <Collapse
                    key={moduleName}
                    title={moduleName}
                    suffix={
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[10px] text-gray-400 font-mono">{selectedCount}/{perms.length}</span>
                        <button
                          type="button"
                          onClick={() => toggleSelectAllModule(moduleName, perms)}
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors ${
                            allSelected ? 'text-primary-700 dark:text-primary-400' : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          {allSelected ? 'Deselect' : 'All'}
                        </button>
                      </div>
                    }
                    headerClassName="capitalize"
                  >
                    <div className="space-y-0.5">
                      {perms.map((perm) => (
                        <div key={perm.id} className="px-1 py-1 rounded hover:bg-gray-50 dark:hover:bg-[#252525]">
                          <Checkbox
                            checked={selectedPermissions.has(perm.id)}
                            onChange={() => togglePermission(perm.id)}
                            size="sm"
                            label={perm.slug}
                            className="text-[11px] font-mono"
                          />
                        </div>
                      ))}
                    </div>
                  </Collapse>
                );
              })}
            </div>
          </div>
          </div>
        </div>

        {/* Actions - fixed at bottom */}
        <div className="flex items-center gap-2 px-5 py-3 border-t border-gray-200 dark:border-[#424242] flex-shrink-0">
          <Button type="submit" size="sm" loading={mutation.isPending} className="flex-1">
            Create Role
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RoleCreateForm;
