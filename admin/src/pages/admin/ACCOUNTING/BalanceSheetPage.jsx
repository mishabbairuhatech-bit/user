import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';
import { Spinner, PageHeader, Badge, Card, DatePicker } from '@components/ui';

const SectionTable = ({ title, items, total, color }) => {
  const colorClasses = {
    blue: {
      headerBg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-400',
    },
    orange: {
      headerBg: 'bg-orange-50 dark:bg-orange-900/20',
      text: 'text-orange-700 dark:text-orange-400',
    },
    purple: {
      headerBg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-700 dark:text-purple-400',
    },
  };

  const cls = colorClasses[color] || colorClasses.blue;

  return (
    <Card>
      <div className="overflow-hidden">
        <div className={`px-4 py-3 ${cls.headerBg} border-b border-gray-200 dark:border-[#2a2a2a]`}>
          <h3 className={`text-sm font-semibold ${cls.text}`}>{title}</h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-[#2a2a2a]">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between px-4 py-2.5">
              <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
              <span className="text-sm font-mono text-gray-900 dark:text-white">
                ₹{parseFloat(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
          {items.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-gray-400">No accounts</div>
          )}
        </div>
        <div className={`flex justify-between px-4 py-3 ${cls.headerBg} font-semibold`}>
          <span className={`text-sm ${cls.text}`}>Total {title}</span>
          <span className={`text-sm font-mono ${cls.text}`}>
            ₹{parseFloat(total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </Card>
  );
};

const BalanceSheetPage = () => {
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.BALANCE_SHEET, asOfDate],
    queryFn: async () => {
      const res = await api.get(API.BALANCE_SHEET, { params: { as_of_date: asOfDate } });
      return res.data.data;
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Balance Sheet"
        subtitle="Assets, liabilities, and equity at a point in time"
        breadcrumb={{ items: [{ label: 'Accounting' }, { label: 'Balance Sheet' }] }}
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
        <div className="space-y-6">
          <SectionTable title="Assets" items={data?.assets || []} total={data?.total_assets} color="blue" />
          <SectionTable title="Liabilities" items={data?.liabilities || []} total={data?.total_liabilities} color="orange" />
          <SectionTable title="Equity" items={data?.equity || []} total={data?.total_equity} color="purple" />
        </div>
      )}
    </div>
  );
};

export default BalanceSheetPage;
