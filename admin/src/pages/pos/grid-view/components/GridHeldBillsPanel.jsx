import { useState, useEffect, useRef } from 'react';
import { Play, Trash2, Clock, ShoppingCart, X } from 'lucide-react';
import { Button } from '@components/ui';

const HeldBillsPanel = ({
  heldBills,
  onResume,
  onDelete,
  onBack,
  isFocused = false,
  position = 'right',
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemRefs = useRef([]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Reset selection when bills change
  useEffect(() => {
    setSelectedIndex((prev) => Math.min(prev, Math.max(0, heldBills.length - 1)));
  }, [heldBills.length]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isFocused) return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (heldBills.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, heldBills.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const bill = heldBills[selectedIndex];
        if (bill) {
          onResume(bill.id);
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        const bill = heldBills[selectedIndex];
        if (bill) {
          onDelete(bill.id);
          setSelectedIndex((prev) => Math.min(prev, heldBills.length - 2));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused, heldBills, selectedIndex, onResume, onDelete]);

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-[#121212] transition-colors ${
      position === 'left'
        ? 'border-r border-gray-100 dark:border-[#2a2a2a]'
        : 'border-l border-gray-100 dark:border-[#2a2a2a]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 dark:border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-gray-900 dark:text-white">
            Held Bills
          </span>
          {heldBills.length > 0 && (
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#2a2a2a] px-2 py-0.5 rounded-full">
              {heldBills.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {heldBills.length > 0 && (
            <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-[#2a2a2a] px-1.5 py-0.5 rounded">
              ↑↓ Enter Del
            </span>
          )}
          <Button variant="ghost" size="sm" icon={X} iconOnly onClick={onBack} />
        </div>
      </div>

      {heldBills.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-gray-400 dark:text-gray-500">
          <ShoppingCart size={48} strokeWidth={1} className="mb-3 opacity-50" />
          <p className="text-sm font-medium">No held bills</p>
          <p className="text-xs mt-1">Bills you hold will appear here</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 md:space-y-2 scrollbar-hide">
          {heldBills.map((bill, index) => (
            <div
              key={bill.id}
              ref={(el) => (itemRefs.current[index] = el)}
              onClick={() => setSelectedIndex(index)}
              className={`p-2 md:p-3 rounded-xl border-2 cursor-pointer transition-all ${
                index === selectedIndex
                  ? 'border-primary-500 dark:border-primary-500 bg-primary-50/50 dark:bg-primary-900/10'
                  : 'border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1a1a1a] hover:border-gray-200 dark:hover:border-[#3a3a3a]'
              }`}
            >
              {/* Time & Customer */}
              <div className="flex items-center justify-between mb-1 md:mb-2">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Clock size={12} className="text-gray-400 md:hidden" />
                  <Clock size={13} className="text-gray-400 hidden md:block" />
                  <span className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(bill.created_at)}
                  </span>
                  {bill.customer && (
                    <span className="text-[11px] md:text-xs text-gray-700 dark:text-gray-300 font-medium">
                      {bill.customer}
                    </span>
                  )}
                </div>
                <span className="text-xs md:text-sm font-bold text-gray-900 dark:text-white">
                  ${bill.totals.total.toFixed(2)}
                </span>
              </div>

              {/* Items preview */}
              <div className="flex flex-wrap gap-1 mb-1 md:mb-2">
                {bill.items.slice(0, 3).map((item, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 text-[10px] bg-gray-200 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 rounded-full"
                  >
                    {item.quantity}x {item.product.name}
                  </span>
                ))}
                {bill.items.length > 3 && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-gray-200 dark:bg-[#2a2a2a] text-gray-500 dark:text-gray-400 rounded-full">
                    +{bill.items.length - 3} more
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] md:text-[11px] text-gray-400 dark:text-gray-500">
                  {bill.items.length} item{bill.items.length !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="danger-outline"
                    size="sm"
                    prefixIcon={Trash2}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(bill.id);
                    }}
                    className="!h-6 md:!h-7 !min-h-0 !px-1.5 md:!px-2 !border-0"
                  >
                    {index === selectedIndex && (
                      <kbd className="hidden md:inline text-[9px] opacity-50">Del</kbd>
                    )}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    prefixIcon={Play}
                    onClick={(e) => {
                      e.stopPropagation();
                      onResume(bill.id);
                    }}
                    className="!h-6 md:!h-7 !min-h-0 !px-2 md:!px-2.5"
                  >
                    Resume
                    {index === selectedIndex && (
                      <kbd className="hidden md:inline text-[9px] opacity-70">↵</kbd>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeldBillsPanel;
