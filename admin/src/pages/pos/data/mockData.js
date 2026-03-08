// Categories
export const categories = [
  { id: 1, name: 'Beverages', icon: 'Coffee', color: '#8B5CF6' },
  { id: 2, name: 'Food', icon: 'UtensilsCrossed', color: '#F59E0B' },
  { id: 3, name: 'Desserts', icon: 'Cake', color: '#EC4899' },
  { id: 4, name: 'Snacks', icon: 'Cookie', color: '#10B981' },
];

// Products
export const products = [
  // Beverages
  { id: 1, name: 'Espresso', price: 3.50, category_id: 1, image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=200', stock: 100, barcode: '1001', is_active: true },
  { id: 2, name: 'Cappuccino', price: 4.50, category_id: 1, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200', stock: 100, barcode: '1002', is_active: true },
  { id: 3, name: 'Latte', price: 4.00, category_id: 1, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200', stock: 100, barcode: '1003', is_active: true },
  { id: 4, name: 'Americano', price: 3.00, category_id: 1, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200', stock: 100, barcode: '1004', is_active: true },
  { id: 5, name: 'Green Tea', price: 2.50, category_id: 1, image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=200', stock: 80, barcode: '1005', is_active: true },
  { id: 6, name: 'Iced Coffee', price: 4.00, category_id: 1, image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=200', stock: 60, barcode: '1006', is_active: true },
  { id: 7, name: 'Orange Juice', price: 3.50, category_id: 1, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=200', stock: 50, barcode: '1007', is_active: true },
  { id: 8, name: 'Smoothie', price: 5.00, category_id: 1, image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=200', stock: 40, barcode: '1008', is_active: true },

  // Food
  { id: 9, name: 'Classic Burger', price: 8.99, category_id: 2, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200', stock: 30, barcode: '2001', is_active: true },
  { id: 10, name: 'Cheese Pizza', price: 12.99, category_id: 2, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200', stock: 25, barcode: '2002', is_active: true },
  { id: 11, name: 'Club Sandwich', price: 7.50, category_id: 2, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200', stock: 40, barcode: '2003', is_active: true },
  { id: 12, name: 'Caesar Salad', price: 6.99, category_id: 2, image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=200', stock: 35, barcode: '2004', is_active: true },
  { id: 13, name: 'Pasta Carbonara', price: 10.99, category_id: 2, image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=200', stock: 20, barcode: '2005', is_active: true },
  { id: 14, name: 'Fish & Chips', price: 11.50, category_id: 2, image: 'https://images.unsplash.com/photo-1579208030886-b1a5ed34fff6?w=200', stock: 15, barcode: '2006', is_active: true },
  { id: 15, name: 'Chicken Wings', price: 9.99, category_id: 2, image: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=200', stock: 25, barcode: '2007', is_active: true },
  { id: 16, name: 'Grilled Steak', price: 18.99, category_id: 2, image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=200', stock: 10, barcode: '2008', is_active: true },

  // Desserts
  { id: 17, name: 'Chocolate Cake', price: 5.99, category_id: 3, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200', stock: 20, barcode: '3001', is_active: true },
  { id: 18, name: 'Cheesecake', price: 6.50, category_id: 3, image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=200', stock: 15, barcode: '3002', is_active: true },
  { id: 19, name: 'Ice Cream Sundae', price: 4.99, category_id: 3, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200', stock: 30, barcode: '3003', is_active: true },
  { id: 20, name: 'Tiramisu', price: 6.99, category_id: 3, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200', stock: 12, barcode: '3004', is_active: true },
  { id: 21, name: 'Apple Pie', price: 4.50, category_id: 3, image: 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=200', stock: 18, barcode: '3005', is_active: true },
  { id: 22, name: 'Brownie', price: 3.99, category_id: 3, image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=200', stock: 25, barcode: '3006', is_active: true },

  // Snacks
  { id: 23, name: 'French Fries', price: 3.50, category_id: 4, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200', stock: 50, barcode: '4001', is_active: true },
  { id: 24, name: 'Onion Rings', price: 4.00, category_id: 4, image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=200', stock: 40, barcode: '4002', is_active: true },
  { id: 25, name: 'Nachos', price: 5.50, category_id: 4, image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=200', stock: 35, barcode: '4003', is_active: true },
  { id: 26, name: 'Mozzarella Sticks', price: 5.99, category_id: 4, image: 'https://images.unsplash.com/photo-1548340748-6d2b7d7da280?w=200', stock: 30, barcode: '4004', is_active: true },
  { id: 27, name: 'Garlic Bread', price: 3.00, category_id: 4, image: 'https://images.unsplash.com/photo-1619535860434-cf9b902c7f5e?w=200', stock: 45, barcode: '4005', is_active: true },
  { id: 28, name: 'Spring Rolls', price: 4.50, category_id: 4, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200', stock: 28, barcode: '4006', is_active: true },
];

// Payment methods
export const paymentMethods = [
  { id: 'cash', name: 'Cash', icon: 'Banknote' },
  { id: 'card', name: 'Card', icon: 'CreditCard' },
  { id: 'upi', name: 'UPI', icon: 'Smartphone' },
];

// Tax rate (5%)
export const TAX_RATE = 0.05;

// Generate bill number
export const generateBillNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${dateStr}-${random}`;
};

// Get stored data from localStorage
export const getStoredBills = () => {
  try {
    return JSON.parse(localStorage.getItem('pos_completed_bills') || '[]');
  } catch {
    return [];
  }
};

export const getStoredHeldBills = () => {
  try {
    return JSON.parse(localStorage.getItem('pos_held_bills') || '[]');
  } catch {
    return [];
  }
};

// Save data to localStorage
export const saveCompletedBill = (bill) => {
  const bills = getStoredBills();
  bills.unshift(bill);
  localStorage.setItem('pos_completed_bills', JSON.stringify(bills.slice(0, 100))); // Keep last 100
};

export const saveHeldBills = (bills) => {
  localStorage.setItem('pos_held_bills', JSON.stringify(bills));
};
