import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { PageHeader, Button, Card, Input } from '@components/ui';
import { useToast } from '@components/ui/Toast';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const RoleCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [errors, setErrors] = useState({});

  const { data: permissionsGrouped = {} } = useQuery({
    queryKey: [QUERY_KEY.PERMISSIONS_GROUPED],
    queryFn: () => api.get(API.PERMISSIONS_GROUPED).then((res) => res.data.data || res.data),
  });

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

  const toggleModule = (moduleName) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleName)) next.delete(moduleName);
      else next.add(moduleName);
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
      navigate('/admin/roles');
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
    <div className="space-y-6">
      <PageHeader
        title="Create Role"
        subtitle="Define a new role with specific permissions"
        breadcrumb={{
          items: [
            { label: 'Roles & Permissions', href: '/admin/roles' },
            { label: 'Create Role' },
          ],
        }}
        sticky
      >
        <Button variant="outline" size="sm" prefixIcon={ArrowLeft} onClick={() => navigate('/admin/roles')}>
          Back
        </Button>
      </PageHeader>

      <Card>
        <Card.Body>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Name"
                placeholder="e.g. Manager"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
              />
              <Input
                label="Slug"
                placeholder="e.g. manager"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugManuallyEdited(true); }}
                error={errors.slug}
              />
            </div>
            <Input
              label="Description"
              placeholder="What is this role for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* Permissions Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Permissions ({selectedPermissions.size} selected)
              </label>
              <div className="space-y-1 border border-gray-200 dark:border-[#3a3a3a] rounded-lg">
                {moduleNames.map((moduleName) => {
                  const perms = permissionsGrouped[moduleName];
                  const isExpanded = expandedModules.has(moduleName);
                  const permIds = perms.map((p) => p.id);
                  const allSelected = permIds.every((id) => selectedPermissions.has(id));
                  const selectedCount = permIds.filter((id) => selectedPermissions.has(id)).length;

                  return (
                    <div key={moduleName} className="border-b border-gray-100 dark:border-[#2a2a2a] last:border-0">
                      <div
                        className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
                        onClick={() => toggleModule(moduleName)}
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">{moduleName}</span>
                          <span className="text-xs text-gray-400 font-mono">{selectedCount}/{perms.length}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleSelectAllModule(moduleName, perms); }}
                          className={`text-xs font-medium px-2 py-0.5 rounded transition-colors ${
                            allSelected
                              ? 'text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {allSelected ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      {isExpanded && (
                        <div className="px-4 pb-3 pt-1 space-y-1 border-t border-gray-100 dark:border-[#2a2a2a]">
                          {perms.map((perm) => (
                            <label key={perm.id} className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-[#252525] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedPermissions.has(perm.id)}
                                onChange={() => togglePermission(perm.id)}
                                className="w-4 h-4 rounded border-gray-300 dark:border-[#3a3a3a] text-primary-600 focus:ring-primary-500 dark:bg-[#121212]"
                              />
                              <div>
                                <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">{perm.slug}</span>
                                {perm.description && (
                                  <span className="text-xs text-gray-400 ml-2">— {perm.description}</span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-[#424242]">
              <Button type="button" size="sm" variant="outline" onClick={() => navigate('/admin/roles')}>
                Cancel
              </Button>
              <Button type="submit" size="sm" loading={mutation.isPending}>
                Create Role
              </Button>
            </div>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default RoleCreatePage;
