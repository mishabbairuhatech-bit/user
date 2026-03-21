import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Shield, ShieldCheck } from 'lucide-react';
import { PageHeader, Badge, Button, Card, Spinner } from '@components/ui';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const RoleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.ROLES_DETAIL, id],
    queryFn: async () => {
      const res = await api.get(`${API.ROLES_DETAIL}/${id}`);
      return res.data.data || res.data;
    },
    enabled: !!id,
  });

  const role = data || {};

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role Details"
        subtitle={role.name}
        breadcrumb={{
          items: [
            { label: 'Roles & Permissions', href: '/admin/roles' },
            { label: role.name || 'Details' },
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
          {/* Icon + Name + Status */}
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              role.is_system
                ? 'bg-amber-100 dark:bg-amber-900/30'
                : 'bg-primary-100 dark:bg-[#1a1a1a]'
            }`}>
              {role.is_system ? (
                <ShieldCheck size={24} className="text-amber-600 dark:text-amber-400" />
              ) : (
                <Shield size={24} className="text-primary-600 dark:text-primary-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">{role.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate font-mono">{role.slug}</p>
            </div>
            <Badge variant={role.is_active ? 'success' : 'danger'} type="soft" size="sm" dot>
              {role.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Detail rows */}
          <div className="space-y-3.5">
            {role.description && (
              <Row label="Description" value={role.description} />
            )}
            <Row label="Type" value={
              <Badge variant={role.is_system ? 'warning' : 'info'} type="soft" size="sm">
                {role.is_system ? 'System' : 'Custom'}
              </Badge>
            } />
            <Row label="Total Permissions" value={`${role.permissions?.length || 0} assigned`} />
            <Row label="Created" value={formatDate(role.created_at)} />
            <Row label="Updated" value={formatDate(role.updated_at)} />
          </div>
        </Card.Body>
      </Card>

      {/* Permissions Card */}
      {Object.keys(groupedPermissions).length > 0 && (
        <Card>
          <Card.Body>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Assigned Permissions</h3>
            <div className="space-y-4">
              {Object.entries(groupedPermissions).sort(([a], [b]) => a.localeCompare(b)).map(([module, perms]) => (
                <div key={module}>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{module}</p>
                  <div className="flex flex-wrap gap-2">
                    {perms.map((perm) => (
                      <span
                        key={perm.id}
                        className="inline-flex items-center px-2.5 py-1 text-xs font-mono bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-[#3a3a3a]"
                      >
                        {perm.slug}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-[#2a2a2a] last:border-0">
    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    <span className="text-sm text-gray-900 dark:text-white text-right truncate ml-4">
      {typeof value === 'string' ? value : value}
    </span>
  </div>
);

export default RoleDetailPage;
