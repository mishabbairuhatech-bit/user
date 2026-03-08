import { Minus, Plus, X, Percent } from 'lucide-react';
import { useState } from 'react';

const CartItem = ({ item, onUpdateQuantity, onUpdateDiscount, onRemove, isSelected }) => {
  const [showDiscount, setShowDiscount] = useState(false);
  const { product, quantity, discount } = item;

  const itemTotal = product.price * quantity;
  const discountAmount = (itemTotal * discount) / 100;
  const finalPrice = itemTotal - discountAmount;

  return (
    <div className={`flex items-start gap-3 py-3 px-2 rounded-lg transition-all ${
      isSelected
        ? 'border border-primary-400 dark:border-primary-500 ring-1 ring-primary-400'
        : 'border border-transparent'
    }`}>
      {/* Image */}
      <img
        src={product.image}
        alt={product.name}
        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/48?text=No+Image';
        }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {product.name}
          </h4>
          <button
            onClick={() => onRemove(product.id)}
            className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          ${product.price.toFixed(2)} each
        </p>

        {/* Quantity controls */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onUpdateQuantity(product.id, quantity - 1)}
              className="w-7 h-7 flex items-center justify-center bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#363636] rounded-lg transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">
              {quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(product.id, quantity + 1)}
              className="w-7 h-7 flex items-center justify-center bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#363636] rounded-lg transition-colors"
            >
              <Plus size={14} />
            </button>

            {/* Discount button */}
            <button
              onClick={() => setShowDiscount(!showDiscount)}
              className={`ml-2 w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                discount > 0
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-500 hover:bg-gray-200 dark:hover:bg-[#363636]'
              }`}
            >
              <Percent size={14} />
            </button>
          </div>

          <span className="text-sm font-bold text-gray-900 dark:text-white">
            ${finalPrice.toFixed(2)}
          </span>
        </div>

        {/* Discount input */}
        {showDiscount && (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="number"
              min="0"
              max="100"
              value={discount}
              onChange={(e) => onUpdateDiscount(product.id, Number(e.target.value))}
              className="w-16 h-7 px-2 text-sm text-center border border-gray-200 dark:border-[#424242] rounded-lg bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white"
            />
            <span className="text-xs text-gray-500">% off</span>
            {discount > 0 && (
              <span className="text-xs text-green-600 dark:text-green-400">
                -${discountAmount.toFixed(2)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartItem;
