import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';
import { Spinner, PageHeader, Badge, Card, DatePicker } from '@components/ui';

const TrialBalancePage = () => {
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.TRIAL_BALANCE, asOfDate],
    queryFn: async () => {
      const res = await api.get(API.TRIAL_BALANCE, { params: { as_of_date: asOfDate } });
      return res.data.data;
    },
  });

  const formatCurrency = (val) => `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trial Balance"
        subtitle="Summary of all ledger balances"
        breadcrumb={{ items: [{ label: 'Accounting' }, { label: 'Trial Balance' }] }}
        sticky
      />

      <div className="flex items-center gap-3">
        <DatePicker
          label="As of Date"
          value={asOfDate}
          onChange={(val) => setAsOfDate(val)}
          size="sm"
        />
        {data && (
          <Badge variant={data.is_balanced ? 'success' : 'danger'} type="soft" size="sm" dot>
            {data.is_balanced ? 'Balanced' : 'Imbalanced'}
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      ) : (
        <Card>
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#121212]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Account</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Group</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Debit</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Credit</th>
                </tr>
              </thead>
              <tbody>
                {(data?.accounts || []).map((acc) => (
                  <tr key={acc.account_id} className="border-b border-gray-100 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#1e1e1e]">
                    <td className="px-4 py-2.5 text-sm text-gray-900 dark:text-white">
                      {acc.account_name}
                      {acc.account_code && <span className="text-xs text-gray-400 ml-1">({acc.account_code})</span>}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-500">{acc.group_name}</td>
                    <td className="px-4 py-2.5 text-sm text-right font-mono text-gray-900 dark:text-white">
                      {acc.debit_balance > 0 ? formatCurrency(acc.debit_balance) : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-right font-mono text-gray-900 dark:text-white">
                      {acc.credit_balance > 0 ? formatCurrency(acc.credit_balance) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 dark:bg-[#121212] font-semibold">
                  <td colSpan={2} className="px-4 py-3 text-sm text-gray-900 dark:text-white">Total</td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-gray-900 dark:text-white">{formatCurrency(data?.total_debit)}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-gray-900 dark:text-white">{formatCurrency(data?.total_credit)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TrialBalancePage;
