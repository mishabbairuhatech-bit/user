import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { PageHeader, Button, Card, Input, Spinner, Collapse, Checkbox } from '@components/ui';
import { useToast } from '@components/ui/Toast';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const RoleFormPage = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [errors, setErrors] = useState({});

  const { data: permissionsGrouped = {}, isLoading: permissionsLoading } = useQuery({
    queryKey: [QUERY_KEY.PERMISSIONS_GROUPED],
    queryFn: () => api.get(API.PERMISSIONS_GROUPED).then((res) => res.data.data || res.data),
  });

  const { data: existingRole, isLoading: roleLoading } = useQuery({
    queryKey: [QUERY_KEY.ROLES_DETAIL, id],
    queryFn: () => api.get(`${API.ROLES_DETAIL}/${id}`).then((res) => res.data.data || res.data),
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingRole) {
      setName(existingRole.name);
      setSlug(existingRole.slug);
      setDescription(existingRole.description || '');
      setSelectedPermissions(new Set(existingRole.permissions?.map((p) => p.id) || []));
      setSlugManuallyEdited(true);
    }
  }, [existingRole]);

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

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (isEditing) return api.patch(`${API.ROLES_UPDATE}/${id}`, data);
      return api.post(API.ROLES_CREATE, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.ROLES_LIST] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.ROLES_DETAIL, id] });
      toast.success(isEditing ? 'Role updated successfully' : 'Role created successfully');
      navigate('/admin/roles');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save role');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    saveMutation.mutate({
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      permission_ids: Array.from(selectedPermissions),
    });
  };

  if (permissionsLoading || (isEditing && roleLoading)) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? 'Edit Role' : 'Create Role'}
        subtitle={isEditing ? 'Modify role details and permissions' : 'Define a new role with specific permissions'}
        breadcrumb={{
          items: [
            { label: 'Roles & Permissions', href: '/admin/roles' },
            { label: isEditing ? existingRole?.name || 'Edit' : 'Create Role' },
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
                disabled={isEditing && existingRole?.is_system}
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
              <div className="space-y-2">
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
                          <span className="text-xs text-gray-400 font-mono">{selectedCount}/{perms.length}</span>
                          <button
                            type="button"
                            onClick={() => toggleSelectAllModule(moduleName, perms)}
                            className={`text-xs font-medium px-2 py-0.5 rounded transition-colors ${
                              allSelected
                                ? 'text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            {allSelected ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>
                      }
                      headerClassName="capitalize"
                    >
                      <div className="space-y-1 pt-1">
                        {perms.map((perm) => (
                          <div key={perm.id} className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-[#252525]">
                            <Checkbox
                              checked={selectedPermissions.has(perm.id)}
                              onChange={() => togglePermission(perm.id)}
                              size="sm"
                              label={
                                <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                                  {perm.slug}
                                  {perm.description && (
                                    <span className="text-xs text-gray-400 ml-2 font-sans">— {perm.description}</span>
                                  )}
                                </span>
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </Collapse>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-[#424242]">
              <Button type="button" size="sm" variant="outline" onClick={() => navigate('/admin/roles')}>
                Cancel
              </Button>
              <Button type="submit" size="sm" loading={saveMutation.isPending}>
                {isEditing ? 'Update Role' : 'Create Role'}
              </Button>
            </div>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default RoleFormPage;
