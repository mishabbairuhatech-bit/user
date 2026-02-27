import { forwardRef } from 'react';
import { Check, X } from 'lucide-react';

const sizes = {
  sm: {
    track: 'w-8 h-4',
    thumb: 'w-3 h-3',
    translate: 'translate-x-4',
    icon: 'w-2 h-2',
    iconLeft: 'left-1',
    iconRight: 'right-1',
    label: 'text-xs',
  },
  md: {
    track: 'w-11 h-6',
    thumb: 'w-5 h-5',
    translate: 'translate-x-5',
    icon: 'w-3 h-3',
    iconLeft: 'left-1',
    iconRight: 'right-1',
    label: 'text-sm',
  },
  lg: {
    track: 'w-14 h-7',
    thumb: 'w-6 h-6',
    translate: 'translate-x-7',
    icon: 'w-4 h-4',
    iconLeft: 'left-1.5',
    iconRight: 'right-1.5',
    label: 'text-base',
  },
};

const Switch = forwardRef(({
  label,
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  showIcons = false,
  checkedIcon,
  uncheckedIcon,
  className = '',
  ...props
}, ref) => {
  const sizeStyles = sizes[size] || sizes.md;

  const CheckedIcon = checkedIcon || Check;
  const UncheckedIcon = uncheckedIcon || X;

  return (
    <div className={`flex items-center ${className}`}>
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={`
          relative inline-flex items-center rounded-full border-2
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-[#1f1f1f]
          ${sizeStyles.track}
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          ${checked
            ? 'bg-primary-500 border-primary-500'
            : 'bg-white dark:bg-[#1f1f1f] border-gray-300 dark:border-[#424242]'}
        `}
        onClick={() => !disabled && onChange && onChange(!checked)}
        {...props}
      >
        {/* Icons inside track */}
        {showIcons && (
          <>
            <span
              className={`
                absolute ${sizeStyles.iconLeft} top-1/2 -translate-y-1/2
                transition-opacity duration-200
                ${checked ? 'opacity-100' : 'opacity-0'}
              `}
            >
              <CheckedIcon className={`${sizeStyles.icon} text-white`} strokeWidth={3} />
            </span>
            <span
              className={`
                absolute ${sizeStyles.iconRight} top-1/2 -translate-y-1/2
                transition-opacity duration-200
                ${checked ? 'opacity-0' : 'opacity-100'}
              `}
            >
              <UncheckedIcon className={`${sizeStyles.icon} text-gray-500`} strokeWidth={3} />
            </span>
          </>
        )}

        {/* Thumb */}
        <span
          className={`
            inline-block rounded-full shadow transform
            transition-all duration-200 ease-in-out
            ${sizeStyles.thumb}
            ${checked ? `bg-white ${sizeStyles.translate}` : 'bg-gray-400 dark:bg-[#606060] translate-x-0.5'}
          `}
        />
      </button>
      {label && (
        <span
          className={`ml-3 ${sizeStyles.label} ${disabled ? 'text-gray-400' : 'text-gray-700 dark:text-[rgba(255,255,255,0.75)]'} cursor-pointer`}
          onClick={() => !disabled && onChange && onChange(!checked)}
        >
          {label}
        </span>
      )}
    </div>
  );
});

Switch.displayName = 'Switch';

export default Switch;
