import { useRef, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
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

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
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
          <div className="flex flex-col items-center justify-center h-full text-gray-300 dark:text-gray-600 py-16">
            <ShoppingCart size={48} strokeWidth={1} className="mb-3" />
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500">No items added</p>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Scan a barcode or search for items to begin</p>
          </div>
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
  );
};

export default BillingTable;
