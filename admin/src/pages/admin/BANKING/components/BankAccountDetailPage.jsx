import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Landmark } from 'lucide-react';
import { PageHeader, Badge, Button, Card, Spinner } from '@components/ui';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const BankAccountDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.BANK_ACCOUNT_DETAIL, id],
    queryFn: async () => {
      const res = await api.get(`${API.BANK_ACCOUNTS}/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const account = data?.data || data || {};

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
        title="Account Details"
        subtitle={account.account_name}
        breadcrumb={{
          items: [
            { label: 'Banking', href: '/admin/banking/accounts' },
            { label: 'Accounts', href: '/admin/banking/accounts' },
            { label: account.account_name || 'Details' },
          ],
        }}
        sticky
      >
        <Button variant="outline" size="sm" prefixIcon={ArrowLeft} onClick={() => navigate('/admin/banking/accounts')}>
          Back
        </Button>
      </PageHeader>

      <Card>
        <Card.Body>
          {/* Icon + Name + Type */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary-100 dark:bg-[#1a1a1a]">
              <Landmark size={24} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">{account.account_name || '-'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{account.bank_name || '-'}</p>
            </div>
            <Badge variant="info" type="soft" size="sm">
              {account.account_type ? account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1) : '-'}
            </Badge>
          </div>

          {/* Detail rows */}
          <div className="space-y-3.5">
            <Row label="Account Name" value={account.account_name || '-'} />
            <Row label="Account Number" value={account.account_number || '-'} />
            <Row label="Bank Name" value={account.bank_name || '-'} />
            <Row label="Branch" value={account.branch || '-'} />
            <Row label="IFSC" value={account.ifsc_code || '-'} />
            <Row label="Type" value={
              <Badge variant="info" type="soft" size="sm">
                {account.account_type ? account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1) : '-'}
              </Badge>
            } />
            <Row label="Opening Balance" value={<span className="font-mono">{formatCurrency(account.opening_balance)}</span>} />
            <Row label="Current Balance" value={<span className="font-mono">{formatCurrency(account.current_balance)}</span>} />
            <Row label="Default" value={
              account.is_default ? (
                <Badge variant="success" type="soft" size="sm">Yes</Badge>
              ) : (
                <Badge variant="default" type="soft" size="sm">No</Badge>
              )
            } />
            <Row label="Created" value={formatDate(account.created_at)} />
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

export default BankAccountDetailPage;
