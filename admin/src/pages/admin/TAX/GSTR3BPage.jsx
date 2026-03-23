import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';
import { Spinner, Select, Card, PageHeader } from '@components/ui';

const monthOptions = [
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

const GSTR3BPage = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.GSTR3B_DATA, month, year],
    queryFn: async () => {
      const res = await api.get(API.GSTR3B, { params: { month, year } });
      return res.data.data;
    },
  });

  const fmt = (val) => `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const Section = ({ title, children }) => (
    <Card>
      <div className="overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 dark:bg-[#121212] border-b border-gray-200 dark:border-[#2a2a2a]">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </Card>
  );

  const TaxGrid = ({ igst, cgst, sgst }) => (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <p className="text-xs text-gray-500">IGST</p>
        <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white">{fmt(igst)}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">CGST</p>
        <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white">{fmt(cgst)}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">SGST</p>
        <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white">{fmt(sgst)}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="GSTR-3B Report"
        subtitle="Monthly summary return data"
        breadcrumb={{ items: [{ label: 'Tax' }, { label: 'GSTR-3B' }] }}
        sticky
      />

      <div className="flex items-center gap-3">
        <div className="w-40">
          <Select
            value={month}
            onChange={(val) => setMonth(parseInt(val))}
            options={monthOptions}
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
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      ) : data ? (
        <div className="space-y-4">
          <Section title="3.1 -- Outward Supplies (Sales)">
            <p className="text-sm text-gray-500 mb-3">Taxable Value: <span className="font-mono font-medium text-gray-900 dark:text-white">{fmt(data.outward_supplies.taxable_value)}</span></p>
            <TaxGrid igst={data.outward_supplies.igst} cgst={data.outward_supplies.cgst} sgst={data.outward_supplies.sgst} />
          </Section>

          <Section title="3.2 -- Inward Supplies (Purchases)">
            <p className="text-sm text-gray-500 mb-3">Taxable Value: <span className="font-mono font-medium text-gray-900 dark:text-white">{fmt(data.inward_supplies.taxable_value)}</span></p>
            <TaxGrid igst={data.inward_supplies.igst} cgst={data.inward_supplies.cgst} sgst={data.inward_supplies.sgst} />
          </Section>

          <Section title="4 -- Input Tax Credit (ITC) Available">
            <TaxGrid igst={data.itc_available.igst} cgst={data.itc_available.cgst} sgst={data.itc_available.sgst} />
          </Section>

          <Section title="6.1 -- Net Tax Payable">
            <TaxGrid igst={data.net_tax_payable.igst} cgst={data.net_tax_payable.cgst} sgst={data.net_tax_payable.sgst} />
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#2a2a2a]">
              <p className="text-sm text-gray-500">Total Net Tax Payable</p>
              <p className="text-3xl font-bold font-mono text-red-600">{fmt(data.net_tax_payable.total)}</p>
            </div>
          </Section>
        </div>
      ) : null}
    </div>
  );
};

export default GSTR3BPage;
