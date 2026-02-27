import { forwardRef, useEffect, useState } from 'react';
import { X } from 'lucide-react';

const sizeClasses = {
  sm: {
    horizontal: 'w-72',
    vertical: 'h-48',
  },
  md: {
    horizontal: 'w-96',
    vertical: 'h-72',
  },
  lg: {
    horizontal: 'w-[480px]',
    vertical: 'h-96',
  },
  xl: {
    horizontal: 'w-[640px]',
    vertical: 'h-[480px]',
  },
  full: {
    horizontal: 'w-full',
    vertical: 'h-full',
  },
};

const placementClasses = {
  left: {
    container: 'left-0 top-0 h-full',
    animation: {
      open: 'translate-x-0',
      closed: '-translate-x-full',
    },
  },
  right: {
    container: 'right-0 top-0 h-full',
    animation: {
      open: 'translate-x-0',
      closed: 'translate-x-full',
    },
  },
  top: {
    container: 'top-0 left-0 w-full',
    animation: {
      open: 'translate-y-0',
      closed: '-translate-y-full',
    },
  },
  bottom: {
    container: 'bottom-0 left-0 w-full',
    animation: {
      open: 'translate-y-0',
      closed: 'translate-y-full',
    },
  },
};

const Drawer = forwardRef(({
  isOpen = false,
  onClose,
  title,
  children,
  footer,
  placement = 'right',
  size = 'md',
  closable = true,
  maskClosable = true,
  className = '',
  ...props
}, ref) => {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  const isHorizontal = placement === 'left' || placement === 'right';
  const sizeClass = isHorizontal ? sizeClasses[size]?.horizontal : sizeClasses[size]?.vertical;
  const placementClass = placementClasses[placement];

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimating(true);
        });
      });
      document.body.style.overflow = 'hidden';
    } else {
      setAnimating(false);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 300);
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleMaskClick = () => {
    if (maskClosable) {
      onClose?.();
    }
  };

  if (!visible) return null;

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-50"
      {...props}
    >
      {/* Backdrop */}
      <div
        className={`
          absolute inset-0 bg-black/50
          transition-opacity duration-300
          ${animating ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={handleMaskClick}
      />

      {/* Drawer Panel */}
      <div
        className={`
          absolute bg-white dark:bg-[#1f1f1f] shadow-2xl flex flex-col
          transition-transform duration-300 ease-out
          ${placementClass.container}
          ${sizeClass}
          ${animating ? placementClass.animation.open : placementClass.animation.closed}
          ${className}
        `}
      >
        {/* Header */}
        {(title || closable) && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#424242]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)]">{title}</h3>
            {closable && (
              <button
                onClick={onClose}
                className="p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-[#424242]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
});

Drawer.displayName = 'Drawer';

export default Drawer;
