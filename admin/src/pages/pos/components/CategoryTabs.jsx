import { useEffect, useRef } from 'react';
import { Coffee, UtensilsCrossed, Cake, Cookie, LayoutGrid } from 'lucide-react';

const iconMap = {
  Coffee,
  UtensilsCrossed,
  Cake,
  Cookie,
};

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
    <div className={`flex items-center gap-2 px-4 h-14 bg-white dark:bg-[#121212] border-2 overflow-x-auto scrollbar-hide transition-colors ${
      isFocused
        ? 'border-primary-500 dark:border-primary-500'
        : 'border-transparent'
    }`}>
      {/* All category */}
      <button
        ref={el => itemRefs.current[0] = el}
        onClick={() => onCategoryChange(null)}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
          activeCategory === null
            ? 'bg-primary-600 text-white'
            : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#363636]'
        } ${isFocused && selectedIndex === 0 ? 'ring-2 ring-primary-400 ring-offset-1' : ''}`}
        title="Alt+1"
      >
        <LayoutGrid size={16} />
        <span className="text-sm font-medium">All</span>
      </button>

      {/* Category buttons */}
      {categories.map((category, index) => {
        const IconComponent = iconMap[category.icon] || Coffee;
        const isActive = activeCategory === category.id;
        const isSelected = isFocused && selectedIndex === index + 1;

        return (
          <button
            key={category.id}
            ref={el => itemRefs.current[index + 1] = el}
            onClick={() => onCategoryChange(category.id)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              isActive
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#363636]'
            } ${isSelected ? 'ring-2 ring-primary-400 ring-offset-1' : ''}`}
            title={`Alt+${index + 2 <= 9 ? index + 2 : 0}`}
          >
            <IconComponent size={16} />
            <span className="text-sm font-medium">{category.name}</span>
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
