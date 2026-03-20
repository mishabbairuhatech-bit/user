import { useEffect, useCallback } from 'react';
import { Printer, Download, X, Check, RotateCcw } from 'lucide-react';
import { Modal, Button } from '@components/ui';

const BillPreview = ({ isOpen, onClose, bill }) => {
  // Keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    if (!isOpen || !bill) return;

    if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      // Trigger print
      const printContent = document.getElementById('bill-print-content');
      if (printContent) {
        const printWindow = window.open('', '', 'width=400,height=600');
        printWindow.document.write(`
          <html>
            <head>
              <title>Bill - ${bill.id}</title>
              <style>
                body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 20px; }
                .divider { border-top: 1px dashed #ccc; margin: 10px 0; }
                .item { display: flex; justify-content: space-between; margin: 5px 0; font-size: 12px; }
                .total { font-weight: bold; font-size: 16px; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onClose();
    }
  }, [isOpen, bill, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!bill) return null;

  const isReturn = bill.type === 'return';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePrint = () => {
    const printContent = document.getElementById('bill-print-content');
    const printWindow = window.open('', '', 'width=400,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Bill - ${bill.id}</title>
          <style>
            body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .divider { border-top: 1px dashed #ccc; margin: 10px 0; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; font-size: 12px; }
            .total { font-weight: bold; font-size: 16px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="sm"
      showCloseButton={false}
      footer={
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrint}
            prefixIcon={Printer}
            className="flex-1"
          >
            Print <kbd className="hidden md:inline ml-2 text-xs opacity-50">P</kbd>
          </Button>
          <Button
            onClick={onClose}
            className="flex-1"
          >
            Done <kbd className="hidden md:inline ml-2 text-xs opacity-50">Enter</kbd>
          </Button>
        </div>
      }
    >
      <div className="text-center pt-4">
        {/* Success icon */}
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
          isReturn ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-green-100 dark:bg-green-900/30'
        }`}>
          {isReturn ? (
            <RotateCcw className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          ) : (
            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
          )}
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          {isReturn ? 'Return Processed!' : 'Payment Successful!'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {isReturn ? 'Refund has been processed' : 'Transaction completed'}
        </p>
      </div>

      {/* Bill content */}
      <div id="bill-print-content" className="bg-gray-50 dark:bg-[#1a1a1a] rounded-xl p-4 mb-4 text-sm">
        {/* Header */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">STORE NAME</h3>
          <p className="text-xs text-gray-500">123 Main Street, City</p>
          <p className="text-xs text-gray-500">Tel: (123) 456-7890</p>
        </div>

        <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-3" />

        {/* Bill info */}
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">{isReturn ? 'Return #' : 'Bill #'}</span>
            <span className="text-gray-900 dark:text-white font-medium">{bill.id}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Date</span>
            <span className="text-gray-900 dark:text-white">{formatDate(bill.created_at)}</span>
          </div>
          {bill.payment_method && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Payment</span>
              <span className="text-gray-900 dark:text-white capitalize">{bill.payment_method}</span>
            </div>
          )}
          {isReturn && bill.original_bill_id && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Original Bill</span>
              <span className="text-gray-900 dark:text-white">{bill.original_bill_id}</span>
            </div>
          )}
        </div>

        <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-3" />

        {/* Items */}
        <div className="space-y-1.5 mb-3">
          {bill.items.map((item, idx) => {
            const itemTotal = item.product.price * item.quantity;
            const itemDiscountType = item.discountType || 'percent';
            const itemDiscountAmt = itemDiscountType === 'fixed'
              ? Math.min(item.discount * item.quantity, itemTotal)
              : (itemTotal * item.discount) / 100;
            const itemFinal = itemTotal - itemDiscountAmt;
            const hasDiscount = itemDiscountAmt > 0;

            return (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-900 dark:text-white">{item.product.name}</span>
                  <span className="text-gray-500">x{item.quantity}</span>
                  {hasDiscount && (
                    <span className="text-[10px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1 py-0.5 rounded">
                      {itemDiscountType === 'percent' ? `${item.discount}%` : `$${item.discount}`} off
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {hasDiscount && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 line-through">${itemTotal.toFixed(2)}</span>
                  )}
                  <span className={`font-medium ${hasDiscount ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                    ${itemFinal.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-3" />

        {/* Totals */}
        <div className="space-y-1">
          {/* Gross Total */}
          {bill.totals.itemDiscountTotal > 0 && (
            <>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Gross Total</span>
                <span className="text-gray-900 dark:text-white">${bill.totals.grossTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Item Discounts</span>
                <span className="text-green-600 dark:text-green-400">-${bill.totals.itemDiscountTotal.toFixed(2)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-900 dark:text-white">${bill.totals.subtotal.toFixed(2)}</span>
          </div>
          {bill.totals.discountAmount > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Cart Discount</span>
              <span className="text-green-600 dark:text-green-400">-${bill.totals.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Tax (10%)</span>
            <span className="text-gray-900 dark:text-white">${bill.totals.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-300 dark:border-gray-600">
            <span className="text-gray-900 dark:text-white">{isReturn ? 'Refund' : 'Total'}</span>
            <span className={isReturn ? 'text-orange-600' : 'text-primary-600 dark:text-primary-400'}>
              ${bill.totals.total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Cash details */}
        {bill.payment_method === 'cash' && bill.change > 0 && (
          <>
            <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-3" />
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Tendered</span>
                <span className="text-gray-900 dark:text-white">${bill.amount_tendered.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Change</span>
                <span className="text-green-600">${bill.change.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="text-center mt-4 pt-3 border-t border-dashed border-gray-300 dark:border-gray-600">
          <p className="text-xs text-gray-500">Thank you for your purchase!</p>
          <p className="text-xs text-gray-400">Please come again</p>
        </div>
      </div>

    </Modal>
  );
};

export default BillPreview;
