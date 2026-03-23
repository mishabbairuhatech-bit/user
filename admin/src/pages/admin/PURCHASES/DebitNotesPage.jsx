import { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { PageHeader, Table, Badge, Input } from '@components/ui';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const DebitNotesPage = () => {
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
    queryKey: [QUERY_KEY.DEBIT_NOTES, page, pageSize, sortColumn, sortDirection, debouncedSearch],
    queryFn: async () => {
      const params = {
        page,
        limit: pageSize,
        ...(sortColumn && { sort_by: sortColumn }),
        ...(sortDirection && { sort_order: sortDirection.toUpperCase() }),
        ...(debouncedSearch && { search: debouncedSearch }),
      };
      const res = await api.get(API.DEBIT_NOTES, { params });
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const debitNotes = data?.data?.items || data?.items || [];
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
      key: 'debit_note_number',
      header: 'DN #',
      width: '130px',
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
      header: 'Vendor',
      width: '180px',
      render: (val) => (
        <span className="text-sm text-gray-900 dark:text-white">{val?.name || '-'}</span>
      ),
    },
    {
      key: 'originalBill',
      header: 'Original Bill',
      width: '140px',
      render: (val) => (
        <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{val?.bill_number || '-'}</span>
      ),
    },
    {
      key: 'grand_total',
      header: 'Amount',
      width: '130px',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(val)}</span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      width: '200px',
      render: (val) => (
        <span className="text-sm text-gray-500 dark:text-gray-400 truncate block max-w-[200px]">{val || '-'}</span>
      ),
    },
    {
      key: 'is_cancelled',
      header: 'Status',
      width: '120px',
      render: (val) => (
        <Badge variant={val ? 'danger' : 'success'} type="soft" size="sm" dot>
          {val ? 'Cancelled' : 'Active'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-80px)] lg:h-[calc(100vh-96px)]">
      <PageHeader
        title="Debit Notes"
        subtitle="Purchase returns and adjustments"
        breadcrumb={{ items: [{ label: 'Purchases' }, { label: 'Debit Notes' }] }}
        sticky
      />

      <div className="flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="w-full sm:w-80">
            <Input
              prefixIcon={Search}
              placeholder="Search debit notes..."
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
          data={debitNotes}
          loading={isLoading}
          emptyMessage="No debit notes found"
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

export default DebitNotesPage;
