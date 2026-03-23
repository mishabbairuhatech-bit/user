import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus } from 'lucide-react';
import { PageHeader, Table, Badge, Input, Button, SplitterLayout, Select } from '@components/ui';
import { useToast } from '@components/ui/Toast';
import usePermission from '@/hooks/usePermission';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';
import JournalEntryDetailPanel from './components/JournalEntryDetailPanel';

const referenceTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'manual', label: 'Manual' },
  { value: 'sales_invoice', label: 'Sales Invoice' },
  { value: 'purchase_bill', label: 'Purchase Bill' },
  { value: 'payment', label: 'Payment' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'credit_note', label: 'Credit Note' },
  { value: 'debit_note', label: 'Debit Note' },
  { value: 'stock_adjustment', label: 'Stock Adjustment' },
];

const JournalEntriesPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { hasPermission } = usePermission();

  const canCreate = hasPermission('accounting:create');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [referenceType, setReferenceType] = useState('');
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedEntryId, setSelectedEntryId] = useState(null);
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
    queryKey: [QUERY_KEY.JOURNAL_ENTRIES, page, pageSize, debouncedSearch, referenceType, sortColumn, sortDirection],
    queryFn: async () => {
      const params = {
        page,
        limit: pageSize,
        sort_by: sortColumn,
        sort_order: sortDirection.toUpperCase(),
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (referenceType) params.reference_type = referenceType;
      const res = await api.get(API.JOURNAL_ENTRIES, { params });
      return res.data;
    },
    keepPreviousData: true,
  });

  const entries = data?.data?.items || data?.items || [];
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
      setSelectedEntryId(selectedEntryId === row.id ? null : row.id);
    } else {
      navigate(`/admin/accounting/journal-entries/${row.id}`);
    }
  };

  const columns = [
    {
      key: 'entry_number',
      header: 'Entry #',
      width: '130px',
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
      key: 'narration',
      header: 'Narration',
      width: '240px',
      render: (val) => (
        <span className="text-sm text-gray-900 dark:text-white truncate block max-w-[240px]">{val || '-'}</span>
      ),
    },
    {
      key: 'reference_type',
      header: 'Type',
      width: '130px',
      render: (val) => (
        <Badge variant={val === 'manual' ? 'default' : 'info'} type="soft" size="sm">
          {val ? val.replace(/_/g, ' ') : '-'}
        </Badge>
      ),
    },
    {
      key: 'total_amount',
      header: 'Amount',
      width: '140px',
      sortable: true,
      render: (val) => (
        <span className="text-sm font-mono text-gray-900 dark:text-white">{formatCurrency(val)}</span>
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
    {
      key: 'created_at',
      header: 'Created',
      width: '140px',
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
  ];

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-80px)] lg:h-[calc(100vh-96px)]">
      <PageHeader
        title="Journal Entries"
        subtitle="View and manage double-entry journal records"
        breadcrumb={{ items: [{ label: 'Accounting' }, { label: 'Journal Entries' }] }}
        sticky
      >
        {canCreate && (
          <Button size="sm" prefixIcon={Plus} onClick={() => navigate('/admin/accounting/journal-entries/new')}>New Entry</Button>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
        <div className="w-full sm:w-80">
          <Input
            prefixIcon={Search}
            placeholder="Search entries..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            size="md"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            options={referenceTypeOptions}
            value={referenceType}
            onChange={(val) => { setReferenceType(val); setPage(1); }}
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
              data={entries}
              loading={isLoading}
              emptyMessage="No journal entries found"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              onRowClick={handleRowClick}
              activeRowId={selectedEntryId}
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
            (selectedEntryId && isDesktop) ? (
              <div className="h-full bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-[#424242] shadow-sm overflow-hidden">
                <JournalEntryDetailPanel
                  entryId={selectedEntryId}
                  onClose={() => setSelectedEntryId(null)}
                />
              </div>
            ) : null
          }
        />
      </div>
    </div>
  );
};

export default JournalEntriesPage;
