import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, User } from 'lucide-react';
import { PageHeader, Badge, Button, Card, Spinner } from '@components/ui';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const VendorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.PARTY_DETAIL, id],
    queryFn: async () => {
      const res = await api.get(`${API.PARTIES}/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const vendor = data?.data || data || {};

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
        title="Vendor Details"
        subtitle={vendor.name}
        breadcrumb={{
          items: [
            { label: 'Purchases', href: '/admin/purchases/vendors' },
            { label: 'Vendors', href: '/admin/purchases/vendors' },
            { label: vendor.name || 'Details' },
          ],
        }}
        sticky
      >
        <Button variant="outline" size="sm" prefixIcon={ArrowLeft} onClick={() => navigate('/admin/purchases/vendors')}>
          Back
        </Button>
      </PageHeader>

      <Card>
        <Card.Body>
          {/* Icon + Name + Status */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary-100 dark:bg-[#1a1a1a]">
              <User size={24} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">{vendor.name || '-'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{vendor.email || '-'}</p>
            </div>
            <Badge variant="info" type="soft" size="sm">
              {vendor.type || 'vendor'}
            </Badge>
          </div>

          {/* Detail rows */}
          <div className="space-y-3.5">
            <Row label="Name" value={vendor.name || '-'} />
            <Row label="Type" value={
              <Badge variant="info" type="soft" size="sm">
                {vendor.type || 'vendor'}
              </Badge>
            } />
            <Row label="GSTIN" value={vendor.gstin || '-'} />
            <Row label="PAN" value={vendor.pan || '-'} />
            <Row label="Phone" value={vendor.phone || '-'} />
            <Row label="Email" value={vendor.email || '-'} />
            <Row label="State Code" value={vendor.state_code ? (
              <Badge variant="default" type="soft" size="sm">{vendor.state_code}</Badge>
            ) : '-'} />
            <Row label="Credit Limit" value={<span className="font-mono">{formatCurrency(vendor.credit_limit)}</span>} />
            <Row label="Credit Period" value={vendor.credit_period ? `${vendor.credit_period} days` : '-'} />
            <Row label="Opening Balance" value={<span className="font-mono">{formatCurrency(vendor.opening_balance)}</span>} />
            <Row label="Created" value={formatDate(vendor.created_at)} />
            <Row label="Updated" value={formatDate(vendor.updated_at)} />
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

export default VendorDetailPage;
