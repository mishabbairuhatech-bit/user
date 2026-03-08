import { useState, useEffect, useCallback } from 'react';
import { Banknote, CreditCard, Smartphone, Check } from 'lucide-react';
import { Modal, Button, Input } from '@components/ui';

const paymentMethods = [
  { id: 'cash', name: 'Cash', icon: Banknote, color: 'bg-green-500' },
  { id: 'card', name: 'Card', icon: CreditCard, color: 'bg-blue-500' },
  { id: 'upi', name: 'UPI', icon: Smartphone, color: 'bg-purple-500' },
];

const PaymentModal = ({ isOpen, onClose, totals, onComplete }) => {
  const [selectedMethod, setSelectedMethod] = useState('cash');
  const [amountTendered, setAmountTendered] = useState('');
  const [processing, setProcessing] = useState(false);
  const [selectedMethodIndex, setSelectedMethodIndex] = useState(0);

  const change = selectedMethod === 'cash' && amountTendered
    ? Math.max(0, Number(amountTendered) - totals.total)
    : 0;

  const canComplete = selectedMethod === 'cash'
    ? Number(amountTendered) >= totals.total
    : true;

  const handleComplete = useCallback(async () => {
    setProcessing(true);
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    onComplete(selectedMethod, Number(amountTendered) || totals.total);
    setProcessing(false);
    setSelectedMethod('cash');
    setSelectedMethodIndex(0);
    setAmountTendered('');
  }, [selectedMethod, amountTendered, totals.total, onComplete]);

  const quickAmounts = [10, 20, 50, 100];

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      const index = paymentMethods.findIndex(m => m.id === selectedMethod);
      setSelectedMethodIndex(index >= 0 ? index : 0);
    }
  }, [isOpen]);

  // Sync method index with selected method
  useEffect(() => {
    setSelectedMethod(paymentMethods[selectedMethodIndex].id);
  }, [selectedMethodIndex]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;

    // Skip if typing in input (except for specific keys)
    const isInput = e.target.tagName === 'INPUT';

    if (e.key === 'ArrowRight' && !isInput) {
      e.preventDefault();
      setSelectedMethodIndex(prev => Math.min(prev + 1, paymentMethods.length - 1));
    } else if (e.key === 'ArrowLeft' && !isInput) {
      e.preventDefault();
      setSelectedMethodIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && canComplete && !processing) {
      e.preventDefault();
      handleComplete();
    } else if (!isInput && selectedMethod === 'cash') {
      // Quick amount shortcuts (1-4 for amounts, E for exact)
      if (e.key === '1') {
        e.preventDefault();
        setAmountTendered('10');
      } else if (e.key === '2') {
        e.preventDefault();
        setAmountTendered('20');
      } else if (e.key === '3') {
        e.preventDefault();
        setAmountTendered('50');
      } else if (e.key === '4') {
        e.preventDefault();
        setAmountTendered('100');
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setAmountTendered(String(Math.ceil(totals.total)));
      }
    }
  }, [isOpen, canComplete, processing, handleComplete, selectedMethod, totals.total]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payment"
      size="md"
    >
      <div className="space-y-6">
        {/* Total */}
        <div className="text-center p-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
          <p className="text-4xl font-bold text-primary-600 dark:text-primary-400">
            ${totals.total.toFixed(2)}
          </p>
        </div>

        {/* Payment methods */}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Payment Method
          </p>
          <div className="grid grid-cols-3 gap-3">
            {paymentMethods.map((method, index) => {
              const Icon = method.icon;
              const isSelected = index === selectedMethodIndex;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethodIndex(index)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-[#2a2a2a] hover:border-gray-300 dark:hover:border-[#424242]'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full ${method.color} flex items-center justify-center text-white`}>
                    <Icon size={24} />
                  </div>
                  <span className={`text-sm font-medium ${
                    isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {method.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cash input */}
        {selectedMethod === 'cash' && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount Tendered
            </p>
            <Input
              type="number"
              value={amountTendered}
              onChange={(e) => setAmountTendered(e.target.value)}
              placeholder="Enter amount"
              className="text-center text-2xl h-14"
              autoFocus
            />

            {/* Quick amounts */}
            <div className="flex gap-2">
              {quickAmounts.map((amount, idx) => (
                <button
                  key={amount}
                  onClick={() => setAmountTendered(String(amount))}
                  className="flex-1 py-2 bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#363636] rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors flex flex-col items-center"
                >
                  <span>${amount}</span>
                  <kbd className="text-xs text-gray-400 mt-0.5">{idx + 1}</kbd>
                </button>
              ))}
              <button
                onClick={() => setAmountTendered(String(Math.ceil(totals.total)))}
                className="flex-1 py-2 bg-primary-100 dark:bg-primary-900/20 hover:bg-primary-200 dark:hover:bg-primary-900/30 rounded-lg text-sm font-medium text-primary-600 dark:text-primary-400 transition-colors flex flex-col items-center"
              >
                <span>Exact</span>
                <kbd className="text-xs text-primary-400 mt-0.5">E</kbd>
              </button>
            </div>

            {/* Change */}
            {Number(amountTendered) > 0 && (
              <div className={`p-4 rounded-xl ${
                change >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
              }`}>
                <div className="flex justify-between">
                  <span className={`text-sm ${
                    change >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                  }`}>
                    {change >= 0 ? 'Change' : 'Amount Due'}
                  </span>
                  <span className={`text-xl font-bold ${
                    change >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                  }`}>
                    ${Math.abs(change).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Complete button */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel <kbd className="ml-2 text-xs opacity-50">Esc</kbd>
          </Button>
          <Button
            onClick={handleComplete}
            disabled={!canComplete}
            loading={processing}
            className="flex-1"
            prefixIcon={Check}
          >
            Complete <kbd className="ml-2 text-xs opacity-50">Enter</kbd>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
