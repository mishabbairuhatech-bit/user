import { forwardRef } from 'react';
import { Check, Minus } from 'lucide-react';

const sizeClasses = {
  sm: {
    box: 'w-4 h-4',
    check: 'w-3 h-3',
    label: 'text-xs',
  },
  md: {
    box: 'w-[18px] h-[18px]',
    check: 'w-3.5 h-3.5',
    label: 'text-sm',
  },
  lg: {
    box: 'w-5 h-5',
    check: 'w-4 h-4',
    label: 'text-base',
  },
};

const Checkbox = forwardRef(({
  label,
  checked = false,
  onChange,
  disabled = false,
  error,
  indeterminate = false,
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const sizes = sizeClasses[size] || sizeClasses.md;

  const handleChange = () => {
    if (disabled || !onChange) return;
    // Create a synthetic event-like object
    const event = {
      target: {
        checked: !checked,
        value: !checked,
      },
    };
    onChange(event);
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleChange();
    }
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      <div
        ref={ref}
        role="checkbox"
        aria-checked={indeterminate ? 'mixed' : checked}
        tabIndex={disabled ? -1 : 0}
        className={`
          ${sizes.box} flex items-center justify-center cursor-pointer
          rounded border-2 transition-all duration-200
          ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          ${checked || indeterminate
            ? 'bg-white dark:bg-[#1f1f1f] border-primary-500'
            : 'bg-white dark:bg-[#1f1f1f] border-gray-300 dark:border-[#424242] hover:border-primary-400'
          }
          ${error ? 'border-red-500' : ''}
        `}
        onClick={handleChange}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {checked && !indeterminate && (
          <Check className={`${sizes.check} text-primary-500`} strokeWidth={3} />
        )}
        {indeterminate && (
          <Minus className={`${sizes.check} text-primary-500`} strokeWidth={3} />
        )}
      </div>
      {label && (
        <span
          className={`ml-2 ${sizes.label} ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-900 dark:text-[rgba(255,255,255,0.85)] cursor-pointer'} select-none`}
          onClick={handleChange}
        >
          {label}
        </span>
      )}
      {error && (
        <p className="ml-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
