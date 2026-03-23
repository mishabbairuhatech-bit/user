import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Package } from 'lucide-react';
import { PageHeader, Badge, Button, Card, Spinner } from '@components/ui';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const StockAdjustmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.STOCK_ADJUSTMENTS, 'detail', id],
    queryFn: async () => {
      const res = await api.get(`${API.STOCK_ADJUSTMENTS}/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const adjustment = data?.data || data || {};

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

  const items = adjustment.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Adjustment Details"
        subtitle={adjustment.adjustment_number}
        breadcrumb={{
          items: [
            { label: 'Inventory', href: '/admin/inventory/stock-adjustments' },
            { label: 'Stock Adjustments', href: '/admin/inventory/stock-adjustments' },
            { label: adjustment.adjustment_number || 'Details' },
          ],
        }}
        sticky
      >
        <Button variant="outline" size="sm" prefixIcon={ArrowLeft} onClick={() => navigate('/admin/inventory/stock-adjustments')}>
          Back
        </Button>
      </PageHeader>

      <Card>
        <Card.Body>
          {/* Icon + Number + Items Count */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary-100 dark:bg-[#1a1a1a]">
              <Package size={24} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-gray-900 dark:text-white truncate font-mono">{adjustment.adjustment_number || '-'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {adjustment.date ? new Date(adjustment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
              </p>
            </div>
            <Badge variant="default" type="soft" size="sm">
              {items.length} items
            </Badge>
          </div>

          {/* Detail rows */}
          <div className="space-y-3.5">
            <Row label="Adjustment #" value={adjustment.adjustment_number || '-'} />
            <Row label="Date" value={
              adjustment.date ? new Date(adjustment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'
            } />
            <Row label="Reason" value={adjustment.reason || '-'} />
            <Row label="Items Count" value={
              <Badge variant="default" type="soft" size="sm">{items.length}</Badge>
            } />
          </div>
        </Card.Body>
      </Card>

      {/* Items Card */}
      {items.length > 0 && (
        <Card>
          <Card.Body>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Adjustment Items</h3>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.product?.name || item.product_id}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.product?.sku || ''}</p>
                  </div>
                  <div className="text-right ml-4 flex items-center gap-3">
                    <Badge
                      variant={item.adjustment_type === 'increase' ? 'success' : 'danger'}
                      type="soft"
                      size="sm"
                    >
                      {item.adjustment_type === 'increase' ? '+' : '-'}{parseFloat(item.quantity || 0)}
                    </Badge>
                    <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{formatCurrency(item.unit_cost)}/unit</span>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}
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

export default StockAdjustmentDetailPage;
