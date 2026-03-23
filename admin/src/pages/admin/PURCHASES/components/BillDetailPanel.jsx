import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { X, Maximize2 } from 'lucide-react';
import { Badge, Spinner } from '@components/ui';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const BillDetailPanel = ({ billId, onClose }) => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.PURCHASE_BILL_DETAIL, billId],
    queryFn: async () => {
      const res = await api.get(`${API.PURCHASE_BILLS}/${billId}`);
      return res.data;
    },
    enabled: !!billId,
  });

  const bill = data?.data || data || {};

  const fmt = (val) => `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

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

  const formatDateShort = (val) => {
    if (!val) return '-';
    return new Date(val).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const statusColor = { unpaid: 'danger', partial: 'warning', paid: 'success' };

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
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Bill Details</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/admin/purchases/bills/${billId}`)}
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
          <Row label="Bill Number" value={bill.bill_number || '-'} />
          <Row label="Vendor Bill #" value={bill.vendor_bill_number || '-'} />
          <Row label="Date" value={formatDateShort(bill.date)} />
          <Row label="Due Date" value={formatDateShort(bill.due_date)} />
          <Row label="Vendor" value={bill.party?.name || '-'} />
          <Row label="Place of Supply" value={bill.place_of_supply || '-'} />
          <Row label="Subtotal" value={
            <span className="font-mono">{fmt(bill.subtotal)}</span>
          } />
          {parseFloat(bill.cgst_amount || 0) > 0 && (
            <Row label="CGST" value={
              <span className="font-mono">{fmt(bill.cgst_amount)}</span>
            } />
          )}
          {parseFloat(bill.sgst_amount || 0) > 0 && (
            <Row label="SGST" value={
              <span className="font-mono">{fmt(bill.sgst_amount)}</span>
            } />
          )}
          {parseFloat(bill.igst_amount || 0) > 0 && (
            <Row label="IGST" value={
              <span className="font-mono">{fmt(bill.igst_amount)}</span>
            } />
          )}
          <Row label="Grand Total" value={
            <span className="font-mono font-medium">{fmt(bill.grand_total)}</span>
          } />
          <Row label="Amount Paid" value={
            <span className="font-mono">{fmt(bill.amount_paid)}</span>
          } />
          <Row label="Balance Due" value={
            <span className="font-mono">{fmt(bill.balance_due)}</span>
          } />
          <Row label="Payment Status" value={
            <Badge variant={statusColor[bill.payment_status] || 'default'} type="soft" size="sm" dot>
              {bill.payment_status || '-'}
            </Badge>
          } />
          <Row label="Notes" value={bill.notes || '-'} />
          <Row label="Created" value={formatDate(bill.created_at)} />
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

export default BillDetailPanel;
