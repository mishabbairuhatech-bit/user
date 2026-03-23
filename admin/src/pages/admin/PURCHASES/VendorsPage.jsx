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
import VendorDetailPanel from './components/VendorDetailPanel';
import VendorCreateForm from './components/VendorCreateForm';

const VendorsPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { hasPermission } = usePermission();

  const canRead = hasPermission('purchases:read');
  const canCreate = hasPermission('purchases:create');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedVendorId, setSelectedVendorId] = useState(null);
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
    queryKey: [QUERY_KEY.PARTIES, 'vendor', page, pageSize, debouncedSearch, sortColumn, sortDirection],
    queryFn: async () => {
      const params = {
        type: 'vendor',
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

  const vendors = data?.data?.items || data?.items || [];
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
      setSelectedVendorId(selectedVendorId === row.id ? null : row.id);
    } else {
      navigate(`/admin/purchases/vendors/${row.id}`);
    }
  };

  const handleAddVendor = () => {
    if (!canCreate) return;
    if (isDesktop) {
      setSelectedVendorId(null);
      setShowCreateForm(true);
    } else {
      navigate('/admin/purchases/vendors/create');
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
      width: '180px',
      render: (val) => (
        <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{val || '-'}</span>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      width: '140px',
      render: (val) => val || <span className="text-gray-400">-</span>,
    },
    {
      key: 'email',
      header: 'Email',
      width: '200px',
      render: (val) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">{val || '-'}</span>
      ),
    },
    {
      key: 'state_code',
      header: 'State',
      width: '100px',
      render: (val) => val ? (
        <Badge variant="default" type="soft" size="sm">
          {val}
        </Badge>
      ) : (
        <span className="text-gray-400">-</span>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      width: '160px',
      sortable: true,
      render: (val) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {val ? new Date(val).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }) : '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-80px)] lg:h-[calc(100vh-96px)]">
      <PageHeader
        title="Vendors"
        subtitle="Manage and view all vendors"
        breadcrumb={{ items: [{ label: 'Vendors' }] }}
        sticky
      >
        {canCreate && (
          <Button size="sm" prefixIcon={Plus} onClick={handleAddVendor}>Add Vendor</Button>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
        <div className="w-full sm:w-80">
          <Input
            prefixIcon={Search}
            placeholder="Search by name, GSTIN or email..."
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
              data={vendors}
              loading={isLoading}
              emptyMessage="No vendors found"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              onRowClick={handleRowClick}
              activeRowId={selectedVendorId}
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
                <VendorCreateForm onClose={() => setShowCreateForm(false)} />
              </div>
            ) : (!showCreateForm && selectedVendorId && isDesktop) ? (
              <div className="h-full bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-[#424242] shadow-sm overflow-hidden">
                <VendorDetailPanel
                  vendorId={selectedVendorId}
                  onClose={() => setSelectedVendorId(null)}
                />
              </div>
            ) : null
          }
        />
      </div>
    </div>
  );
};

export default VendorsPage;
