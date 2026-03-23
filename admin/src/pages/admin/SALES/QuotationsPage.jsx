import { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { PageHeader, Table, Badge, Input } from '@components/ui';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const statusColors = {
  draft: 'default',
  sent: 'info',
  accepted: 'success',
  rejected: 'danger',
  expired: 'warning',
  converted: 'success',
};

const QuotationsPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.QUOTATIONS, page, pageSize, sortColumn, sortDirection, debouncedSearch],
    queryFn: async () => {
      const params = {
        page,
        limit: pageSize,
        ...(sortColumn && { sort_by: sortColumn }),
        ...(sortDirection && { sort_order: sortDirection.toUpperCase() }),
        ...(debouncedSearch && { search: debouncedSearch }),
      };
      const res = await api.get(API.QUOTATIONS, { params });
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const quotations = data?.data?.items || data?.items || [];
  const meta = data?.data?.meta || data?.meta || {};

  const handleSort = (column, direction) => {
    setSortColumn(column);
    setSortDirection(direction);
    setPage(1);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
  };

  const formatCurrency = (val) =>
    `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const columns = [
    {
      key: 'quotation_number',
      header: 'QT #',
      width: '140px',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{val}</span>
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
      key: 'party',
      header: 'Customer',
      width: '180px',
      render: (val) => (
        <span className="text-sm text-gray-900 dark:text-white">{val?.name || '-'}</span>
      ),
    },
    {
      key: 'valid_until',
      header: 'Valid Until',
      width: '130px',
      sortable: true,
      render: (val) => (
        <span className="text-sm text-gray-500">
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
      key: 'status',
      header: 'Status',
      width: '120px',
      render: (val) => (
        <Badge variant={statusColors[val] || 'default'} type="soft" size="sm" dot>
          {val || '-'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-80px)] lg:h-[calc(100vh-96px)]">
      <PageHeader
        title="Quotations"
        subtitle="Proforma invoices and estimates"
        breadcrumb={{ items: [{ label: 'Sales' }, { label: 'Quotations' }] }}
        sticky
      />

      <div className="flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="w-full sm:w-80">
            <Input
              prefixIcon={Search}
              placeholder="Search quotations..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              size="md"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden flex flex-1 min-h-0">
        <Table
          columns={columns}
          data={quotations}
          loading={isLoading}
          emptyMessage="No quotations found"
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          showPagination
          currentPage={page}
          totalPages={meta.total_pages || 1}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </div>
    </div>
  );
};

export default QuotationsPage;
