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
import InvoiceDetailPanel from './components/InvoiceDetailPanel';
import InvoiceCreateForm from './components/InvoiceCreateForm';

const InvoicesPage = () => {
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
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
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
    queryKey: [QUERY_KEY.SALES_INVOICES, page, pageSize, debouncedSearch, sortColumn, sortDirection],
    queryFn: async () => {
      const params = {
        page,
        limit: pageSize,
        sort_by: sortColumn,
        sort_order: sortDirection.toUpperCase(),
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      const res = await api.get(API.SALES_INVOICES, { params });
      return res.data;
    },
    keepPreviousData: true,
  });

  const invoices = data?.data?.items || data?.items || [];
  const meta = data?.data?.meta || data?.meta || {};

  const formatCurrency = (val) =>
    `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const statusColor = { unpaid: 'danger', partial: 'warning', paid: 'success' };
  const sourceColor = { pos: 'info', sales: 'default' };

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
      setSelectedInvoiceId(selectedInvoiceId === row.id ? null : row.id);
    } else {
      navigate(`/admin/sales/invoices/${row.id}`);
    }
  };

  const handleAddInvoice = () => {
    if (!canCreate) return;
    if (isDesktop) {
      setSelectedInvoiceId(null);
      setShowCreateForm(true);
    } else {
      navigate('/admin/sales/invoices/new');
    }
  };

  const columns = [
    {
      key: 'invoice_number',
      header: 'Invoice #',
      width: '140px',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{val}</span>
      ),
    },
    {
      key: 'party',
      header: 'Customer',
      width: '180px',
      render: (val) => (
        <span className="text-sm text-gray-900 dark:text-white truncate">{val?.name || 'Walk-in'}</span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      width: '130px',
      sortable: true,
      render: (val) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {val ? new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
        </span>
      ),
    },
    {
      key: 'grand_total',
      header: 'Total',
      width: '120px',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(val)}</span>
      ),
    },
    {
      key: 'balance_due',
      header: 'Balance',
      width: '120px',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-sm text-gray-900 dark:text-white">{formatCurrency(val)}</span>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      width: '100px',
      render: (val) => (
        <Badge variant={sourceColor[val] || 'default'} type="soft" size="sm">
          {val || '-'}
        </Badge>
      ),
    },
    {
      key: 'payment_status',
      header: 'Status',
      width: '120px',
      sortable: true,
      render: (val, row) => (
        <Badge
          variant={row.is_cancelled ? 'danger' : (statusColor[val] || 'default')}
          type="soft"
          size="sm"
          dot
        >
          {row.is_cancelled ? 'Cancelled' : (val || '-')}
        </Badge>
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
        title="Sales Invoices"
        subtitle="Manage and view all sales invoices"
        breadcrumb={{ items: [{ label: 'Sales Invoices' }] }}
        sticky
      >
        {canCreate && (
          <Button size="sm" prefixIcon={Plus} onClick={handleAddInvoice}>New Invoice</Button>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
        <div className="w-full sm:w-80">
          <Input
            prefixIcon={Search}
            placeholder="Search by invoice # or customer..."
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
              data={invoices}
              loading={isLoading}
              emptyMessage="No invoices found"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              onRowClick={handleRowClick}
              activeRowId={selectedInvoiceId}
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
                <InvoiceCreateForm onClose={() => setShowCreateForm(false)} />
              </div>
            ) : (!showCreateForm && selectedInvoiceId && isDesktop) ? (
              <div className="h-full bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-[#424242] shadow-sm overflow-hidden">
                <InvoiceDetailPanel
                  invoiceId={selectedInvoiceId}
                  onClose={() => setSelectedInvoiceId(null)}
                />
              </div>
            ) : null
          }
        />
      </div>
    </div>
  );
};

export default InvoicesPage;
