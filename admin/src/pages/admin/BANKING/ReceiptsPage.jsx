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
import ReceiptDetailPanel from './components/ReceiptDetailPanel';
import ReceiptCreateForm from './components/ReceiptCreateForm';

const ReceiptsPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { hasPermission } = usePermission();

  const canCreate = hasPermission('banking:create');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);
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
    queryKey: [QUERY_KEY.PAYMENT_RECEIPTS_LIST, 'receipt', page, pageSize, debouncedSearch, sortColumn, sortDirection],
    queryFn: async () => {
      const params = {
        type: 'receipt',
        page,
        limit: pageSize,
        sort_by: sortColumn,
        sort_order: sortDirection.toUpperCase(),
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      const res = await api.get(API.PAYMENT_RECEIPTS, { params });
      return res.data;
    },
    keepPreviousData: true,
  });

  const receipts = data?.data?.items || data?.items || [];
  const meta = data?.data?.meta || data?.meta || {};

  const formatCurrency = (val) => `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

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
      setSelectedReceiptId(selectedReceiptId === row.id ? null : row.id);
    } else {
      navigate(`/admin/banking/receipts/${row.id}`);
    }
  };

  const handleAddReceipt = () => {
    if (!canCreate) return;
    if (isDesktop) {
      setSelectedReceiptId(null);
      setShowCreateForm(true);
    } else {
      navigate('/admin/banking/receipts/create');
    }
  };

  const columns = [
    {
      key: 'voucher_number',
      header: 'Voucher #',
      width: '140px',
      sortable: true,
      render: (val) => <span className="font-mono text-sm">{val || '-'}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      width: '120px',
      sortable: true,
      render: (val) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {val
            ? new Date(val).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : '-'}
        </span>
      ),
    },
    {
      key: 'party',
      header: 'Customer',
      width: '180px',
      render: (val) => (
        <span className="text-sm text-gray-900 dark:text-white truncate">{val?.name || '-'}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      width: '140px',
      sortable: true,
      render: (val) => (
        <span className="text-sm font-mono text-gray-900 dark:text-white">{formatCurrency(val)}</span>
      ),
    },
    {
      key: 'payment_mode',
      header: 'Mode',
      width: '130px',
      render: (val) => (
        <Badge variant="info" type="soft" size="sm">
          {val ? val.replace(/_/g, ' ') : '-'}
        </Badge>
      ),
    },
    {
      key: 'bankAccount',
      header: 'Account',
      width: '160px',
      render: (val) => (
        <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{val?.account_name || '-'}</span>
      ),
    },
    {
      key: 'is_cancelled',
      header: 'Status',
      width: '120px',
      render: (val) => (
        <Badge
          variant={val ? 'danger' : 'success'}
          type="soft"
          size="sm"
          dot
        >
          {val ? 'Cancelled' : 'Active'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-80px)] lg:h-[calc(100vh-96px)]">
      <PageHeader
        title="Receipts"
        subtitle="Receipts received from customers"
        breadcrumb={{ items: [{ label: 'Banking' }, { label: 'Receipts' }] }}
        sticky
      >
        {canCreate && (
          <Button size="sm" prefixIcon={Plus} onClick={handleAddReceipt}>New Receipt</Button>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
        <div className="w-full sm:w-80">
          <Input
            prefixIcon={Search}
            placeholder="Search receipts..."
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
              data={receipts}
              loading={isLoading}
              emptyMessage="No receipts found"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              onRowClick={handleRowClick}
              activeRowId={selectedReceiptId}
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
                <ReceiptCreateForm onClose={() => setShowCreateForm(false)} />
              </div>
            ) : (!showCreateForm && selectedReceiptId && isDesktop) ? (
              <div className="h-full bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-[#424242] shadow-sm overflow-hidden">
                <ReceiptDetailPanel
                  receiptId={selectedReceiptId}
                  onClose={() => setSelectedReceiptId(null)}
                />
              </div>
            ) : null
          }
        />
      </div>
    </div>
  );
};

export default ReceiptsPage;
