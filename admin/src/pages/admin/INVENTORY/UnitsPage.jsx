import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, Edit, Ruler } from 'lucide-react';
import { PageHeader, Table, Badge, Input, Button, SplitterLayout } from '@components/ui';
import usePermission from '@/hooks/usePermission';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';
import UnitDetailPanel from './components/UnitDetailPanel';
import UnitCreateForm from './components/UnitCreateForm';

const UnitsPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermission();

  const canCreate = hasPermission('inventory:create');
  const canUpdate = hasPermission('inventory:update');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editUnit, setEditUnit] = useState(null);
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
    queryKey: [QUERY_KEY.UNITS, page, pageSize, debouncedSearch, sortColumn, sortDirection],
    queryFn: async () => {
      const params = { page, limit: pageSize, sort_by: sortColumn, sort_order: sortDirection.toUpperCase() };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      const res = await api.get(API.UNITS, { params });
      return res.data;
    },
    keepPreviousData: true,
  });

  const units = data?.data?.items || data?.items || [];
  const meta = data?.data?.meta || data?.meta || {};

  const selectedUnit = selectedUnitId ? units.find((u) => u.id === selectedUnitId) : null;

  const handleSort = (key, direction) => { setSortColumn(key); setSortDirection(direction); };
  const handlePageSizeChange = (newSize) => { setPageSize(newSize); setPage(1); };

  const handleRowClick = (row) => {
    if (isDesktop) {
      setShowCreateForm(false);
      setEditUnit(null);
      setSelectedUnitId(selectedUnitId === row.id ? null : row.id);
    } else {
      navigate(`/admin/inventory/units/${row.id}`);
    }
  };

  const handleAddUnit = () => {
    if (isDesktop) {
      setSelectedUnitId(null);
      setEditUnit(null);
      setShowCreateForm(true);
    } else {
      navigate('/admin/inventory/units/new');
    }
  };

  const handleEditUnit = (row) => {
    if (isDesktop) {
      setSelectedUnitId(null);
      setShowCreateForm(false);
      setEditUnit(row);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Unit',
      width: '280px',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary-100 dark:bg-[#1a1a1a]">
            <Ruler size={16} className="text-primary-600 dark:text-primary-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{row.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-mono">{row.short_name}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'short_name',
      header: 'Code',
      width: '120px',
      render: (val) => (
        <Badge variant="default" type="soft" size="sm">
          {val}
        </Badge>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      width: '110px',
      render: (val) => (
        <Badge variant={val !== false ? 'success' : 'danger'} type="soft" size="sm" dot>
          {val !== false ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    ...(canUpdate ? [{
      key: 'actions',
      header: 'Actions',
      width: '80px',
      fixed: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-center">
          <button
            onClick={(e) => { e.stopPropagation(); handleEditUnit(row); }}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#3a3a3a] flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors"
            title="Edit unit"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-80px)] lg:h-[calc(100vh-96px)]">
      <PageHeader
        title="Units of Measurement"
        subtitle="Define measurement units for products"
        breadcrumb={{ items: [{ label: 'Inventory' }, { label: 'Units' }] }}
        sticky
      >
        {canCreate && (
          <Button size="sm" prefixIcon={Plus} onClick={handleAddUnit}>Add Unit</Button>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
        <div className="w-full sm:w-80">
          <Input
            prefixIcon={Search}
            placeholder="Search by name or code..."
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
              data={units}
              loading={isLoading}
              emptyMessage="No units found"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              onRowClick={handleRowClick}
              activeRowId={selectedUnitId}
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
                <UnitCreateForm onClose={() => setShowCreateForm(false)} />
              </div>
            ) : (editUnit && isDesktop && canUpdate) ? (
              <div key={editUnit.id} className="h-full bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-[#424242] shadow-sm overflow-hidden">
                <UnitCreateForm editingUnit={editUnit} onClose={() => setEditUnit(null)} />
              </div>
            ) : (selectedUnit && isDesktop) ? (
              <div className="h-full bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-[#424242] shadow-sm overflow-hidden">
                <UnitDetailPanel unit={selectedUnit} onClose={() => setSelectedUnitId(null)} />
              </div>
            ) : null
          }
        />
      </div>
    </div>
  );
};

export default UnitsPage;
