import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, RotateCcw, X } from 'lucide-react';
import { Modal, Button, Input, Checkbox } from '@components/ui';
import { TAX_RATE } from '../data/mockData';

const ReturnsModal = ({ isOpen, onClose, completedBills, onProcessReturn }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [processing, setProcessing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemRefs = useRef([]);
  const searchInputRef = useRef(null);

  // Filter bills (exclude returns)
  const filteredBills = completedBills
    .filter(bill => bill.type !== 'return')
    .filter(bill =>
      bill.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 10);

  const handleSelectBill = (bill) => {
    setSelectedBill(bill);
    const items = {};
    bill.items.forEach((item, idx) => {
      items[idx] = { selected: false, quantity: item.quantity };
    });
    setSelectedItems(items);
  };

  const toggleItem = (idx) => {
    setSelectedItems(prev => ({
      ...prev,
      [idx]: { ...prev[idx], selected: !prev[idx].selected }
    }));
  };

  const updateQuantity = (idx, quantity) => {
    const maxQty = selectedBill.items[idx].quantity;
    setSelectedItems(prev => ({
      ...prev,
      [idx]: { ...prev[idx], quantity: Math.max(1, Math.min(maxQty, quantity)) }
    }));
  };

  const calculateRefund = () => {
    if (!selectedBill) return { subtotal: 0, tax: 0, total: 0 };

    let subtotal = 0;
    Object.entries(selectedItems).forEach(([idx, item]) => {
      if (item.selected) {
        const originalItem = selectedBill.items[idx];
        subtotal += originalItem.product.price * item.quantity;
      }
    });

    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),
    };
  };

  const handleProcessReturn = async () => {
    setProcessing(true);

    const returnItems = [];
    Object.entries(selectedItems).forEach(([idx, item]) => {
      if (item.selected) {
        const originalItem = selectedBill.items[idx];
        returnItems.push({
          product: originalItem.product,
          quantity: item.quantity,
          discount: originalItem.discount,
        });
      }
    });

    await new Promise(resolve => setTimeout(resolve, 500));
    onProcessReturn(selectedBill, returnItems);
    setProcessing(false);
    setSelectedBill(null);
    setSelectedItems({});
    setSearchQuery('');
  };

  const hasSelectedItems = Object.values(selectedItems).some(item => item.selected);
  const refund = calculateRefund();

  // Reset selection when modal opens or bill changes
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      itemRefs.current = [];
      if (!selectedBill && searchInputRef.current) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }
    }
  }, [isOpen, selectedBill]);

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
    if (!isOpen) return;

    if (e.target.tagName === 'INPUT') return;

    if (!selectedBill) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredBills.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filteredBills[selectedIndex]) {
        e.preventDefault();
        handleSelectBill(filteredBills[selectedIndex]);
        setSelectedIndex(0);
      }
    } else {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, selectedBill.items.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        toggleItem(selectedIndex);
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        if (selectedItems[selectedIndex]?.selected) {
          updateQuantity(selectedIndex, selectedItems[selectedIndex].quantity + 1);
        }
      } else if (e.key === '-') {
        e.preventDefault();
        if (selectedItems[selectedIndex]?.selected) {
          updateQuantity(selectedIndex, selectedItems[selectedIndex].quantity - 1);
        }
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setSelectedBill(null);
        setSelectedItems({});
        setSelectedIndex(0);
      } else if ((e.key === 'p' || e.key === 'P') && hasSelectedItems && !processing) {
        e.preventDefault();
        handleProcessReturn();
      }
    }
  }, [isOpen, selectedBill, filteredBills, selectedIndex, selectedItems, hasSelectedItems, processing]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Process Return"
      size="lg"
      footer={
        !selectedBill ? (
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close <kbd className="ml-2 text-xs opacity-50">Esc</kbd>
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedBill(null);
                setSelectedItems({});
              }}
              className="flex-1"
            >
              Back <kbd className="ml-2 text-xs opacity-50">Bksp</kbd>
            </Button>
            <Button
              onClick={handleProcessReturn}
              disabled={!hasSelectedItems}
              loading={processing}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
              prefixIcon={RotateCcw}
            >
              Process <kbd className="ml-2 text-xs opacity-50">P</kbd>
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-4 py-4">
        {!selectedBill ? (
          <>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search by bill number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Bills list */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide">
              {filteredBills.length === 0 ? (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                  <RotateCcw size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No bills found</p>
                  <p className="text-sm">Search for a bill to process return</p>
                </div>
              ) : (
                filteredBills.map((bill, index) => (
                  <Button
                    key={bill.id}
                    ref={el => itemRefs.current[index] = el}
                    variant="ghost"
                    size="md"
                    onClick={() => handleSelectBill(bill)}
                    className={`w-full !flex !items-center !justify-between !p-4 !h-auto !min-h-0 !rounded-xl !border-2 !text-left ${index === selectedIndex
                        ? '!border-primary-500 dark:!border-primary-500 !bg-gray-50 dark:!bg-[#1a1a1a]'
                        : '!border-gray-200 dark:!border-[#2a2a2a] hover:!border-primary-300 dark:hover:!border-primary-600 !bg-gray-50 dark:!bg-[#1a1a1a]'
                      }`}
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{bill.id}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(bill.created_at)} | {bill.items.length} items
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        ${bill.totals.total.toFixed(2)}
                      </span>
                      {index === selectedIndex && <kbd className="text-xs text-gray-400">Enter</kbd>}
                    </div>
                  </Button>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            {/* Selected bill header */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{selectedBill.id}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(selectedBill.created_at)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={X}
                iconOnly
                onClick={() => {
                  setSelectedBill(null);
                  setSelectedItems({});
                }}
                className="!text-gray-400 hover:!text-gray-600 dark:hover:!text-gray-300"
              />
            </div>

            {/* Items to return */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Select items to return:
              </p>
              {selectedBill.items.map((item, idx) => (
                <div
                  key={idx}
                  ref={el => itemRefs.current[idx] = el}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${idx === selectedIndex
                      ? 'border-primary-500 dark:border-primary-500'
                      : selectedItems[idx]?.selected
                        ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-600'
                        : 'bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]'
                    }`}
                >
                  <Checkbox
                    checked={selectedItems[idx]?.selected || false}
                    onChange={() => toggleItem(idx)}
                  />
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ${item.product.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  {selectedItems[idx]?.selected && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        iconOnly
                        onClick={() => updateQuantity(idx, selectedItems[idx].quantity - 1)}
                        className="!w-7 !h-7 !min-h-0 !p-0"
                      >
                        -
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {selectedItems[idx].quantity}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        iconOnly
                        onClick={() => updateQuantity(idx, selectedItems[idx].quantity + 1)}
                        className="!w-7 !h-7 !min-h-0 !p-0"
                      >
                        +
                      </Button>
                    </div>
                  )}
                  {idx === selectedIndex && <kbd className="text-xs text-gray-400">Enter</kbd>}
                </div>
              ))}
            </div>

            {/* Refund summary */}
            {hasSelectedItems && (
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-orange-700 dark:text-orange-400">Subtotal</span>
                  <span className="text-orange-700 dark:text-orange-400">${refund.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-orange-700 dark:text-orange-400">Tax</span>
                  <span className="text-orange-700 dark:text-orange-400">${refund.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-orange-200 dark:border-orange-800">
                  <span className="text-orange-700 dark:text-orange-400">Refund Total</span>
                  <span className="text-orange-700 dark:text-orange-400">${refund.total.toFixed(2)}</span>
                </div>
              </div>
            )}

          </>
        )}
      </div>
    </Modal>
  );
};

export default ReturnsModal;
