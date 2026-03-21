import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Maximize2, Shield, ShieldCheck, Trash2 } from 'lucide-react';
import { Badge, Spinner, Button } from '@components/ui';
import { ConfirmModal } from '@components/ui';
import { useToast } from '@components/ui/Toast';
import usePermission from '@/hooks/usePermission';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const RoleDetailPanel = ({ roleId, onClose }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { hasPermission } = usePermission();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const canUpdate = hasPermission('roles:update');
  const canDelete = hasPermission('roles:delete');

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.ROLES_DETAIL, roleId],
    queryFn: async () => {
      const res = await api.get(`${API.ROLES_DETAIL}/${roleId}`);
      return res.data.data || res.data;
    },
    enabled: !!roleId,
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`${API.ROLES_DELETE}/${roleId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.ROLES_LIST] });
      toast.success('Role deleted successfully');
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete role');
    },
  });

  const role = data || {};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  // Group permissions by module
  const groupedPermissions = (role.permissions || []).reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {});

  const formatDate = (val) => {
    if (!val) return '-';
    return new Date(val).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-[#424242] flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Role Details</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/admin/roles/${roleId}`)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
            title="Expand"
          >
            <Maximize2 size={14} className="text-gray-500" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
            title="Close"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4">
        {/* Icon + Name + Status */}
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            role.is_system
              ? 'bg-amber-100 dark:bg-amber-900/30'
              : 'bg-primary-100 dark:bg-[#1a1a1a]'
          }`}>
            {role.is_system ? (
              <ShieldCheck size={20} className="text-amber-600 dark:text-amber-400" />
            ) : (
              <Shield size={20} className="text-primary-600 dark:text-primary-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{role.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-mono">{role.slug}</p>
          </div>
          <Badge variant={role.is_active ? 'success' : 'danger'} type="soft" size="sm" dot>
            {role.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Detail rows */}
        <div className="space-y-3.5 mb-5">
          {role.description && (
            <Row label="Description" value={role.description} />
          )}
          <Row label="Type" value={
            <Badge variant={role.is_system ? 'warning' : 'info'} type="soft" size="sm">
              {role.is_system ? 'System' : 'Custom'}
            </Badge>
          } />
          <Row label="Permissions" value={`${role.permissions?.length || 0} assigned`} />
          <Row label="Created" value={formatDate(role.created_at)} />
          <Row label="Updated" value={formatDate(role.updated_at)} />
        </div>

        {/* Permissions by Module */}
        {Object.keys(groupedPermissions).length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Assigned Permissions
            </p>
            <div className="space-y-3">
              {Object.entries(groupedPermissions).sort(([a], [b]) => a.localeCompare(b)).map(([module, perms]) => (
                <div key={module}>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize mb-1.5">{module}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {perms.map((perm) => (
                      <span
                        key={perm.id}
                        className="px-2 py-0.5 text-[11px] font-mono bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 rounded-md"
                      >
                        {perm.action}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions removed — use table action buttons instead */}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => !deleteMutation.isPending && setShowDeleteModal(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Role"
        message={`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`}
        variant="danger"
        confirmText="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-[#2a2a2a] last:border-0">
    <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
    <span className="text-xs text-gray-900 dark:text-white text-right truncate ml-4">
      {typeof value === 'string' ? value : value}
    </span>
  </div>
);

export default RoleDetailPanel;
