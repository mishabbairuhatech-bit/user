import { useEffect, useCallback } from 'react';
import { AlertTriangle, Pause, Trash2, X } from 'lucide-react';
import { Modal, Button } from '@components/ui';

const HeldBillsWarningModal = ({ isOpen, onClose, onHoldBill, onClearCart, context = 'heldBills' }) => {
  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === '1' || e.key.toLowerCase() === 'h') {
        e.preventDefault();
        e.stopPropagation();
        onHoldBill();
      } else if (e.key === '2' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        e.stopPropagation();
        onClearCart();
      } else if (e.key === '3') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    },
    [isOpen, onHoldBill, onClearCart, onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, handleKeyDown]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" closeOnEsc={true}>
      <div className="py-6">
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <AlertTriangle size={28} className="text-amber-500" />
          </div>
        </div>

        {/* Message */}
        <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">
          Cart Has Items
        </h3>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
          Your cart currently has items. What would you like to do before {context === 'returns' ? 'processing returns' : 'viewing held bills'}?
        </p>

        {/* Actions */}
        <div className="space-y-2.5">
          {/* Option 1: Hold current bill */}
          <Button
            variant="ghost"
            size="md"
            onClick={onHoldBill}
            className="w-full !flex !items-center !gap-3 !px-4 !py-3 !h-auto !bg-primary-50 dark:!bg-primary-900/20 hover:!bg-primary-100 dark:hover:!bg-primary-900/30 !border-2 !border-primary-200 dark:!border-primary-800 !rounded-xl"
          >
            <div className="w-9 h-9 rounded-lg bg-primary-500 flex items-center justify-center shrink-0">
              <Pause size={18} className="text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Hold Current Bill
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Save cart items as a held bill
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-white dark:bg-[#2a2a2a] text-gray-500 dark:text-gray-400 rounded border border-gray-200 dark:border-[#424242]">
                H
              </kbd>
              <span className="text-gray-300 dark:text-gray-600 text-xs">or</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-white dark:bg-[#2a2a2a] text-gray-500 dark:text-gray-400 rounded border border-gray-200 dark:border-[#424242]">
                1
              </kbd>
            </div>
          </Button>

          {/* Option 2: Clear cart */}
          <Button
            variant="ghost"
            size="md"
            onClick={onClearCart}
            className="w-full !flex !items-center !gap-3 !px-4 !py-3 !h-auto !bg-red-50 dark:!bg-red-900/10 hover:!bg-red-100 dark:hover:!bg-red-900/20 !border-2 !border-red-200 dark:!border-red-800/50 !rounded-xl"
          >
            <div className="w-9 h-9 rounded-lg bg-red-500 flex items-center justify-center shrink-0">
              <Trash2 size={18} className="text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Remove All Items
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Clear cart and {context === 'returns' ? 'process returns' : 'view held bills'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-white dark:bg-[#2a2a2a] text-gray-500 dark:text-gray-400 rounded border border-gray-200 dark:border-[#424242]">
                C
              </kbd>
              <span className="text-gray-300 dark:text-gray-600 text-xs">or</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-white dark:bg-[#2a2a2a] text-gray-500 dark:text-gray-400 rounded border border-gray-200 dark:border-[#424242]">
                2
              </kbd>
            </div>
          </Button>

          {/* Option 3: Continue / Close */}
          <Button
            variant="ghost"
            size="md"
            onClick={onClose}
            className="w-full !flex !items-center !gap-3 !px-4 !py-3 !h-auto !bg-gray-50 dark:!bg-[#1a1a1a] hover:!bg-gray-100 dark:hover:!bg-[#2a2a2a] !border-2 !border-gray-200 dark:!border-[#2a2a2a] !rounded-xl"
          >
            <div className="w-9 h-9 rounded-lg bg-gray-400 dark:bg-gray-600 flex items-center justify-center shrink-0">
              <X size={18} className="text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Continue with Cart
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Close this popup and keep current items
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-white dark:bg-[#2a2a2a] text-gray-500 dark:text-gray-400 rounded border border-gray-200 dark:border-[#424242]">
                Esc
              </kbd>
              <span className="text-gray-300 dark:text-gray-600 text-xs">or</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-white dark:bg-[#2a2a2a] text-gray-500 dark:text-gray-400 rounded border border-gray-200 dark:border-[#424242]">
                3
              </kbd>
            </div>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default HeldBillsWarningModal;
