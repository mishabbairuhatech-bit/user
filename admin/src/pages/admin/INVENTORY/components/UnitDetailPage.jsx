import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Ruler } from 'lucide-react';
import { PageHeader, Badge, Button, Card, Spinner } from '@components/ui';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const UnitDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.UNITS, 'detail', id],
    queryFn: async () => {
      const res = await api.get(API.UNITS, { params: { limit: 200 } });
      const items = res.data?.data?.items || res.data?.items || res.data?.data || [];
      return items.find((u) => String(u.id) === String(id)) || null;
    },
    enabled: !!id,
  });

  const unit = data || {};

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
        title="Unit Details"
        subtitle={unit.name}
        breadcrumb={{
          items: [
            { label: 'Inventory', href: '/admin/inventory/units' },
            { label: 'Units', href: '/admin/inventory/units' },
            { label: unit.name || 'Details' },
          ],
        }}
        sticky
      >
        <Button variant="outline" size="sm" prefixIcon={ArrowLeft} onClick={() => navigate('/admin/inventory/units')}>
          Back
        </Button>
      </PageHeader>

      <Card>
        <Card.Body>
          {/* Icon + Name + Status */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary-100 dark:bg-[#1a1a1a]">
              <Ruler size={24} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">{unit.name || '-'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate font-mono">{unit.short_name || '-'}</p>
            </div>
            <Badge variant={unit.is_active !== false ? 'success' : 'danger'} type="soft" size="sm" dot>
              {unit.is_active !== false ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Detail rows */}
          <div className="space-y-3.5">
            <Row label="Name" value={unit.name || '-'} />
            <Row label="Short Name" value={unit.short_name || '-'} />
            <Row label="Status" value={
              <Badge variant={unit.is_active !== false ? 'success' : 'danger'} type="soft" size="sm" dot>
                {unit.is_active !== false ? 'Active' : 'Inactive'}
              </Badge>
            } />
            <Row label="Created" value={formatDate(unit.created_at)} />
            <Row label="Updated" value={formatDate(unit.updated_at)} />
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

export default UnitDetailPage;
