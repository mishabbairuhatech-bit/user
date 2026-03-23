import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Receipt } from 'lucide-react';
import { PageHeader, Badge, Button, Card, Spinner } from '@components/ui';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const ReceiptDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.PAYMENT_RECEIPT_DETAIL, id],
    queryFn: async () => {
      const res = await api.get(`${API.PAYMENT_RECEIPTS}/${id}`);
      return res.data;
    },
    enabled: !!id,
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

  const formatCurrency = (val) =>
    `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Receipt Details"
        subtitle={receipt.voucher_number}
        breadcrumb={{
          items: [
            { label: 'Banking', href: '/admin/banking/receipts' },
            { label: 'Receipts', href: '/admin/banking/receipts' },
            { label: receipt.voucher_number || 'Details' },
          ],
        }}
        sticky
      >
        <Button variant="outline" size="sm" prefixIcon={ArrowLeft} onClick={() => navigate('/admin/banking/receipts')}>
          Back
        </Button>
      </PageHeader>

      <Card>
        <Card.Body>
          {/* Icon + Voucher + Status */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary-100 dark:bg-[#1a1a1a]">
              <Receipt size={24} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-gray-900 dark:text-white truncate font-mono">{receipt.voucher_number || '-'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{receipt.party?.name || '-'}</p>
            </div>
            <Badge
              variant={receipt.is_cancelled ? 'danger' : 'success'}
              type="soft"
              size="sm"
              dot
            >
              {receipt.is_cancelled ? 'Cancelled' : 'Active'}
            </Badge>
          </div>

          {/* Detail rows */}
          <div className="space-y-3.5">
            <Row label="Voucher #" value={<span className="font-mono">{receipt.voucher_number || '-'}</span>} />
            <Row label="Date" value={receipt.date ? new Date(receipt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'} />
            <Row label="Customer" value={receipt.party?.name || '-'} />
            <Row label="Amount" value={<span className="font-mono">{formatCurrency(receipt.amount)}</span>} />
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

export default ReceiptDetailPage;
