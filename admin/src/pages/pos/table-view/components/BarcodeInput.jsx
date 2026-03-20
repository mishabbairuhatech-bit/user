import { useState, useRef, useEffect, useMemo } from 'react';
import { ScanBarcode, Search, X, User } from 'lucide-react';
import { Button, Input } from '@components/ui';
import { products } from '../../grid-view/data/mockData';

const BarcodeInput = ({ onAddItem, inputRef: externalRef, customer, onCustomerChange, reversed = false }) => {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const localRef = useRef(null);
  const dropdownRef = useRef(null);
  const itemRefs = useRef([]);
  const inputRef = externalRef || localRef;

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.is_active &&
        (p.name.toLowerCase().includes(q) ||
          p.barcode.includes(q) ||
          String(p.id).includes(q))
    ).slice(0, 8);
  }, [query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredProducts.length]);

  // Scroll focused item into view
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (product) => {
    onAddItem(product);
    setQuery('');
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
      setQuery('');
      return;
    }

    if (!showDropdown || filteredProducts.length === 0) {
      // Enter on barcode exact match
      if (e.key === 'Enter' && query.trim()) {
        e.preventDefault();
        const exact = products.find(
          (p) => p.barcode === query.trim() || String(p.id) === query.trim()
        );
        if (exact && exact.is_active) {
          handleSelect(exact);
        } else if (filteredProducts.length === 1) {
          handleSelect(filteredProducts[0]);
        }
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredProducts.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredProducts[selectedIndex]) {
        handleSelect(filteredProducts[selectedIndex]);
      }
    }
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-[#0d0d0d] border-b border-gray-200 dark:border-[#2a2a2a] ${reversed ? 'flex-row-reverse' : ''}`}>
      {/* Barcode/Search Input */}
      <div className="relative flex-1 max-w-xl" ref={dropdownRef}>
        <div className="relative">
          <ScanBarcode size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(e.target.value.trim().length > 0);
            }}
            onFocus={() => {
              if (query.trim()) setShowDropdown(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Scan barcode or search item... (F6)"
            className="w-full h-10 pl-10 pr-9 text-sm bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-lg outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 dark:focus:border-primary-500 transition-colors font-mono"
            autoComplete="off"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setShowDropdown(false); inputRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && filteredProducts.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-lg shadow-xl z-50 max-h-[320px] overflow-y-auto">
            {filteredProducts.map((product, index) => (
              <button
                key={product.id}
                ref={(el) => (itemRefs.current[index] = el)}
                onClick={() => handleSelect(product)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                  index === selectedIndex
                    ? 'bg-primary-50 dark:bg-[#222] dark:border-l-2 dark:border-l-primary-500'
                    : 'hover:bg-gray-50 dark:hover:bg-[#222] dark:border-l-2 dark:border-l-transparent'
                }`}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-9 h-9 rounded-lg object-cover shrink-0 bg-gray-100 dark:bg-[#2a2a2a]"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/36?text=?'; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                    #{product.barcode} · Stock: {product.stock}
                  </p>
                </div>
                <span className="text-sm font-bold text-primary-600 dark:text-primary-400 shrink-0">
                  ${product.price.toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        )}

        {showDropdown && query.trim() && filteredProducts.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-lg shadow-xl z-50 p-4 text-center">
            <Search size={20} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No items found for "{query}"</p>
          </div>
        )}
      </div>

      {/* Customer Input */}
      <div className="relative w-48 hidden lg:block">
        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          value={customer || ''}
          onChange={(e) => onCustomerChange(e.target.value || null)}
          placeholder="Customer name"
          className="w-full h-10 pl-9 pr-3 text-sm bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-lg outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 dark:focus:border-primary-500 transition-colors"
        />
      </div>
    </div>
  );
};

export default BarcodeInput;
