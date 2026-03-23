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
import BillDetailPanel from './components/BillDetailPanel';

const BillsPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { hasPermission } = usePermission();

  const canCreate = hasPermission('purchases:create');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedBillId, setSelectedBillId] = useState(null);
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
    queryKey: [QUERY_KEY.PURCHASE_BILLS, page, pageSize, debouncedSearch, sortColumn, sortDirection],
    queryFn: async () => {
      const params = {
        page,
        limit: pageSize,
        sort_by: sortColumn,
        sort_order: sortDirection.toUpperCase(),
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      const res = await api.get(API.PURCHASE_BILLS, { params });
      return res.data;
    },
    keepPreviousData: true,
  });

  const bills = data?.data?.items || data?.items || [];
  const meta = data?.data?.meta || data?.meta || {};

  const fmt = (val) => `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const statusColor = { unpaid: 'danger', partial: 'warning', paid: 'success' };

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
      setSelectedBillId(selectedBillId === row.id ? null : row.id);
    } else {
      navigate(`/admin/purchases/bills/${row.id}`);
    }
  };

  const handleAddBill = () => {
    if (!canCreate) return;
    if (isDesktop) {
      setSelectedBillId(null);
      navigate('/admin/purchases/bills/new');
    } else {
      navigate('/admin/purchases/bills/new');
    }
  };

  const columns = [
    {
      key: 'bill_number',
      header: 'Bill #',
      width: '130px',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{val}</span>
      ),
    },
    {
      key: 'vendor_bill_number',
      header: 'Vendor Bill #',
      width: '140px',
      render: (val) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">{val || '-'}</span>
      ),
    },
    {
      key: 'party',
      header: 'Vendor',
      width: '180px',
      render: (val) => (
        <span className="text-sm text-gray-900 dark:text-white">{val?.name || '-'}</span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      width: '130px',
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
    {
      key: 'grand_total',
      header: 'Total',
      width: '130px',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{fmt(val)}</span>
      ),
    },
    {
      key: 'balance_due',
      header: 'Balance',
      width: '130px',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-sm text-gray-900 dark:text-white">{fmt(val)}</span>
      ),
    },
    {
      key: 'payment_status',
      header: 'Status',
      width: '120px',
      render: (val) => (
        <Badge
          variant={statusColor[val] || 'default'}
          type="soft"
          size="sm"
          dot
        >
          {val || '-'}
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
        title="Bills"
        subtitle="Manage and view all purchase bills"
        breadcrumb={{ items: [{ label: 'Bills' }] }}
        sticky
      >
        {canCreate && (
          <Button size="sm" prefixIcon={Plus} onClick={handleAddBill}>New Bill</Button>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
        <div className="w-full sm:w-80">
          <Input
            prefixIcon={Search}
            placeholder="Search by bill number or vendor..."
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
              data={bills}
              loading={isLoading}
              emptyMessage="No purchase bills found"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              onRowClick={handleRowClick}
              activeRowId={selectedBillId}
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
            selectedBillId && isDesktop ? (
              <div className="h-full bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-[#424242] shadow-sm overflow-hidden">
                <BillDetailPanel
                  billId={selectedBillId}
                  onClose={() => setSelectedBillId(null)}
                />
              </div>
            ) : null
          }
        />
      </div>
    </div>
  );
};

export default BillsPage;
