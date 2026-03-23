import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, XCircle, Printer } from 'lucide-react';
import { PageHeader, Badge, Button, Card, Spinner, Table, ConfirmModal } from '@components/ui';
import { useToast } from '@components/ui/Toast';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const InvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.SALES_INVOICE_DETAIL, id],
    queryFn: async () => {
      const res = await api.get(`${API.SALES_INVOICES}/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const invoice = data?.data || data || {};

  const cancelMutation = useMutation({
    mutationFn: () => api.post(`${API.SALES_INVOICES}/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.SALES_INVOICE_DETAIL, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.SALES_INVOICES] });
      toast.success('Invoice cancelled successfully');
      setShowCancelModal(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to cancel invoice');
    },
  });

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

  if (!invoice.id) {
    return <div className="text-center py-20 text-gray-500">Invoice not found.</div>;
  }

  const itemColumns = [
    {
      key: 'product',
      header: 'Product',
      width: '200px',
      render: (val) => <span className="text-sm">{val?.name || '-'}</span>,
    },
    {
      key: 'hsn_code',
      header: 'HSN',
      width: '100px',
      render: (val) => <span className="text-xs font-mono text-gray-500">{val || '-'}</span>,
    },
    {
      key: 'quantity',
      header: 'Qty',
      width: '80px',
      render: (val) => <span className="font-mono">{parseFloat(val)}</span>,
    },
    {
      key: 'unit_price',
      header: 'Price',
      width: '110px',
      render: (val) => <span className="font-mono">{formatCurrency(val)}</span>,
    },
    {
      key: 'discount_percent',
      header: 'Disc %',
      width: '80px',
      render: (val) => <span className="font-mono text-gray-500">{parseFloat(val)}%</span>,
    },
    {
      key: 'taxable_amount',
      header: 'Taxable',
      width: '110px',
      render: (val) => <span className="font-mono">{formatCurrency(val)}</span>,
    },
    {
      key: 'tax_rate',
      header: 'Tax',
      width: '160px',
      render: (_, row) => {
        const igst = parseFloat(row.igst_amount || 0);
        const cgst = parseFloat(row.cgst_amount || 0);
        const sgst = parseFloat(row.sgst_amount || 0);
        return (
          <span className="text-xs text-gray-500">
            {igst > 0 ? `IGST ${formatCurrency(igst)}` : `CGST ${formatCurrency(cgst)} + SGST ${formatCurrency(sgst)}`}
          </span>
        );
      },
    },
    {
      key: 'total',
      header: 'Total',
      width: '110px',
      render: (val) => <span className="font-mono font-medium">{formatCurrency(val)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoice Details"
        subtitle={`${invoice.invoice_number} - ${invoice.party?.name || 'Walk-in'}`}
        breadcrumb={{
          items: [
            { label: 'Sales Invoices', href: '/admin/sales/invoices' },
            { label: invoice.invoice_number || 'Details' },
          ],
        }}
        sticky
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" prefixIcon={ArrowLeft} onClick={() => navigate('/admin/sales/invoices')}>
            Back
          </Button>
          <Button variant="outline" size="sm" prefixIcon={Printer} onClick={() => window.print()}>
            Print
          </Button>
          {!invoice.is_cancelled && (
            <Button variant="outline" size="sm" prefixIcon={XCircle} onClick={() => setShowCancelModal(true)} className="text-red-600">
              Cancel
            </Button>
          )}
        </div>
      </PageHeader>

      {invoice.is_cancelled && (
        <Badge variant="danger" type="soft" size="sm" dot>CANCELLED</Badge>
      )}

      <Card>
        <Card.Body>
          {/* Invoice header info */}
          <div className="flex items-center justify-between mb-6">
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-gray-900 dark:text-white font-mono">{invoice.invoice_number}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{invoice.party?.name || 'Walk-in'}</p>
            </div>
            <Badge variant={invoice.is_cancelled ? 'danger' : (statusColor[invoice.payment_status] || 'default')} type="soft" size="sm" dot>
              {invoice.is_cancelled ? 'Cancelled' : (invoice.payment_status || '-')}
            </Badge>
          </div>

          {/* Detail rows */}
          <div className="space-y-3.5">
            <Row label="Date" value={formatDate(invoice.date)} />
            <Row label="Due Date" value={formatDate(invoice.due_date)} />
            <Row label="Customer" value={invoice.party?.name || 'Walk-in'} />
            {invoice.party?.gstin && <Row label="Customer GSTIN" value={invoice.party.gstin} />}
            <Row label="Place of Supply" value={invoice.place_of_supply || '-'} />
            <Row label="Subtotal" value={<span className="font-mono">{formatCurrency(invoice.taxable_amount)}</span>} />
            {parseFloat(invoice.discount_amount || 0) > 0 && (
              <Row label="Discount" value={<span className="font-mono">{formatCurrency(invoice.discount_amount)}</span>} />
            )}
            {parseFloat(invoice.cgst_amount || 0) > 0 && (
              <Row label="CGST" value={<span className="font-mono">{formatCurrency(invoice.cgst_amount)}</span>} />
            )}
            {parseFloat(invoice.sgst_amount || 0) > 0 && (
              <Row label="SGST" value={<span className="font-mono">{formatCurrency(invoice.sgst_amount)}</span>} />
            )}
            {parseFloat(invoice.igst_amount || 0) > 0 && (
              <Row label="IGST" value={<span className="font-mono">{formatCurrency(invoice.igst_amount)}</span>} />
            )}
            {parseFloat(invoice.round_off || 0) !== 0 && (
              <Row label="Round Off" value={<span className="font-mono">{formatCurrency(invoice.round_off)}</span>} />
            )}
            <Row label="Grand Total" value={<span className="font-mono font-semibold">{formatCurrency(invoice.grand_total)}</span>} />
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
        </Card.Body>
      </Card>

      {/* Line Items */}
      {invoice.items && invoice.items.length > 0 && (
        <Card>
          <Card.Body>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Line Items</h3>
            <Table columns={itemColumns} data={invoice.items} emptyMessage="No items" />
          </Card.Body>
        </Card>
      )}

      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => cancelMutation.mutate()}
        title="Cancel Invoice"
        message={`Cancel ${invoice.invoice_number}? Stock will be returned and accounting entries reversed.`}
        variant="danger"
        confirmText="Cancel Invoice"
        loading={cancelMutation.isPending}
      />
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

export default InvoiceDetailPage;
