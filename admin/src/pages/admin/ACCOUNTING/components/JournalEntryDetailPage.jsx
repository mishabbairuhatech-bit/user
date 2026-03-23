import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { PageHeader, Badge, Button, Card, Spinner } from '@components/ui';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const JournalEntryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.JOURNAL_ENTRY_DETAIL, id],
    queryFn: async () => {
      const res = await api.get(`${API.JOURNAL_ENTRIES}/${id}`);
      return res.data;
    },
    enabled: !!id,
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

  const formatCurrency = (val) =>
    `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  const lines = entry.lines || entry.journal_lines || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal Entry Details"
        subtitle={entry.entry_number}
        breadcrumb={{
          items: [
            { label: 'Accounting', href: '/admin/accounting/journal-entries' },
            { label: 'Journal Entries', href: '/admin/accounting/journal-entries' },
            { label: entry.entry_number || 'Details' },
          ],
        }}
        sticky
      >
        <Button variant="outline" size="sm" prefixIcon={ArrowLeft} onClick={() => navigate('/admin/accounting/journal-entries')}>
          Back
        </Button>
      </PageHeader>

      <Card>
        <Card.Body>
          {/* Icon + Entry Number + Status */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary-100 dark:bg-[#1a1a1a]">
              <BookOpen size={24} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-gray-900 dark:text-white truncate font-mono">{entry.entry_number || '-'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {entry.date ? new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
              </p>
            </div>
            <Badge
              variant={entry.is_cancelled ? 'danger' : 'success'}
              type="soft"
              size="sm"
              dot
            >
              {entry.is_cancelled ? 'Cancelled' : 'Active'}
            </Badge>
          </div>

          {/* Detail rows */}
          <div className="space-y-3.5">
            <Row label="Entry #" value={<span className="font-mono">{entry.entry_number || '-'}</span>} />
            <Row label="Date" value={entry.date ? new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'} />
            <Row label="Narration" value={entry.narration || '-'} />
            <Row label="Reference Type" value={
              <Badge variant={entry.reference_type === 'manual' ? 'default' : 'info'} type="soft" size="sm">
                {entry.reference_type ? entry.reference_type.replace(/_/g, ' ') : '-'}
              </Badge>
            } />
            <Row label="Total Amount" value={<span className="font-mono">{formatCurrency(entry.total_amount)}</span>} />
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
        </Card.Body>
      </Card>

      {/* Lines Card */}
      {lines.length > 0 && (
        <Card>
          <Card.Body>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Journal Lines</h3>
            <div className="border border-gray-100 dark:border-[#2a2a2a] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#1e1e1e] border-b border-gray-100 dark:border-[#2a2a2a]">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Account</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Debit</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, idx) => (
                    <tr key={line.id || idx} className="border-b border-gray-100 dark:border-[#2a2a2a] last:border-0">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {line.account?.name || line.ledger_account?.name || line.account_name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-gray-900 dark:text-white">
                        {parseFloat(line.debit_amount || 0) > 0 ? formatCurrency(line.debit_amount) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-gray-900 dark:text-white">
                        {parseFloat(line.credit_amount || 0) > 0 ? formatCurrency(line.credit_amount) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      )}
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

export default JournalEntryDetailPage;
