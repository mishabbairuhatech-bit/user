import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, TrendingDown, ShoppingCart, Package,
  AlertTriangle, Clock, Banknote, Building2,
  Plus, FileText, Receipt, ArrowUpRight, ArrowDownLeft,
} from 'lucide-react';
import api from '@/services/api';
import { Card, Badge, Spinner, PageHeader } from '@components/ui';
import { useAuth } from '@hooks';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => api.get('reports/dashboard').then((r) => r.data.data),
    refetchInterval: 60000, // refresh every minute
  });

  const fmt = (val) => `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const MetricCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
          <p className={`text-2xl font-bold font-mono mt-1 ${color || 'text-gray-900 dark:text-white'}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color ? 'bg-opacity-10' : 'bg-gray-100 dark:bg-[#2a2a2a]'}`}
          style={color ? { backgroundColor: color === 'text-green-600' ? '#dcfce7' : color === 'text-red-600' ? '#fee2e2' : color === 'text-blue-600' ? '#dbeafe' : color === 'text-orange-600' ? '#fed7aa' : '#f3f4f6' } : {}}>
          <Icon size={20} className={color || 'text-gray-600'} />
        </div>
      </div>
    </Card>
  );

  const QuickAction = ({ label, icon: Icon, onClick, color }) => (
    <button onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#171717] border border-gray-200 dark:border-[#2a2a2a] rounded-lg hover:border-primary-300 dark:hover:border-primary-700 transition-colors text-sm text-gray-700 dark:text-gray-300">
      <Icon size={16} className={color || 'text-gray-500'} />
      {label}
    </button>
  );

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.first_name || 'User'}`}
        subtitle={`${data?.period?.from || ''} to ${data?.period?.to || ''}`}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Sales" value={fmt(data?.total_sales)} icon={TrendingUp} color="text-green-600"
          subtitle={`${data?.sales_count || 0} invoices`} />
        <MetricCard title="Total Purchases" value={fmt(data?.total_purchases)} icon={ShoppingCart} color="text-blue-600"
          subtitle={`${data?.purchase_count || 0} bills`} />
        <MetricCard title="Receivables" value={fmt(data?.outstanding_receivables)} icon={ArrowDownLeft} color="text-orange-600"
          subtitle={data?.overdue_invoices > 0 ? `${data.overdue_invoices} overdue` : 'None overdue'} />
        <MetricCard title="Payables" value={fmt(data?.outstanding_payables)} icon={ArrowUpRight} color="text-red-600"
          subtitle={data?.overdue_bills > 0 ? `${data.overdue_bills} overdue` : 'None overdue'} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Cash Balance" value={fmt(data?.cash_balance)} icon={Banknote} />
        <MetricCard title="Bank Balance" value={fmt(data?.bank_balance)} icon={Building2} />
        <MetricCard title="Low Stock Items" value={data?.low_stock_count || 0} icon={Package}
          color={data?.low_stock_count > 0 ? 'text-orange-600' : undefined} />
        <MetricCard title="Overdue Invoices" value={data?.overdue_invoices || 0} icon={Clock}
          color={data?.overdue_invoices > 0 ? 'text-red-600' : undefined} />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <QuickAction label="New Invoice" icon={Plus} onClick={() => navigate('/admin/sales/invoices/new')} color="text-green-600" />
          <QuickAction label="New Purchase" icon={Plus} onClick={() => navigate('/admin/purchases/bills/new')} color="text-blue-600" />
          <QuickAction label="Record Payment" icon={ArrowUpRight} onClick={() => navigate('/admin/banking/payments')} color="text-red-600" />
          <QuickAction label="Record Receipt" icon={ArrowDownLeft} onClick={() => navigate('/admin/banking/receipts')} color="text-green-600" />
          <QuickAction label="Open POS" icon={ShoppingCart} onClick={() => navigate('/pos')} />
          <QuickAction label="Add Product" icon={Package} onClick={() => navigate('/admin/inventory/products/new')} />
        </div>
      </div>

      {/* Alerts */}
      {(data?.low_stock_count > 0 || data?.overdue_invoices > 0 || data?.overdue_bills > 0) && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Alerts</h3>
          <div className="space-y-2">
            {data?.low_stock_count > 0 && (
              <div className="flex items-center gap-3 px-4 py-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg cursor-pointer"
                onClick={() => navigate('/admin/inventory/products?stock_status=low_stock')}>
                <AlertTriangle size={18} className="text-orange-600" />
                <span className="text-sm text-orange-800 dark:text-orange-300">{data.low_stock_count} products are running low on stock</span>
              </div>
            )}
            {data?.overdue_invoices > 0 && (
              <div className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg cursor-pointer"
                onClick={() => navigate('/admin/sales/invoices')}>
                <Clock size={18} className="text-red-600" />
                <span className="text-sm text-red-800 dark:text-red-300">{data.overdue_invoices} sales invoices are past due date</span>
              </div>
            )}
            {data?.overdue_bills > 0 && (
              <div className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg cursor-pointer"
                onClick={() => navigate('/admin/purchases/bills')}>
                <Clock size={18} className="text-red-600" />
                <span className="text-sm text-red-800 dark:text-red-300">{data.overdue_bills} purchase bills are past due date</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Sales */}
      {data?.recent_sales?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recent Sales</h3>
          <Card className="divide-y divide-gray-100 dark:divide-[#2a2a2a]">
            {data.recent_sales.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#1e1e1e] cursor-pointer"
                onClick={() => navigate(`/admin/sales/invoices/${inv.id}`)}>
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-gray-400" />
                  <div>
                    <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">{inv.invoice_number}</span>
                    <span className="text-xs text-gray-400 ml-2">{inv.date}</span>
                  </div>
                  {inv.party && <span className="text-xs text-gray-500">· {inv.party.name}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-medium">{fmt(inv.grand_total)}</span>
                  <Badge variant={inv.payment_status === 'paid' ? 'success' : inv.payment_status === 'partial' ? 'warning' : 'danger'} size="sm">
                    {inv.payment_status}
                  </Badge>
                  {inv.source === 'pos' && <Badge variant="info" size="sm">POS</Badge>}
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
