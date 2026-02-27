import { forwardRef } from 'react';
import { X } from 'lucide-react';

const variantStyles = {
  // Soft/Light variants (default)
  default: {
    soft: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-[#424242]',
    outline: 'bg-white text-gray-700 border-gray-300 dark:bg-[#1f1f1f] dark:text-gray-300 dark:border-[#424242]',
    filled: 'bg-gray-600 text-white border-gray-600 dark:bg-gray-500 dark:border-gray-500',
    dot: 'bg-gray-500',
  },
  primary: {
    soft: 'bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-900/30 dark:text-primary-400 dark:border-primary-800',
    outline: 'bg-white text-primary-600 border-primary-300 dark:bg-[#1f1f1f] dark:text-primary-400 dark:border-primary-700',
    filled: 'bg-primary-600 text-white border-primary-600',
    dot: 'bg-primary-500',
  },
  success: {
    soft: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    outline: 'bg-white text-emerald-600 border-emerald-300 dark:bg-[#1f1f1f] dark:text-emerald-400 dark:border-emerald-700',
    filled: 'bg-emerald-500 text-white border-emerald-500',
    dot: 'bg-emerald-500',
  },
  warning: {
    soft: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    outline: 'bg-white text-amber-600 border-amber-300 dark:bg-[#1f1f1f] dark:text-amber-400 dark:border-amber-700',
    filled: 'bg-amber-500 text-white border-amber-500',
    dot: 'bg-amber-500',
  },
  danger: {
    soft: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    outline: 'bg-white text-red-600 border-red-300 dark:bg-[#1f1f1f] dark:text-red-400 dark:border-red-700',
    filled: 'bg-red-500 text-white border-red-500',
    dot: 'bg-red-500',
  },
  info: {
    soft: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    outline: 'bg-white text-blue-600 border-blue-300 dark:bg-[#1f1f1f] dark:text-blue-400 dark:border-blue-700',
    filled: 'bg-blue-500 text-white border-blue-500',
    dot: 'bg-blue-500',
  },
  teal: {
    soft: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800',
    outline: 'bg-white text-teal-600 border-teal-300 dark:bg-[#1f1f1f] dark:text-teal-400 dark:border-teal-700',
    filled: 'bg-teal-500 text-white border-teal-500',
    dot: 'bg-teal-500',
  },
  purple: {
    soft: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
    outline: 'bg-white text-purple-600 border-purple-300 dark:bg-[#1f1f1f] dark:text-purple-400 dark:border-purple-700',
    filled: 'bg-purple-500 text-white border-purple-500',
    dot: 'bg-purple-500',
  },
  pink: {
    soft: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800',
    outline: 'bg-white text-pink-600 border-pink-300 dark:bg-[#1f1f1f] dark:text-pink-400 dark:border-pink-700',
    filled: 'bg-pink-500 text-white border-pink-500',
    dot: 'bg-pink-500',
  },
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-sm gap-1.5',
  lg: 'px-3 py-1.5 text-sm gap-2',
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4',
};

const avatarSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const dotSizes = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
};

const Badge = forwardRef(({
  children,
  variant = 'default',
  type = 'soft', // soft, outline, filled
  size = 'md',
  rounded = true,
  icon: Icon,
  avatar,
  dot = false,
  dismissible = false,
  onDismiss,
  className = '',
  ...props
}, ref) => {
  const variantStyle = variantStyles[variant] || variantStyles.default;
  const baseStyle = variantStyle[type] || variantStyle.soft;

  return (
    <span
      ref={ref}
      className={`
        inline-flex items-center font-medium border
        ${rounded ? 'rounded-full' : 'rounded-md'}
        ${baseStyle}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {avatar && (
        <img
          src={avatar}
          alt=""
          className={`${avatarSizes[size]} rounded-full object-cover -ml-0.5`}
        />
      )}
      {dot && (
        <span
          className={`${dotSizes[size]} rounded-full ${variantStyle.dot}`}
        />
      )}
      {Icon && !avatar && !dot && (
        <Icon className={iconSizes[size]} />
      )}
      {children}
      {dismissible && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss && onDismiss();
          }}
          className="ml-0.5 -mr-1 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <X className={iconSizes[size]} />
        </button>
      )}
    </span>
  );
});

Badge.displayName = 'Badge';

export default Badge;
