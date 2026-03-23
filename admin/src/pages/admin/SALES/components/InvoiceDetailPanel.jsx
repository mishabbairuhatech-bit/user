import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { X, Maximize2 } from 'lucide-react';
import { Badge, Spinner } from '@components/ui';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const InvoiceDetailPanel = ({ invoiceId, onClose }) => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.SALES_INVOICE_DETAIL, invoiceId],
    queryFn: async () => {
      const res = await api.get(`${API.SALES_INVOICES}/${invoiceId}`);
      return res.data;
    },
    enabled: !!invoiceId,
  });

  const invoice = data?.data || data || {};

  const formatDate = (val) => {
    if (!val) return '-';
    return new Date(val).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (val) =>
    `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

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
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Invoice Details</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/admin/sales/invoices/${invoiceId}`)}
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
        {/* Invoice Number + Status */}
        <div className="flex items-center justify-between mb-5">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white font-mono">{invoice.invoice_number || '-'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{invoice.party?.name || 'Walk-in'}</p>
          </div>
          {invoice.is_cancelled ? (
            <Badge variant="danger" type="soft" size="sm" dot>Cancelled</Badge>
          ) : (
            <Badge variant={statusColor[invoice.payment_status] || 'default'} type="soft" size="sm" dot>
              {invoice.payment_status || '-'}
            </Badge>
          )}
        </div>

        {/* Detail rows */}
        <div className="space-y-3.5">
          <Row label="Date" value={formatDate(invoice.date)} />
          <Row label="Due Date" value={formatDate(invoice.due_date)} />
          <Row label="Customer" value={invoice.party?.name || 'Walk-in'} />
          <Row label="Place of Supply" value={invoice.place_of_supply || '-'} />
          <Row label="Subtotal" value={<span className="font-mono">{formatCurrency(invoice.taxable_amount)}</span>} />
          <Row label="Discount" value={<span className="font-mono">{formatCurrency(invoice.discount_amount)}</span>} />
          {parseFloat(invoice.cgst_amount || 0) > 0 && (
            <Row label="CGST" value={<span className="font-mono">{formatCurrency(invoice.cgst_amount)}</span>} />
          )}
          {parseFloat(invoice.sgst_amount || 0) > 0 && (
            <Row label="SGST" value={<span className="font-mono">{formatCurrency(invoice.sgst_amount)}</span>} />
          )}
          {parseFloat(invoice.igst_amount || 0) > 0 && (
            <Row label="IGST" value={<span className="font-mono">{formatCurrency(invoice.igst_amount)}</span>} />
          )}
          <Row label="Grand Total" value={<span className="font-mono font-medium">{formatCurrency(invoice.grand_total)}</span>} />
          <Row label="Amount Paid" value={<span className="font-mono text-green-600">{formatCurrency(invoice.amount_paid)}</span>} />
          <Row label="Balance Due" value={<span className="font-mono text-red-600">{formatCurrency(invoice.balance_due)}</span>} />
          <Row label="Payment Status" value={
            <Badge variant={statusColor[invoice.payment_status] || 'default'} type="soft" size="sm">
              {invoice.payment_status || '-'}
            </Badge>
          } />
          <Row label="Source" value={
            <Badge variant={invoice.source === 'pos' ? 'info' : 'default'} type="soft" size="sm">
              {invoice.source || '-'}
            </Badge>
          } />
          {invoice.notes && <Row label="Notes" value={invoice.notes} />}
          {invoice.terms && <Row label="Terms" value={invoice.terms} />}
          <Row label="Created" value={formatDate(invoice.created_at)} />
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

export default InvoiceDetailPanel;
