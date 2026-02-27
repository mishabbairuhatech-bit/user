import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { PageHeader, Table, Badge, Input, Avatar } from '@components/ui';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';
import UserDetailPanel from './UserDetailPanel';

const UsersPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);

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
      setSelectedUserId(selectedUserId === row.id ? null : row.id);
    } else {
      navigate(`/admin/users/${row.id}`);
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
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="Manage and view all registered users"
        breadcrumb={{ items: [{ label: 'Users' }] }}
        sticky
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
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
      <div className="bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-[#424242] shadow-sm overflow-hidden flex">
        {/* Table */}
        <div className={`min-w-0 transition-all duration-300 ${selectedUserId && isDesktop ? 'flex-1' : 'w-full'}`}>
          <Table
            columns={columns}
            data={users}
            loading={isLoading}
            emptyMessage="No users found"
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            onRowClick={handleRowClick}
            showPagination
            currentPage={page}
            totalPages={meta.total_pages || 1}
            onPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[10, 20, 50, 100]}
            className="border-0 rounded-none shadow-none"
          />
        </div>

        {/* Vertical Divider + Detail Panel - Desktop only */}
        {selectedUserId && isDesktop && (
          <>
            <div className="w-px bg-gray-200 dark:bg-[#424242] flex-shrink-0" />
            <div className="w-[380px] flex-shrink-0">
              <UserDetailPanel
                userId={selectedUserId}
                onClose={() => setSelectedUserId(null)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
