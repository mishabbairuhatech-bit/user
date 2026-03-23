import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus } from 'lucide-react';
import { PageHeader, Table, Badge, Input, Button, SplitterLayout } from '@components/ui';
import { useToast } from '@components/ui/Toast';
import usePermission from '@/hooks/usePermission';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';
import CustomerDetailPanel from './components/CustomerDetailPanel';
import CustomerCreateForm from './components/CustomerCreateForm';

const CustomersPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { hasPermission } = usePermission();

  const canCreate = hasPermission('sales:create');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
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
    queryKey: [QUERY_KEY.PARTIES, 'customer', page, pageSize, debouncedSearch, sortColumn, sortDirection],
    queryFn: async () => {
      const params = {
        type: 'customer',
        page,
        limit: pageSize,
        sort_by: sortColumn,
        sort_order: sortDirection.toUpperCase(),
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      const res = await api.get(API.PARTIES, { params });
      return res.data;
    },
    keepPreviousData: true,
  });

  const customers = data?.data?.items || data?.items || [];
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
      setShowCreateForm(false);
      setSelectedCustomerId(selectedCustomerId === row.id ? null : row.id);
    } else {
      navigate(`/admin/sales/customers/${row.id}`);
    }
  };

  const handleAddCustomer = () => {
    if (!canCreate) return;
    if (isDesktop) {
      setSelectedCustomerId(null);
      setShowCreateForm(true);
    } else {
      navigate('/admin/sales/customers/create');
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      width: '200px',
      sortable: true,
      render: (val) => (
        <span className="text-sm font-medium text-gray-900 dark:text-white">{val || '-'}</span>
      ),
    },
    {
      key: 'gstin',
      header: 'GSTIN',
      width: '200px',
      render: (val) => (
        <span className="text-sm font-mono text-gray-500">{val || '-'}</span>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      width: '150px',
      render: (val) => val || <span className="text-gray-400">-</span>,
    },
    {
      key: 'email',
      header: 'Email',
      width: '200px',
      render: (val) => (
        <span className="text-sm text-gray-500">{val || '-'}</span>
      ),
    },
    {
      key: 'state_code',
      header: 'State',
      width: '100px',
      render: (val) => val ? (
        <Badge variant="default" type="soft" size="sm">{val}</Badge>
      ) : (
        <span className="text-gray-400">-</span>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      width: '150px',
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
    <div className="flex flex-col gap-4 h-[calc(100vh-80px)] lg:h-[calc(100vh-96px)]">
      <PageHeader
        title="Customers"
        subtitle="Manage and view all customers"
        breadcrumb={{ items: [{ label: 'Customers' }] }}
        sticky
      >
        {canCreate && (
          <Button size="sm" prefixIcon={Plus} onClick={handleAddCustomer}>Add Customer</Button>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
        <div className="w-full sm:w-80">
          <Input
            prefixIcon={Search}
            placeholder="Search customers..."
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
              data={customers}
              loading={isLoading}
              emptyMessage="No customers found"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              onRowClick={handleRowClick}
              activeRowId={selectedCustomerId}
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
                <CustomerCreateForm onClose={() => setShowCreateForm(false)} />
              </div>
            ) : (!showCreateForm && selectedCustomerId && isDesktop) ? (
              <div className="h-full bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-[#424242] shadow-sm overflow-hidden">
                <CustomerDetailPanel
                  customerId={selectedCustomerId}
                  onClose={() => setSelectedCustomerId(null)}
                />
              </div>
            ) : null
          }
        />
      </div>
    </div>
  );
};

export default CustomersPage;
