import { Plus, Minus, AlertCircle } from 'lucide-react';

const ProductCard = ({ product, onAdd, onUpdateQuantity, cartQuantity, isSelected }) => {
  const isLowStock = product.stock <= 5;
  const isOutOfStock = product.stock === 0;
  const inCart = cartQuantity > 0;

  return (
    <div
      onClick={() => !isOutOfStock && !inCart && onAdd(product)}
      className={`relative bg-white dark:bg-[#1a1a1a] rounded-xl border-2 overflow-hidden transition-all ${
        isSelected
          ? 'border-primary-500 ring-2 ring-primary-500/30 shadow-lg'
          : isOutOfStock
          ? 'border-gray-200 dark:border-[#2a2a2a] opacity-50 cursor-not-allowed'
          : inCart
          ? 'border-primary-400 dark:border-primary-600 shadow-md'
          : 'border-gray-200 dark:border-[#2a2a2a] hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 active:scale-[0.98] cursor-pointer'
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-100 dark:bg-[#2a2a2a]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/200?text=No+Image';
          }}
        />

        {/* Cart quantity badge */}
        {cartQuantity > 0 && (
          <div className="absolute top-1 right-1 w-5 h-5 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
            {cartQuantity}
          </div>
        )}

        {/* Low stock indicator */}
        {isLowStock && !isOutOfStock && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
            <AlertCircle size={12} />
            Low Stock
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2">
        <h3 className="text-xs font-medium text-gray-900 dark:text-white truncate">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
            ${product.price.toFixed(2)}
          </span>
          {!isOutOfStock && (
            inCart ? (
              /* Plus/Minus controls when in cart */
              <div className="flex items-center gap-0.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateQuantity(product.id, cartQuantity - 1);
                  }}
                  className="w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-[#2a2a2a] hover:bg-gray-300 dark:hover:bg-[#363636] text-gray-700 dark:text-gray-300 rounded-full transition-colors"
                >
                  <Minus size={12} />
                </button>
                <span className="w-5 text-center text-xs font-bold text-gray-900 dark:text-white">
                  {cartQuantity}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateQuantity(product.id, cartQuantity + 1);
                  }}
                  className="w-6 h-6 flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>
            ) : (
              /* Add button when not in cart */
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(product);
                }}
                className="w-6 h-6 flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-colors"
              >
                <Plus size={14} />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
