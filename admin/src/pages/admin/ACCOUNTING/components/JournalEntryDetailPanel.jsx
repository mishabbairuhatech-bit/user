import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { X, Maximize2 } from 'lucide-react';
import { Badge, Spinner } from '@components/ui';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const JournalEntryDetailPanel = ({ entryId, onClose }) => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.JOURNAL_ENTRY_DETAIL, entryId],
    queryFn: async () => {
      const res = await api.get(`${API.JOURNAL_ENTRIES}/${entryId}`);
      return res.data;
    },
    enabled: !!entryId,
  });

  const entry = data?.data || data || {};

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

  const lines = entry.lines || entry.journal_lines || [];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-[#424242] flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Entry Details</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/admin/accounting/journal-entries/${entryId}`)}
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
          <Row label="Entry Number" value={
            <span className="font-mono">{entry.entry_number || '-'}</span>
          } />
          <Row label="Date" value={entry.date ? new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'} />
          <Row label="Narration" value={entry.narration || '-'} />
          <Row label="Reference Type" value={
            <Badge variant={entry.reference_type === 'manual' ? 'default' : 'info'} type="soft" size="sm">
              {entry.reference_type ? entry.reference_type.replace(/_/g, ' ') : '-'}
            </Badge>
          } />
          <Row label="Total Amount" value={
            <span className="font-mono">{formatCurrency(entry.total_amount)}</span>
          } />
          <Row label="Status" value={
            <Badge
              variant={entry.is_cancelled ? 'danger' : 'success'}
              type="soft"
              size="sm"
              dot
            >
              {entry.is_cancelled ? 'Cancelled' : 'Active'}
            </Badge>
          } />
          <Row label="Auto-generated" value={entry.is_auto_generated ? 'Yes' : 'No'} />
          <Row label="Financial Year" value={entry.financial_year || '-'} />
          <Row label="Created" value={formatDate(entry.created_at)} />
        </div>

        {/* Journal Lines */}
        {lines.length > 0 && (
          <div className="mt-6">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">Lines</h4>
            <div className="border border-gray-100 dark:border-[#2a2a2a] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#1e1e1e] border-b border-gray-100 dark:border-[#2a2a2a]">
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Account</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Debit</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, idx) => (
                    <tr key={line.id || idx} className="border-b border-gray-100 dark:border-[#2a2a2a] last:border-0">
                      <td className="px-3 py-2 text-xs text-gray-900 dark:text-white">
                        {line.account?.name || line.ledger_account?.name || line.account_name || '-'}
                      </td>
                      <td className="px-3 py-2 text-xs text-right font-mono text-gray-900 dark:text-white">
                        {parseFloat(line.debit_amount || 0) > 0 ? formatCurrency(line.debit_amount) : '-'}
                      </td>
                      <td className="px-3 py-2 text-xs text-right font-mono text-gray-900 dark:text-white">
                        {parseFloat(line.credit_amount || 0) > 0 ? formatCurrency(line.credit_amount) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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

export default JournalEntryDetailPanel;
