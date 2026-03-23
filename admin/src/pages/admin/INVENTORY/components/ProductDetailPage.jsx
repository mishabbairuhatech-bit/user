import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { PageHeader, Badge, Button, Card, Spinner } from '@components/ui';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.PRODUCT_DETAIL, id],
    queryFn: async () => {
      const res = await api.get(`${API.PRODUCTS}/${id}`);
      return res.data;
    },
    enabled: !!id,
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
    <div className="space-y-6">
      <PageHeader
        title="Product Details"
        subtitle={product.name}
        breadcrumb={{
          items: [
            { label: 'Products', href: '/admin/inventory/products' },
            { label: product.name || 'Details' },
          ],
        }}
        sticky
      >
        <Button variant="outline" size="sm" prefixIcon={ArrowLeft} onClick={() => navigate('/admin/inventory/products')}>
          Back
        </Button>
      </PageHeader>

      <Card>
        <Card.Body>
          {/* Name + SKU + Status */}
          <div className="flex items-center gap-4 mb-6">
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">{product.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                SKU: {product.sku}{product.barcode ? ` · Barcode: ${product.barcode}` : ''}
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
                  className={`text-sm font-mono ${
                    isOut
                      ? 'text-red-600'
                      : isLow
                      ? 'text-orange-600'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {stock} {product.unit?.short_name || ''}
                </span>
                {isLow && <AlertTriangle size={14} className="text-orange-500" />}
                {isLow && <span className="text-xs text-orange-600 ml-1">Low stock (min: {min})</span>}
                {isOut && <span className="text-xs text-red-600 ml-1">Out of stock</span>}
              </div>
            } />
            <Row label="Minimum Stock" value={String(min)} />
            <Row label="Description" value={product.description || '-'} />
            <Row label="Created" value={formatDate(product.created_at)} />
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-[#2a2a2a] last:border-0">
    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    <span className="text-sm text-gray-900 dark:text-white text-right truncate ml-4">
      {typeof value === 'string' ? value : value}
    </span>
  </div>
);

export default ProductDetailPage;
