import { useEffect, useRef } from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, cart, onAddToCart, onUpdateQuantity, loading, selectedIndex }) => {
  const itemRefs = useRef([]);

  // Get cart quantities for each product
  const getCartQuantity = (productId) => {
    const cartItem = cart.find(item => item.product.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 4xl:grid-cols-7 gap-4 p-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-gray-200 dark:bg-[#2a2a2a] rounded-xl" />
            <div className="mt-3 h-4 bg-gray-200 dark:bg-[#2a2a2a] rounded w-3/4" />
            <div className="mt-2 h-6 bg-gray-200 dark:bg-[#2a2a2a] rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-gray-500 dark:text-gray-400">
        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="text-lg font-medium">No products found</p>
        <p className="text-sm">Try selecting a different category or search term</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 4xl:grid-cols-7 gap-4 p-4 pb-8">
      {products.map((product, index) => (
        <div key={product.id} ref={el => itemRefs.current[index] = el}>
          <ProductCard
            product={product}
            onAdd={onAddToCart}
            onUpdateQuantity={onUpdateQuantity}
            cartQuantity={getCartQuantity(product.id)}
            isSelected={index === selectedIndex}
          />
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
