import { Pause, Trash2, CreditCard, Banknote, Smartphone, Check, ArrowLeft } from 'lucide-react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@components/ui';

const paymentMethods = [
  { id: 'cash', name: 'Cash', icon: Banknote, color: 'bg-green-500', shortcut: '1' },
  { id: 'card', name: 'Card', icon: CreditCard, color: 'bg-blue-500', shortcut: '2' },
  { id: 'upi', name: 'UPI', icon: Smartphone, color: 'bg-purple-500', shortcut: '3' },
];

const quickAmounts = [10, 20, 50, 100];

const ActionBar = ({
  cart,
  totals,
  onHold,
  onClear,
  onCompleteSale,
  showPayment,
  onTogglePayment,
}) => {
  const [selectedMethodIndex, setSelectedMethodIndex] = useState(0);
  const [amountTendered, setAmountTendered] = useState('');
  const [processing, setProcessing] = useState(false);
  const amountRef = useRef(null);

  const selectedMethod = paymentMethods[selectedMethodIndex]?.id || 'cash';
  const change = selectedMethod === 'cash' && amountTendered
    ? Math.max(0, Number(amountTendered) - totals.total) : 0;
  const canComplete = selectedMethod === 'cash'
    ? Number(amountTendered) >= totals.total : true;

  // Reset payment state
  useEffect(() => {
    if (showPayment) {
      setSelectedMethodIndex(0);
      setAmountTendered('');
      setProcessing(false);
      setTimeout(() => amountRef.current?.focus(), 100);
    }
  }, [showPayment]);

  const handleComplete = useCallback(async () => {
    if (!canComplete || processing) return;
    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    onCompleteSale?.(selectedMethod, Number(amountTendered) || totals.total);
    setProcessing(false);
    setSelectedMethodIndex(0);
    setAmountTendered('');
  }, [canComplete, processing, selectedMethod, amountTendered, totals.total, onCompleteSale]);

  // Payment keyboard handler (capture phase)
  useEffect(() => {
    if (!showPayment) return;

    const handleKeyDown = (e) => {
      // Escape — cancel
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onTogglePayment();
        return;
      }

      // Enter — complete
      if (e.key === 'Enter' && !processing && canComplete) {
        e.preventDefault();
        e.stopPropagation();
        handleComplete();
        return;
      }

      // If typing in cash input, only intercept Enter/Escape (handled above)
      if (e.target.tagName === 'INPUT') return;

      // Arrow keys — switch payment method
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedMethodIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedMethodIndex((prev) => Math.min(prev + 1, paymentMethods.length - 1));
      }

      // 1/2/3 — select payment method
      if (e.key === '1') { e.preventDefault(); e.stopPropagation(); setSelectedMethodIndex(0); }
      else if (e.key === '2') { e.preventDefault(); e.stopPropagation(); setSelectedMethodIndex(1); }
      else if (e.key === '3') { e.preventDefault(); e.stopPropagation(); setSelectedMethodIndex(2); }

      // Quick amount shortcuts for cash
      if (selectedMethod === 'cash') {
        if (e.key === '4') { e.preventDefault(); e.stopPropagation(); setAmountTendered('10'); }
        else if (e.key === '5') { e.preventDefault(); e.stopPropagation(); setAmountTendered('20'); }
        else if (e.key === '6') { e.preventDefault(); e.stopPropagation(); setAmountTendered('50'); }
        else if (e.key === '7') { e.preventDefault(); e.stopPropagation(); setAmountTendered('100'); }
        else if (e.key === 'e' || e.key === 'E') {
          e.preventDefault();
          e.stopPropagation();
          setAmountTendered(String(Math.ceil(totals.total)));
        }
      }

      // Tab — focus amount input
      if (e.key === 'Tab' && selectedMethod === 'cash') {
        e.preventDefault();
        e.stopPropagation();
        amountRef.current?.focus();
      }

      // Block all other keys from leaking
      if (!e.key.startsWith('F')) {
        e.stopPropagation();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [showPayment, processing, canComplete, handleComplete, onTogglePayment, selectedMethod, totals.total]);

  if (showPayment) {
    return (
      <div className="shrink-0 bg-white dark:bg-[#121212] border-t border-gray-200 dark:border-[#2a2a2a] px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 max-w-5xl mx-auto">
          {/* Row 1: Back + Payment Methods */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowLeft}
              iconOnly
              onClick={onTogglePayment}
              title="Cancel (Esc)"
            />
            <div className="flex items-center gap-1.5">
              {paymentMethods.map((method, index) => {
                const Icon = method.icon;
                const isSelected = index === selectedMethodIndex;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethodIndex(index)}
                    className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-[#2a2a2a] hover:border-gray-300 dark:hover:border-[#3a3a3a]'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full ${method.color} flex items-center justify-center text-white shrink-0`}>
                      <Icon size={13} />
                    </div>
                    <span className={`font-medium ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      {method.name}
                    </span>
                    <kbd className="hidden md:inline text-[10px] text-gray-400 bg-gray-100 dark:bg-[#2a2a2a] px-1 rounded">
                      {method.shortcut}
                    </kbd>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2 (mobile) / inline (desktop): Cash Amount */}
          {selectedMethod === 'cash' && (
            <div className="flex items-center gap-2 flex-1 max-w-md overflow-x-auto scrollbar-hide">
              <input
                ref={amountRef}
                type="text"
                inputMode="decimal"
                value={amountTendered}
                onChange={(e) => setAmountTendered(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canComplete && !processing) {
                    e.preventDefault();
                    handleComplete();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    onTogglePayment();
                  }
                  e.stopPropagation();
                }}
                placeholder="Amount"
                className="w-28 md:w-36 h-9 px-3 text-center text-sm font-semibold font-mono bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-lg outline-none text-gray-900 dark:text-white focus:border-primary-500 transition-colors shrink-0"
              />
              {quickAmounts.map((amount, idx) => (
                <button
                  key={amount}
                  onClick={() => setAmountTendered(String(amount))}
                  className="px-2 md:px-2.5 py-1.5 text-xs font-medium bg-gray-100 dark:bg-[#222] hover:bg-gray-200 dark:hover:bg-[#333] text-gray-600 dark:text-gray-400 rounded-md transition-colors shrink-0"
                >
                  ${amount}
                </button>
              ))}
              <button
                onClick={() => setAmountTendered(String(Math.ceil(totals.total)))}
                className="px-2 md:px-2.5 py-1.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/20 hover:bg-primary-200 dark:hover:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-md transition-colors shrink-0"
              >
                Exact
              </button>
              {Number(amountTendered) > 0 && (
                <div className={`px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-bold shrink-0 whitespace-nowrap ${
                  change >= 0 ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                }`}>
                  {change >= 0 ? 'Change' : 'Due'}: ${Math.abs(change).toFixed(2)}
                </div>
              )}
            </div>
          )}

          {/* Complete button */}
          <Button
            variant="primary"
            size="md"
            onClick={handleComplete}
            disabled={!canComplete || processing}
            loading={processing}
            prefixIcon={!processing ? Check : undefined}
            className="md:ml-auto !px-6 w-full md:w-auto"
          >
            {processing ? 'Processing...' : 'Complete Sale'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="shrink-0 bg-white dark:bg-[#121212] border-t border-gray-200 dark:border-[#2a2a2a] px-4 py-2.5">
      <div className="flex items-center justify-between">
        {/* Left actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            prefixIcon={Pause}
            onClick={onHold}
            disabled={cart.length === 0}
          >
            Hold <kbd className="hidden md:inline ml-1 text-[10px] opacity-50">F2</kbd>
          </Button>
          <Button
            variant="outline"
            size="sm"
            prefixIcon={Trash2}
            onClick={onClear}
            disabled={cart.length === 0}
            className="!text-red-500 dark:!text-red-400 hover:!bg-red-50 dark:hover:!bg-red-900/10 !border-red-200 dark:!border-red-900/30"
          >
            Clear <kbd className="hidden md:inline ml-1 text-[10px] opacity-50">F9</kbd>
          </Button>
        </div>

        {/* Center info */}
        <div className="hidden md:flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>{cart.length} items</span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span>{totals.itemCount} pcs</span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span className="font-bold text-lg text-primary-600 dark:text-primary-400 font-mono">
            ${totals.total.toFixed(2)}
          </span>
        </div>

        {/* Checkout — desktop only (mobile uses summary drawer) */}
        <Button
          variant="primary"
          size="lg"
          onClick={onTogglePayment}
          disabled={cart.length === 0}
          className="!px-8 hidden md:flex"
        >
          <CreditCard size={18} className="mr-2" />
          Checkout
          <kbd className="ml-2 text-[10px] opacity-60">F8</kbd>
        </Button>
      </div>
    </div>
  );
};

export default ActionBar;
