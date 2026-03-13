import { Plus, Minus, AlertCircle } from 'lucide-react';
import { Card } from '@components/ui';

const ProductCard = ({ product, onAdd, onUpdateQuantity, cartQuantity, isSelected }) => {
  const isLowStock = product.stock <= 5;
  const isOutOfStock = product.stock === 0;
  const inCart = cartQuantity > 0;

  return (
    <Card
      onClick={() => !isOutOfStock && !inCart && onAdd(product)}
      className={`relative p-3 transition-all flex flex-col h-full outline-none focus:outline-none ${isSelected
        ? '!border-primary-500 !bg-gray-50/40 dark:!bg-[#181818] shadow-lg transform scale-[1.02]'
        : isOutOfStock
          ? 'opacity-50 cursor-not-allowed'
          : inCart
            ? '!border-primary-300 !bg-primary-50/40 dark:!bg-primary-800/10 shadow-sm'
            : 'hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:!border-gray-300 dark:hover:!border-gray-600 active:scale-[0.98] cursor-pointer'
        }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-50 dark:bg-[#2a2a2a] rounded-2xl overflow-hidden mb-3">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/200?text=No+Image';
          }}
        />

        {/* Low stock indicator */}
        {isLowStock && !isOutOfStock && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1 shadow-sm">
            <AlertCircle size={10} />
            Low Stock
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 dark:bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-md shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col px-1">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1 leading-tight line-clamp-1">
          {product.name}
        </h3>

        <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-3 line-clamp-2 leading-relaxed min-h-[32px]">
          {product.description || `Artificial potted plant, indoor/outdoor ${product.name.toLowerCase()}, 9 cm`}
        </p>

        <div className="mt-auto flex items-center justify-between mb-4">
          <span className="text-[15px] font-extrabold text-primary-500 dark:text-primary-400">
            ${product.price.toFixed(2)}
          </span>
          <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-[#2a2a2a] px-2 py-0.5 rounded-full border border-gray-100 dark:border-gray-800">
            {product.stock} Items
          </span>
        </div>

        {!isOutOfStock && (
          inCart ? (
            /* Plus/Minus controls when in cart */
            <div className="flex items-center justify-between w-full p-1 border border-primary-500 dark:border-primary-500 bg-white dark:bg-[#1a1a1a] rounded-[14px] h-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuantity(product.id, cartQuantity - 1);
                }}
                className="w-8 h-8 flex items-center justify-center bg-white dark:bg-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#363636] border border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-300 rounded-[10px] shadow-sm transition-all"
              >
                <Minus size={14} strokeWidth={2.5} />
              </button>
              <span className="flex-1 text-center text-sm font-bold text-primary-700 dark:text-primary-300">
                {cartQuantity} in cart
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuantity(product.id, cartQuantity + 1);
                }}
                className="w-8 h-8 flex items-center justify-center bg-primary-500 hover:bg-primary-600 text-white rounded-[10px] shadow-[0_2px_8px_-2px_rgba(var(--color-primary-500),0.5)] transition-all"
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            /* Add button when not in cart */
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd(product);
              }}
              className="w-full h-10 flex items-center justify-center gap-2 border border-primary-500 dark:border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-500 hover:text-white dark:hover:bg-primary-600 bg-white dark:bg-[#1a1a1a] rounded-[14px] text-sm font-semibold transition-all active:scale-[0.98]"
            >
              <Plus size={16} strokeWidth={2.5} /> Add to cart
            </button>
          )
        )}
      </div>
    </Card>
  );
};

export default ProductCard;
