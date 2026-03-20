import { useState, useCallback, useEffect } from 'react';
import {
  TAX_RATE,
  generateBillNumber,
  getStoredHeldBills,
  saveHeldBills,
  saveCompletedBill,
  getStoredBills
} from '../data/mockData';

const usePOS = () => {
  // Cart state
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [discount, setDiscount] = useState(0); // Overall discount percentage
  const [discountType, setDiscountType] = useState('percent'); // 'percent' or 'fixed'

  // Held bills
  const [heldBills, setHeldBills] = useState([]);

  // Completed bills (for reports)
  const [completedBills, setCompletedBills] = useState([]);

  // Load held bills from localStorage on mount
  useEffect(() => {
    setHeldBills(getStoredHeldBills());
    setCompletedBills(getStoredBills());
  }, []);

  // Add item to cart
  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      if (existingIndex >= 0) {
        // Increment quantity
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1
        };
        return updated;
      }
      // Add new item
      return [...prev, { product, quantity: 1, discount: 0, discountType: 'percent' }];
    });
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.product.id === productId
        ? { ...item, quantity }
        : item
    ));
  }, []);

  // Update item discount
  const updateItemDiscount = useCallback((productId, discount) => {
    setCart(prev => prev.map(item =>
      item.product.id === productId
        ? { ...item, discount: Math.max(0, item.discountType === 'percent' ? Math.min(100, discount) : discount) }
        : item
    ));
  }, []);

  // Update item discount type
  const updateItemDiscountType = useCallback((productId, discountType) => {
    setCart(prev => prev.map(item =>
      item.product.id === productId
        ? { ...item, discountType, discount: 0 }
        : item
    ));
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  // Clear cart
  const clearCart = useCallback(() => {
    setCart([]);
    setCustomer(null);
    setDiscount(0);
    setDiscountType('percent');
  }, []);

  // Calculate totals
  const calculateTotals = useCallback(() => {
    const grossTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const itemDiscountTotal = cart.reduce((sum, item) => {
      const itemTotal = item.product.price * item.quantity;
      const itemDiscount = item.discountType === 'fixed'
        ? Math.min(item.discount * item.quantity, itemTotal)
        : (itemTotal * item.discount) / 100;
      return sum + itemDiscount;
    }, 0);

    const subtotal = grossTotal - itemDiscountTotal;

    let discountAmount = 0;
    if (discountType === 'percent') {
      discountAmount = (subtotal * discount) / 100;
    } else {
      discountAmount = Math.min(discount, subtotal);
    }

    const afterDiscount = subtotal - discountAmount;
    const tax = afterDiscount * TAX_RATE;
    const total = afterDiscount + tax;

    return {
      grossTotal: Number(grossTotal.toFixed(2)),
      itemDiscountTotal: Number(itemDiscountTotal.toFixed(2)),
      subtotal: Number(subtotal.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [cart, discount, discountType]);

  // Hold current bill
  const holdBill = useCallback(() => {
    if (cart.length === 0) return null;

    const heldBill = {
      id: Date.now().toString(),
      items: [...cart],
      customer,
      discount,
      discountType,
      created_at: new Date().toISOString(),
      totals: calculateTotals(),
    };

    const updatedHeldBills = [...heldBills, heldBill].slice(-10); // Max 10 held bills
    setHeldBills(updatedHeldBills);
    saveHeldBills(updatedHeldBills);
    clearCart();

    return heldBill;
  }, [cart, customer, discount, discountType, heldBills, calculateTotals, clearCart]);

  // Resume held bill
  const resumeBill = useCallback((billId) => {
    const bill = heldBills.find(b => b.id === billId);
    if (!bill) return;

    setCart(bill.items);
    setCustomer(bill.customer);
    setDiscount(bill.discount);
    setDiscountType(bill.discountType);

    // Remove from held bills
    const updatedHeldBills = heldBills.filter(b => b.id !== billId);
    setHeldBills(updatedHeldBills);
    saveHeldBills(updatedHeldBills);
  }, [heldBills]);

  // Delete held bill
  const deleteHeldBill = useCallback((billId) => {
    const updatedHeldBills = heldBills.filter(b => b.id !== billId);
    setHeldBills(updatedHeldBills);
    saveHeldBills(updatedHeldBills);
  }, [heldBills]);

  // Complete sale
  const completeSale = useCallback((paymentMethod, amountTendered = 0) => {
    if (cart.length === 0) return null;

    const totals = calculateTotals();
    const bill = {
      id: generateBillNumber(),
      items: [...cart],
      customer,
      discount,
      discountType,
      totals,
      payment_method: paymentMethod,
      amount_tendered: paymentMethod === 'cash' ? amountTendered : totals.total,
      change: paymentMethod === 'cash' ? Math.max(0, amountTendered - totals.total) : 0,
      created_at: new Date().toISOString(),
    };

    // Save to completed bills
    saveCompletedBill(bill);
    setCompletedBills(prev => [bill, ...prev].slice(0, 100));

    // Clear cart
    clearCart();

    return bill;
  }, [cart, customer, discount, discountType, calculateTotals, clearCart]);

  // Process return
  const processReturn = useCallback((originalBill, returnItems) => {
    const returnTotal = returnItems.reduce((sum, item) => {
      const itemTotal = item.product.price * item.quantity;
      const itemDiscount = (itemTotal * item.discount) / 100;
      return sum + (itemTotal - itemDiscount);
    }, 0);

    const tax = returnTotal * TAX_RATE;
    const totalRefund = returnTotal + tax;

    const returnBill = {
      id: generateBillNumber(),
      type: 'return',
      original_bill_id: originalBill.id,
      items: returnItems,
      totals: {
        subtotal: Number(returnTotal.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        total: Number(totalRefund.toFixed(2)),
      },
      created_at: new Date().toISOString(),
    };

    saveCompletedBill(returnBill);
    setCompletedBills(prev => [returnBill, ...prev].slice(0, 100));

    return returnBill;
  }, []);

  // Get daily report
  const getDailyReport = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todaysBills = completedBills.filter(
      bill => bill.created_at?.slice(0, 10) === today && bill.type !== 'return'
    );
    const todaysReturns = completedBills.filter(
      bill => bill.created_at?.slice(0, 10) === today && bill.type === 'return'
    );

    const totalSales = todaysBills.reduce((sum, bill) => sum + bill.totals.total, 0);
    const totalReturns = todaysReturns.reduce((sum, bill) => sum + bill.totals.total, 0);

    const paymentBreakdown = {
      cash: todaysBills.filter(b => b.payment_method === 'cash').reduce((sum, b) => sum + b.totals.total, 0),
      card: todaysBills.filter(b => b.payment_method === 'card').reduce((sum, b) => sum + b.totals.total, 0),
      upi: todaysBills.filter(b => b.payment_method === 'upi').reduce((sum, b) => sum + b.totals.total, 0),
    };

    // Top selling items
    const itemSales = {};
    todaysBills.forEach(bill => {
      bill.items.forEach(item => {
        if (!itemSales[item.product.id]) {
          itemSales[item.product.id] = {
            product: item.product,
            quantity: 0,
            revenue: 0,
          };
        }
        itemSales[item.product.id].quantity += item.quantity;
        itemSales[item.product.id].revenue += item.product.price * item.quantity;
      });
    });

    const topItems = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      date: today,
      salesCount: todaysBills.length,
      returnsCount: todaysReturns.length,
      totalSales: Number(totalSales.toFixed(2)),
      totalReturns: Number(totalReturns.toFixed(2)),
      netSales: Number((totalSales - totalReturns).toFixed(2)),
      paymentBreakdown,
      topItems,
      bills: todaysBills,
    };
  }, [completedBills]);

  return {
    // State
    cart,
    customer,
    discount,
    discountType,
    heldBills,
    completedBills,

    // Setters
    setCustomer,
    setDiscount,
    setDiscountType,

    // Cart actions
    addToCart,
    updateQuantity,
    updateItemDiscount,
    updateItemDiscountType,
    removeFromCart,
    clearCart,

    // Calculations
    calculateTotals,

    // Bill actions
    holdBill,
    resumeBill,
    deleteHeldBill,
    completeSale,
    processReturn,

    // Reports
    getDailyReport,
  };
};

export default usePOS;
