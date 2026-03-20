import { useState, useRef, useEffect } from 'react';
import { Minus, Plus, X, Percent, DollarSign } from 'lucide-react';
import { useSettings } from '@hooks';

const BillingTableRow = ({
  item,
  index,
  isSelected,
  onUpdateQuantity,
  onUpdateItemDiscount,
  onUpdateItemDiscountType,
  onRemove,
  triggerEditQty = false,
  triggerEditDiscount = false,
  onEditDone,
}) => {
  const { settings } = useSettings();
  const radius = { none: 'rounded-none', small: 'rounded-md', rounded: 'rounded-lg', full: 'rounded-full' }[settings.borderRadius] || 'rounded-lg';
  const { product, quantity, discount, discountType = 'percent' } = item;
  const [editingQty, setEditingQty] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(false);
  const [localQty, setLocalQty] = useState(String(quantity));
  const [localDiscount, setLocalDiscount] = useState(String(discount));
  const qtyRef = useRef(null);
  const discountRef = useRef(null);

  const itemTotal = product.price * quantity;
  const discountAmount = discountType === 'fixed'
    ? Math.min(discount * quantity, itemTotal)
    : (itemTotal * discount) / 100;
  const finalPrice = itemTotal - discountAmount;

  useEffect(() => {
    setLocalQty(String(quantity));
  }, [quantity]);

  useEffect(() => {
    setLocalDiscount(String(discount));
  }, [discount]);

  // Trigger edit from parent via keyboard
  useEffect(() => {
    if (triggerEditQty && !editingQty) {
      setEditingQty(true);
    }
  }, [triggerEditQty]);

  useEffect(() => {
    if (triggerEditDiscount && !editingDiscount) {
      setEditingDiscount(true);
    }
  }, [triggerEditDiscount]);

  useEffect(() => {
    if (editingQty && qtyRef.current) {
      qtyRef.current.focus();
      qtyRef.current.select();
    }
  }, [editingQty]);

  useEffect(() => {
    if (editingDiscount && discountRef.current) {
      discountRef.current.focus();
      discountRef.current.select();
    }
  }, [editingDiscount]);

  const commitQty = () => {
    const val = parseInt(localQty, 10);
    if (val > 0) {
      onUpdateQuantity(product.id, val);
    } else {
      setLocalQty(String(quantity));
    }
    setEditingQty(false);
    onEditDone?.();
  };

  const commitDiscount = () => {
    const val = parseFloat(localDiscount) || 0;
    onUpdateItemDiscount(product.id, val);
    setEditingDiscount(false);
    onEditDone?.();
  };

  return (
    <div
      className={`grid grid-cols-[50px_90px_1fr_100px_100px_120px_110px_44px] gap-0 border-b transition-colors group ${
        isSelected
          ? 'bg-primary-50/70 dark:bg-primary-900/15 border-primary-100 dark:border-primary-900/30'
          : 'border-gray-100 dark:border-[#1e1e1e] hover:bg-gray-50/50 dark:hover:bg-[#151515]'
      }`}
    >
      {/* S.No */}
      <div className="px-3 py-2.5 text-center">
        <span className={`text-xs font-mono ${isSelected ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-gray-400 dark:text-gray-500'}`}>
          {index + 1}
        </span>
      </div>

      {/* Barcode */}
      <div className="px-3 py-2.5">
        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
          {product.barcode}
        </span>
      </div>

      {/* Item Name */}
      <div className="px-3 py-2.5 flex items-center gap-2.5 min-w-0">
        <img
          src={product.image}
          alt={product.name}
          className={`w-7 h-7 ${radius === 'rounded-full' ? 'rounded-full' : 'rounded-md'} object-cover shrink-0 bg-gray-100 dark:bg-[#2a2a2a]`}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/28?text=?'; }}
        />
        <span className={`text-sm truncate ${isSelected ? 'font-semibold text-primary-700 dark:text-primary-300' : 'font-medium text-gray-900 dark:text-white'}`}>
          {product.name}
        </span>
      </div>

      {/* Price */}
      <div className="px-3 py-2.5 text-right">
        <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
          ${product.price.toFixed(2)}
        </span>
      </div>

      {/* Quantity */}
      <div className="px-3 py-2.5 flex items-center justify-center">
        {editingQty ? (
          <input
            ref={qtyRef}
            type="number"
            min="1"
            value={localQty}
            onChange={(e) => setLocalQty(e.target.value)}
            onBlur={commitQty}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitQty();
              if (e.key === 'Escape') { setLocalQty(String(quantity)); setEditingQty(false); onEditDone?.(); }
              e.stopPropagation();
            }}
            className={`w-14 h-7 text-center text-sm font-bold bg-white dark:bg-[#1a1a1a] border border-primary-400 dark:border-primary-500 ${radius} outline-none text-gray-900 dark:text-white`}
          />
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onUpdateQuantity(product.id, quantity - 1); }}
              className={`w-5 h-5 ${radius} flex items-center justify-center text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333] hover:text-gray-600 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity`}
            >
              <Minus size={12} />
            </button>
            <button
              onDoubleClick={() => setEditingQty(true)}
              className={`min-w-[28px] h-7 px-1.5 ${radius} text-sm font-bold text-center cursor-default ${
                isSelected
                  ? 'text-primary-700 dark:text-primary-300 bg-primary-100/50 dark:bg-primary-900/20'
                  : 'text-gray-900 dark:text-white bg-gray-100 dark:bg-[#222]'
              }`}
            >
              {quantity}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onUpdateQuantity(product.id, quantity + 1); }}
              className={`w-5 h-5 ${radius} flex items-center justify-center text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333] hover:text-gray-600 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity`}
            >
              <Plus size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Discount */}
      <div className="px-3 py-2.5 flex items-center justify-center gap-1">
        {editingDiscount ? (
          <div className="flex items-center gap-1">
            <input
              ref={discountRef}
              type="number"
              min="0"
              max={discountType === 'percent' ? 100 : undefined}
              value={localDiscount}
              onChange={(e) => setLocalDiscount(e.target.value)}
              onBlur={commitDiscount}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitDiscount();
                if (e.key === 'Escape') { setLocalDiscount(String(discount)); setEditingDiscount(false); onEditDone?.(); }
                if (e.key === 's' || e.key === 'S') {
                  e.preventDefault();
                  onUpdateItemDiscountType(product.id, discountType === 'percent' ? 'fixed' : 'percent');
                }
                e.stopPropagation();
              }}
              className={`w-12 h-7 text-center text-xs font-medium bg-white dark:bg-[#1a1a1a] border border-primary-400 dark:border-primary-500 ${radius} outline-none text-gray-900 dark:text-white`}
            />
            <button
              onClick={(e) => { e.stopPropagation(); onUpdateItemDiscountType(product.id, discountType === 'percent' ? 'fixed' : 'percent'); }}
              className={`w-6 h-7 ${radius} flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-[#333] hover:text-primary-500`}
            >
              {discountType === 'percent' ? <Percent size={11} /> : <DollarSign size={11} />}
            </button>
          </div>
        ) : (
          <button
            onDoubleClick={() => setEditingDiscount(true)}
            onClick={(e) => e.stopPropagation()}
            className={`text-xs font-medium px-2 py-1 ${radius} cursor-default ${
              discount > 0
                ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {discount > 0
              ? `${discount}${discountType === 'percent' ? '%' : '$'}`
              : '-'
            }
          </button>
        )}
      </div>

      {/* Amount */}
      <div className="px-3 py-2.5 text-right">
        <div className="flex flex-col items-end">
          {discountAmount > 0 && (
            <span className="text-[10px] text-gray-400 dark:text-gray-500 line-through font-mono leading-none">
              ${itemTotal.toFixed(2)}
            </span>
          )}
          <span className={`text-sm font-bold font-mono ${
            discountAmount > 0
              ? 'text-green-600 dark:text-green-400'
              : isSelected
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-900 dark:text-white'
          }`}>
            ${finalPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Delete */}
      <div className="px-1.5 py-2.5 flex items-center justify-center">
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(product.id); }}
          className={`w-6 h-6 ${radius} flex items-center justify-center text-gray-300 dark:text-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all`}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default BillingTableRow;
