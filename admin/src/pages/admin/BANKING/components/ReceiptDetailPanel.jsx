import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { X, Maximize2 } from 'lucide-react';
import { Badge, Spinner } from '@components/ui';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const ReceiptDetailPanel = ({ receiptId, onClose }) => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.PAYMENT_RECEIPT_DETAIL, receiptId],
    queryFn: async () => {
      const res = await api.get(`${API.PAYMENT_RECEIPTS}/${receiptId}`);
      return res.data;
    },
    enabled: !!receiptId,
  });

  const receipt = data?.data || data || {};

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
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Receipt Details</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/admin/banking/receipts/${receiptId}`)}
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
          <Row label="Voucher #" value={
            <span className="font-mono">{receipt.voucher_number || '-'}</span>
          } />
          <Row label="Date" value={receipt.date ? new Date(receipt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'} />
          <Row label="Customer" value={receipt.party?.name || '-'} />
          <Row label="Amount" value={
            <span className="font-mono">{formatCurrency(receipt.amount)}</span>
          } />
          <Row label="Payment Mode" value={
            <Badge variant="info" type="soft" size="sm">
              {receipt.payment_mode ? receipt.payment_mode.replace(/_/g, ' ') : '-'}
            </Badge>
          } />
          <Row label="Bank Account" value={receipt.bankAccount?.account_name || '-'} />
          <Row label="Transaction Ref" value={receipt.transaction_ref || '-'} />
          <Row label="Narration" value={receipt.narration || '-'} />
          <Row label="Status" value={
            <Badge
              variant={receipt.is_cancelled ? 'danger' : 'success'}
              type="soft"
              size="sm"
              dot
            >
              {receipt.is_cancelled ? 'Cancelled' : 'Active'}
            </Badge>
          } />
          <Row label="Created" value={formatDate(receipt.created_at)} />
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

export default ReceiptDetailPanel;
