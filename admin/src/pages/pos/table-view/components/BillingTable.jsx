import { useRef, useEffect } from 'react';
import { ShoppingCart, Minus, Plus, X } from 'lucide-react';
import BillingTableRow from './BillingTableRow';

const BillingTable = ({
  cart,
  onUpdateQuantity,
  onUpdateItemDiscount,
  onUpdateItemDiscountType,
  onRemove,
  selectedIndex = -1,
  onSelectIndex,
  editingField,
  onEditDone,
}) => {
  const rowRefs = useRef([]);

  useEffect(() => {
    if (selectedIndex >= 0 && rowRefs.current[selectedIndex]) {
      rowRefs.current[selectedIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-gray-300 dark:text-gray-600 py-16">
      <ShoppingCart size={48} strokeWidth={1} className="mb-3" />
      <p className="text-sm font-medium text-gray-400 dark:text-gray-500">No items added</p>
      <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Scan a barcode or search for items to begin</p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ===== DESKTOP TABLE (hidden on mobile) ===== */}
      <div className="hidden md:flex flex-col flex-1 overflow-hidden">
        {/* Table Header */}
        <div className="shrink-0 grid grid-cols-[50px_90px_1fr_100px_100px_120px_110px_44px] gap-0 bg-gray-100 dark:bg-[#161616] border-b border-gray-200 dark:border-[#2a2a2a] text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <div className="px-3 py-2.5 text-center">#</div>
          <div className="px-3 py-2.5">Barcode</div>
          <div className="px-3 py-2.5">Item Name</div>
          <div className="px-3 py-2.5 text-right">Price</div>
          <div className="px-3 py-2.5 text-center">Qty</div>
          <div className="px-3 py-2.5 text-center">Discount</div>
          <div className="px-3 py-2.5 text-right">Amount</div>
          <div className="px-3 py-2.5"></div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {cart.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {cart.map((item, index) => (
                <div
                  key={item.product.id}
                  ref={(el) => (rowRefs.current[index] = el)}
                  onClick={() => onSelectIndex(index)}
                >
                  <BillingTableRow
                    item={item}
                    index={index}
                    isSelected={index === selectedIndex}
                    onUpdateQuantity={onUpdateQuantity}
                    onUpdateItemDiscount={onUpdateItemDiscount}
                    onUpdateItemDiscountType={onUpdateItemDiscountType}
                    onRemove={onRemove}
                    triggerEditQty={index === selectedIndex && editingField === 'qty'}
                    triggerEditDiscount={index === selectedIndex && editingField === 'discount'}
                    onEditDone={onEditDone}
                  />
                </div>
              ))}
              {/* Empty rows to fill space */}
              {cart.length < 12 &&
                Array.from({ length: 12 - cart.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="grid grid-cols-[50px_90px_1fr_100px_100px_120px_110px_44px] gap-0 border-b border-gray-50 dark:border-[#1a1a1a] h-[44px]"
                  >
                    <div className="px-3 py-2 text-center text-xs text-gray-200 dark:text-gray-700 font-mono">
                      {cart.length + i + 1}
                    </div>
                    <div className="px-3 py-2" />
                    <div className="px-3 py-2" />
                    <div className="px-3 py-2" />
                    <div className="px-3 py-2" />
                    <div className="px-3 py-2" />
                    <div className="px-3 py-2" />
                    <div className="px-3 py-2" />
                  </div>
                ))}
            </>
          )}
        </div>
      </div>

      {/* ===== MOBILE CARD LIST (hidden on desktop) ===== */}
      <div className="md:hidden flex-1 overflow-y-auto scrollbar-hide">
        {cart.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="p-3 space-y-2">
            {cart.map((item, index) => {
              const { product, quantity, discount, discountType = 'percent' } = item;
              const itemTotal = product.price * quantity;
              const discountAmount = discountType === 'fixed'
                ? Math.min(discount * quantity, itemTotal)
                : (itemTotal * discount) / 100;
              const finalPrice = itemTotal - discountAmount;

              return (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#151515] rounded-xl border border-gray-100 dark:border-[#222]"
                >
                  {/* Image */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-11 h-11 rounded-lg object-cover shrink-0 bg-gray-100 dark:bg-[#2a2a2a]"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">${product.price.toFixed(2)}</span>
                      {discountAmount > 0 && (
                        <span className="text-[10px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1 py-0.5 rounded">
                          {discount}{discountType === 'percent' ? '%' : '$'} off
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-[#2a2a2a] flex items-center justify-center text-gray-600 dark:text-gray-300 active:scale-95"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-gray-900 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-primary-500 text-white flex items-center justify-center active:scale-95"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Price + Delete */}
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-1">
                    <span className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                      ${finalPrice.toFixed(2)}
                    </span>
                    <button
                      onClick={() => onRemove(product.id)}
                      className="text-gray-400 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingTable;
