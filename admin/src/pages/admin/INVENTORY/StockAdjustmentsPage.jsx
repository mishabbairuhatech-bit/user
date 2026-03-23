import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, Package } from 'lucide-react';
import { PageHeader, Table, Badge, Input, Button, SplitterLayout } from '@components/ui';
import usePermission from '@/hooks/usePermission';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';
import StockAdjustmentDetailPanel from './components/StockAdjustmentDetailPanel';
import StockAdjustmentCreateForm from './components/StockAdjustmentCreateForm';

const StockAdjustmentsPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermission();

  const canCreate = hasPermission('inventory:create');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedAdjId, setSelectedAdjId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsDesktop(window.innerWidth >= 1280);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.STOCK_ADJUSTMENTS, page, pageSize, debouncedSearch, sortColumn, sortDirection],
    queryFn: async () => {
      const params = { page, limit: pageSize, sort_by: sortColumn, sort_order: sortDirection.toUpperCase() };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      const res = await api.get(API.STOCK_ADJUSTMENTS, { params });
      return res.data;
    },
    keepPreviousData: true,
  });

  const adjustments = data?.data?.items || data?.items || [];
  const meta = data?.data?.meta || data?.meta || {};

  const selectedAdj = selectedAdjId ? adjustments.find((a) => a.id === selectedAdjId) : null;

  const handleSort = (key, direction) => { setSortColumn(key); setSortDirection(direction); };
  const handlePageSizeChange = (newSize) => { setPageSize(newSize); setPage(1); };

  const handleRowClick = (row) => {
    if (isDesktop) {
      setShowCreateForm(false);
      setSelectedAdjId(selectedAdjId === row.id ? null : row.id);
    } else {
      navigate(`/admin/inventory/stock-adjustments/${row.id}`);
    }
  };

  const handleAddAdjustment = () => {
    if (isDesktop) {
      setSelectedAdjId(null);
      setShowCreateForm(true);
    } else {
      navigate('/admin/inventory/stock-adjustments/new');
    }
  };

  const columns = [
    {
      key: 'adjustment_number',
      header: 'Adjustment #',
      width: '200px',
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary-100 dark:bg-[#1a1a1a]">
            <Package size={16} className="text-primary-600 dark:text-primary-400" />
          </div>
          <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{val}</span>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      width: '140px',
      sortable: true,
      render: (val) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {val ? new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      width: '240px',
      render: (val) => (
        <span className="text-sm text-gray-600 dark:text-gray-300 truncate block max-w-[240px]">
          {val || <span className="text-gray-400">-</span>}
        </span>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      width: '120px',
      render: (val) => (
        <Badge variant="default" type="soft" size="sm">
          {val?.length || 0} items
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-80px)] lg:h-[calc(100vh-96px)]">
      <PageHeader
        title="Stock Adjustments"
        subtitle="Manual stock corrections"
        breadcrumb={{ items: [{ label: 'Inventory' }, { label: 'Stock Adjustments' }] }}
        sticky
      >
        {canCreate && (
          <Button size="sm" prefixIcon={Plus} onClick={handleAddAdjustment}>New Adjustment</Button>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
        <div className="w-full sm:w-80">
          <Input
            prefixIcon={Search}
            placeholder="Search adjustments..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            size="md"
          />
        </div>
      </div>

      {/* Table + Right Panel */}
      <div className="overflow-hidden flex flex-1 min-h-0">
        <SplitterLayout
          initialRightWidth={380}
          minRightWidth={300}
          maxRightWidth={600}
          className="bg-transparent dark:bg-transparent"
          leftPanel={
            <Table
              columns={columns}
              data={adjustments}
              loading={isLoading}
              emptyMessage="No stock adjustments found"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              onRowClick={handleRowClick}
              activeRowId={selectedAdjId}
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
                <StockAdjustmentCreateForm onClose={() => setShowCreateForm(false)} />
              </div>
            ) : (selectedAdj && isDesktop) ? (
              <div className="h-full bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-[#424242] shadow-sm overflow-hidden">
                <StockAdjustmentDetailPanel adjustment={selectedAdj} onClose={() => setSelectedAdjId(null)} />
              </div>
            ) : null
          }
        />
      </div>
    </div>
  );
};

export default StockAdjustmentsPage;
