import { Percent, DollarSign } from 'lucide-react';
import { useRef } from 'react';

const TotalsPanel = ({
  totals,
  cart,
  discount,
  discountType,
  onSetDiscount,
  onSetDiscountType,
  position = 'right',
  cartDiscountRef: externalDiscountRef,
}) => {
  const localRef = useRef(null);
  const discountRef = externalDiscountRef || localRef;

  return (
    <div className={`w-[320px] shrink-0 bg-gray-50 dark:bg-[#111] flex flex-col ${
      position === 'left'
        ? 'border-r border-gray-200 dark:border-[#2a2a2a]'
        : 'border-l border-gray-200 dark:border-[#2a2a2a]'
    }`}>
      {/* Summary Header — matches BillingTable column header height */}
      <div className="shrink-0 px-4 flex items-center bg-gray-100 dark:bg-[#161616] border-b border-gray-200 dark:border-[#2a2a2a]">
        <h3 className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2.5">
          Bill Summary
        </h3>
      </div>

      {/* Totals */}
      <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto scrollbar-hide">
        {/* Items Count */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">Items</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {cart.length} ({totals.itemCount} pcs)
          </span>
        </div>

        {/* Gross Total */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">Gross Total</span>
          <span className="font-semibold text-gray-900 dark:text-white font-mono">
            ${totals.grossTotal.toFixed(2)}
          </span>
        </div>

        {/* Item Discounts */}
        {totals.itemDiscountTotal > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Item Discounts</span>
            <span className="font-semibold text-green-600 dark:text-green-400 font-mono">
              -${totals.itemDiscountTotal.toFixed(2)}
            </span>
          </div>
        )}

        {/* Subtotal */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
          <span className="font-semibold text-gray-900 dark:text-white font-mono">
            ${totals.subtotal.toFixed(2)}
          </span>
        </div>

        {/* Cart Discount */}
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">Cart Discount</span>
            <div className="flex items-center bg-white dark:bg-[#1a1a1a] rounded border border-gray-200 dark:border-[#333] overflow-hidden h-7 transition-colors focus-within:border-primary-500">
              <input
                ref={discountRef}
                type="number"
                min="0"
                value={discount || ''}
                onChange={(e) => onSetDiscount(Number(e.target.value) || 0)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape' || e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    discountRef.current?.blur();
                  }
                }}
                placeholder="0"
                className="w-11 h-full text-xs text-center bg-transparent border-none outline-none text-gray-900 dark:text-white font-mono"
              />
              <select
                value={discountType}
                onChange={(e) => onSetDiscountType(e.target.value)}
                className="h-full px-1 text-xs bg-gray-50 dark:bg-[#0d0d0d] border-l border-gray-200 dark:border-[#333] outline-none text-gray-500 dark:text-gray-400 cursor-pointer"
              >
                <option value="percent">%</option>
                <option value="fixed">$</option>
              </select>
            </div>
          </div>
          <span className={`font-semibold font-mono ${totals.discountAmount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
            -${totals.discountAmount.toFixed(2)}
          </span>
        </div>

        {/* Tax */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">Tax (5%)</span>
          <span className="font-semibold text-gray-900 dark:text-white font-mono">
            ${totals.tax.toFixed(2)}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-dashed border-gray-200 dark:border-[#333] !mt-4 !mb-2" />

        {/* Grand Total */}
        <div className="flex justify-between items-center !mt-2">
          <span className="text-base font-bold text-gray-900 dark:text-white">
            TOTAL
          </span>
          <span className="text-2xl font-extrabold text-primary-600 dark:text-primary-400 font-mono">
            ${totals.total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Last scanned item */}
      {cart.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-[#2a2a2a] bg-gray-100 dark:bg-[#0d0d0d]">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Last Added</p>
          <div className="flex items-center gap-2">
            <img
              src={cart[cart.length - 1].product.image}
              alt={cart[cart.length - 1].product.name}
              className="w-8 h-8 rounded object-cover bg-gray-200 dark:bg-[#222]"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                {cart[cart.length - 1].product.name}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                {cart[cart.length - 1].quantity}x ${cart[cart.length - 1].product.price.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TotalsPanel;
