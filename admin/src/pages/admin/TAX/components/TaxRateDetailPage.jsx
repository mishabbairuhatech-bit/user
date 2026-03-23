import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Percent } from 'lucide-react';
import { PageHeader, Badge, Button, Card, Spinner } from '@components/ui';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const TaxRateDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.TAX_RATES, 'detail', id],
    queryFn: async () => {
      const res = await api.get(`${API.TAX_RATES}/${id}`);
      return res.data;
    },
    enabled: !!id,
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
    <div className="space-y-6">
      <PageHeader
        title="Tax Rate Details"
        subtitle={rate.name}
        breadcrumb={{
          items: [
            { label: 'Tax', href: '/admin/tax/rates' },
            { label: 'Tax Rates', href: '/admin/tax/rates' },
            { label: rate.name || 'Details' },
          ],
        }}
        sticky
      >
        <Button variant="outline" size="sm" prefixIcon={ArrowLeft} onClick={() => navigate('/admin/tax/rates')}>
          Back
        </Button>
      </PageHeader>

      <Card>
        <Card.Body>
          {/* Icon + Name + Status */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary-100 dark:bg-[#1a1a1a]">
              <Percent size={24} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">{rate.name || '-'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate font-mono">{rate.rate || 0}%</p>
            </div>
            <Badge
              variant={rate.is_active ? 'success' : 'default'}
              type="soft"
              size="sm"
              dot
            >
              {rate.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Detail rows */}
          <div className="space-y-3.5">
            <Row label="Name" value={rate.name || '-'} />
            <Row label="Total Rate" value={<span className="font-mono">{rate.rate || 0}%</span>} />
            <Row label="CGST" value={<span className="font-mono">{rate.cgst_rate || 0}%</span>} />
            <Row label="SGST" value={<span className="font-mono">{rate.sgst_rate || 0}%</span>} />
            <Row label="IGST" value={<span className="font-mono">{rate.igst_rate || 0}%</span>} />
            <Row label="Cess" value={<span className="font-mono">{rate.cess_rate || 0}%</span>} />
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

export default TaxRateDetailPage;
