import { useEffect, useRef } from 'react';
import GridProductCard from './GridProductCard';

const ProductGrid = ({ products, cart, onAddToCart, onUpdateQuantity, selectedIndex }) => {
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 4xl:grid-cols-8 gap-[5px] p-3 pb-6">
      {products.map((product, index) => (
        <div key={product.id} ref={el => itemRefs.current[index] = el}>
          <GridProductCard
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
