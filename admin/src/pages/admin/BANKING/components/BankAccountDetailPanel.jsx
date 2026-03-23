import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { X, Maximize2 } from 'lucide-react';
import { Badge, Spinner } from '@components/ui';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const BankAccountDetailPanel = ({ accountId, onClose }) => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.BANK_ACCOUNT_DETAIL, accountId],
    queryFn: async () => {
      const res = await api.get(`${API.BANK_ACCOUNTS}/${accountId}`);
      return res.data;
    },
    enabled: !!accountId,
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
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Account Details</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/admin/banking/accounts/${accountId}`)}
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
          <Row label="Opening Balance" value={
            <span className="font-mono">{formatCurrency(account.opening_balance)}</span>
          } />
          <Row label="Current Balance" value={
            <span className="font-mono">{formatCurrency(account.current_balance)}</span>
          } />
          <Row label="Is Default" value={
            account.is_default ? (
              <Badge variant="success" type="soft" size="sm">Yes</Badge>
            ) : (
              <span>No</span>
            )
          } />
          <Row label="Created" value={formatDate(account.created_at)} />
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

export default BankAccountDetailPanel;
