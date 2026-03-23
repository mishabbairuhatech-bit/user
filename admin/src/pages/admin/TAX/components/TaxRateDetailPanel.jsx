import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { X, Maximize2 } from 'lucide-react';
import { Badge, Spinner } from '@components/ui';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const TaxRateDetailPanel = ({ rateId, onClose }) => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.TAX_RATES, 'detail', rateId],
    queryFn: async () => {
      const res = await api.get(`${API.TAX_RATES}/${rateId}`);
      return res.data;
    },
    enabled: !!rateId,
  });

  const rate = data?.data || data || {};

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-[#424242] flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Tax Rate Details</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/admin/tax/rates/${rateId}`)}
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
        <div className="space-y-3.5">
          <Row label="Name" value={rate.name || '-'} />
          <Row label="Total Rate" value={
            <span className="font-mono">{rate.rate || 0}%</span>
          } />
          <Row label="CGST Rate" value={
            <span className="font-mono">{rate.cgst_rate || 0}%</span>
          } />
          <Row label="SGST Rate" value={
            <span className="font-mono">{rate.sgst_rate || 0}%</span>
          } />
          <Row label="IGST Rate" value={
            <span className="font-mono">{rate.igst_rate || 0}%</span>
          } />
          <Row label="Cess Rate" value={
            <span className="font-mono">{rate.cess_rate || 0}%</span>
          } />
          <Row label="Status" value={
            <Badge
              variant={rate.is_active ? 'success' : 'default'}
              type="soft"
              size="sm"
              dot
            >
              {rate.is_active ? 'Active' : 'Inactive'}
            </Badge>
          } />
          <Row label="Created" value={formatDate(rate.created_at)} />
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

export default TaxRateDetailPanel;
