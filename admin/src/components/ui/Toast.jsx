import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

// ─── Toast Context ───────────────────────────────────────────────
const ToastContext = createContext(null);

let toastIdCounter = 0;

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// ─── Toast Provider ──────────────────────────────────────────────
export const ToastProvider = ({ children, position = 'top-right', maxToasts = 5 }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ variant = 'info', title, message, duration = 4000, closable = true }) => {
    const id = ++toastIdCounter;
    setToasts((prev) => {
      const next = [...prev, { id, variant, title, message, duration, closable, entering: true }];
      return next.length > maxToasts ? next.slice(next.length - maxToasts) : next;
    });
    return id;
  }, [maxToasts]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const toast = useCallback((messageOrOptions) => {
    if (typeof messageOrOptions === 'string') {
      return addToast({ message: messageOrOptions });
    }
    return addToast(messageOrOptions);
  }, [addToast]);

  toast.success = (title, message) =>
    addToast({ variant: 'success', title, message: typeof title === 'string' && !message ? undefined : message, ...(typeof title === 'object' ? title : message ? {} : { message: title, title: undefined }) });
  toast.error = (title, message) =>
    addToast({ variant: 'danger', title, message: typeof title === 'string' && !message ? undefined : message, ...(typeof title === 'object' ? title : message ? {} : { message: title, title: undefined }) });
  toast.warning = (title, message) =>
    addToast({ variant: 'warning', title, message: typeof title === 'string' && !message ? undefined : message, ...(typeof title === 'object' ? title : message ? {} : { message: title, title: undefined }) });
  toast.info = (title, message) =>
    addToast({ variant: 'info', title, message: typeof title === 'string' && !message ? undefined : message, ...(typeof title === 'object' ? title : message ? {} : { message: title, title: undefined }) });

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} position={position} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// ─── Position Classes ────────────────────────────────────────────
const positionClasses = {
  'top-right': 'top-4 right-4 items-end',
  'top-left': 'top-4 left-4 items-start',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
  'bottom-right': 'bottom-4 right-4 items-end',
  'bottom-left': 'bottom-4 left-4 items-start',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
};

// ─── Toast Container ─────────────────────────────────────────────
const ToastContainer = ({ toasts, position, onRemove }) => {
  if (toasts.length === 0) return null;

  const isBottom = position.startsWith('bottom');

  return createPortal(
    <div
      className={`fixed z-[9999] flex flex-col gap-2 pointer-events-none ${positionClasses[position]}`}
    >
      {(isBottom ? [...toasts].reverse() : toasts).map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>,
    document.body
  );
};

// ─── Variant Config ──────────────────────────────────────────────
const variantConfig = {
  success: {
    icon: CheckCircle,
    bg: 'bg-white dark:bg-[#121212]',
    border: 'border-success-500',
    iconColor: 'text-success-500',
    bar: 'bg-success-500',
  },
  danger: {
    icon: AlertCircle,
    bg: 'bg-white dark:bg-[#121212]',
    border: 'border-danger-500',
    iconColor: 'text-danger-500',
    bar: 'bg-danger-500',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-white dark:bg-[#121212]',
    border: 'border-warning-500',
    iconColor: 'text-warning-500',
    bar: 'bg-warning-500',
  },
  info: {
    icon: Info,
    bg: 'bg-white dark:bg-[#121212]',
    border: 'border-info-500',
    iconColor: 'text-info-500',
    bar: 'bg-info-500',
  },
};

// ─── Single Toast ────────────────────────────────────────────────
const ToastItem = ({ toast, onRemove }) => {
  const { id, variant = 'info', title, message, duration, closable = true, exiting } = toast;
  const config = variantConfig[variant] || variantConfig.info;
  const IconComponent = config.icon;
  const timerRef = useRef(null);
  const [progress, setProgress] = useState(100);
  const [paused, setPaused] = useState(false);
  const startTimeRef = useRef(Date.now());
  const remainingRef = useRef(duration);

  useEffect(() => {
    if (duration <= 0) return;

    const startTimer = () => {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const newRemaining = remainingRef.current - elapsed;
        if (newRemaining <= 0) {
          clearInterval(timerRef.current);
          onRemove(id);
        } else {
          setProgress((newRemaining / duration) * 100);
        }
      }, 50);
    };

    if (!paused) {
      startTimer();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startTimeRef.current));
      }
    };
  }, [paused, duration, id, onRemove]);

  const handleMouseEnter = () => {
    setPaused(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startTimeRef.current));
    }
  };

  const handleMouseLeave = () => {
    setPaused(false);
  };

  return (
    <div
      className={`
        pointer-events-auto w-[360px] max-w-[calc(100vw-2rem)]
        rounded-xl shadow-lg border-l-4
        ${config.bg} ${config.border}
        border border-gray-200 dark:border-[#424242] border-l-4
        overflow-hidden
        transition-all duration-300 ease-out
        ${exiting ? 'opacity-0 translate-x-4 scale-95' : 'opacity-100 translate-x-0 scale-100'}
        animate-[slideIn_0.3s_ease-out]
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
    >
      <div className="flex items-start gap-3 p-4">
        <div className={`flex-shrink-0 mt-0.5 ${config.iconColor}`}>
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
          )}
          {message && (
            <p className={`text-sm text-gray-600 dark:text-gray-400 ${title ? 'mt-0.5' : ''}`}>
              {message}
            </p>
          )}
          {!title && !message && (
            <p className="text-sm text-gray-600 dark:text-gray-400">Notification</p>
          )}
        </div>
        {closable && (
          <button
            onClick={() => onRemove(id)}
            className="flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {duration > 0 && (
        <div className="h-1 w-full bg-gray-100 dark:bg-[#2a2a2a]">
          <div
            className={`h-full ${config.bar} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default ToastProvider;
