import { ShoppingCart, Trash2, Pause, Percent } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import CartItem from './CartItem';

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
}) => {
  const itemRefs = useRef([]);
  const cartDiscountRef = useRef(null);

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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#121212] border-l border-gray-100 dark:border-[#2a2a2a] transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 dark:border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            Detail Items
          </span>
          {isFocused && (
            <span className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#2a2a2a] px-1.5 py-0.5 rounded">
              ↑↓ +/- D S T Y
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onHold}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
            title="Hold bill"
            disabled={cart.length === 0}
          >
            <Pause size={16} />
          </button>
          <button
            onClick={onClear}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Clear cart"
            disabled={cart.length === 0}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-gray-400 dark:text-gray-500">
          <ShoppingCart size={64} strokeWidth={1} className="mb-4 opacity-50" />
          <p className="text-lg font-medium">Cart is empty</p>
          <p className="text-sm text-center mt-1">Click on products to add them to the cart</p>
        </div>
      ) : (
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
          <div className="p-5 bg-gray-50 dark:bg-[#1a1a1a] rounded-t-3xl border-t border-gray-100 dark:border-[#2a2a2a] shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] mt-auto pt-6">
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
            <button
               onClick={onCheckout}
               disabled={cart.length === 0}
               className="w-full h-12 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-[14px] shadow-[0_4px_14px_0_rgba(var(--color-primary-500),0.39)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            >
              Place an Order
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPanel;
