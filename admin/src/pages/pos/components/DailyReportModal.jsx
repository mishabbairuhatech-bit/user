import { useEffect, useCallback } from 'react';
import { Printer, TrendingUp, Banknote, CreditCard, Smartphone, ShoppingBag, RotateCcw } from 'lucide-react';
import { Modal, Button, Badge } from '@components/ui';

const DailyReportModal = ({ isOpen, onClose, report }) => {
  // Keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;

    if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      window.print();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onClose();
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!report) return null;

  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const paymentIcons = {
    cash: Banknote,
    card: CreditCard,
    upi: Smartphone,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Daily Report"
      size="lg"
      footer={
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrint}
            prefixIcon={Printer}
            className="flex-1"
          >
            Print <kbd className="ml-2 text-xs opacity-50">P</kbd>
          </Button>
          <Button onClick={onClose} className="flex-1">
            Close <kbd className="ml-2 text-xs opacity-50">Enter</kbd>
          </Button>
        </div>
      }
    >
      <div className="space-y-6 py-4">
        {/* Header */}
        <div className="text-center p-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl text-white">
          <p className="text-sm opacity-80">Sales Report</p>
          <h2 className="text-xl font-bold mt-1">{formatDate(report.date)}</h2>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(report.totalSales)}
            </p>
            <p className="text-sm text-green-700 dark:text-green-400">Total Sales</p>
            <Badge variant="success" size="sm" className="mt-2">
              {report.salesCount} orders
            </Badge>
          </div>

          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-center">
            <RotateCcw className="w-8 h-8 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatCurrency(report.totalReturns)}
            </p>
            <p className="text-sm text-orange-700 dark:text-orange-400">Returns</p>
            <Badge variant="warning" size="sm" className="mt-2">
              {report.returnsCount} returns
            </Badge>
          </div>

          <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-center">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-primary-600 dark:text-primary-400" />
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {formatCurrency(report.netSales)}
            </p>
            <p className="text-sm text-primary-700 dark:text-primary-400">Net Sales</p>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="p-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Payment Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(report.paymentBreakdown).map(([method, amount]) => {
              const Icon = paymentIcons[method] || Banknote;
              const percentage = report.totalSales > 0 ? (amount / report.totalSales) * 100 : 0;

              return (
                <div key={method} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#2a2a2a] flex items-center justify-center">
                    <Icon size={20} className="text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {method}
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-[#2a2a2a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Items */}
        {report.topItems.length > 0 && (
          <div className="p-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top Selling Items</h3>
            <div className="space-y-3">
              {report.topItems.map((item, idx) => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </span>
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.quantity} sold
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No data */}
        {report.salesCount === 0 && (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
            <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No sales today</p>
            <p className="text-sm">Start selling to see your report</p>
          </div>
        )}

      </div>
    </Modal>
  );
};

export default DailyReportModal;
