import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { PageHeader, Badge, Card, Spinner, Button } from '@components/ui';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const PurchaseBillDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.PURCHASE_BILL_DETAIL, id],
    queryFn: async () => {
      const res = await api.get(`${API.PURCHASE_BILLS}/${id}`);
      return res.data;
    },
    enabled: !!id,
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
    <div className="space-y-6">
      <PageHeader
        title="Bill Details"
        subtitle={bill.bill_number || ''}
        breadcrumb={{
          items: [
            { label: 'Bills', href: '/admin/purchases/bills' },
            { label: bill.bill_number || 'Detail' },
          ],
        }}
        sticky
      >
        <Button variant="outline" size="sm" prefixIcon={ArrowLeft} onClick={() => navigate('/admin/purchases/bills')}>
          Back
        </Button>
      </PageHeader>

      <Card>
        <Card.Body>
          {/* Detail rows */}
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

          {/* Line Items */}
          {bill.items && bill.items.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-[#2a2a2a]">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Line Items</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-[#2a2a2a]">
                      <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 dark:text-gray-400">Product</th>
                      <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 dark:text-gray-400">HSN</th>
                      <th className="text-right py-2 pr-4 text-xs font-semibold text-gray-500 dark:text-gray-400">Qty</th>
                      <th className="text-right py-2 pr-4 text-xs font-semibold text-gray-500 dark:text-gray-400">Unit Price</th>
                      <th className="text-right py-2 pr-4 text-xs font-semibold text-gray-500 dark:text-gray-400">Disc %</th>
                      <th className="text-right py-2 pr-4 text-xs font-semibold text-gray-500 dark:text-gray-400">Taxable</th>
                      <th className="text-right py-2 pr-4 text-xs font-semibold text-gray-500 dark:text-gray-400">Tax</th>
                      <th className="text-right py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bill.items.map((item, idx) => {
                      const cgst = parseFloat(item.cgst_amount || 0);
                      const sgst = parseFloat(item.sgst_amount || 0);
                      const igst = parseFloat(item.igst_amount || 0);
                      const taxLabel = igst > 0 ? `IGST ${fmt(igst)}` : `CGST ${fmt(cgst)} + SGST ${fmt(sgst)}`;
                      return (
                        <tr key={idx} className="border-b border-gray-100 dark:border-[#2a2a2a] last:border-0">
                          <td className="py-2 pr-4 text-gray-900 dark:text-white">{item.product?.name || '-'}</td>
                          <td className="py-2 pr-4 font-mono text-xs text-gray-500">{item.hsn_code || '-'}</td>
                          <td className="py-2 pr-4 text-right font-mono">{parseFloat(item.quantity || 0)}</td>
                          <td className="py-2 pr-4 text-right font-mono">{fmt(item.unit_price)}</td>
                          <td className="py-2 pr-4 text-right font-mono text-gray-500">{parseFloat(item.discount_percent || 0)}%</td>
                          <td className="py-2 pr-4 text-right font-mono">{fmt(item.taxable_amount)}</td>
                          <td className="py-2 pr-4 text-right text-xs text-gray-500">{taxLabel}</td>
                          <td className="py-2 text-right font-mono font-medium">{fmt(item.total)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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

export default PurchaseBillDetailPage;
