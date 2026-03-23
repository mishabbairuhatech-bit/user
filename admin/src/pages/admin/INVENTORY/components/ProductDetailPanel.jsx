import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { X, Maximize2, AlertTriangle } from 'lucide-react';
import { Badge, Spinner } from '@components/ui';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const ProductDetailPanel = ({ productId, onClose }) => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.PRODUCT_DETAIL, productId],
    queryFn: async () => {
      const res = await api.get(`${API.PRODUCTS}/${productId}`);
      return res.data;
    },
    enabled: !!productId,
  });

  const product = data?.data || data || {};

  const formatDate = (val) => {
    if (!val) return '-';
    return new Date(val).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (val) =>
    `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  const stock = parseFloat(product.current_stock || 0);
  const min = parseFloat(product.minimum_stock || 0);
  const isLow = stock > 0 && stock <= min;
  const isOut = stock <= 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-[#424242] flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Product Details</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/admin/inventory/products/${productId}`)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
            title="Expand"
          >
            <Maximize2 size={14} className="text-gray-500" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
            title="Close"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4">
        {/* Name + SKU + Status */}
        <div className="flex items-center gap-3 mb-5">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{product.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              SKU: {product.sku}{product.barcode ? ` · ${product.barcode}` : ''}
            </p>
          </div>
          <Badge variant={product.is_active ? 'success' : 'danger'} type="soft" size="sm" dot>
            {product.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Detail rows */}
        <div className="space-y-3.5">
          <Row label="Category" value={product.category?.name || '-'} />
          <Row label="Unit" value={product.unit?.short_name || '-'} />
          <Row label="Purchase Price" value={formatCurrency(product.purchase_price)} />
          <Row label="Selling Price" value={formatCurrency(product.selling_price)} />
          <Row label="Tax Rate" value={
            product.taxRate ? (
              <Badge variant="info" type="soft" size="sm">
                {product.taxRate.name} ({product.taxRate.rate}%)
              </Badge>
            ) : '-'
          } />
          <Row label="Current Stock" value={
            <div className="flex items-center gap-1">
              <span
                className={`text-xs font-mono ${
                  isOut
                    ? 'text-red-600'
                    : isLow
                    ? 'text-orange-600'
                    : 'text-gray-900 dark:text-white'
                }`}
              >
                {stock}
              </span>
              {isLow && <AlertTriangle size={12} className="text-orange-500" />}
            </div>
          } />
          <Row label="Minimum Stock" value={String(min)} />
          <Row label="Description" value={product.description || '-'} />
          <Row label="Created" value={formatDate(product.created_at)} />
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-[#2a2a2a] last:border-0">
    <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
    <span className="text-xs text-gray-900 dark:text-white text-right truncate ml-4">
      {typeof value === 'string' ? value : value}
    </span>
  </div>
);

export default ProductDetailPanel;
