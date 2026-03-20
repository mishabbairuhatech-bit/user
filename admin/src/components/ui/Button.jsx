import { forwardRef } from 'react';

const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
  secondary: 'bg-gray-200 dark:bg-[#2a2a2a] text-gray-900 dark:text-[rgba(255,255,255,0.85)] hover:bg-gray-300 dark:hover:bg-[#363636] active:bg-gray-400 dark:active:bg-[#424242]',
  outline: 'border border-gray-300 dark:border-[#424242] text-gray-700 dark:text-[rgba(255,255,255,0.85)] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] active:bg-gray-100 dark:active:bg-[#363636]',
  dashed: 'border border-dashed border-gray-300 dark:border-[#424242] text-gray-700 dark:text-[rgba(255,255,255,0.85)] hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 active:bg-primary-100 dark:active:bg-primary-900/30',
  danger: 'bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700',
  'danger-outline': 'border border-rose-300 dark:border-rose-500/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 active:bg-rose-100 dark:active:bg-rose-900/30',
  ghost: 'text-gray-700 dark:text-[rgba(255,255,255,0.85)] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] active:bg-gray-200 dark:active:bg-[#363636]',
  link: 'text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 active:text-primary-800 dark:active:text-primary-500 hover:underline',
};

const sizeClasses = {
  sm: {
    button: 'px-3 py-1.5 text-xs min-h-[32px] gap-1.5',
    icon: 'w-3.5 h-3.5',
    spinner: 'h-3 w-3',
  },
  md: {
    button: 'px-4 py-2 text-sm min-h-[38px] gap-2',
    icon: 'w-4 h-4',
    spinner: 'h-4 w-4',
  },
  lg: {
    button: 'px-6 py-2.5 text-base min-h-[46px] gap-2.5',
    icon: 'w-5 h-5',
    spinner: 'h-5 w-5',
  },
};

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  icon: Icon,
  prefixIcon: PrefixIcon,
  suffixIcon: SuffixIcon,
  iconOnly = false,
  ...props
}, ref) => {
  const sizes = sizeClasses[size] || sizeClasses.md;
  const IconComponent = Icon || PrefixIcon;

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium rounded-xl
        outline-none
        focus:outline-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#141414]
        transition-all duration-200
        active:scale-[0.97]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variants[variant] || variants.primary}
        ${sizes.button}
        ${iconOnly ? '!px-2' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <svg className={`animate-spin ${sizes.spinner}`} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : IconComponent ? (
        <IconComponent className={sizes.icon} />
      ) : null}
      {children}
      {SuffixIcon && !loading && (
        <SuffixIcon className={sizes.icon} />
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
