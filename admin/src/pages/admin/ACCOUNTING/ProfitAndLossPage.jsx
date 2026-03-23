import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';
import { Spinner, PageHeader, Card, DatePicker } from '@components/ui';

const ProfitAndLossPage = () => {
  const today = new Date();
  const fyStart = today.getMonth() >= 3
    ? `${today.getFullYear()}-04-01`
    : `${today.getFullYear() - 1}-04-01`;

  const [fromDate, setFromDate] = useState(fyStart);
  const [toDate, setToDate] = useState(today.toISOString().split('T')[0]);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.PROFIT_AND_LOSS, fromDate, toDate],
    queryFn: async () => {
      const res = await api.get(API.PROFIT_AND_LOSS, { params: { from_date: fromDate, to_date: toDate } });
      return res.data.data;
    },
  });

  const formatCurrency = (val) => `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profit & Loss Statement"
        subtitle="Income and expenses for the selected period"
        breadcrumb={{ items: [{ label: 'Accounting' }, { label: 'Profit & Loss' }] }}
        sticky
      />

      <div className="flex items-center gap-3 flex-wrap">
        <DatePicker
          label="From"
          value={fromDate}
          onChange={(val) => setFromDate(val)}
          size="sm"
        />
        <DatePicker
          label="To"
          value={toDate}
          onChange={(val) => setToDate(val)}
          size="sm"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income */}
          <Card>
            <div className="overflow-hidden">
              <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 border-b border-gray-200 dark:border-[#2a2a2a]">
                <h3 className="text-sm font-semibold text-green-700 dark:text-green-400">Income</h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-[#2a2a2a]">
                {(data?.income || []).map((item, i) => (
                  <div key={i} className="flex justify-between px-4 py-2.5">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                    <span className="text-sm font-mono text-gray-900 dark:text-white">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between px-4 py-3 bg-green-50 dark:bg-green-900/20 font-semibold">
                <span className="text-sm text-green-700 dark:text-green-400">Total Income</span>
                <span className="text-sm font-mono text-green-700 dark:text-green-400">{formatCurrency(data?.total_income)}</span>
              </div>
            </div>
          </Card>

          {/* Expenses */}
          <Card>
            <div className="overflow-hidden">
              <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-gray-200 dark:border-[#2a2a2a]">
                <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">Expenses</h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-[#2a2a2a]">
                {(data?.expenses || []).map((item, i) => (
                  <div key={i} className="flex justify-between px-4 py-2.5">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                    <span className="text-sm font-mono text-gray-900 dark:text-white">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between px-4 py-3 bg-red-50 dark:bg-red-900/20 font-semibold">
                <span className="text-sm text-red-700 dark:text-red-400">Total Expenses</span>
                <span className="text-sm font-mono text-red-700 dark:text-red-400">{formatCurrency(data?.total_expenses)}</span>
              </div>
            </div>
          </Card>

          {/* Net Profit/Loss */}
          <div className="lg:col-span-2">
            <Card className={`p-6 text-center ${(data?.net_profit || 0) >= 0 ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}`}>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Net {(data?.net_profit || 0) >= 0 ? 'Profit' : 'Loss'}
              </p>
              <p className={`text-3xl font-bold font-mono ${(data?.net_profit || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(Math.abs(data?.net_profit || 0))}
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitAndLossPage;
