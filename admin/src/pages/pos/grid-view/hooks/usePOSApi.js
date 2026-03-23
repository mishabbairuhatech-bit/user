import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import API from '@/services/endpoints';
import QUERY_KEY from '@/services/queryKeys';

/**
 * API-backed POS hook — replaces the localStorage-based usePOS.
 * Requires an active POS session to function.
 */
const usePOSApi = () => {
  const queryClient = useQueryClient();

  // Cart state (local — only persisted on hold/finalize)
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percent');

  // Session
  const { data: activeSession, isLoading: sessionLoading, refetch: refetchSession } = useQuery({
    queryKey: [QUERY_KEY.POS_ACTIVE_SESSION],
    queryFn: () => api.get(API.POS_SESSIONS_ACTIVE).then((r) => r.data.data),
    retry: false,
  });

  // Products
  const { data: productsData } = useQuery({
    queryKey: [QUERY_KEY.PRODUCTS, 'pos-active'],
    queryFn: () => api.get(API.PRODUCTS, { params: { limit: 100, is_active: 'true' } }).then((r) => r.data.data),
  });
  const products = productsData?.items || [];

  // Categories
  const { data: categories } = useQuery({
    queryKey: [QUERY_KEY.CATEGORIES],
    queryFn: () => api.get(API.CATEGORIES).then((r) => r.data.data),
  });

  // Held bills
  const { data: heldBills = [], refetch: refetchHeldBills } = useQuery({
    queryKey: [QUERY_KEY.POS_HELD_BILLS, activeSession?.id],
    queryFn: () => api.get(API.POS_HELD_BILLS, { params: { session_id: activeSession?.id } }).then((r) => r.data.data),
    enabled: !!activeSession?.id,
  });

  // Terminals
  const { data: terminals } = useQuery({
    queryKey: [QUERY_KEY.POS_TERMINALS],
    queryFn: () => api.get(API.POS_TERMINALS).then((r) => r.data.data),
  });

  // ─── Session mutations ──────────────────────────
  const openSessionMutation = useMutation({
    mutationFn: (data) => api.post(`${API.POS_SESSIONS}/open`, data).then((r) => r.data.data),
    onSuccess: () => refetchSession(),
  });

  const closeSessionMutation = useMutation({
    mutationFn: ({ sessionId, closing_cash }) =>
      api.post(`${API.POS_SESSIONS}/${sessionId}/close`, { closing_cash }).then((r) => r.data.data),
    onSuccess: () => refetchSession(),
  });

  // ─── Cart operations ──────────────────────────
  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const existing = prev.findIndex((item) => item.product.id === product.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + 1 };
        return updated;
      }
      return [...prev, { product, quantity: 1, discount: 0, discountType: 'percent' }];
    });
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setCart((prev) => prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item)));
  }, []);

  const updateItemDiscount = useCallback((productId, discount) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, discount: Math.max(0, item.discountType === 'percent' ? Math.min(100, discount) : discount) }
          : item,
      ),
    );
  }, []);

  const updateItemDiscountType = useCallback((productId, discountType) => {
    setCart((prev) => prev.map((item) => (item.product.id === productId ? { ...item, discountType, discount: 0 } : item)));
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setCustomer(null);
    setDiscount(0);
    setDiscountType('percent');
  }, []);

  // ─── Calculate totals ──────────────────────────
  const calculateTotals = useCallback(() => {
    const grossTotal = cart.reduce((sum, item) => {
      const price = parseFloat(item.product.selling_price || item.product.price || 0);
      return sum + price * item.quantity;
    }, 0);

    const itemDiscountTotal = cart.reduce((sum, item) => {
      const price = parseFloat(item.product.selling_price || item.product.price || 0);
      const itemTotal = price * item.quantity;
      const itemDisc = item.discountType === 'fixed' ? Math.min(item.discount * item.quantity, itemTotal) : (itemTotal * item.discount) / 100;
      return sum + itemDisc;
    }, 0);

    const subtotal = grossTotal - itemDiscountTotal;
    let discountAmount = discountType === 'percent' ? (subtotal * discount) / 100 : Math.min(discount, subtotal);
    const afterDiscount = subtotal - discountAmount;

    // Tax is computed server-side on finalize; show estimate based on product tax rates
    const estimatedTax = cart.reduce((sum, item) => {
      const price = parseFloat(item.product.selling_price || item.product.price || 0);
      const itemTotal = price * item.quantity;
      const itemDisc = item.discountType === 'fixed' ? Math.min(item.discount * item.quantity, itemTotal) : (itemTotal * item.discount) / 100;
      const taxable = itemTotal - itemDisc;
      const rate = parseFloat(item.product.taxRate?.rate || 0);
      return sum + (taxable * rate) / 100;
    }, 0);

    const total = afterDiscount + estimatedTax;

    return {
      grossTotal: Number(grossTotal.toFixed(2)),
      itemDiscountTotal: Number(itemDiscountTotal.toFixed(2)),
      subtotal: Number(subtotal.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      tax: Number(estimatedTax.toFixed(2)),
      total: Number(total.toFixed(2)),
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [cart, discount, discountType]);

  // ─── Hold bill (API) ──────────────────────────
  const holdBillMutation = useMutation({
    mutationFn: (data) => api.post(API.POS_HOLD, data).then((r) => r.data.data),
    onSuccess: () => {
      refetchHeldBills();
      clearCart();
    },
  });

  const holdBill = useCallback(() => {
    if (cart.length === 0 || !activeSession?.id) return null;
    holdBillMutation.mutate({
      session_id: activeSession.id,
      customer_name: customer?.name || '',
      items: cart.map((item) => ({
        product_id: item.product.id,
        name: item.product.name,
        sku: item.product.sku,
        qty: item.quantity,
        price: parseFloat(item.product.selling_price || item.product.price || 0),
        discount: item.discount,
      })),
    });
  }, [cart, activeSession, customer]);

  // ─── Recall held bill (API) ──────────────────────────
  const resumeBill = useCallback(async (billId) => {
    try {
      const res = await api.post(`${API.POS_HELD_BILLS}/${billId}/recall`);
      const data = res.data.data;
      if (data?.items) {
        const restoredCart = data.items.map((item) => {
          const product = products.find((p) => p.id === item.product_id) || {
            id: item.product_id, name: item.name, sku: item.sku,
            selling_price: item.price, price: item.price,
          };
          return { product, quantity: item.qty, discount: item.discount || 0, discountType: 'percent' };
        });
        setCart(restoredCart);
        setCustomer(data.customer_name ? { name: data.customer_name } : null);
      }
      refetchHeldBills();
    } catch (err) {
      console.error('Failed to recall held bill:', err);
    }
  }, [products]);

  const deleteHeldBill = useCallback(async (billId) => {
    try {
      await api.delete(`${API.POS_HELD_BILLS}/${billId}`);
      refetchHeldBills();
    } catch (err) {
      console.error('Failed to delete held bill:', err);
    }
  }, []);

  // ─── Finalize bill (API) ──────────────────────────
  const finalizeBillMutation = useMutation({
    mutationFn: (data) => api.post(API.POS_FINALIZE, data).then((r) => r.data.data),
    onSuccess: () => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.PRODUCTS] });
    },
  });

  const completeSale = useCallback((paymentMethod, amountTendered = 0) => {
    if (cart.length === 0 || !activeSession?.id) return null;

    const totals = calculateTotals();
    const amount = paymentMethod === 'cash' ? amountTendered || totals.total : totals.total;

    finalizeBillMutation.mutate({
      session_id: activeSession.id,
      party_id: customer?.id || undefined,
      customer_name: customer?.name || undefined,
      discount_amount: totals.discountAmount || 0,
      round_off: 0,
      items: cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: parseFloat(item.product.selling_price || item.product.price || 0),
        discount_percent: item.discountType === 'percent' ? item.discount : 0,
      })),
      payments: [{ mode: paymentMethod, amount }],
    });

    return {
      totals,
      payment_method: paymentMethod,
      amount_tendered: amount,
      change: paymentMethod === 'cash' ? Math.max(0, amount - totals.total) : 0,
    };
  }, [cart, activeSession, customer, calculateTotals]);

  // ─── Daily report (API) ──────────────────────────
  const getDailyReport = useCallback(async (date) => {
    const d = date || new Date().toISOString().split('T')[0];
    const res = await api.get(API.POS_DAILY_SALES, { params: { date: d } });
    return res.data.data;
  }, []);

  return {
    // Session
    activeSession,
    sessionLoading,
    terminals,
    openSession: openSessionMutation.mutateAsync,
    closeSession: closeSessionMutation.mutateAsync,
    openSessionLoading: openSessionMutation.isPending,
    closeSessionLoading: closeSessionMutation.isPending,

    // Products & categories
    products,
    categories: categories || [],

    // Cart
    cart,
    customer,
    setCustomer,
    discount,
    setDiscount,
    discountType,
    setDiscountType,
    addToCart,
    updateQuantity,
    updateItemDiscount,
    updateItemDiscountType,
    removeFromCart,
    clearCart,
    calculateTotals,

    // Held bills
    heldBills,
    holdBill,
    resumeBill,
    deleteHeldBill,

    // Complete sale
    completeSale,
    finalizeBillLoading: finalizeBillMutation.isPending,
    lastFinalizedBill: finalizeBillMutation.data,

    // Reports
    getDailyReport,

    // Returns
    processReturn: async (originalInvoiceId, items) => {
      return api.post(API.POS_RETURN, {
        original_invoice_id: originalInvoiceId,
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity, unit_price: i.unit_price })),
      }).then((r) => r.data.data);
    },
  };
};

export default usePOSApi;
