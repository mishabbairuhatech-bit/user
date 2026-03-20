import { useState, useEffect, useCallback, useRef } from 'react';
import { Banknote, CreditCard, Smartphone, Check, ArrowLeft, Loader2 } from 'lucide-react';
import { Button, Input } from '@components/ui';

const paymentMethods = [
  { id: 'cash', name: 'Cash', icon: Banknote, color: 'bg-green-500' },
  { id: 'card', name: 'Card', icon: CreditCard, color: 'bg-blue-500' },
  { id: 'upi', name: 'UPI', icon: Smartphone, color: 'bg-purple-500' },
];

const PaymentPanel = ({ isActive, totals, cart = [], onComplete, onBack }) => {
  const [selectedMethodIndex, setSelectedMethodIndex] = useState(0);
  const [amountTendered, setAmountTendered] = useState('');
  const [processing, setProcessing] = useState(false);
  const [focusArea, setFocusArea] = useState('method'); // 'method' | 'amount'
  const amountRef = useRef(null);

  const selectedMethod = paymentMethods[selectedMethodIndex].id;

  const change = selectedMethod === 'cash' && amountTendered
    ? Math.max(0, Number(amountTendered) - totals.total)
    : 0;

  const canComplete = selectedMethod === 'cash'
    ? Number(amountTendered) >= totals.total
    : true;

  const quickAmounts = [10, 20, 50, 100];

  const handleComplete = useCallback(async () => {
    if (!canComplete || processing) return;
    setProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onComplete(selectedMethod, Number(amountTendered) || totals.total);
    setProcessing(false);
    setSelectedMethodIndex(0);
    setAmountTendered('');
    setFocusArea('method');
  }, [selectedMethod, amountTendered, totals.total, onComplete, canComplete, processing]);

  // Reset when panel opens
  useEffect(() => {
    if (isActive) {
      setSelectedMethodIndex(0);
      setAmountTendered('');
      setProcessing(false);
      setFocusArea('method');
    }
  }, [isActive]);

  // Manage actual DOM focus for amount input
  useEffect(() => {
    if (focusArea === 'amount' && amountRef.current) {
      amountRef.current.focus();
    } else if (focusArea !== 'amount' && amountRef.current) {
      amountRef.current.blur();
    }
  }, [focusArea]);

  // Keyboard navigation — always active when panel is open (capture phase to intercept everything)
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      // Always allow Escape
      if (e.key === 'Escape') {
        if (focusArea === 'amount') {
          e.preventDefault();
          e.stopPropagation();
          setFocusArea('method');
          return;
        }
        // Let POSPage handle closing the panel
        return;
      }

      // Block F-keys except F1 (shortcuts help) and F8 (toggle payment)
      if (e.key.startsWith('F') && e.key !== 'F1' && e.key !== 'F8') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Enter to complete
      if (e.key === 'Enter' && !processing) {
        if (canComplete) {
          e.preventDefault();
          e.stopPropagation();
          handleComplete();
        }
        return;
      }

      // When typing in amount input, let it handle its own input
      if (focusArea === 'amount') {
        // Arrow Up — move back to method selection
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          e.stopPropagation();
          setFocusArea('method');
          return;
        }
        // Let normal typing happen in the input
        return;
      }

      // Method selection (focusArea === 'method')
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedMethodIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedMethodIndex(prev => Math.min(prev + 1, paymentMethods.length - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        if (selectedMethod === 'cash') {
          setFocusArea('amount');
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        // Nowhere above methods
      }

      // Quick amount shortcuts (1-4, E) when not in input
      if (selectedMethod === 'cash') {
        if (e.key === '1') { e.preventDefault(); e.stopPropagation(); setAmountTendered('10'); }
        else if (e.key === '2') { e.preventDefault(); e.stopPropagation(); setAmountTendered('20'); }
        else if (e.key === '3') { e.preventDefault(); e.stopPropagation(); setAmountTendered('50'); }
        else if (e.key === '4') { e.preventDefault(); e.stopPropagation(); setAmountTendered('100'); }
        else if (e.key === 'e' || e.key === 'E') {
          e.preventDefault();
          e.stopPropagation();
          setAmountTendered(String(Math.ceil(totals.total)));
        }
      }

      // Block Tab from leaking
      if (e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        // Cycle between method ↔ amount
        if (focusArea === 'method' && selectedMethod === 'cash') {
          setFocusArea('amount');
        } else {
          setFocusArea('method');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isActive, focusArea, canComplete, processing, handleComplete, selectedMethod, totals.total]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#121212] border-l border-gray-100 dark:border-[#2a2a2a] transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 dark:border-[#2a2a2a] shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            iconOnly
            onClick={onBack}
            title="Back to cart (Esc)"
          />
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            Payment
          </span>
        </div>
        <span className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#2a2a2a] px-1.5 py-0.5 rounded">
          ← → ↑ ↓ Tab Enter
        </span>
      </div>

      {/* Receipt / Items — scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-4 pt-3 pb-2">
          {/* Receipt header */}
          <div className="text-center mb-2">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono tracking-widest uppercase">Order Receipt</p>
          </div>
          <div className="border-b border-dashed border-gray-300 dark:border-[#333] mb-2" />

          {/* Column headers */}
          <div className="flex items-center px-1 mb-1">
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 font-mono uppercase tracking-wider flex-1 min-w-0">Item</span>
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 font-mono uppercase tracking-wider w-6 text-center">Qty</span>
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 font-mono uppercase tracking-wider w-14 text-right">Disc</span>
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 font-mono uppercase tracking-wider w-14 text-right">Amt</span>
          </div>
          <div className="border-b border-dashed border-gray-300 dark:border-[#333] mb-1" />

          {/* Items */}
          {cart.map((item) => {
            const itemTotal = item.product.price * item.quantity;
            const itemDiscount = item.discountType === 'fixed'
              ? Math.min(item.discount * item.quantity, itemTotal)
              : (itemTotal * item.discount) / 100;
            const finalPrice = itemTotal - itemDiscount;
            return (
              <div key={item.product.id} className="flex items-center py-1 px-1">
                <span className="text-xs text-gray-700 dark:text-gray-300 font-mono leading-tight flex-1 min-w-0 truncate">
                  {item.product.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono w-6 text-center">
                  {item.quantity}
                </span>
                <span className="text-xs text-green-500 font-mono w-14 text-right">
                  {itemDiscount > 0 ? `-$${itemDiscount.toFixed(2)}` : '-'}
                </span>
                <span className="text-xs text-gray-700 dark:text-gray-300 font-mono w-14 text-right">
                  ${finalPrice.toFixed(2)}
                </span>
              </div>
            );
          })}

          <div className="border-b border-dashed border-gray-300 dark:border-[#333] mt-1 mb-2" />

          {/* Subtotal / Discounts / Tax / Total */}
          <div className="space-y-1 px-1">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">Subtotal</span>
              <span className="text-xs text-gray-700 dark:text-gray-300 font-mono">${totals.subtotal.toFixed(2)}</span>
            </div>
            {totals.itemDiscountTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">Item Discounts</span>
                <span className="text-xs text-green-500 font-mono">-${totals.itemDiscountTotal.toFixed(2)}</span>
              </div>
            )}
            {totals.discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">Cart Discount</span>
                <span className="text-xs text-green-500 font-mono">-${totals.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">Tax</span>
              <span className="text-xs text-gray-700 dark:text-gray-300 font-mono">${totals.tax.toFixed(2)}</span>
            </div>
            <div className="border-b border-dashed border-gray-300 dark:border-[#333] !mt-2 !mb-1" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-900 dark:text-white font-mono">TOTAL</span>
              <span className="text-lg font-bold text-primary-600 dark:text-primary-400 font-mono">${totals.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-b border-dashed border-gray-300 dark:border-[#333] mt-2" />
        </div>
      </div>

      {/* Payment Actions — fixed, non-scrolling */}
      <div className="shrink-0 border-t border-gray-100 dark:border-[#2a2a2a] px-4 py-3 space-y-3">
        {/* Payment methods */}
        <div className="grid grid-cols-3 gap-1.5 rounded-lg p-0.5">
          {paymentMethods.map((method, index) => {
            const Icon = method.icon;
            const isSelected = index === selectedMethodIndex;
            return (
              <Button
                key={method.id}
                variant={isSelected ? 'outline' : 'ghost'}
                size="sm"
                onClick={() => { setSelectedMethodIndex(index); setFocusArea('method'); }}
                className={`!flex !items-center !justify-center gap-1.5 !py-2 !px-2 !rounded-lg !border-2 ${
                  isSelected
                    ? '!border-primary-500 !bg-primary-50 dark:!bg-primary-900/20'
                    : '!border-gray-200 dark:!border-[#2a2a2a] hover:!border-gray-300 dark:hover:!border-[#424242]'
                }`}
              >
                <div className={`w-7 h-7 rounded-full ${method.color} flex items-center justify-center text-white shrink-0`}>
                  <Icon size={14} />
                </div>
                <span className={`text-xs font-medium ${
                  isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {method.name}
                </span>
              </Button>
            );
          })}
        </div>

        {/* Cash input */}
        {selectedMethod === 'cash' && (
          <div className="space-y-2">
            <Input
              ref={amountRef}
              type="text"
              size="md"
              value={amountTendered}
              onChange={(e) => setAmountTendered(e.target.value)}
              onFocus={() => setFocusArea('amount')}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  e.stopPropagation();
                  setFocusArea('method');
                } else if (e.key === 'Enter' && canComplete && !processing) {
                  e.preventDefault();
                  e.stopPropagation();
                  handleComplete();
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  e.stopPropagation();
                  setFocusArea('method');
                }
              }}
              placeholder="Amount tendered"
              className="[&_input]:text-center [&_input]:text-lg [&_input]:font-semibold"
            />

            {/* Quick amounts */}
            <div className="flex gap-1 rounded-lg">
              {quickAmounts.map((amount, idx) => (
                <Button
                  key={amount}
                  variant="secondary"
                  size="sm"
                  onClick={() => setAmountTendered(String(amount))}
                  className="flex-1 !flex !flex-col !items-center !px-2 !py-1.5 !min-h-0 !text-[11px]"
                >
                  <span>${amount}</span>
                  <kbd className="text-[9px] text-gray-400">{idx + 1}</kbd>
                </Button>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setAmountTendered(String(Math.ceil(totals.total)))}
                className="flex-1 !flex !flex-col !items-center !px-2 !py-1.5 !min-h-0 !text-[11px] !bg-primary-100 dark:!bg-primary-900/20 hover:!bg-primary-200 dark:hover:!bg-primary-900/30 !text-primary-600 dark:!text-primary-400"
              >
                <span>Exact</span>
                <kbd className="text-[9px] text-primary-400">E</kbd>
              </Button>
            </div>

            {/* Change */}
            {Number(amountTendered) > 0 && (
              <div className={`p-2 rounded-lg flex justify-between items-center ${
                change >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
              }`}>
                <span className={`text-xs ${
                  change >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                }`}>
                  {change >= 0 ? 'Change' : 'Amount Due'}
                </span>
                <span className={`text-base font-bold ${
                  change >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                }`}>
                  ${Math.abs(change).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
          >
            Cancel <kbd className="text-[10px] opacity-50">Esc</kbd>
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleComplete}
            disabled={!canComplete || processing}
            loading={processing}
            prefixIcon={!processing ? Check : undefined}
            className="flex-1"
          >
            {processing ? 'Processing...' : 'Complete'}
            {!processing && <kbd className="text-[10px] opacity-50">Enter</kbd>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPanel;
