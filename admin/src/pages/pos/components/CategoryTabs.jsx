import { useEffect, useRef } from 'react';

const CategoryTabs = ({ categories, activeCategory, onCategoryChange, selectedIndex = 0, isFocused = false }) => {
  const itemRefs = useRef([]);

  // Scroll selected item into view
  useEffect(() => {
    if (isFocused && selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [selectedIndex, isFocused]);

  return (
    <div className="flex items-center gap-6 px-6 h-14 bg-white dark:bg-[#121212] overflow-x-auto scrollbar-hide border-b border-gray-100 dark:border-[#2a2a2a] transition-colors leading-none">
      {/* All category */}
      <button
        ref={el => itemRefs.current[0] = el}
        onClick={() => onCategoryChange(null)}
        className={`relative flex items-center h-full px-3 whitespace-nowrap transition-all ${
          isFocused && selectedIndex === 0
            ? 'ring-2 ring-primary-400 ring-inset rounded-md'
            : ''
        } ${
          activeCategory === null
            ? 'text-gray-900 dark:text-white font-bold'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
        title="Alt+1"
      >
        <span className="text-sm">All Items</span>
        {activeCategory === null && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-900 dark:bg-white" />
        )}
      </button>

      {/* Category buttons */}
      {categories.map((category, index) => {
        const isActive = activeCategory === category.id;
        const isSelected = isFocused && selectedIndex === index + 1;

        return (
          <button
            key={category.id}
            ref={el => itemRefs.current[index + 1] = el}
            onClick={() => onCategoryChange(category.id)}
            className={`relative flex items-center h-full px-3 whitespace-nowrap transition-all ${
              isSelected
                ? 'ring-2 ring-primary-400 ring-inset rounded-md'
                : ''
            } ${
              isActive
                ? 'text-gray-900 dark:text-white font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            title={`Alt+${index + 2 <= 9 ? index + 2 : 0}`}
          >
            <span className="text-sm">{category.name}</span>
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-900 dark:bg-white" />
            )}
          </button>
        );
      })}

      {/* Focus indicator */}
      {isFocused && (
        <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 px-2 py-0.5 whitespace-nowrap">
          ← → Enter
        </span>
      )}
    </div>
  );
};

export default CategoryTabs;
