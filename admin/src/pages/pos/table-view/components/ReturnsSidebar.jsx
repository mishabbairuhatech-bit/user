import { useState, useEffect, useRef } from 'react';
import { Search, RotateCcw, X, Check } from 'lucide-react';
import { Button } from '@components/ui';
import { TAX_RATE } from '../../grid-view/data/mockData';

const ReturnsSidebar = ({ isOpen, completedBills, onProcessReturn, onClose, position = 'right' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [processing, setProcessing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef(null);
  const itemRefs = useRef([]);

  const filteredBills = completedBills
    .filter((bill) => bill.type !== 'return')
    .filter((bill) => bill.id.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 20);

  const handleSelectBill = (bill) => {
    setSelectedBill(bill);
    const items = {};
    bill.items.forEach((_, idx) => {
      items[idx] = { selected: false, quantity: bill.items[idx].quantity };
    });
    setSelectedItems(items);
    setSelectedIndex(0);
  };

  const toggleItem = (idx) => {
    setSelectedItems((prev) => ({
      ...prev,
      [idx]: { ...prev[idx], selected: !prev[idx].selected },
    }));
  };

  const updateQty = (idx, qty) => {
    const maxQty = selectedBill.items[idx].quantity;
    setSelectedItems((prev) => ({
      ...prev,
      [idx]: { ...prev[idx], quantity: Math.max(1, Math.min(maxQty, qty)) },
    }));
  };

  const hasSelectedItems = Object.values(selectedItems).some((i) => i.selected);

  const refund = (() => {
    if (!selectedBill) return { subtotal: 0, tax: 0, total: 0 };
    let subtotal = 0;
    Object.entries(selectedItems).forEach(([idx, item]) => {
      if (item.selected) subtotal += selectedBill.items[idx].product.price * item.quantity;
    });
    const tax = subtotal * TAX_RATE;
    return { subtotal: +subtotal.toFixed(2), tax: +tax.toFixed(2), total: +(subtotal + tax).toFixed(2) };
  })();

  const handleProcessReturn = async () => {
    if (!hasSelectedItems || processing) return;
    setProcessing(true);
    const returnItems = [];
    Object.entries(selectedItems).forEach(([idx, item]) => {
      if (item.selected) {
        const orig = selectedBill.items[idx];
        returnItems.push({ product: orig.product, quantity: item.quantity, discount: orig.discount });
      }
    });
    await new Promise((r) => setTimeout(r, 500));
    onProcessReturn(selectedBill, returnItems);
    setProcessing(false);
    setSelectedBill(null);
    setSearchQuery('');
  };

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedBill(null);
      setSelectedItems({});
      setSelectedIndex(0);
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Scroll selected into view
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedIndex]);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Full keyboard navigation (capture phase)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Escape handling
      if (e.key === 'Escape') {
        if (selectedBill) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          setSelectedBill(null);
          setSelectedItems({});
          setSelectedIndex(0);
          setTimeout(() => searchRef.current?.focus(), 50);
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        onClose();
        return;
      }

      // F3 / Cmd+R — close
      if (e.key === 'F3' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        onClose();
        return;
      }

      // Block other F-keys
      if (e.key.startsWith('F') && e.key !== 'F1') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // If in search input
      if (e.target.tagName === 'INPUT') {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          e.stopPropagation();
          if (!selectedBill && filteredBills.length > 0) {
            e.target.blur();
            setSelectedIndex(0);
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          if (!selectedBill && filteredBills[0]) {
            handleSelectBill(filteredBills[0]);
          }
        }
        return;
      }

      // Bill list navigation (no bill selected)
      if (!selectedBill) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex((prev) => Math.min(prev + 1, filteredBills.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          e.stopPropagation();
          if (selectedIndex === 0) {
            searchRef.current?.focus();
          } else {
            setSelectedIndex((prev) => Math.max(prev - 1, 0));
          }
        } else if (e.key === 'Enter' && filteredBills[selectedIndex]) {
          e.preventDefault();
          e.stopPropagation();
          handleSelectBill(filteredBills[selectedIndex]);
        }
        // Block Tab
        if (e.key === 'Tab') { e.preventDefault(); e.stopPropagation(); }
        return;
      }

      // Item selection navigation (bill selected)
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => Math.min(prev + 1, selectedBill.items.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        toggleItem(selectedIndex);
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        e.stopPropagation();
        if (selectedItems[selectedIndex]?.selected) {
          updateQty(selectedIndex, selectedItems[selectedIndex].quantity + 1);
        }
      } else if (e.key === '-') {
        e.preventDefault();
        e.stopPropagation();
        if (selectedItems[selectedIndex]?.selected) {
          updateQty(selectedIndex, selectedItems[selectedIndex].quantity - 1);
        }
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedBill(null);
        setSelectedItems({});
        setSelectedIndex(0);
        setTimeout(() => searchRef.current?.focus(), 50);
      } else if ((e.key === 'p' || e.key === 'P') && hasSelectedItems && !processing) {
        e.preventDefault();
        e.stopPropagation();
        handleProcessReturn();
      }

      // Block Tab
      if (e.key === 'Tab') { e.preventDefault(); e.stopPropagation(); }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, selectedBill, filteredBills, selectedIndex, selectedItems, hasSelectedItems, processing, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`absolute top-0 bottom-0 w-full md:w-[380px] bg-white dark:bg-[#121212] z-30 flex flex-col shadow-2xl ${
      position === 'left'
        ? 'left-0 md:border-r border-gray-200 dark:border-[#2a2a2a]'
        : 'right-0 md:border-l border-gray-200 dark:border-[#2a2a2a]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-gray-200 dark:border-[#2a2a2a] shrink-0">
        <div className="flex items-center gap-2">
          <RotateCcw size={16} className="text-primary-500" />
          <span className="font-bold text-sm text-gray-900 dark:text-white">Returns</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-[#2a2a2a] px-1.5 py-0.5 rounded">
            ↑↓ Enter {selectedBill ? '+- P Bksp' : ''}
          </span>
          <Button variant="ghost" size="sm" icon={X} iconOnly onClick={onClose} />
        </div>
      </div>

      {!selectedBill ? (
        <>
          {/* Search */}
          <div className="px-3 pt-3 pb-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search bill number..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSelectedIndex(0); }}
                className="w-full h-9 pl-9 pr-8 text-sm bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-lg outline-none text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setSelectedIndex(0); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-white hover:bg-gray-400"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          </div>

          {/* Bills list */}
          <div className="flex-1 overflow-y-auto px-3 pb-8 md:pb-3 space-y-1.5 scrollbar-hide">
            {filteredBills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <RotateCcw size={40} className="mb-3 opacity-50" />
                <p className="text-sm font-medium">No bills found</p>
              </div>
            ) : (
              filteredBills.map((bill, index) => (
                <button
                  key={bill.id}
                  ref={(el) => (itemRefs.current[index] = el)}
                  onClick={() => handleSelectBill(bill)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 text-left transition-colors ${
                    index === selectedIndex
                      ? 'border-primary-400 bg-primary-50/50 dark:bg-primary-900/10'
                      : 'border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1a1a1a] hover:border-gray-200'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{bill.id}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">{formatDate(bill.created_at)} · {bill.items.length} items</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                      ${bill.totals.total.toFixed(2)}
                    </span>
                    {index === selectedIndex && (
                      <kbd className="text-[10px] text-gray-400 bg-gray-100 dark:bg-[#2a2a2a] px-1 rounded">↵</kbd>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="shrink-0 p-3 border-t border-gray-200 dark:border-[#2a2a2a] hidden md:block">
            <Button variant="outline" size="sm" onClick={onClose} className="w-full">
              Cancel <kbd className="ml-1 text-[10px] opacity-50">Esc</kbd>
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Selected bill header */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#2a2a2a] shrink-0">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedBill.id}</p>
              <p className="text-[11px] text-gray-500">{formatDate(selectedBill.created_at)}</p>
            </div>
            <Button variant="ghost" size="sm" icon={X} iconOnly onClick={() => { setSelectedBill(null); setSelectedItems({}); }} />
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 scrollbar-hide">
            <p className="text-[11px] font-medium text-gray-500 px-1 mb-1">Select items to return:</p>
            {selectedBill.items.map((item, idx) => (
              <div
                key={idx}
                ref={(el) => (itemRefs.current[idx] = el)}
                onClick={() => { setSelectedIndex(idx); toggleItem(idx); }}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                  idx === selectedIndex
                    ? 'border-primary-400 dark:border-primary-500'
                    : selectedItems[idx]?.selected
                      ? 'border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10'
                      : 'border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1a1a1a]'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                  selectedItems[idx]?.selected ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-300 dark:border-[#444]'
                }`}>
                  {selectedItems[idx]?.selected && <Check size={12} />}
                </div>
                <img src={item.product.image} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{item.product.name}</p>
                  <p className="text-[11px] text-gray-500">${item.product.price.toFixed(2)} x {item.quantity}</p>
                </div>
                {selectedItems[idx]?.selected && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); updateQty(idx, selectedItems[idx].quantity - 1); }} className="w-6 h-6 rounded bg-gray-200 dark:bg-[#2a2a2a] flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">-</button>
                    <span className="w-5 text-center text-xs font-semibold text-gray-900 dark:text-white">{selectedItems[idx].quantity}</span>
                    <button onClick={(e) => { e.stopPropagation(); updateQty(idx, selectedItems[idx].quantity + 1); }} className="w-6 h-6 rounded bg-gray-200 dark:bg-[#2a2a2a] flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">+</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Refund + Actions */}
          <div className="shrink-0 border-t border-gray-200 dark:border-[#2a2a2a] px-4 py-3 space-y-3">
            {hasSelectedItems && (
              <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-primary-600 dark:text-primary-400">Subtotal</span>
                  <span className="text-primary-600 dark:text-primary-400">${refund.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-primary-600 dark:text-primary-400">Tax</span>
                  <span className="text-primary-600 dark:text-primary-400">${refund.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-1.5 border-t border-primary-200 dark:border-primary-800">
                  <span className="text-primary-700 dark:text-primary-300">Refund Total</span>
                  <span className="text-primary-700 dark:text-primary-300">${refund.total.toFixed(2)}</span>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setSelectedBill(null); setSelectedItems({}); setSelectedIndex(0); }}>
                Back <kbd className="hidden md:inline text-[10px] opacity-50">Bksp</kbd>
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleProcessReturn}
                disabled={!hasSelectedItems || processing}
                loading={processing}
                prefixIcon={!processing ? RotateCcw : undefined}
                className="flex-1"
              >
                {processing ? 'Processing...' : 'Process Return'}
                {!processing && <kbd className="hidden md:inline text-[10px] opacity-50 ml-1">P</kbd>}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReturnsSidebar;
