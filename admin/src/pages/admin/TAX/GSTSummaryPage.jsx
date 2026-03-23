import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';
import { Spinner, Card, Badge, PageHeader, DatePicker } from '@components/ui';

const GSTSummaryPage = () => {
  const today = new Date();
  const fyStart = today.getMonth() >= 3 ? `${today.getFullYear()}-04-01` : `${today.getFullYear() - 1}-04-01`;
  const [fromDate, setFromDate] = useState(fyStart);
  const [toDate, setToDate] = useState(today.toISOString().split('T')[0]);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.GST_SUMMARY, fromDate, toDate],
    queryFn: async () => {
      const res = await api.get(API.GST_SUMMARY, { params: { from_date: fromDate, to_date: toDate } });
      return res.data.data;
    },
  });

  const fmt = (val) => `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const TaxRow = ({ label, output, input, net }) => (
    <tr className="border-b border-gray-100 dark:border-[#2a2a2a]">
      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{label}</td>
      <td className="px-4 py-3 text-sm font-mono text-right">{fmt(output)}</td>
      <td className="px-4 py-3 text-sm font-mono text-right">{fmt(input)}</td>
      <td className={`px-4 py-3 text-sm font-mono text-right font-medium ${net > 0 ? 'text-red-600' : net < 0 ? 'text-green-600' : ''}`}>
        {net > 0 ? fmt(net) : net < 0 ? `(${fmt(Math.abs(net))}) Credit` : '-'}
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="GST Summary"
        subtitle="Input tax credit vs output tax liability"
        breadcrumb={{ items: [{ label: 'Tax' }, { label: 'GST Summary' }] }}
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
        {data?.cross_utilization_applied && <Badge variant="info" type="soft" size="sm">IGST cross-utilization applied</Badge>}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 border-red-200 dark:border-red-800">
              <p className="text-xs text-gray-500 mb-1">Total Output Tax (Collected)</p>
              <p className="text-2xl font-bold font-mono text-red-600">{fmt(data.output.total)}</p>
            </Card>
            <Card className="p-5 border-green-200 dark:border-green-800">
              <p className="text-xs text-gray-500 mb-1">Total Input Tax Credit (Paid)</p>
              <p className="text-2xl font-bold font-mono text-green-600">{fmt(data.input.total)}</p>
            </Card>
            <Card className={`p-5 ${data.net.total_payable > 0 ? 'border-red-200 dark:border-red-800' : 'border-green-200 dark:border-green-800'}`}>
              <p className="text-xs text-gray-500 mb-1">{data.net.total_payable > 0 ? 'Net GST Payable' : 'Net GST Credit'}</p>
              <p className={`text-2xl font-bold font-mono ${data.net.total_payable > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {data.net.total_payable > 0 ? fmt(data.net.total_payable) : fmt(data.net.total_credit)}
              </p>
            </Card>
          </div>

          {/* Detailed Table */}
          <Card>
            <div className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#121212]">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Component</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Output (Liability)</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Input (Credit)</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Net Payable</th>
                  </tr>
                </thead>
                <tbody>
                  <TaxRow label="CGST" output={data.output.cgst} input={data.input.cgst} net={data.net.cgst} />
                  <TaxRow label="SGST" output={data.output.sgst} input={data.input.sgst} net={data.net.sgst} />
                  <TaxRow label="IGST" output={data.output.igst} input={data.input.igst} net={data.net.igst} />
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 dark:bg-[#121212] font-semibold">
                    <td className="px-4 py-3 text-sm">Total</td>
                    <td className="px-4 py-3 text-sm font-mono text-right">{fmt(data.output.total)}</td>
                    <td className="px-4 py-3 text-sm font-mono text-right">{fmt(data.input.total)}</td>
                    <td className="px-4 py-3 text-sm font-mono text-right font-bold text-red-600">{fmt(data.net.total_payable)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
};

export default GSTSummaryPage;
