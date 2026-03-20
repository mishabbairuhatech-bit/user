import { Button, Input, Modal } from '@components/ui';
import { useSettings } from '@hooks';
import { Search, ShoppingCart, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import GridBillPreview from './components/GridBillPreview';
import GridCartPanel from './components/GridCartPanel';
import GridCategoryTabs from './components/GridCategoryTabs';
import GridDailyReportModal from './components/GridDailyReportModal';
import GridHeader from './components/GridHeader';
import GridHeldBillsPanel from './components/GridHeldBillsPanel';
import GridHeldBillsWarningModal from './components/GridHeldBillsWarningModal';
import GridProductGrid from './components/GridProductGrid';
import GridReturnsPanel from './components/GridReturnsPanel';
import { categories, products } from './data/mockData';
import usePOS from './hooks/usePOS';

const POSPage = () => {
  const { settings } = useSettings();
  const isCartLeft = settings.posCartPosition === 'left';

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
  const [showPaymentPanel, setShowPaymentPanel] = useState(false);
  const [showReturnsPanel, setShowReturnsPanel] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [completedBill, setCompletedBill] = useState(null);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Held bills panel (replaces cart area)
  const [showHeldBillsPanel, setShowHeldBillsPanel] = useState(false);
  const [cartWarningContext, setCartWarningContext] = useState(null); // null | 'heldBills' | 'returns'
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [gridColumns, setGridColumns] = useState(4);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [selectedCartIndex, setSelectedCartIndex] = useState(-1);
  const [focusSection, setFocusSection] = useState('products'); // 'categories', 'products', 'cart'
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0); // 0 = All, 1+ = categories
  const [showDiscountIndex, setShowDiscountIndex] = useState(-1); // which cart item has discount input open
  const [focusCartDiscount, setFocusCartDiscount] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Calculate grid columns based on screen width
  useEffect(() => {
    const calculateColumns = () => {
      const width = window.innerWidth;
      // Match the grid breakpoints: grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 4xl:grid-cols-8
      if (width >= 2560) return 8;       // 4xl
      if (width >= 1920) return 7;       // 3xl
      if (width >= 1536) return 6;       // 2xl
      if (width >= 1280) return 5;       // xl
      if (width >= 1024) return 4;       // lg
      if (width >= 768) return 3;          // md
      return 2;                          // mobile
    };

    const handleResize = () => {
      setGridColumns(calculateColumns());
      setIsMobile(window.innerWidth < 768);
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

  // Open held bills panel - with warning if cart has items
  const handleOpenHeldBills = useCallback(() => {
    if (showHeldBillsPanel) {
      setShowHeldBillsPanel(false);
      setShowMobileCart(false);
      return;
    }
    setShowReturnsPanel(false);
    if (cart.length > 0) {
      setCartWarningContext('heldBills');
    } else {
      setShowHeldBillsPanel(true);
      setShowMobileCart(true);
      setFocusSection('cart');
    }
  }, [showHeldBillsPanel, cart.length]);

  const handleOpenReturns = useCallback(() => {
    if (showReturnsPanel) {
      setShowReturnsPanel(false);
      setShowMobileCart(false);
      return;
    }
    setShowHeldBillsPanel(false);
    setShowPaymentPanel(false);
    if (cart.length > 0) {
      setCartWarningContext('returns');
    } else {
      setShowReturnsPanel(true);
      setShowMobileCart(true);
      setFocusSection('cart');
    }
  }, [showReturnsPanel, cart.length]);

  // Warning modal handlers
  const handleWarningHoldBill = useCallback(() => {
    const ctx = cartWarningContext;
    holdBill();
    setCartWarningContext(null);
    if (ctx === 'returns') {
      setShowReturnsPanel(true);
    } else {
      setShowHeldBillsPanel(true);
    }
    setShowMobileCart(true);
    setFocusSection('cart');
  }, [holdBill, cartWarningContext]);

  const handleWarningClearCart = useCallback(() => {
    const ctx = cartWarningContext;
    clearCart();
    setCartWarningContext(null);
    if (ctx === 'returns') {
      setShowReturnsPanel(true);
    } else {
      setShowHeldBillsPanel(true);
    }
    setShowMobileCart(true);
    setFocusSection('cart');
  }, [clearCart, cartWarningContext]);

  // Resume bill from held bills panel
  const handleResumeBill = useCallback((billId) => {
    resumeBill(billId);
    setShowHeldBillsPanel(false);
  }, [resumeBill]);

  const handleCheckout = () => {
    if (cart.length > 0) {
      setShowPaymentPanel(true);
      setShowHeldBillsPanel(false);
      setShowReturnsPanel(false);
      setFocusSection('cart');
    }
  };

  const handleCompleteSale = useCallback((paymentMethod, amountTendered) => {
    const bill = completeSale(paymentMethod, amountTendered);
    if (bill) {
      setShowPaymentPanel(false);
      setCompletedBill(bill);
    }
  }, [completeSale]);

  const handleProcessReturn = (originalBill, returnItems) => {
    const returnBill = processReturn(originalBill, returnItems);
    if (returnBill) {
      setShowReturnsPanel(false);
      setCompletedBill(returnBill);
    }
  };

  // Check if any modal is open
  const isAnyModalOpen = cartWarningContext || showReportModal || completedBill || showShortcutsModal;

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback((e) => {
    // Skip all keyboard shortcuts on mobile
    if (window.innerWidth < 768) return;

    // Skip if typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    // When payment panel is active, only allow Escape and F8 — everything else is handled by PaymentPanel
    if (showPaymentPanel) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowPaymentPanel(false);
        return;
      }
      if (e.key === 'F8' || ((e.ctrlKey || e.metaKey) && e.key === 'Enter')) {
        e.preventDefault();
        setShowPaymentPanel(false);
        return;
      }
      // Block everything else from POSPage
      return;
    }

    // When returns panel is active, only allow Escape and F3 — everything else is handled by ReturnsPanel
    if (showReturnsPanel) {
      if (e.key === 'Escape') {
        // ReturnsPanel handles its own Escape for going back from bill selection
        // Only close panel if ReturnsPanel doesn't stop propagation
        e.preventDefault();
        setShowReturnsPanel(false);
        return;
      }
      if (e.key === 'F3' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r')) {
        e.preventDefault();
        setShowReturnsPanel(false);
        return;
      }
      return;
    }

    // Close modals with Escape
    if (e.key === 'Escape') {
      if (completedBill) {
        setCompletedBill(null);
      } else if (cartWarningContext) {
        setCartWarningContext(null);
      } else if (showReportModal) {
        setShowReportModal(false);
      } else if (showShortcutsModal) {
        setShowShortcutsModal(false);
      } else if (showHeldBillsPanel) {
        setShowHeldBillsPanel(false);
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
      if (!cartWarningContext) {
        handleOpenReturns();
      }
      return;
    } else if (e.key === 'F4' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e')) { // Mac: Cmd+E, Win: Ctrl+E
      e.preventDefault();
      setShowReportModal(prev => !prev);
      return;
    } else if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h')) {
      e.preventDefault();
      if (!cartWarningContext) {
        handleOpenHeldBills();
      }
      return;
    } else if (e.key === 'F8' || ((e.ctrlKey || e.metaKey) && e.key === 'Enter')) { // Cmd+Enter
      e.preventDefault();
      if (showPaymentPanel) {
        setShowPaymentPanel(false);
      } else if (cart.length > 0) {
        handleCheckout();
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
        setShowReturnsPanel(false);
        setShowHeldBillsPanel(true);
        setFocusSection('cart');
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

    // Tab to cycle through sections: categories -> products -> cart/held bills (desktop only)
    const canFocusRightPanel = cart.length > 0 || showHeldBillsPanel || showPaymentPanel || showReturnsPanel;
    if (e.key === 'Tab' && window.innerWidth >= 768) {
      e.preventDefault();
      if (e.shiftKey) {
        // Shift+Tab: reverse direction
        if (focusSection === 'categories') {
          if (canFocusRightPanel) {
            setFocusSection('cart');
            if (!showHeldBillsPanel && !showPaymentPanel && !showReturnsPanel) setSelectedCartIndex(0);
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
          if (canFocusRightPanel) {
            setFocusSection('cart');
            if (!showHeldBillsPanel && !showPaymentPanel && !showReturnsPanel) setSelectedCartIndex(0);
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

    // Cart navigation when cart focused (skip if held bills or payment panel is shown - they handle their own keys)
    if (focusSection === 'cart' && cart.length > 0 && !showHeldBillsPanel && !showPaymentPanel) {
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
    isAnyModalOpen, completedBill, showPaymentPanel, cartWarningContext,
    showReturnsPanel, showReportModal, showShortcutsModal, searchQuery,
    filteredProducts, selectedProductIndex, cart, addToCart, updateQuantity,
    removeFromCart, clearCart, handleHoldBill, gridColumns,
    isSearchMode, selectedCartIndex, focusSection, selectedCategoryIndex, categories,
    showDiscountIndex, updateItemDiscountType, setDiscountType, showHeldBillsPanel,
    handleOpenHeldBills, handleOpenReturns, handleCheckout
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

  // Auto-switch back to cart when items are added while held bills panel is shown
  useEffect(() => {
    if (showHeldBillsPanel && cart.length > 0) {
      setShowHeldBillsPanel(false);
    }
  }, [cart.length, showHeldBillsPanel]);

  return (
    <div className="h-screen flex bg-white dark:bg-[#0a0a0a]">
      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#0a0a0a]">
        {/* Header */}
        <GridHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          heldBillsCount={heldBills.length}
          onHoldBillsClick={handleOpenHeldBills}
          isHeldBillsActive={showHeldBillsPanel}
          isReturnsActive={showReturnsPanel}
          onReportsClick={() => setShowReportModal(true)}
          onReturnsClick={handleOpenReturns}
          onKeyboardClick={() => setShowShortcutsModal(true)}
        />

        {/* Main content */}
        <div className={`flex-1 flex overflow-hidden ${isCartLeft ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Products panel */}
          <div className={`flex-1 flex flex-col overflow-hidden relative transition-opacity ${showPaymentPanel || showReturnsPanel || showHeldBillsPanel ? 'opacity-40 pointer-events-none select-none' : ''}`}>
            {/* Categories */}
            <GridCategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={(catId) => {
                setActiveCategory(catId);
                setSelectedProductIndex(0);
              }}
              selectedIndex={!isMobile ? selectedCategoryIndex : -1}
              isFocused={!isMobile && !showPaymentPanel && !showReturnsPanel && !showHeldBillsPanel && focusSection === 'categories'}
            />

            {/* Products grid */}
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0a0a0a] scrollbar-hide outline-none transition-colors">
              <GridProductGrid
                products={filteredProducts}
                cart={cart}
                onAddToCart={addToCart}
                onUpdateQuantity={updateQuantity}
                selectedIndex={!isMobile && !showPaymentPanel && !showReturnsPanel && !showHeldBillsPanel && focusSection === 'products' ? selectedProductIndex : -1}
              />
            </div>

            {/* Disabled overlay when payment/returns/held bills panel is active */}
            {(showPaymentPanel || showReturnsPanel || showHeldBillsPanel) && (
              <div className="absolute inset-0 z-10" />
            )}
          </div>

          {/* Cart panel / Held Bills panel - Desktop */}
          <div className="hidden md:block w-[380px] flex-shrink-0">
            {showReturnsPanel ? (
              <GridReturnsPanel
                isActive={showReturnsPanel}
                completedBills={completedBills}
                onProcessReturn={handleProcessReturn}
                onBack={() => setShowReturnsPanel(false)}
                position={isCartLeft ? 'left' : 'right'}
              />
            ) : showHeldBillsPanel ? (
              <GridHeldBillsPanel
                heldBills={heldBills}
                onResume={handleResumeBill}
                onDelete={deleteHeldBill}
                onBack={() => setShowHeldBillsPanel(false)}
                isFocused={focusSection === 'cart'}
                position={isCartLeft ? 'left' : 'right'}
              />
            ) : (
              <GridCartPanel
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
                showPayment={showPaymentPanel}
                onCompleteSale={handleCompleteSale}
                onBackFromPayment={() => setShowPaymentPanel(false)}
                position={isCartLeft ? 'left' : 'right'}
              />
            )}
          </div>
        </div>

        {/* Mobile cart button */}
        <div className={`md:hidden fixed bottom-4 ${isCartLeft ? 'left-4' : 'right-4'} z-40`}>
          <Button
            variant="primary"
            size="lg"
            icon={ShoppingCart}
            iconOnly
            onClick={() => setShowMobileCart(true)}
            className="relative !w-14 !h-14 !rounded-full shadow-lg"
          >
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {totals.itemCount}
              </span>
            )}
          </Button>
        </div>

        {/* Mobile cart/panel drawer */}
        {showMobileCart && (
          <div className="md:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => {
                setShowMobileCart(false);
                setShowPaymentPanel(false);
                setShowHeldBillsPanel(false);
                setShowReturnsPanel(false);
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-[80vh] bg-white dark:bg-[#121212] rounded-t-2xl overflow-hidden">
              <div className="h-full flex flex-col">
                {/* Handle */}
                <div className="flex justify-center py-2">
                  <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </div>
                {showReturnsPanel ? (
                  <GridReturnsPanel
                    isActive={showReturnsPanel}
                    completedBills={completedBills}
                    onProcessReturn={(originalBill, returnItems) => {
                      handleProcessReturn(originalBill, returnItems);
                      setShowMobileCart(false);
                    }}
                    onBack={() => {
                      setShowReturnsPanel(false);
                      setShowMobileCart(false);
                    }}
                  />
                ) : showHeldBillsPanel ? (
                  <GridHeldBillsPanel
                    heldBills={heldBills}
                    onResume={(billId) => {
                      handleResumeBill(billId);
                      setShowMobileCart(true);
                    }}
                    onDelete={deleteHeldBill}
                    onBack={() => {
                      setShowHeldBillsPanel(false);
                      setShowMobileCart(false);
                    }}
                    isFocused={false}
                  />
                ) : (
                  <GridCartPanel
                    cart={cart}
                    totals={totals}
                    discount={discount}
                    discountType={discountType}
                    onUpdateQuantity={updateQuantity}
                    onUpdateItemDiscount={updateItemDiscount}
                    onUpdateItemDiscountType={updateItemDiscountType}
                    onRemove={removeFromCart}
                    onClear={clearCart}
                    onHold={() => {
                      handleHoldBill();
                      setShowMobileCart(false);
                    }}
                    onSetDiscount={setDiscount}
                    onSetDiscountType={setDiscountType}
                    onCheckout={handleCheckout}
                    showPayment={showPaymentPanel}
                    onCompleteSale={(method, amount) => {
                      handleCompleteSale(method, amount);
                      setShowMobileCart(false);
                    }}
                    onBackFromPayment={() => setShowPaymentPanel(false)}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
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
              Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">F1</kbd> or <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">?</kbd> to toggle • <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-[#2a2a2a] rounded">Esc</kbd> to close
            </p>
          }
        >
          <div className="space-y-4 py-4">
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
                  <Button
                    variant="primary"
                    size="sm"
                    icon={X}
                    iconOnly
                    onClick={() => { setIsSearchMode(false); setSearchQuery(''); }}
                    className="!w-4 !h-4 !min-h-0 !p-0 !rounded-full cursor-pointer"
                  />
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
