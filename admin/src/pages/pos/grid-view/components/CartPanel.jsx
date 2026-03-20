import { ShoppingCart, Trash2, Pause, Percent, Banknote, CreditCard, Smartphone, Check, ArrowLeft, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Input } from '@components/ui';
import CartItem from './CartItem';

const paymentMethods = [
  { id: 'cash', name: 'Cash', icon: Banknote, color: 'bg-green-500' },
  { id: 'card', name: 'Card', icon: CreditCard, color: 'bg-blue-500' },
  { id: 'upi', name: 'UPI', icon: Smartphone, color: 'bg-purple-500' },
];

const CartPanel = ({
  cart,
  totals,
  discount,
  discountType,
  onUpdateQuantity,
  onUpdateItemDiscount,
  onUpdateItemDiscountType,
  onRemove,
  onClear,
  onHold,
  onSetDiscount,
  onSetDiscountType,
  onCheckout,
  selectedIndex = -1,
  isFocused = false,
  showDiscountIndex = -1,
  onToggleDiscount,
  focusCartDiscount = false,
  // Payment props
  showPayment = false,
  onCompleteSale,
  onBackFromPayment,
  position = 'right',
}) => {
  const itemRefs = useRef([]);
  const cartDiscountRef = useRef(null);
  const amountRef = useRef(null);

  // Payment state
  const [selectedMethodIndex, setSelectedMethodIndex] = useState(0);
  const [amountTendered, setAmountTendered] = useState('');
  const [processing, setProcessing] = useState(false);

  const selectedMethod = paymentMethods[selectedMethodIndex]?.id || 'cash';
  const change = selectedMethod === 'cash' && amountTendered
    ? Math.max(0, Number(amountTendered) - totals.total) : 0;
  const canComplete = selectedMethod === 'cash'
    ? Number(amountTendered) >= totals.total : true;
  const quickAmounts = [10, 20, 50, 100];

  // Reset payment state when payment opens/closes
  useEffect(() => {
    if (showPayment) {
      setSelectedMethodIndex(0);
      setAmountTendered('');
      setProcessing(false);
    }
  }, [showPayment]);

  const handleComplete = useCallback(async () => {
    if (!canComplete || processing) return;
    setProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onCompleteSale?.(selectedMethod, Number(amountTendered) || totals.total);
    setProcessing(false);
    setSelectedMethodIndex(0);
    setAmountTendered('');
  }, [canComplete, processing, selectedMethod, amountTendered, totals.total, onCompleteSale]);

  // Focus cart discount input when triggered
  useEffect(() => {
    if (focusCartDiscount && cartDiscountRef.current) {
      cartDiscountRef.current.focus();
      cartDiscountRef.current.select();
    }
  }, [focusCartDiscount]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  // Payment keyboard handling
  useEffect(() => {
    if (!showPayment) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onBackFromPayment?.();
        return;
      }
      if (e.key === 'Enter' && !processing && canComplete) {
        e.preventDefault();
        e.stopPropagation();
        handleComplete();
        return;
      }
      if (e.target.tagName === 'INPUT') return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedMethodIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedMethodIndex(prev => Math.min(prev + 1, paymentMethods.length - 1));
      }

      // Quick amount shortcuts
      if (selectedMethod === 'cash') {
        if (e.key === '1') { e.preventDefault(); setAmountTendered('10'); }
        else if (e.key === '2') { e.preventDefault(); setAmountTendered('20'); }
        else if (e.key === '3') { e.preventDefault(); setAmountTendered('50'); }
        else if (e.key === '4') { e.preventDefault(); setAmountTendered('100'); }
        else if (e.key === 'e' || e.key === 'E') {
          e.preventDefault();
          setAmountTendered(String(Math.ceil(totals.total)));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [showPayment, processing, canComplete, handleComplete, onBackFromPayment, selectedMethod, totals.total]);

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-[#121212] transition-colors ${
      position === 'left'
        ? 'border-r border-gray-100 dark:border-[#2a2a2a]'
        : 'border-l border-gray-100 dark:border-[#2a2a2a]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 dark:border-[#2a2a2a]">
        {showPayment ? (
          <>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                icon={ArrowLeft}
                iconOnly
                onClick={onBackFromPayment}
                title="Back to cart (Esc)"
              />
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                Payment
              </span>
            </div>
            <span className="hidden md:inline text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#2a2a2a] px-1.5 py-0.5 rounded">
              ← → Enter
            </span>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                Detail Items
              </span>
              {isFocused && (
                <span className="hidden md:inline text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#2a2a2a] px-1.5 py-0.5 rounded">
                  ↑↓ +/- D S T Y
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                icon={Pause}
                iconOnly
                onClick={onHold}
                title="Hold bill"
                disabled={cart.length === 0}
              />
              <Button
                variant="ghost"
                size="sm"
                icon={Trash2}
                iconOnly
                onClick={onClear}
                title="Clear cart"
                disabled={cart.length === 0}
              />
            </div>
          </>
        )}
      </div>

      {showPayment ? (
        /* ========== PAYMENT MODE ========== */
        <>
          {/* Scrollable: receipt items + totals */}
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

              {/* Totals summary */}
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

          {/* Payment Actions - fixed bottom */}
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
                    onClick={() => setSelectedMethodIndex(index)}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      e.stopPropagation();
                      onBackFromPayment?.();
                    } else if (e.key === 'Enter' && canComplete && !processing) {
                      e.preventDefault();
                      e.stopPropagation();
                      handleComplete();
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
                      <kbd className="hidden md:block text-[9px] text-gray-400">{idx + 1}</kbd>
                    </Button>
                  ))}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setAmountTendered(String(Math.ceil(totals.total)))}
                    className="flex-1 !flex !flex-col !items-center !px-2 !py-1.5 !min-h-0 !text-[11px] !bg-primary-100 dark:!bg-primary-900/20 hover:!bg-primary-200 dark:hover:!bg-primary-900/30 !text-primary-600 dark:!text-primary-400"
                  >
                    <span>Exact</span>
                    <kbd className="hidden md:block text-[9px] text-primary-400">E</kbd>
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
                onClick={onBackFromPayment}
              >
                Cancel <kbd className="hidden md:inline text-[10px] opacity-50">Esc</kbd>
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
                {!processing && <kbd className="hidden md:inline text-[10px] opacity-50">Enter</kbd>}
              </Button>
            </div>
          </div>
        </>
      ) : cart.length === 0 ? (
        /* ========== EMPTY CART ========== */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-gray-400 dark:text-gray-500">
          <ShoppingCart size={64} strokeWidth={1} className="mb-4 opacity-50" />
          <p className="text-lg font-medium">Cart is empty</p>
          <p className="text-sm text-center mt-1">Click on products to add them to the cart</p>
        </div>
      ) : (
        /* ========== CART MODE ========== */
        <>
          {/* Cart items */}
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 scrollbar-hide">
            {cart.map((item, index) => (
              <div key={item.product.id} ref={el => itemRefs.current[index] = el} className="mt-1">
                <CartItem
                  item={item}
                  onUpdateQuantity={onUpdateQuantity}
                  onUpdateDiscount={onUpdateItemDiscount}
                  onUpdateDiscountType={onUpdateItemDiscountType}
                  onRemove={onRemove}
                  isSelected={index === selectedIndex}
                  showDiscount={index === showDiscountIndex}
                  onToggleDiscount={(show) => onToggleDiscount && onToggleDiscount(show ? index : -1)}
                />
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="p-5 pb-8 bg-gray-50 dark:bg-[#1a1a1a] rounded-t-3xl border-t border-gray-100 dark:border-[#2a2a2a] shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] mt-auto pt-6">
            <h4 className="font-bold text-base text-gray-900 dark:text-white mb-4">Detail Payment</h4>

            <div className="space-y-3 mb-5">
              {/* Gross Total */}
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-gray-500 dark:text-gray-400">Gross Total</span>
                <span className="font-bold text-gray-900 dark:text-white">${totals.grossTotal.toFixed(2)}</span>
              </div>

              {/* Item Discounts */}
              {totals.itemDiscountTotal > 0 && (
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-gray-500 dark:text-gray-400">Item Discounts</span>
                  <span className="font-bold text-green-500 dark:text-green-400">-${totals.itemDiscountTotal.toFixed(2)}</span>
                </div>
              )}

              {/* Subtotal */}
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-gray-500 dark:text-gray-400">Sub total</span>
                <span className={`font-bold ${totals.itemDiscountTotal > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}>${totals.subtotal.toFixed(2)}</span>
              </div>

              {/* Tax */}
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-gray-500 dark:text-gray-400">Tax 10%</span>
                <span className="font-bold text-gray-900 dark:text-white">${totals.tax.toFixed(2)}</span>
              </div>

              {/* Discount Option */}
              <div className="flex justify-between items-center text-[13px]">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Cart Discount</span>
                  <div className="flex items-center bg-white dark:bg-[#2a2a2a] rounded-md border border-gray-200 dark:border-[#424242] overflow-hidden h-7 transition-colors focus-within:border-primary-500">
                    <input
                      ref={cartDiscountRef}
                      type="number"
                      min="0"
                      value={discount || ''}
                      onChange={(e) => onSetDiscount(Number(e.target.value) || 0)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape' || e.key === 'Enter') {
                          e.preventDefault();
                          e.stopPropagation();
                          cartDiscountRef.current?.blur();
                        } else if (e.key === 's' || e.key === 'S') {
                          e.preventDefault();
                          onSetDiscountType(discountType === 'percent' ? 'fixed' : 'percent');
                        }
                      }}
                      placeholder="0"
                      className="w-12 h-full text-xs text-center bg-transparent border-none outline-none text-gray-900 dark:text-white"
                    />
                    <select
                      value={discountType}
                      onChange={(e) => onSetDiscountType(e.target.value)}
                      className="h-full px-1 text-xs bg-gray-50 dark:bg-[#1a1a1a] border-l border-gray-200 dark:border-[#424242] outline-none text-gray-600 dark:text-gray-300 cursor-pointer"
                    >
                      <option value="percent">%</option>
                      <option value="fixed">$</option>
                    </select>
                  </div>
                </div>
                <span className={`font-bold ${totals.discountAmount > 0 ? 'text-green-500 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                  -${totals.discountAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Separator */}
            <div className="w-full border-t-[1.5px] border-dashed border-gray-200 dark:border-gray-800 mb-5" />

            {/* Total */}
            <div className="flex justify-between items-center mb-6">
              <span className="font-semibold text-gray-900 dark:text-white text-[15px]">Total Payment</span>
              <span className="text-lg font-extrabold text-primary-500 dark:text-primary-400">${totals.total.toFixed(2)}</span>
            </div>

            {/* Checkout button */}
            <Button
              variant="primary"
              size="lg"
              onClick={onCheckout}
              disabled={cart.length === 0}
              className="w-full"
            >
              Place an Order
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPanel;
