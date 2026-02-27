import { useState, useRef, useEffect } from 'react';

const positions = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

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
  top: 'top-full left-1/2 -translate-x-1/2 border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-y-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-y-transparent border-l-transparent',
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
  const timeoutRef = useRef(null);

  const showTooltip = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!content) return children;

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={`
            absolute z-50 px-2 py-1.5 font-normal
            rounded-md shadow-lg
            leading-snug w-max
            ${colorClasses[color]?.bg || colorClasses.dark.bg}
            ${sizeClasses[size] || sizeClasses.md}
            ${positions[position]}
            ${className}
          `}
        >
          {content}
          <div
            className={`
              absolute w-0 h-0 border-4
              ${arrowPositions[position]}
              ${colorClasses[color]?.arrow[position] || colorClasses.dark.arrow[position]}
            `}
          />
        </div>
      )}
    </div>
  );
};

Tooltip.displayName = 'Tooltip';

export default Tooltip;
