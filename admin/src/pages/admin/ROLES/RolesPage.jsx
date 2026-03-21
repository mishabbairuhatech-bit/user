import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, Shield, ShieldCheck, Lock, Edit, Trash2 } from 'lucide-react';
import { PageHeader, Table, Badge, Input, Button, SplitterLayout } from '@components/ui';
import usePermission from '@/hooks/usePermission';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';
import RoleDetailPanel from './components/RoleDetailPanel';
import RoleCreateForm from './components/RoleCreateForm';
import RoleEditPanel from './components/RoleEditPanel';

const RolesPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editRoleId, setEditRoleId] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);

  const canCreate = hasPermission('roles:create');
  const canUpdate = hasPermission('roles:update');
  const canDelete = hasPermission('roles:delete');

  useEffect(() => {
    const checkScreen = () => setIsDesktop(window.innerWidth >= 1280);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: roles = [], isLoading } = useQuery({
    queryKey: [QUERY_KEY.ROLES_LIST],
    queryFn: async () => {
      const res = await api.get(API.ROLES_LIST);
      return res.data.data || res.data;
    },
  });

  // Client-side search filter
  const filteredRoles = debouncedSearch
    ? roles.filter((r) =>
        r.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        r.slug.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : roles;

  const handleRowClick = (row) => {
    if (isDesktop) {
      setShowCreateForm(false);
      setEditRoleId(null);
      setSelectedRoleId(selectedRoleId === row.id ? null : row.id);
    } else {
      navigate(`/admin/roles/${row.id}`);
    }
  };

  const handleAddRole = () => {
    if (isDesktop) {
      setSelectedRoleId(null);
      setEditRoleId(null);
      setShowCreateForm(true);
    } else {
      navigate('/admin/roles/create');
    }
  };

  const handleEditRole = (row) => {
    if (isDesktop) {
      setSelectedRoleId(null);
      setShowCreateForm(false);
      setEditRoleId(row.id);
    } else {
      navigate(`/admin/roles/${row.id}/edit`);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Role',
      width: '280px',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
            row.is_system
              ? 'bg-amber-100 dark:bg-amber-900/30'
              : 'bg-primary-100 dark:bg-[#1a1a1a]'
          }`}>
            {row.is_system ? (
              <ShieldCheck size={16} className="text-amber-600 dark:text-amber-400" />
            ) : (
              <Shield size={16} className="text-primary-600 dark:text-primary-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {row.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-mono">{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      width: '240px',
      render: (val) => (
        <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
          {val || <span className="text-gray-400">-</span>}
        </span>
      ),
    },
    {
      key: 'permissions',
      header: 'Permissions',
      width: '130px',
      render: (val) => (
        <Badge variant="default" type="soft" size="sm">
          {val?.length || 0} permissions
        </Badge>
      ),
    },
    {
      key: 'is_system',
      header: 'Type',
      width: '120px',
      render: (val) => (
        <Badge
          variant={val ? 'warning' : 'info'}
          type="soft"
          size="sm"
          dot
        >
          {val ? 'System' : 'Custom'}
        </Badge>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      width: '110px',
      render: (val) => (
        <Badge
          variant={val ? 'success' : 'danger'}
          type="soft"
          size="sm"
          dot
        >
          {val ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    // Only show actions column if user has edit or delete permission
    ...(canUpdate || canDelete ? [{
      key: 'actions',
      header: 'Actions',
      width: '120px',
      fixed: 'right',
      render: (_, row) => {
        const isSuperAdmin = row.slug === 'super_admin';
        return (
          <div className="flex items-center gap-2">
            {canUpdate && (
              <button
                onClick={(e) => { e.stopPropagation(); if (!isSuperAdmin) handleEditRole(row); }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isSuperAdmin
                    ? 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    : 'bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#3a3a3a] text-gray-500 dark:text-gray-400'
                }`}
                disabled={isSuperAdmin}
                title={isSuperAdmin ? 'Super Admin cannot be edited' : 'Edit role'}
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isSuperAdmin
                    ? 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    : 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400'
                }`}
                disabled={isSuperAdmin}
                title={isSuperAdmin ? 'Super Admin cannot be deleted' : 'Delete role'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      },
    }] : []),
  ];

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-80px)] lg:h-[calc(100vh-96px)]">
      <PageHeader
        title="Roles & Permissions"
        subtitle="Manage roles and their permissions to control access across the system"
        breadcrumb={{ items: [{ label: 'Roles & Permissions' }] }}
        sticky
      >
        {canCreate && (
          <Button size="sm" prefixIcon={Plus} onClick={handleAddRole}>Create Role</Button>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
        <div className="w-full sm:w-80">
          <Input
            prefixIcon={Search}
            placeholder="Search by name or slug..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            size="md"
          />
        </div>
      </div>

      {/* Table + Detail Panel */}
      <div className="overflow-hidden flex flex-1 min-h-0">
        <SplitterLayout
          initialRightWidth={420}
          minRightWidth={340}
          maxRightWidth={640}
          className="bg-transparent dark:bg-transparent"
          leftPanel={
            <Table
              columns={columns}
              data={filteredRoles}
              loading={isLoading}
              emptyMessage="No roles found"
              onRowClick={handleRowClick}
              activeRowId={selectedRoleId}
            />
          }
          rightPanel={
            (showCreateForm && isDesktop && canCreate) ? (
              <div className="h-full bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-[#424242] shadow-sm overflow-hidden">
                <RoleCreateForm onClose={() => setShowCreateForm(false)} />
              </div>
            ) : (editRoleId && isDesktop && canUpdate) ? (
              <div className="h-full bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-[#424242] shadow-sm overflow-hidden">
                <RoleEditPanel
                  roleId={editRoleId}
                  onClose={() => setEditRoleId(null)}
                />
              </div>
            ) : (selectedRoleId && isDesktop) ? (
              <div className="h-full bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-[#424242] shadow-sm overflow-hidden">
                <RoleDetailPanel
                  roleId={selectedRoleId}
                  onClose={() => setSelectedRoleId(null)}
                />
              </div>
            ) : null
          }
        />
      </div>
    </div>
  );
};

export default RolesPage;
