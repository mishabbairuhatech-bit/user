import { useState, useEffect, useCallback, useRef } from 'react';
import { Receipt, X } from 'lucide-react';
import { Modal, Button } from '@components/ui';
import { useSettings } from '@hooks';
import usePOS from '../grid-view/hooks/usePOS';

// Table-view components
import TableHeader from './components/TableHeader';
import BarcodeInput from './components/BarcodeInput';
import BillingTable from './components/BillingTable';
import TotalsPanel from './components/TotalsPanel';
import ActionBar from './components/ActionBar';
import HeldBillsSidebar from './components/HeldBillsSidebar';
import ReturnsSidebar from './components/ReturnsSidebar';

// Reuse modals from grid-view
import GridBillPreview from '../grid-view/components/GridBillPreview';
import GridDailyReportModal from '../grid-view/components/GridDailyReportModal';
import GridHeldBillsWarningModal from '../grid-view/components/GridHeldBillsWarningModal';

const TablePOSPage = () => {
  const { settings } = useSettings();
  const isSummaryLeft = settings.posSummaryPosition === 'left';

  const {
    cart,
    customer,
    discount,
    discountType,
    heldBills,
    completedBills,
    setCustomer,
    setDiscount,
    setDiscountType,
    addToCart,
    updateQuantity,
    updateItemDiscount,
    updateItemDiscountType,
    removeFromCart,
    clearCart,
    calculateTotals,
    holdBill,
    resumeBill,
    deleteHeldBill,
    completeSale,
    processReturn,
    getDailyReport,
  } = usePOS();

  // UI state
  const [selectedRowIndex, setSelectedRowIndex] = useState(-1);
  const [showPayment, setShowPayment] = useState(false);
  const [showHeldBills, setShowHeldBills] = useState(false);
  const [showReturns, setShowReturns] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [completedBill, setCompletedBill] = useState(null);
  const [cartWarningContext, setCartWarningContext] = useState(null);

  // Inline editing state — 'qty' | 'discount' | null
  const [editingField, setEditingField] = useState(null);

  // Mobile state
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

  const barcodeInputRef = useRef(null);
  const cartDiscountRef = useRef(null);
  const totals = calculateTotals();

  // Focus barcode input on mount
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Track mobile breakpoint
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset selected row when cart changes
  useEffect(() => {
    if (cart.length === 0) {
      setSelectedRowIndex(-1);
      setEditingField(null);
    } else if (selectedRowIndex >= cart.length) {
      setSelectedRowIndex(cart.length - 1);
    }
  }, [cart.length, selectedRowIndex]);

  // Auto-close held bills sidebar when cart gets items
  useEffect(() => {
    if (showHeldBills && cart.length > 0) {
      setShowHeldBills(false);
    }
  }, [cart.length, showHeldBills]);

  // Clear editing when row changes
  useEffect(() => {
    setEditingField(null);
  }, [selectedRowIndex]);

  // Handlers
  const handleAddItem = useCallback((product) => {
    addToCart(product);
    setSelectedRowIndex(cart.length);
  }, [addToCart, cart.length]);

  const handleHoldBill = useCallback(() => {
    holdBill();
    setShowHeldBills(true);
  }, [holdBill]);

  const handleOpenHeldBills = useCallback(() => {
    if (showHeldBills) {
      setShowHeldBills(false);
      return;
    }
    setShowReturns(false);
    if (cart.length > 0) {
      setCartWarningContext('heldBills');
    } else {
      setShowHeldBills(true);
    }
  }, [showHeldBills, cart.length]);

  const handleOpenReturns = useCallback(() => {
    if (showReturns) {
      setShowReturns(false);
      return;
    }
    setShowHeldBills(false);
    setShowPayment(false);
    if (cart.length > 0) {
      setCartWarningContext('returns');
    } else {
      setShowReturns(true);
    }
  }, [showReturns, cart.length]);

  const handleWarningHoldBill = useCallback(() => {
    const ctx = cartWarningContext;
    holdBill();
    setCartWarningContext(null);
    if (ctx === 'returns') setShowReturns(true);
    else setShowHeldBills(true);
  }, [holdBill, cartWarningContext]);

  const handleWarningClearCart = useCallback(() => {
    const ctx = cartWarningContext;
    clearCart();
    setCartWarningContext(null);
    if (ctx === 'returns') setShowReturns(true);
    else setShowHeldBills(true);
  }, [clearCart, cartWarningContext]);

  const handleResumeBill = useCallback((billId) => {
    resumeBill(billId);
    setShowHeldBills(false);
  }, [resumeBill]);

  const handleCheckout = useCallback(() => {
    if (cart.length > 0) {
      setShowPayment(true);
      setShowHeldBills(false);
      setShowReturns(false);
    }
  }, [cart.length]);

  const handleCompleteSale = useCallback((paymentMethod, amountTendered) => {
    const bill = completeSale(paymentMethod, amountTendered);
    if (bill) {
      setShowPayment(false);
      setCompletedBill(bill);
    }
  }, [completeSale]);

  const handleProcessReturn = useCallback((originalBill, returnItems) => {
    const returnBill = processReturn(originalBill, returnItems);
    if (returnBill) {
      setShowReturns(false);
      setCompletedBill(returnBill);
    }
  }, [processReturn]);

  const isAnyModalOpen = cartWarningContext || showReportModal || completedBill || showShortcutsModal;

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    // Skip all keyboard shortcuts on mobile
    if (window.innerWidth < 768) return;

    // Skip if in input (except F-keys and Ctrl/Cmd combos)
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      if (!e.key.startsWith('F') && !(e.ctrlKey || e.metaKey)) return;
    }

    // When payment is active — ActionBar handles its own keys via capture phase
    if (showPayment) {
      if (e.key === 'F8' || ((e.ctrlKey || e.metaKey) && e.key === 'Enter')) {
        e.preventDefault();
        setShowPayment(false);
        return;
      }
      return;
    }

    // When returns sidebar is active — it handles its own keys via capture phase
    if (showReturns) {
      if (e.key === 'F3' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r')) {
        e.preventDefault();
        setShowReturns(false);
        return;
      }
      return;
    }

    // Escape
    if (e.key === 'Escape') {
      if (completedBill) setCompletedBill(null);
      else if (cartWarningContext) setCartWarningContext(null);
      else if (showReportModal) setShowReportModal(false);
      else if (showShortcutsModal) setShowShortcutsModal(false);
      else if (showHeldBills) setShowHeldBills(false);
      else if (editingField) setEditingField(null);
      else if (selectedRowIndex >= 0) {
        setSelectedRowIndex(-1);
        barcodeInputRef.current?.focus();
      }
      return;
    }

    // F1 / ? — shortcuts
    if (e.key === 'F1' || (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey)) {
      e.preventDefault();
      setShowShortcutsModal((prev) => !prev);
      return;
    }

    // F2 / Cmd+S — Hold bill
    if (e.key === 'F2' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's')) {
      e.preventDefault();
      if (cart.length > 0) handleHoldBill();
      return;
    }

    // F3 / Cmd+R — Returns
    if (e.key === 'F3' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r')) {
      e.preventDefault();
      if (!cartWarningContext) handleOpenReturns();
      return;
    }

    // F4 / Cmd+E — Reports
    if (e.key === 'F4' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e')) {
      e.preventDefault();
      setShowReportModal((prev) => !prev);
      return;
    }

    // F5 / Cmd+H — Held bills
    if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h')) {
      e.preventDefault();
      if (!cartWarningContext) handleOpenHeldBills();
      return;
    }

    // F6 — Focus barcode input
    if (e.key === 'F6') {
      e.preventDefault();
      setSelectedRowIndex(-1);
      barcodeInputRef.current?.focus();
      return;
    }

    // F8 / Cmd+Enter — Checkout
    if (e.key === 'F8' || ((e.ctrlKey || e.metaKey) && e.key === 'Enter')) {
      e.preventDefault();
      if (cart.length > 0) handleCheckout();
      return;
    }

    // F9 / Cmd+Backspace — Clear
    if (e.key === 'F9' || ((e.ctrlKey || e.metaKey) && e.key === 'Backspace')) {
      e.preventDefault();
      clearCart();
      return;
    }

    // Don't process more shortcuts when modals are open
    if (isAnyModalOpen) return;

    // Table navigation (when not in an input and not editing)
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      // Tab — cycle: barcode ↔ table
      if (e.key === 'Tab') {
        e.preventDefault();
        if (selectedRowIndex >= 0) {
          // Table → Barcode
          setSelectedRowIndex(-1);
          barcodeInputRef.current?.focus();
        } else if (cart.length > 0) {
          // Barcode → Table
          setSelectedRowIndex(0);
          barcodeInputRef.current?.blur();
        }
        return;
      }

      // "/" — Focus barcode input
      if (e.key === '/') {
        e.preventDefault();
        setSelectedRowIndex(-1);
        barcodeInputRef.current?.focus();
        return;
      }

      if (cart.length > 0 && !showHeldBills) {
        // Arrow navigation
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedRowIndex((prev) => {
            if (prev < 0) return 0;
            return Math.min(prev + 1, cart.length - 1);
          });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (selectedRowIndex <= 0) {
            setSelectedRowIndex(-1);
            barcodeInputRef.current?.focus();
          } else {
            setSelectedRowIndex((prev) => Math.max(prev - 1, 0));
          }
        }

        // Actions on selected row
        if (selectedRowIndex >= 0) {
          const item = cart[selectedRowIndex];
          if (!item) return;

          // + / = — Increase qty
          if (e.key === '+' || e.key === '=') {
            e.preventDefault();
            updateQuantity(item.product.id, item.quantity + 1);
          }
          // - — Decrease qty
          else if (e.key === '-') {
            e.preventDefault();
            updateQuantity(item.product.id, item.quantity - 1);
          }
          // Delete / Backspace — Remove item
          else if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            removeFromCart(item.product.id);
            setSelectedRowIndex((prev) => Math.min(prev, cart.length - 2));
          }
          // Q or Enter — Edit quantity
          else if (e.key === 'q' || e.key === 'Q' || e.key === 'Enter') {
            e.preventDefault();
            setEditingField(null);
            setTimeout(() => setEditingField('qty'), 0);
          }
          // D — Edit discount
          else if (e.key === 'd' || e.key === 'D') {
            e.preventDefault();
            setEditingField(null);
            setTimeout(() => setEditingField('discount'), 0);
          }
          // S — Toggle discount type (% / $)
          else if (e.key === 's' || e.key === 'S') {
            e.preventDefault();
            updateItemDiscountType(item.product.id, item.discountType === 'percent' ? 'fixed' : 'percent');
          }
          // T — Focus cart discount input
          else if (e.key === 't' || e.key === 'T') {
            e.preventDefault();
            cartDiscountRef.current?.focus();
            cartDiscountRef.current?.select();
          }
          // Y — Toggle cart discount type
          else if (e.key === 'y' || e.key === 'Y') {
            e.preventDefault();
            setDiscountType((prev) => (prev === 'percent' ? 'fixed' : 'percent'));
          }
        }
      }
    }
  }, [
    showPayment, showReturns, completedBill, cartWarningContext, showReportModal,
    showShortcutsModal, showHeldBills, selectedRowIndex, cart, isAnyModalOpen,
    editingField, handleHoldBill, handleOpenReturns, handleOpenHeldBills,
    handleCheckout, clearCart, updateQuantity, removeFromCart, updateItemDiscountType,
    setDiscountType,
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-[#0a0a0a]">
      {/* Header */}
      <TableHeader
        heldBillsCount={heldBills.length}
        onHoldBillsClick={handleOpenHeldBills}
        isHeldBillsActive={showHeldBills}
        isReturnsActive={showReturns}
        onReportsClick={() => setShowReportModal(true)}
        onReturnsClick={handleOpenReturns}
        onKeyboardClick={() => setShowShortcutsModal(true)}
      />

      {/* Barcode Input Bar */}
      <BarcodeInput
        onAddItem={handleAddItem}
        inputRef={barcodeInputRef}
        customer={customer}
        onCustomerChange={setCustomer}
        reversed={isSummaryLeft}
      />

      {/* Main Content: Table + Totals Panel */}
      <div className={`flex-1 flex overflow-hidden relative ${isSummaryLeft ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Billing Table */}
        <BillingTable
          cart={cart}
          onUpdateQuantity={updateQuantity}
          onUpdateItemDiscount={updateItemDiscount}
          onUpdateItemDiscountType={updateItemDiscountType}
          onRemove={removeFromCart}
          selectedIndex={selectedRowIndex}
          onSelectIndex={setSelectedRowIndex}
          editingField={editingField}
          onEditDone={() => setEditingField(null)}
        />

        {/* Totals Panel */}
        <TotalsPanel
          totals={totals}
          cart={cart}
          discount={discount}
          discountType={discountType}
          onSetDiscount={setDiscount}
          onSetDiscountType={setDiscountType}
          position={isSummaryLeft ? 'left' : 'right'}
          cartDiscountRef={cartDiscountRef}
        />

        {/* Held Bills Sidebar (overlay) */}
        <HeldBillsSidebar
          isOpen={showHeldBills}
          heldBills={heldBills}
          onResume={handleResumeBill}
          onDelete={deleteHeldBill}
          onClose={() => setShowHeldBills(false)}
          position={isSummaryLeft ? 'left' : 'right'}
        />

        {/* Returns Sidebar (overlay) */}
        <ReturnsSidebar
          isOpen={showReturns}
          completedBills={completedBills}
          onProcessReturn={handleProcessReturn}
          onClose={() => setShowReturns(false)}
          position={isSummaryLeft ? 'left' : 'right'}
        />
      </div>

      {/* Action Bar / Payment Bar */}
      <ActionBar
        cart={cart}
        totals={totals}
        onHold={handleHoldBill}
        onClear={clearCart}
        onCompleteSale={handleCompleteSale}
        showPayment={showPayment}
        onTogglePayment={() => {
          if (showPayment) setShowPayment(false);
          else if (cart.length > 0) handleCheckout();
        }}
      />

      {/* Mobile Summary FAB */}
      {isMobile && cart.length > 0 && !showMobileSummary && !showPayment && (
        <div className="md:hidden fixed bottom-20 right-4 z-40">
          <Button
            variant="primary"
            size="lg"
            onClick={() => setShowMobileSummary(true)}
            className="!w-14 !h-14 !rounded-full shadow-lg !p-0 relative"
          >
            <Receipt size={22} />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {totals.itemCount}
            </span>
          </Button>
        </div>
      )}

      {/* Mobile Summary Drawer */}
      {showMobileSummary && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileSummary(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[75vh] bg-white dark:bg-[#121212] rounded-t-2xl overflow-hidden flex flex-col">
            {/* Handle */}
            <div className="flex justify-center py-2 shrink-0">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-4 pb-2 shrink-0">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Bill Summary</h3>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Items</span>
                <span className="font-semibold text-gray-900 dark:text-white">{cart.length} ({totals.itemCount} pcs)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Gross Total</span>
                <span className="font-semibold text-gray-900 dark:text-white font-mono">${totals.grossTotal.toFixed(2)}</span>
              </div>
              {totals.itemDiscountTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Item Discounts</span>
                  <span className="font-semibold text-green-600 dark:text-green-400 font-mono">-${totals.itemDiscountTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                <span className="font-semibold text-gray-900 dark:text-white font-mono">${totals.subtotal.toFixed(2)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Cart Discount</span>
                  <span className="font-semibold text-green-600 dark:text-green-400 font-mono">-${totals.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Tax (5%)</span>
                <span className="font-semibold text-gray-900 dark:text-white font-mono">${totals.tax.toFixed(2)}</span>
              </div>
              <div className="border-t-2 border-dashed border-gray-200 dark:border-[#333] !mt-4 !mb-2" />
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-gray-900 dark:text-white">TOTAL</span>
                <span className="text-2xl font-extrabold text-primary-600 dark:text-primary-400 font-mono">${totals.total.toFixed(2)}</span>
              </div>

              {/* Cart Discount input */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Cart Discount</span>
                <div className="flex items-center bg-white dark:bg-[#1a1a1a] rounded border border-gray-200 dark:border-[#333] overflow-hidden h-8">
                  <input
                    type="number"
                    min="0"
                    value={discount || ''}
                    onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-14 h-full text-xs text-center bg-transparent border-none outline-none text-gray-900 dark:text-white font-mono"
                  />
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="h-full px-1.5 text-xs bg-gray-50 dark:bg-[#0d0d0d] border-l border-gray-200 dark:border-[#333] outline-none text-gray-500 dark:text-gray-400"
                  >
                    <option value="percent">%</option>
                    <option value="fixed">$</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 !mt-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowMobileSummary(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    setShowMobileSummary(false);
                    handleCheckout();
                  }}
                  disabled={cart.length === 0}
                  className="flex-1"
                >
                  Checkout · ${totals.total.toFixed(2)}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals (reused from grid-view) */}
      <GridHeldBillsWarningModal
        isOpen={!!cartWarningContext}
        onClose={() => setCartWarningContext(null)}
        onHoldBill={handleWarningHoldBill}
        onClearCart={handleWarningClearCart}
        context={cartWarningContext}
      />

      <GridBillPreview
        isOpen={!!completedBill}
        onClose={() => setCompletedBill(null)}
        bill={completedBill}
      />

      <GridDailyReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        report={getDailyReport()}
      />

      {/* Keyboard Shortcuts Modal */}
      <Modal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
        title="Keyboard Shortcuts"
        size="md"
        footer={
          <p className="text-xs text-gray-400 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">F1</kbd> or <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">?</kbd> to toggle
          </p>
        }
      >
        <div className="space-y-4 py-4">
          {/* Section nav */}
          <div className="flex items-center justify-between text-sm pb-3 border-b border-gray-200 dark:border-[#2a2a2a]">
            <span className="font-medium text-gray-700 dark:text-gray-300">Switch Sections</span>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">Tab</kbd>
              <span className="text-gray-500 dark:text-gray-400 text-xs">Barcode ↔ Table</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Table Navigation</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Focus barcode</span><span className="flex gap-1"><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">F6</kbd><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">/</kbd></span></div>
                <div className="flex justify-between"><span className="text-gray-500">Navigate rows</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">↑ ↓</kbd></div>
                <div className="flex justify-between"><span className="text-gray-500">Qty +/-</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">+ -</kbd></div>
                <div className="flex justify-between"><span className="text-gray-500">Edit quantity</span><span className="flex gap-1"><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">Q</kbd><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">Enter</kbd></span></div>
                <div className="flex justify-between"><span className="text-gray-500">Edit discount</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">D</kbd></div>
                <div className="flex justify-between"><span className="text-gray-500">Item % / $</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">S</kbd></div>
                <div className="flex justify-between"><span className="text-gray-500">Cart discount</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">T</kbd></div>
                <div className="flex justify-between"><span className="text-gray-500">Cart % / $</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">Y</kbd></div>
                <div className="flex justify-between"><span className="text-gray-500">Remove item</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">Del</kbd></div>
                <div className="flex justify-between"><span className="text-gray-500">Deselect row</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">Esc</kbd></div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Actions</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Shortcuts</span><span className="flex gap-1"><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">F1</kbd><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">?</kbd></span></div>
                <div className="flex justify-between"><span className="text-gray-500">Hold Bill</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">F2</kbd></div>
                <div className="flex justify-between"><span className="text-gray-500">Returns</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">F3</kbd></div>
                <div className="flex justify-between"><span className="text-gray-500">Reports</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">F4</kbd></div>
                <div className="flex justify-between"><span className="text-gray-500">Held Bills</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">F5</kbd></div>
                <div className="flex justify-between"><span className="text-gray-500">Checkout</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">F8</kbd></div>
                <div className="flex justify-between"><span className="text-gray-500">Clear Cart</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">F9</kbd></div>
              </div>

              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">Payment</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Select method</span><span className="flex gap-1"><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">1</kbd><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">2</kbd><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">3</kbd></span></div>
                <div className="flex justify-between"><span className="text-gray-500">Navigate</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">← →</kbd></div>
                <div className="flex justify-between"><span className="text-gray-500">Quick amounts</span><span className="flex gap-1"><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">4-7</kbd></span></div>
                <div className="flex justify-between"><span className="text-gray-500">Exact amount</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">E</kbd></div>
                <div className="flex justify-between"><span className="text-gray-500">Focus input</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">Tab</kbd></div>
                <div className="flex justify-between"><span className="text-gray-500">Complete</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">Enter</kbd></div>
                <div className="flex justify-between"><span className="text-gray-500">Cancel</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">Esc</kbd></div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TablePOSPage;
