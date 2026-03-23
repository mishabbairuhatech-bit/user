import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, AlertTriangle } from 'lucide-react';
import { PageHeader, Table, Badge, Input, Button, SplitterLayout } from '@components/ui';
import { useToast } from '@components/ui/Toast';
import usePermission from '@/hooks/usePermission';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';
import ProductDetailPanel from './components/ProductDetailPanel';
import ProductCreateForm from './components/ProductCreateForm';

const ProductsPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { hasPermission } = usePermission();

  const canCreate = hasPermission('inventory:create');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedProductId, setSelectedProductId] = useState(null);
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
    queryKey: [QUERY_KEY.PRODUCTS, page, pageSize, debouncedSearch, sortColumn, sortDirection],
    queryFn: async () => {
      const params = {
        page,
        limit: pageSize,
        sort_by: sortColumn,
        sort_order: sortDirection.toUpperCase(),
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      const res = await api.get(API.PRODUCTS, { params });
      return res.data;
    },
    keepPreviousData: true,
  });

  const products = data?.data?.items || data?.items || [];
  const meta = data?.data?.meta || data?.meta || {};

  const formatCurrency = (val) =>
    `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

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
      setSelectedProductId(selectedProductId === row.id ? null : row.id);
    } else {
      navigate(`/admin/inventory/products/${row.id}`);
    }
  };

  const handleAddProduct = () => {
    if (!canCreate) return;
    if (isDesktop) {
      setSelectedProductId(null);
      setShowCreateForm(true);
    } else {
      navigate('/admin/inventory/products/new');
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Product',
      width: '260px',
      sortable: true,
      render: (_, row) => (
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {row.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {row.sku}{row.barcode ? ` · ${row.barcode}` : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      width: '140px',
      render: (val) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {val?.name || '-'}
        </span>
      ),
    },
    {
      key: 'purchase_price',
      header: 'Purchase',
      width: '120px',
      sortable: true,
      render: (val) => (
        <span className="text-sm font-mono text-gray-900 dark:text-white">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: 'selling_price',
      header: 'Selling',
      width: '120px',
      sortable: true,
      render: (val) => (
        <span className="text-sm font-mono text-gray-900 dark:text-white">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: 'current_stock',
      header: 'Stock',
      width: '120px',
      sortable: true,
      render: (val, row) => {
        const stock = parseFloat(val || 0);
        const min = parseFloat(row.minimum_stock || 0);
        const isLow = stock > 0 && stock <= min;
        const isOut = stock <= 0;
        return (
          <div className="flex items-center gap-1">
            <span
              className={`text-sm font-mono ${
                isOut
                  ? 'text-red-600'
                  : isLow
                  ? 'text-orange-600'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {stock}
            </span>
            {isLow && <AlertTriangle size={14} className="text-orange-500" />}
          </div>
        );
      },
    },
    {
      key: 'is_active',
      header: 'Status',
      width: '120px',
      sortable: true,
      render: (val) => (
        <Badge
          variant={val ? 'success' : 'danger'}
          type="soft"
          size="sm"
          dot
        >
          {val ? 'Active' : 'Inactive'}
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
        title="Products"
        subtitle="Manage and view all products"
        breadcrumb={{ items: [{ label: 'Products' }] }}
        sticky
      >
        {canCreate && (
          <Button size="sm" prefixIcon={Plus} onClick={handleAddProduct}>Add Product</Button>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
        <div className="w-full sm:w-80">
          <Input
            prefixIcon={Search}
            placeholder="Search by name, SKU or barcode..."
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
              data={products}
              loading={isLoading}
              emptyMessage="No products found"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              onRowClick={handleRowClick}
              activeRowId={selectedProductId}
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
                <ProductCreateForm onClose={() => setShowCreateForm(false)} />
              </div>
            ) : (!showCreateForm && selectedProductId && isDesktop) ? (
              <div className="h-full bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-[#424242] shadow-sm overflow-hidden">
                <ProductDetailPanel
                  productId={selectedProductId}
                  onClose={() => setSelectedProductId(null)}
                />
              </div>
            ) : null
          }
        />
      </div>
    </div>
  );
};

export default ProductsPage;
