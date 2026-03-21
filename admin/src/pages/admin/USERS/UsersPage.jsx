import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Shield } from 'lucide-react';
import { PageHeader, Table, Badge, Input, Avatar, Button, SplitterLayout } from '@components/ui';
import { useToast } from '@components/ui/Toast';
import usePermission from '@/hooks/usePermission';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';
import UserDetailPanel from './components/UserDetailPanel';
import UserCreateForm from './components/UserCreateForm';

const UsersPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { hasPermission } = usePermission();

  const canCreate = hasPermission('users:create');
  const canAssignRole = hasPermission('roles:assign');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [roleDropdownUserId, setRoleDropdownUserId] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const checkScreen = () => setIsDesktop(window.innerWidth >= 1280);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!roleDropdownUserId) return;
    const handleClick = () => setRoleDropdownUserId(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [roleDropdownUserId]);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.USERS_LIST, page, pageSize, debouncedSearch, sortColumn, sortDirection],
    queryFn: async () => {
      const params = {
        page,
        limit: pageSize,
        sort_by: sortColumn,
        sort_order: sortDirection.toUpperCase(),
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      const res = await api.get(API.USERS_LIST, { params });
      return res.data;
    },
    keepPreviousData: true,
  });

  const users = data?.data?.items || data?.items || [];
  const meta = data?.data?.meta || data?.meta || {};

  const { data: roles = [] } = useQuery({
    queryKey: [QUERY_KEY.ROLES_LIST],
    queryFn: async () => {
      const res = await api.get(API.ROLES_LIST);
      return res.data.data || res.data;
    },
  });

  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }));

  const assignRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }) =>
      api.patch(`${API.USERS_ASSIGN_ROLE}/${userId}/role`, { role_id: roleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.USERS_LIST] });
      toast.success('Role updated successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update role');
    },
  });

  const handleSort = (key, direction) => {
    setSortColumn(key);
    setSortDirection(direction);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
  };

  const handleRowClick = (row) => {
    if (isDesktop) {
      setShowCreateForm(false);
      setSelectedUserId(selectedUserId === row.id ? null : row.id);
    } else {
      navigate(`/admin/users/${row.id}`);
    }
  };

  const handleAddUser = () => {
    if (!canCreate) return;
    if (isDesktop) {
      setSelectedUserId(null);
      setShowCreateForm(true);
    } else {
      navigate('/admin/users/create');
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'User',
      width: '280px',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={row.avatar_url}
            name={`${row.first_name || ''} ${row.last_name || ''}`.trim() || row.email}
            size="sm"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {`${row.first_name || ''} ${row.last_name || ''}`.trim() || '-'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      width: '140px',
      render: (_, row) => {
        const roleName = row.role?.name;
        return roleName ? (
          <Badge variant="info" type="soft" size="sm">
            {roleName}
          </Badge>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        );
      },
    },
    {
      key: 'phone',
      header: 'Phone',
      width: '160px',
      render: (val) => val || <span className="text-gray-400">-</span>,
    },
    {
      key: 'is_active',
      header: 'Status',
      width: '120px',
      sortable: true,
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
    {
      key: 'created_at',
      header: 'Created',
      width: '160px',
      sortable: true,
      render: (val) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {new Date(val).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    // Only show role assign action if user has permission
    ...(canAssignRole ? [{
      key: 'actions',
      header: 'Actions',
      width: '80px',
      fixed: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (roleDropdownUserId === row.id) {
                setRoleDropdownUserId(null);
              } else {
                const rect = e.currentTarget.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const dropdownHeight = roleOptions.length * 40 + 8;
                const openAbove = spaceBelow < dropdownHeight && rect.top > spaceBelow;
                setDropdownPos({
                  top: openAbove ? rect.top - dropdownHeight : rect.bottom + 4,
                  left: Math.min(rect.left - 120, window.innerWidth - 184),
                });
                setRoleDropdownUserId(row.id);
              }
            }}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#3a3a3a] flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors"
            title="Change role"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-80px)] lg:h-[calc(100vh-96px)]">
      <PageHeader
        title="Users"
        subtitle="Manage and view all registered users"
        breadcrumb={{ items: [{ label: 'Users' }] }}
        sticky
      >
        {canCreate && (
          <Button size="sm" prefixIcon={Plus} onClick={handleAddUser}>Add User</Button>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
        <div className="w-full sm:w-80">
          <Input
            prefixIcon={Search}
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            size="md"
          />
        </div>
      </div>

      {/* Table + Detail Panel */}
      <div className="overflow-hidden flex flex-1 min-h-0">
        <SplitterLayout
          initialRightWidth={380}
          minRightWidth={300}
          maxRightWidth={600}
          className="bg-transparent dark:bg-transparent"
          leftPanel={
            <Table
              columns={columns}
              data={users}
              loading={isLoading}
              emptyMessage="No users found"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              onRowClick={handleRowClick}
              activeRowId={selectedUserId}
              showPagination
              currentPage={page}
              totalPages={meta.total_pages || 1}
              onPageChange={setPage}
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[10, 20, 50, 100]}
            />
          }
          rightPanel={
            (showCreateForm && isDesktop && canCreate) ? (
              <div className="h-full bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-[#424242] shadow-sm overflow-hidden">
                <UserCreateForm onClose={() => setShowCreateForm(false)} />
              </div>
            ) : (!showCreateForm && selectedUserId && isDesktop) ? (
              <div className="h-full bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-[#424242] shadow-sm overflow-hidden">
                <UserDetailPanel
                  userId={selectedUserId}
                  onClose={() => setSelectedUserId(null)}
                />
              </div>
            ) : null
          }
        />
      </div>

      {/* Role change dropdown portal */}
      {roleDropdownUserId && createPortal(
        <div
          className="fixed z-[9999] w-44 bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#424242] rounded-xl shadow-xl overflow-hidden"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
          onClick={(e) => e.stopPropagation()}
        >
          {roleOptions.map((role) => {
            const currentUser = users.find((u) => u.id === roleDropdownUserId);
            const isCurrent = currentUser?.role?.id === role.value;
            return (
              <div
                key={role.value}
                className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between ${
                  isCurrent
                    ? 'bg-primary-50 dark:bg-[#2a2a2a] text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
                }`}
                onClick={() => {
                  if (!isCurrent) {
                    assignRoleMutation.mutate({ userId: roleDropdownUserId, roleId: role.value });
                  }
                  setRoleDropdownUserId(null);
                }}
              >
                <span>{role.label}</span>
                {isCurrent && (
                  <span className="text-primary-500 text-xs font-medium">Current</span>
                )}
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
};

export default UsersPage;
