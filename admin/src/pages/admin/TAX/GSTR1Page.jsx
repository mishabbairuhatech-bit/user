import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';
import { Spinner, Table, Badge, PageHeader, Select, Card } from '@components/ui';

const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const yearOptions = [2024, 2025, 2026, 2027].map((y) => ({ value: y, label: String(y) }));

const GSTR1Page = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.GSTR1_DATA, month, year],
    queryFn: async () => {
      const res = await api.get(API.GSTR1, { params: { month, year } });
      return res.data.data;
    },
  });

  const fmt = (val) => `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const b2bColumns = [
    {
      key: 'customer_gstin',
      header: 'GSTIN',
      width: '180px',
      render: (val) => <span className="font-mono text-xs">{val}</span>,
    },
    {
      key: 'customer_name',
      header: 'Customer',
      width: '200px',
      render: (val) => <span className="text-sm">{val || '-'}</span>,
    },
    {
      key: 'invoices',
      header: 'Invoices',
      width: '100px',
      render: (val) => <Badge variant="info" type="soft" size="sm">{val?.length || 0}</Badge>,
    },
  ];

  const hsnColumns = [
    {
      key: 'hsn_code',
      header: 'HSN Code',
      width: '120px',
      render: (val) => <span className="font-mono text-sm">{val}</span>,
    },
    {
      key: 'quantity',
      header: 'Qty',
      width: '80px',
      render: (val) => <span className="font-mono text-sm">{parseFloat(val).toFixed(0)}</span>,
    },
    {
      key: 'taxable_value',
      header: 'Taxable',
      width: '140px',
      render: (val) => <span className="font-mono text-sm">{fmt(val)}</span>,
    },
    {
      key: 'cgst',
      header: 'CGST',
      width: '120px',
      render: (val) => <span className="font-mono text-sm text-gray-500">{fmt(val)}</span>,
    },
    {
      key: 'sgst',
      header: 'SGST',
      width: '120px',
      render: (val) => <span className="font-mono text-sm text-gray-500">{fmt(val)}</span>,
    },
    {
      key: 'igst',
      header: 'IGST',
      width: '120px',
      render: (val) => <span className="font-mono text-sm text-gray-500">{fmt(val)}</span>,
    },
    {
      key: 'total_value',
      header: 'Total',
      width: '140px',
      render: (val) => <span className="font-mono text-sm font-medium">{fmt(val)}</span>,
    },
  ];

  const cnColumns = [
    {
      key: 'credit_note_number',
      header: 'CN #',
      width: '140px',
      render: (val) => <span className="font-mono text-sm">{val}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      width: '120px',
      render: (val) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {val ? new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
        </span>
      ),
    },
    {
      key: 'original_invoice',
      header: 'Original Invoice',
      width: '160px',
      render: (val) => <span className="text-sm">{val || '-'}</span>,
    },
    {
      key: 'customer_gstin',
      header: 'GSTIN',
      width: '180px',
      render: (val) => <span className="font-mono text-xs">{val || '-'}</span>,
    },
    {
      key: 'total',
      header: 'Amount',
      width: '140px',
      render: (val) => <span className="font-mono text-sm">{fmt(val)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="GSTR-1 Report"
        subtitle="Outward supplies data for filing"
        breadcrumb={{ items: [{ label: 'Tax' }, { label: 'GSTR-1' }] }}
        sticky
      />

      <div className="flex items-center gap-3">
        <div className="w-40">
          <Select
            value={month}
            onChange={(val) => setMonth(parseInt(val))}
            options={months}
            size="md"
          />
        </div>
        <div className="w-28">
          <Select
            value={year}
            onChange={(val) => setYear(parseInt(val))}
            options={yearOptions}
            size="md"
          />
        </div>
        {data && (
          <Badge variant="info" type="soft" size="sm">
            {data.total_invoices} invoices · {fmt(data.total_value)}
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* B2B */}
          <Card>
            <Card.Body>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">B2B -- Supplies to Registered Dealers</h3>
              <Table columns={b2bColumns} data={data.b2b || []} emptyMessage="No B2B invoices." />
            </Card.Body>
          </Card>

          {/* B2C Small */}
          <Card>
            <Card.Body>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">B2C Small -- Aggregated by Rate & Place</h3>
              {(data.b2cs || []).length === 0 ? (
                <p className="text-sm text-gray-400 py-4">No B2C small data.</p>
              ) : (
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-[#2a2a2a]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-[#121212]">
                        <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Place of Supply</th>
                        <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">Rate</th>
                        <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">Taxable</th>
                        <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">CGST</th>
                        <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">SGST</th>
                        <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">IGST</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.b2cs.map((row, i) => (
                        <tr key={i} className="border-b border-gray-100 dark:border-[#2a2a2a]">
                          <td className="px-4 py-2 text-sm">{row.place_of_supply}</td>
                          <td className="px-4 py-2 text-sm font-mono text-right">{row.rate}%</td>
                          <td className="px-4 py-2 text-sm font-mono text-right">{fmt(row.taxable_value)}</td>
                          <td className="px-4 py-2 text-sm font-mono text-right text-gray-500">{fmt(row.cgst)}</td>
                          <td className="px-4 py-2 text-sm font-mono text-right text-gray-500">{fmt(row.sgst)}</td>
                          <td className="px-4 py-2 text-sm font-mono text-right text-gray-500">{fmt(row.igst)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Credit Notes */}
          <Card>
            <Card.Body>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Credit Notes</h3>
              <Table columns={cnColumns} data={data.credit_notes || []} emptyMessage="No credit notes." />
            </Card.Body>
          </Card>

          {/* HSN Summary */}
          <Card>
            <Card.Body>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">HSN Summary</h3>
              <Table columns={hsnColumns} data={data.hsn_summary || []} emptyMessage="No HSN data." />
            </Card.Body>
          </Card>
        </div>
      ) : null}
    </div>
  );
};

export default GSTR1Page;
