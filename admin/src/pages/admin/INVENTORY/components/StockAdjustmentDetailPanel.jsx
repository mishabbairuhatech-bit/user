import { useNavigate } from 'react-router-dom';
import { X, Maximize2, Package } from 'lucide-react';
import { Badge } from '@components/ui';

const StockAdjustmentDetailPanel = ({ adjustment, onClose }) => {
  const navigate = useNavigate();
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

  const formatCurrency = (val) => `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-[#424242] flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Adjustment Details</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/admin/inventory/stock-adjustments/${adjustment.id}`)}
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
        {/* Icon + Number */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary-100 dark:bg-[#1a1a1a]">
            <Package size={20} className="text-primary-600 dark:text-primary-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{adjustment.adjustment_number}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {adjustment.date ? new Date(adjustment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
            </p>
          </div>
          <Badge variant="default" type="soft" size="sm">
            {adjustment.items?.length || 0} items
          </Badge>
        </div>

        {/* Detail rows */}
        <div className="space-y-3.5">
          <Row label="Adjustment #" value={adjustment.adjustment_number} />
          <Row label="Date" value={
            adjustment.date ? new Date(adjustment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'
          } />
          <Row label="Reason" value={adjustment.reason || '-'} />
          <Row label="Items Count" value={
            <Badge variant="default" type="soft" size="sm">{adjustment.items?.length || 0}</Badge>
          } />
          <Row label="Created" value={formatDate(adjustment.created_at)} />
        </div>

        {/* Items list */}
        {adjustment.items && adjustment.items.length > 0 && (
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-[#2a2a2a]">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Adjustment Items</h4>
            <div className="space-y-2">
              {adjustment.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {item.product?.name || item.product_id}
                    </p>
                    <p className="text-xs text-gray-500">{item.product?.sku || ''}</p>
                  </div>
                  <div className="text-right ml-3">
                    <Badge
                      variant={item.adjustment_type === 'increase' ? 'success' : 'danger'}
                      type="soft"
                      size="sm"
                    >
                      {item.adjustment_type === 'increase' ? '+' : '-'}{parseFloat(item.quantity || 0)}
                    </Badge>
                    <p className="text-xs font-mono text-gray-500 mt-0.5">{formatCurrency(item.unit_cost)}/unit</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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

export default StockAdjustmentDetailPanel;
