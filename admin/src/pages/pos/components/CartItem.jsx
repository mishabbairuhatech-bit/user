import { Minus, Plus, X, Percent, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@components/ui';

const CartItem = ({ item, onUpdateQuantity, onUpdateDiscount, onUpdateDiscountType, onRemove, isSelected, showDiscount = false, onToggleDiscount }) => {
  const [localShowDiscount, setLocalShowDiscount] = useState(false);
  const discountVisible = showDiscount || localShowDiscount;
  const { product, quantity, discount, discountType = 'percent' } = item;

  const itemTotal = product.price * quantity;
  const discountAmount = discountType === 'fixed'
    ? Math.min(discount * quantity, itemTotal)
    : (itemTotal * discount) / 100;
  const finalPrice = itemTotal - discountAmount;

  return (
    <div className={`flex items-center gap-3 py-3 px-3 rounded-xl transition-all duration-300 ease-in-out ${
      isSelected
        ? 'bg-primary-50 dark:bg-primary-900/20 scale-[1.04] shadow-sm -translate-y-0.5'
        : 'scale-100 translate-y-0 hover:bg-gray-50/50 dark:hover:bg-[#1a1a1a]/50'
    }`}>
      {/* Image */}
      <div className="relative w-14 h-14 bg-gray-100 dark:bg-[#2a2a2a] rounded-xl flex-shrink-0 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/48?text=No+Image';
          }}
        />
        <Button
          variant="ghost"
          size="sm"
          icon={X}
          iconOnly
          onClick={() => onRemove(product.id)}
          className="absolute top-1 left-1 !p-0.5 !min-h-0 !w-auto !h-auto !bg-white/80 dark:!bg-black/50 hover:!bg-red-500 hover:!text-white !rounded-md !text-gray-500 backdrop-blur-[2px]"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h4 className="text-[13px] font-bold text-gray-900 dark:text-white truncate">
          {product.name}
        </h4>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
          {product.description || `Artificial potted plant, 9 cm`}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          {discountAmount > 0 ? (
            <>
              <span className="text-[11px] text-gray-400 dark:text-gray-500 line-through">${itemTotal.toFixed(2)}</span>
              <span className="text-[13px] font-extrabold text-green-500 dark:text-green-400">${finalPrice.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-[13px] font-extrabold text-primary-500 dark:text-primary-400">${itemTotal.toFixed(2)}</span>
          )}
        </div>
      </div>

      {/* Controls: Quantity & Item Discount */}
      <div className="flex flex-col items-end gap-2 ml-2">
        {/* Quantity */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            icon={Minus}
            iconOnly
            onClick={() => onUpdateQuantity(product.id, quantity - 1)}
            className="!w-7 !h-7 !min-h-0 !p-0 shadow-sm"
          />
          <span className="w-4 text-center text-sm font-bold text-gray-900 dark:text-white">
            {quantity}
          </span>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            iconOnly
            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
            className="!w-7 !h-7 !min-h-0 !p-0 shadow-sm"
          />
        </div>

        {/* Item Discount Option */}
        <div className="flex items-center justify-end gap-1 w-full relative">
          {discountVisible ? (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                iconOnly
                onClick={() => onUpdateDiscountType(product.id, discountType === 'percent' ? 'fixed' : 'percent')}
                className="!w-6 !h-6 !min-h-0 !p-0 !bg-gray-50 dark:!bg-[#2a2a2a] hover:!border-primary-500"
                title="Toggle % / $ (S)"
              >
                {discountType === 'percent' ? <Percent size={10} /> : <DollarSign size={10} />}
              </Button>
              <input
                autoFocus={showDiscount}
                type="number"
                min="0"
                max={discountType === 'percent' ? 100 : undefined}
                value={discount || ''}
                onChange={(e) => onUpdateDiscount(product.id, Number(e.target.value) || 0)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape' || e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    setLocalShowDiscount(false);
                    if (onToggleDiscount) onToggleDiscount(false);
                  } else if (e.key === 's' || e.key === 'S') {
                    e.preventDefault();
                    onUpdateDiscountType(product.id, discountType === 'percent' ? 'fixed' : 'percent');
                  }
                }}
                placeholder={discountType === 'percent' ? '%' : '$'}
                className="w-12 h-6 px-1 text-[11px] text-center border border-gray-200 dark:border-[#424242] rounded-md bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white outline-none focus:border-primary-500"
              />
              <Button
                variant="ghost"
                size="sm"
                icon={X}
                iconOnly
                onClick={() => { setLocalShowDiscount(false); if (onToggleDiscount) onToggleDiscount(false); }}
                className="!w-6 !h-6 !min-h-0 !p-0 !text-gray-400 hover:!text-red-500"
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setLocalShowDiscount(true); if (onToggleDiscount) onToggleDiscount(true); }}
              className={`!min-h-0 !px-1.5 !py-0.5 !text-[10px] !font-bold ${
                discount > 0
                  ? '!bg-green-100 !text-green-600 dark:!bg-green-900/30 dark:!text-green-400'
                  : '!text-gray-400 hover:!text-primary-500 !bg-gray-100 dark:!bg-[#2a2a2a] hover:!bg-primary-50 dark:hover:!bg-primary-900/20'
              }`}
            >
              {discountType === 'percent' ? <Percent size={10} /> : <DollarSign size={10} />}
              {discount > 0 ? `${discount}${discountType === 'percent' ? '%' : '$'} OFF` : 'Discount'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartItem;
