import { ShoppingCart, Trash2, Pause, Percent } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button, Input } from '@components/ui';
import CartItem from './CartItem';

const CartPanel = ({
  cart,
  totals,
  discount,
  discountType,
  onUpdateQuantity,
  onUpdateItemDiscount,
  onRemove,
  onClear,
  onHold,
  onSetDiscount,
  onSetDiscountType,
  onCheckout,
  selectedIndex = -1,
  isFocused = false,
}) => {
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const itemRefs = useRef([]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  if (cart.length === 0) {
    return (
      <div className={`flex flex-col h-full bg-white dark:bg-[#121212] border-2 transition-colors ${isFocused
          ? 'border-primary-500 dark:border-primary-500'
          : 'border-transparent'
        }`}>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-gray-400 dark:text-gray-500">
          <ShoppingCart size={64} strokeWidth={1} className="mb-4 opacity-50" />
          <p className="text-lg font-medium">Cart is empty</p>
          <p className="text-sm text-center mt-1">Click on products to add them to the cart</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-[#121212] border-2 transition-colors ${isFocused
        ? 'border-primary-500 dark:border-primary-500'
        : 'border-transparent'
      }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200 dark:border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <ShoppingCart size={20} className="text-gray-600 dark:text-gray-300" />
          <span className="font-semibold text-gray-900 dark:text-white">
            Cart ({totals.itemCount})
          </span>
          {isFocused && (
            <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-0.5">
              ↑ ↓ +/-
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onHold}
            className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
            title="Hold bill"
          >
            <Pause size={18} />
          </button>
          <button
            onClick={onClear}
            className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
            title="Clear cart"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 scrollbar-hide">
        {cart.map((item, index) => (
          <div key={item.product.id} ref={el => itemRefs.current[index] = el} className="mt-1">
            <CartItem
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onUpdateDiscount={onUpdateItemDiscount}
              onRemove={onRemove}
              isSelected={index === selectedIndex}
            />
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 dark:border-[#2a2a2a] p-4 space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
          <span className="text-gray-900 dark:text-white">${totals.subtotal.toFixed(2)}</span>
        </div>

        {/* Discount */}
        <div className="flex justify-between text-sm items-center">
          <button
            onClick={() => setShowDiscountInput(!showDiscountInput)}
            className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
          >
            <Percent size={14} />
            <span>Discount</span>
          </button>
          <span className={`${totals.discountAmount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
            -${totals.discountAmount.toFixed(2)}
          </span>
        </div>

        {/* Discount input */}
        {showDiscountInput && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg">
            <Input
              type="number"
              min="0"
              value={discount}
              onChange={(e) => onSetDiscount(Number(e.target.value))}
              className="w-20 h-8 text-center"
            />
            <select
              value={discountType}
              onChange={(e) => onSetDiscountType(e.target.value)}
              className="h-8 px-2 text-sm border border-gray-200 dark:border-[#424242] rounded-lg bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white"
            >
              <option value="percent">%</option>
              <option value="fixed">$</option>
            </select>
          </div>
        )}

        {/* Tax */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Tax (5%)</span>
          <span className="text-gray-900 dark:text-white">${totals.tax.toFixed(2)}</span>
        </div>

        {/* Total */}
        <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-[#2a2a2a]">
          <span className="text-gray-900 dark:text-white">Total</span>
          <span className="text-primary-600 dark:text-primary-400">${totals.total.toFixed(2)}</span>
        </div>

        {/* Checkout button */}
        <Button
          onClick={onCheckout}
          className="w-full h-12 text-base font-semibold"
        >
          Checkout - ${totals.total.toFixed(2)}
        </Button>
      </div>
    </div>
  );
};

export default CartPanel;
