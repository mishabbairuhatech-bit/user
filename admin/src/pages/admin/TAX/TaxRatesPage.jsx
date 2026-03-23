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
import TaxRateDetailPanel from './components/TaxRateDetailPanel';
import TaxRateCreateForm from './components/TaxRateCreateForm';

const TaxRatesPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { hasPermission } = usePermission();

  const canCreate = hasPermission('tax:create');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedRateId, setSelectedRateId] = useState(null);
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
    queryKey: [QUERY_KEY.TAX_RATES, page, pageSize, debouncedSearch, sortColumn, sortDirection],
    queryFn: async () => {
      const params = {
        page,
        limit: pageSize,
        sort_by: sortColumn,
        sort_order: sortDirection.toUpperCase(),
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      const res = await api.get(API.TAX_RATES, { params });
      return res.data;
    },
    keepPreviousData: true,
  });

  const taxRates = data?.data?.items || data?.data || data?.items || [];
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
      setSelectedRateId(selectedRateId === row.id ? null : row.id);
    } else {
      navigate(`/admin/tax/rates/${row.id}`);
    }
  };

  const handleAddRate = () => {
    if (!canCreate) return;
    if (isDesktop) {
      setSelectedRateId(null);
      setShowCreateForm(true);
    } else {
      navigate('/admin/tax/rates/create');
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      width: '180px',
      sortable: true,
      render: (val) => (
        <span className="text-sm font-medium text-gray-900 dark:text-white">{val || '-'}</span>
      ),
    },
    {
      key: 'rate',
      header: 'Rate',
      width: '100px',
      sortable: true,
      render: (val) => <span className="text-sm font-mono text-gray-900 dark:text-white">{val}%</span>,
    },
    {
      key: 'cgst_rate',
      header: 'CGST',
      width: '100px',
      render: (val) => <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{val}%</span>,
    },
    {
      key: 'sgst_rate',
      header: 'SGST',
      width: '100px',
      render: (val) => <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{val}%</span>,
    },
    {
      key: 'igst_rate',
      header: 'IGST',
      width: '100px',
      render: (val) => <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{val}%</span>,
    },
    {
      key: 'cess_rate',
      header: 'Cess',
      width: '100px',
      render: (val) => <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{val || 0}%</span>,
    },
    {
      key: 'is_active',
      header: 'Status',
      width: '120px',
      render: (val) => (
        <Badge
          variant={val ? 'success' : 'default'}
          type="soft"
          size="sm"
          dot
        >
          {val ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-80px)] lg:h-[calc(100vh-96px)]">
      <PageHeader
        title="Tax Rates"
        subtitle="Manage GST tax rate slabs"
        breadcrumb={{ items: [{ label: 'Tax' }, { label: 'Tax Rates' }] }}
        sticky
      >
        {canCreate && (
          <Button size="sm" prefixIcon={Plus} onClick={handleAddRate}>Add Tax Rate</Button>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
        <div className="w-full sm:w-80">
          <Input
            prefixIcon={Search}
            placeholder="Search tax rates..."
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
              data={Array.isArray(taxRates) ? taxRates : []}
              loading={isLoading}
              emptyMessage="No tax rates found"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              onRowClick={handleRowClick}
              activeRowId={selectedRateId}
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
                <TaxRateCreateForm onClose={() => setShowCreateForm(false)} />
              </div>
            ) : (!showCreateForm && selectedRateId && isDesktop) ? (
              <div className="h-full bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-[#424242] shadow-sm overflow-hidden">
                <TaxRateDetailPanel
                  rateId={selectedRateId}
                  onClose={() => setSelectedRateId(null)}
                />
              </div>
            ) : null
          }
        />
      </div>
    </div>
  );
};

export default TaxRatesPage;
