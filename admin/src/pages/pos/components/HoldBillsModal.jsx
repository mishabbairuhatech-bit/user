import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Trash2, Clock, ShoppingCart } from 'lucide-react';
import { Modal, Button } from '@components/ui';

const HoldBillsModal = ({ isOpen, onClose, heldBills, onResume, onDelete }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemRefs = useRef([]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Reset selection when modal opens or bills change
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
    }
  }, [isOpen, heldBills.length]);

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
  const handleKeyDown = useCallback((e) => {
    if (!isOpen || heldBills.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, heldBills.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const bill = heldBills[selectedIndex];
      if (bill) {
        onResume(bill.id);
        onClose();
      }
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      const bill = heldBills[selectedIndex];
      if (bill) {
        onDelete(bill.id);
        setSelectedIndex(prev => Math.min(prev, heldBills.length - 2));
      }
    }
  }, [isOpen, heldBills, selectedIndex, onResume, onDelete, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Held Bills"
      size="lg"
    >
      <div className="space-y-4">
        {heldBills.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No held bills</p>
            <p className="text-sm">Bills you hold will appear here</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-hide">
            {heldBills.map((bill, index) => (
              <div
                key={bill.id}
                ref={el => itemRefs.current[index] = el}
                className={`flex items-center gap-4 p-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl border-2 transition-colors ${
                  index === selectedIndex
                    ? 'border-primary-500 dark:border-primary-500'
                    : 'border-gray-200 dark:border-[#2a2a2a]'
                }`}
              >
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatTime(bill.created_at)}
                    </span>
                    {bill.customer && (
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        - {bill.customer}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {bill.items.length} items
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ${bill.totals.total.toFixed(2)}
                    </span>
                  </div>

                  {/* Items preview */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {bill.items.slice(0, 3).map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 rounded-full"
                      >
                        {item.quantity}x {item.product.name}
                      </span>
                    ))}
                    {bill.items.length > 3 && (
                      <span className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-[#2a2a2a] text-gray-500 dark:text-gray-400 rounded-full">
                        +{bill.items.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(bill.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 size={16} />
                    {index === selectedIndex && <kbd className="ml-1 text-xs opacity-50">Del</kbd>}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      onResume(bill.id);
                      onClose();
                    }}
                    prefixIcon={Play}
                  >
                    Resume
                    {index === selectedIndex && <kbd className="ml-1 text-xs opacity-50">Enter</kbd>}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end border-t border-gray-200 dark:border-[#2a2a2a]">
          <Button variant="outline" onClick={onClose}>
            Close <kbd className="ml-2 text-xs opacity-50">Esc</kbd>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default HoldBillsModal;
