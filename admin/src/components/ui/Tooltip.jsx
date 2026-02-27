import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

const GAP = 8;

const colorClasses = {
  dark: {
    bg: 'bg-gray-800 dark:bg-[#2a2a2a] text-white dark:text-[rgba(255,255,255,0.85)] dark:border dark:border-[#424242]',
    arrow: {
      top: 'border-t-gray-800 dark:border-t-[#2a2a2a]',
      bottom: 'border-b-gray-800 dark:border-b-[#2a2a2a]',
      left: 'border-l-gray-800 dark:border-l-[#2a2a2a]',
      right: 'border-r-gray-800 dark:border-r-[#2a2a2a]',
    },
  },
  light: {
    bg: 'bg-white dark:bg-[#2a2a2a] text-gray-800 dark:text-[rgba(255,255,255,0.85)] border border-gray-200 dark:border-[#424242]',
    arrow: {
      top: 'border-t-white dark:border-t-[#2a2a2a]',
      bottom: 'border-b-white dark:border-b-[#2a2a2a]',
      left: 'border-l-white dark:border-l-[#2a2a2a]',
      right: 'border-r-white dark:border-r-[#2a2a2a]',
    },
  },
  primary: {
    bg: 'bg-primary-500 text-white',
    arrow: {
      top: 'border-t-primary-500',
      bottom: 'border-b-primary-500',
      left: 'border-l-primary-500',
      right: 'border-r-primary-500',
    },
  },
  success: {
    bg: 'bg-emerald-500 text-white',
    arrow: {
      top: 'border-t-emerald-500',
      bottom: 'border-b-emerald-500',
      left: 'border-l-emerald-500',
      right: 'border-r-emerald-500',
    },
  },
  warning: {
    bg: 'bg-amber-500 text-white',
    arrow: {
      top: 'border-t-amber-500',
      bottom: 'border-b-amber-500',
      left: 'border-l-amber-500',
      right: 'border-r-amber-500',
    },
  },
  error: {
    bg: 'bg-rose-500 text-white',
    arrow: {
      top: 'border-t-rose-500',
      bottom: 'border-b-rose-500',
      left: 'border-l-rose-500',
      right: 'border-r-rose-500',
    },
  },
  info: {
    bg: 'bg-sky-500 text-white',
    arrow: {
      top: 'border-t-sky-500',
      bottom: 'border-b-sky-500',
      left: 'border-l-sky-500',
      right: 'border-r-sky-500',
    },
  },
};

const arrowPositions = {
  top: 'border-x-transparent border-b-transparent',
  bottom: 'border-x-transparent border-t-transparent',
  left: 'border-y-transparent border-r-transparent',
  right: 'border-y-transparent border-l-transparent',
};

const sizeClasses = {
  sm: 'max-w-[200px] text-xs [overflow-wrap:break-word]',
  md: 'max-w-[300px] text-xs [overflow-wrap:break-word]',
  lg: 'max-w-[400px] text-sm [overflow-wrap:break-word]',
  xl: 'max-w-[500px] text-sm [overflow-wrap:break-word]',
  auto: 'text-xs',
};

const Tooltip = ({
  children,
  content,
  position = 'top',
  size = 'md',
  color = 'dark',
  delay = 200,
  disabled = false,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [arrowCoords, setArrowCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  const calcPosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tip = tooltipRef.current.getBoundingClientRect();

    let top = 0, left = 0, arrowTop = 0, arrowLeft = 0;

    switch (position) {
      case 'top':
        top = rect.top - tip.height - GAP;
        left = rect.left + rect.width / 2 - tip.width / 2;
        arrowTop = tip.height - 1;
        arrowLeft = tip.width / 2 - 4;
        break;
      case 'bottom':
        top = rect.bottom + GAP;
        left = rect.left + rect.width / 2 - tip.width / 2;
        arrowTop = -7;
        arrowLeft = tip.width / 2 - 4;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tip.height / 2;
        left = rect.left - tip.width - GAP;
        arrowTop = tip.height / 2 - 4;
        arrowLeft = tip.width - 1;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tip.height / 2;
        left = rect.right + GAP;
        arrowTop = tip.height / 2 - 4;
        arrowLeft = -7;
        break;
    }

    setCoords({ top, left });
    setArrowCoords({ top: arrowTop, left: arrowLeft });
  }, [position]);

  const showTooltip = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) calcPosition();
  }, [isVisible, calcPosition]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!content) return children;

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            style={{ position: 'fixed', top: coords.top, left: coords.left }}
            className={`
              z-[9999] px-2 py-1.5 font-normal
              rounded-md shadow-lg
              leading-snug w-max pointer-events-none
              ${colorClasses[color]?.bg || colorClasses.dark.bg}
              ${sizeClasses[size] || sizeClasses.md}
              ${className}
            `}
          >
            {content}
            <div
              style={{ position: 'absolute', top: arrowCoords.top, left: arrowCoords.left }}
              className={`
                w-0 h-0 border-4
                ${arrowPositions[position]}
                ${colorClasses[color]?.arrow[position] || colorClasses.dark.arrow[position]}
              `}
            />
          </div>,
          document.body
        )}
    </div>
  );
};

Tooltip.displayName = 'Tooltip';

export default Tooltip;
