import { useState, useMemo, useEffect, useCallback } from 'react';
import { ShoppingCart, LayoutGrid, Home, Clock, Bookmark, Settings, Pause, RotateCcw, BarChart3, Keyboard, Search, X } from 'lucide-react';
import { categories, products } from './data/mockData';
import { Modal, Input } from '@components/ui';
import usePOS from './hooks/usePOS';
import POSHeader from './components/POSHeader';
import CategoryTabs from './components/CategoryTabs';
import ProductGrid from './components/ProductGrid';
import CartPanel from './components/CartPanel';
import PaymentModal from './components/PaymentModal';
import HoldBillsModal from './components/HoldBillsModal';
import BillPreview from './components/BillPreview';
import ReturnsModal from './components/ReturnsModal';
import DailyReportModal from './components/DailyReportModal';

const POSPage = () => {
  // POS hook
  const {
    cart,
    discount,
    discountType,
    heldBills,
    completedBills,
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

  // Local state
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileCart, setShowMobileCart] = useState(false);

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHoldBillsModal, setShowHoldBillsModal] = useState(false);
  const [showReturnsModal, setShowReturnsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [completedBill, setCompletedBill] = useState(null);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [gridColumns, setGridColumns] = useState(4);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [selectedCartIndex, setSelectedCartIndex] = useState(-1);
  const [focusSection, setFocusSection] = useState('products'); // 'categories', 'products', 'cart'
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0); // 0 = All, 1+ = categories
  const [showDiscountIndex, setShowDiscountIndex] = useState(-1); // which cart item has discount input open
  const [focusCartDiscount, setFocusCartDiscount] = useState(false);

  // Calculate grid columns based on screen width
  useEffect(() => {
    const calculateColumns = () => {
      const width = window.innerWidth;
      // Match the grid breakpoints: grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 4xl:grid-cols-7
      if (width >= 2560) return 7;       // 4xl
      if (width >= 1920) return 6;       // 3xl
      if (width >= 1536) return 5;       // 2xl
      if (width >= 1280) return 4;       // xl
      if (width >= 1024) return 3;       // lg
      return 2;                          // md and below
    };

    const handleResize = () => {
      setGridColumns(calculateColumns());
    };

    handleResize(); // Initial calculation
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = activeCategory === null || product.category_id === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch && product.is_active;
    });
  }, [activeCategory, searchQuery]);

  // Calculate totals
  const totals = calculateTotals();

  // Handlers
  const handleHoldBill = () => {
    holdBill();
  };

  const handleCheckout = () => {
    if (cart.length > 0) {
      setShowPaymentModal(true);
    }
  };

  const handleCompleteSale = (paymentMethod, amountTendered) => {
    const bill = completeSale(paymentMethod, amountTendered);
    if (bill) {
      setShowPaymentModal(false);
      setCompletedBill(bill);
    }
  };

  const handleProcessReturn = (originalBill, returnItems) => {
    const returnBill = processReturn(originalBill, returnItems);
    if (returnBill) {
      setShowReturnsModal(false);
      setCompletedBill(returnBill);
    }
  };

  // Check if any modal is open
  const isAnyModalOpen = showPaymentModal || showHoldBillsModal || showReturnsModal || showReportModal || completedBill || showShortcutsModal;

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback((e) => {
    // Skip if typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    // Close modals with Escape
    if (e.key === 'Escape') {
      if (completedBill) {
        setCompletedBill(null);
      } else if (showPaymentModal) {
        setShowPaymentModal(false);
      } else if (showHoldBillsModal) {
        setShowHoldBillsModal(false);
      } else if (showReturnsModal) {
        setShowReturnsModal(false);
      } else if (showReportModal) {
        setShowReportModal(false);
      } else if (showShortcutsModal) {
        setShowShortcutsModal(false);
      } else if (isSearchMode || searchQuery) {
        setIsSearchMode(false);
        setSearchQuery('');
      } else if (selectedCartIndex >= 0) {
        setSelectedCartIndex(-1);
      }
      return;
    }

    // F1 or ? to toggle shortcuts modal (works even when modal is open)
    // On Mac, F1 is intercepted by the OS (brightness), so ? (Shift+/) is the alternative
    if (e.key === 'F1' || (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey)) {
      e.preventDefault();
      setShowShortcutsModal(prev => !prev);
      return;
    }

    // Function keys - toggle modals (work even when modal is open)
    if (e.key === 'F3' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r')) { // Mac: Cmd+R, Win: Ctrl+R
      e.preventDefault();
      setShowReturnsModal(prev => !prev);
      return;
    } else if (e.key === 'F4' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e')) { // Mac: Cmd+E, Win: Ctrl+E
      e.preventDefault();
      setShowReportModal(prev => !prev);
      return;
    } else if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h')) { // Mac: Cmd+H is native hide, but typically apps bind Ctrl+H or similar
      // To play nice with Mac OS 'Hide' shortcut, let's also support Alt+H
      e.preventDefault();
      setShowHoldBillsModal(prev => !prev);
      return;
    } else if (e.key === 'F8' || ((e.ctrlKey || e.metaKey) && e.key === 'Enter')) { // Cmd+Enter
      e.preventDefault();
      if (showPaymentModal) {
        setShowPaymentModal(false);
      } else if (cart.length > 0) {
        setShowPaymentModal(true);
      }
      return;
    }

    // Don't process other shortcuts if modal is open
    if (isAnyModalOpen) return;

    // Function keys that are actions (not modals)
    if (e.key === 'F2' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's')) { // Save / Suspend / Hold
      e.preventDefault();
      if (cart.length > 0) {
        handleHoldBill();
        setShowHoldBillsModal(true);
      }
    } else if (e.key === 'F9' || ((e.ctrlKey || e.metaKey) && e.key === 'Backspace')) { // Clear
      e.preventDefault();
      clearCart();
    }

    // Category shortcuts (Alt + 1-9, 0 for 10th)
    if (e.altKey && e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      const keyNum = e.key === '0' ? 10 : parseInt(e.key);
      const catIndex = keyNum - 1; // 0-based index (1 = All, 2 = first category, etc.)

      if (catIndex === 0) {
        setActiveCategory(null); // All
      } else if (categories[catIndex - 1]) {
        setActiveCategory(categories[catIndex - 1].id);
      }
      setSelectedProductIndex(0);
    }

    // "/" to toggle search mode
    if (e.key === '/') {
      e.preventDefault();
      setIsSearchMode(prev => {
        if (prev) {
          setSearchQuery('');
          return false;
        }
        setSelectedCartIndex(-1);
        return true;
      });
      return;
    }

    // Search mode - type letters to filter
    if (isSearchMode) {
      if (e.key.length === 1 && e.key.match(/[a-zA-Z0-9 ]/)) {
        e.preventDefault();
        setSearchQuery(prev => prev + e.key);
        setSelectedProductIndex(0);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setSearchQuery(prev => prev.slice(0, -1));
        setSelectedProductIndex(0);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        setIsSearchMode(false);
      }
      return;
    }

    // Tab to cycle through sections: categories -> products -> cart
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        // Shift+Tab: reverse direction
        if (focusSection === 'categories') {
          if (cart.length > 0) {
            setFocusSection('cart');
            setSelectedCartIndex(0);
          } else {
            setFocusSection('products');
          }
        } else if (focusSection === 'products') {
          setFocusSection('categories');
        } else if (focusSection === 'cart') {
          setFocusSection('products');
          setSelectedCartIndex(-1);
          setShowDiscountIndex(-1);
        }
      } else {
        // Tab: forward direction
        if (focusSection === 'categories') {
          setFocusSection('products');
        } else if (focusSection === 'products') {
          if (cart.length > 0) {
            setFocusSection('cart');
            setSelectedCartIndex(0);
          } else {
            setFocusSection('categories');
          }
        } else if (focusSection === 'cart') {
          setFocusSection('categories');
          setSelectedCartIndex(-1);
          setShowDiscountIndex(-1);
        }
      }
      return;
    }

    // Category navigation when categories focused
    if (focusSection === 'categories') {
      const totalCategories = categories.length + 1; // +1 for "All"
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedCategoryIndex(prev => (prev + 1) % totalCategories);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedCategoryIndex(prev => (prev - 1 + totalCategories) % totalCategories);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedCategoryIndex === 0) {
          setActiveCategory(null);
        } else {
          setActiveCategory(categories[selectedCategoryIndex - 1].id);
        }
        setSelectedProductIndex(0);
      }
      return;
    }

    // Cart navigation when cart focused
    if (focusSection === 'cart' && cart.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCartIndex(prev => Math.min(prev + 1, cart.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCartIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        const item = cart[selectedCartIndex];
        updateQuantity(item.product.id, item.quantity + 1);
      } else if (e.key === '-') {
        e.preventDefault();
        const item = cart[selectedCartIndex];
        updateQuantity(item.product.id, item.quantity - 1);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        const item = cart[selectedCartIndex];
        removeFromCart(item.product.id);
        setSelectedCartIndex(prev => Math.min(prev, cart.length - 2));
        setShowDiscountIndex(-1);
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setShowDiscountIndex(prev => prev === selectedCartIndex ? -1 : selectedCartIndex);
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        const item = cart[selectedCartIndex];
        if (item) {
          updateItemDiscountType(item.product.id, item.discountType === 'percent' ? 'fixed' : 'percent');
        }
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setFocusCartDiscount(false);
        setTimeout(() => setFocusCartDiscount(true), 0);
      } else if (e.key === 'y' || e.key === 'Y') {
        e.preventDefault();
        setDiscountType(prev => prev === 'percent' ? 'fixed' : 'percent');
      }
      return;
    }

    // Product navigation when products focused
    if (focusSection === 'products') {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedProductIndex(prev => Math.min(prev + 1, filteredProducts.length - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedProductIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedProductIndex(prev => Math.min(prev + gridColumns, filteredProducts.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedProductIndex(prev => Math.max(prev - gridColumns, 0));
      } else if (e.key === 'Enter' && filteredProducts[selectedProductIndex]) {
        e.preventDefault();
        addToCart(filteredProducts[selectedProductIndex]);
      } else if ((e.key === '+' || e.key === '=') && filteredProducts[selectedProductIndex]) {
        e.preventDefault();
        const product = filteredProducts[selectedProductIndex];
        const cartItem = cart.find(item => item.product.id === product.id);
        if (cartItem) {
          updateQuantity(product.id, cartItem.quantity + 1);
        } else {
          addToCart(product);
        }
      } else if (e.key === '-' && filteredProducts[selectedProductIndex]) {
        e.preventDefault();
        const product = filteredProducts[selectedProductIndex];
        const cartItem = cart.find(item => item.product.id === product.id);
        if (cartItem && cartItem.quantity > 1) {
          updateQuantity(product.id, cartItem.quantity - 1);
        } else if (cartItem) {
          removeFromCart(product.id);
        }
      }
      return;
    }
  }, [
    isAnyModalOpen, completedBill, showPaymentModal, showHoldBillsModal,
    showReturnsModal, showReportModal, showShortcutsModal, searchQuery,
    filteredProducts, selectedProductIndex, cart, addToCart, updateQuantity,
    removeFromCart, clearCart, handleHoldBill, handleCheckout, gridColumns,
    isSearchMode, selectedCartIndex, focusSection, selectedCategoryIndex, categories,
    showDiscountIndex, updateItemDiscountType, setDiscountType
  ]);

  // Add keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Reset selected index when products change
  useEffect(() => {
    setSelectedProductIndex(0);
  }, [activeCategory]);

  // Reset cart selection when cart changes
  useEffect(() => {
    if (cart.length === 0) {
      setSelectedCartIndex(-1);
    } else if (selectedCartIndex >= cart.length) {
      setSelectedCartIndex(cart.length - 1);
    }
  }, [cart.length, selectedCartIndex]);

  return (
    <div className="h-screen flex bg-white dark:bg-[#0a0a0a]">
      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#0a0a0a]">
        {/* Header */}
        <POSHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          heldBillsCount={heldBills.length}
          onHoldBillsClick={() => setShowHoldBillsModal(true)}
          onReportsClick={() => setShowReportModal(true)}
          onReturnsClick={() => setShowReturnsModal(true)}
          onKeyboardClick={() => setShowShortcutsModal(true)}
        />

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Products panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Categories */}
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={(catId) => {
                setActiveCategory(catId);
                setSelectedProductIndex(0);
              }}
              selectedIndex={selectedCategoryIndex}
              isFocused={focusSection === 'categories'}
            />

            {/* Products grid */}
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0a0a0a] scrollbar-hide outline-none transition-colors">
              <ProductGrid
                products={filteredProducts}
                cart={cart}
                onAddToCart={addToCart}
                onUpdateQuantity={updateQuantity}
                selectedIndex={focusSection === 'products' ? selectedProductIndex : -1}
              />
            </div>
          </div>

          {/* Cart panel - Desktop */}
          <div className="hidden md:block w-[380px] flex-shrink-0">
            <CartPanel
              cart={cart}
              totals={totals}
              discount={discount}
              discountType={discountType}
              onUpdateQuantity={updateQuantity}
              onUpdateItemDiscount={updateItemDiscount}
              onUpdateItemDiscountType={updateItemDiscountType}
              onRemove={removeFromCart}
              onClear={clearCart}
              onHold={handleHoldBill}
              onSetDiscount={setDiscount}
              onSetDiscountType={setDiscountType}
              onCheckout={handleCheckout}
              selectedIndex={focusSection === 'cart' ? selectedCartIndex : -1}
              isFocused={focusSection === 'cart'}
              showDiscountIndex={focusSection === 'cart' ? showDiscountIndex : -1}
              onToggleDiscount={(idx) => setShowDiscountIndex(idx)}
              focusCartDiscount={focusCartDiscount}
            />
          </div>
        </div>

        {/* Mobile cart button */}
        <div className="md:hidden fixed bottom-4 right-4 z-40">
          <button
            onClick={() => setShowMobileCart(true)}
            className="relative w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          >
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {totals.itemCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile cart drawer */}
        {showMobileCart && (
          <div className="md:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowMobileCart(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 h-[80vh] bg-white dark:bg-[#121212] rounded-t-2xl overflow-hidden">
              <div className="h-full flex flex-col">
                {/* Handle */}
                <div className="flex justify-center py-2">
                  <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </div>
                <CartPanel
                  cart={cart}
                  totals={totals}
                  discount={discount}
                  discountType={discountType}
                  onUpdateQuantity={updateQuantity}
                  onUpdateItemDiscount={updateItemDiscount}
                  onRemove={removeFromCart}
                  onClear={clearCart}
                  onHold={() => {
                    handleHoldBill();
                    setShowMobileCart(false);
                  }}
                  onSetDiscount={setDiscount}
                  onSetDiscountType={setDiscountType}
                  onCheckout={() => {
                    setShowMobileCart(false);
                    handleCheckout();
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          totals={totals}
          onComplete={handleCompleteSale}
        />

        <HoldBillsModal
          isOpen={showHoldBillsModal}
          onClose={() => setShowHoldBillsModal(false)}
          heldBills={heldBills}
          onResume={resumeBill}
          onDelete={deleteHeldBill}
        />

        <BillPreview
          isOpen={!!completedBill}
          onClose={() => setCompletedBill(null)}
          bill={completedBill}
        />

        <ReturnsModal
          isOpen={showReturnsModal}
          onClose={() => setShowReturnsModal(false)}
          completedBills={completedBills}
          onProcessReturn={handleProcessReturn}
        />

        <DailyReportModal
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
        >
          <div className="space-y-4">
            {/* Section Navigation */}
            <div className="flex items-center justify-between text-sm pb-3 border-b border-gray-200 dark:border-[#2a2a2a]">
              <span className="font-medium text-gray-700 dark:text-gray-300">Switch Sections</span>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">Tab</kbd>
                <span className="text-gray-600 dark:text-gray-400">Categories → Products → Cart</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Categories (when focused)</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Navigate</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">← →</kbd></div>
                  <div className="flex justify-between"><span className="text-gray-500">Select</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">Enter</kbd></div>
                  <div className="flex justify-between"><span className="text-gray-500">Quick Jump</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">Alt+1-9,0</kbd></div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Products (when focused)</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Navigate</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">← ↑ ↓ →</kbd></div>
                  <div className="flex justify-between"><span className="text-gray-500">Add Item</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">Enter</kbd></div>
                  <div className="flex justify-between"><span className="text-gray-500">Qty +/-</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">+ -</kbd></div>
                  <div className="flex justify-between"><span className="text-gray-500">Search</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">/</kbd></div>
                  <div className="flex justify-between"><span className="text-gray-500">Clear Search</span><span className="flex gap-1"><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">Esc</kbd> <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">Cmd+Del</kbd></span></div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Cart (when focused)</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Navigate</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">↑ ↓</kbd></div>
                  <div className="flex justify-between"><span className="text-gray-500">Qty +/-</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">+ -</kbd></div>
                  <div className="flex justify-between"><span className="text-gray-500">Remove</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">Del</kbd></div>
                  <div className="flex justify-between"><span className="text-gray-500">Item Discount</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">D</kbd></div>
                  <div className="flex justify-between"><span className="text-gray-500">Item % / $</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">S</kbd></div>
                  <div className="flex justify-between"><span className="text-gray-500">Cart Discount</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">T</kbd></div>
                  <div className="flex justify-between"><span className="text-gray-500">Cart % / $</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">Y</kbd></div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Actions</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Shortcuts</span><span className="flex gap-1"><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">F1</kbd> <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">?</kbd></span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Hold Bill</span><span className="flex gap-1"><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">F2</kbd> <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">Cmd+S</kbd></span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Returns</span><span className="flex gap-1"><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">F3</kbd> <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">Cmd+R</kbd></span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Reports</span><span className="flex gap-1"><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">F4</kbd> <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">Cmd+E</kbd></span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Held Bills</span><span className="flex gap-1"><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">F5</kbd> <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">Cmd+H</kbd></span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Checkout</span><span className="flex gap-1"><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">F8</kbd> <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">Cmd+Enter</kbd></span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Clear Cart</span><span className="flex gap-1"><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">F9</kbd> <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">Cmd+Del</kbd></span></div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center pt-2 border-t border-gray-200 dark:border-[#2a2a2a]">
              Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">F1</kbd> or <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">?</kbd> to toggle • <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">Esc</kbd> to close
            </p>
          </div>
        </Modal>

        {/* Search overlay indicator */}
        {isSearchMode && (
          <div className="absolute top-[100px] left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-auto w-[450px] animate-in slide-in-from-top-6 fade-in duration-200">
            <Input
              autoFocus
              size="md"
              prefixIcon={Search}
              placeholder="Type to search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedProductIndex(0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  setIsSearchMode(false);
                  setSearchQuery('');
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  if (filteredProducts.length > 0) {
                    addToCart(filteredProducts[0]);
                  }
                  setIsSearchMode(false);
                  setSearchQuery('');
                } else if ((e.ctrlKey || e.metaKey) && e.key === 'Backspace') {
                  e.preventDefault();
                  setSearchQuery('');
                  setSelectedProductIndex(0);
                }
              }}
              className="shadow-xl"
              suffix={
                searchQuery && (
                  <button
                    onClick={() => { setIsSearchMode(false); setSearchQuery(''); }}
                    className="w-4 h-4 rounded-full bg-primary-500 hover:bg-primary-600 transition-colors flex items-center justify-center text-white cursor-pointer"
                  >
                    <X size={10} strokeWidth={4} />
                  </button>
                )
              }
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default POSPage;
