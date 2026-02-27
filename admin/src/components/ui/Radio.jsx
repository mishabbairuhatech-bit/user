import { forwardRef } from 'react';

const sizeClasses = {
  sm: {
    outer: 'w-3.5 h-3.5 border',
    inner: 'w-1.5 h-1.5',
    label: 'text-xs',
  },
  md: {
    outer: 'w-4 h-4 border',
    inner: 'w-2 h-2',
    label: 'text-sm',
  },
  lg: {
    outer: 'w-5 h-5 border',
    inner: 'w-2.5 h-2.5',
    label: 'text-base',
  },
};

const Radio = forwardRef(({
  label,
  checked = false,
  onChange,
  disabled = false,
  name,
  value,
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const sizes = sizeClasses[size] || sizeClasses.md;
  return (
    <div className={`flex items-center ${className}`}>
      <div
        ref={ref}
        role="radio"
        aria-checked={checked}
        tabIndex={disabled ? -1 : 0}
        className={`
          ${sizes.outer} rounded-full flex items-center justify-center cursor-pointer
          transition-colors duration-200
          ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          ${checked
            ? 'bg-white dark:bg-[#121212] border-primary-500'
            : 'bg-white dark:bg-[#121212] border-gray-300 dark:border-[#424242] hover:border-primary-500'
          }
        `}
        onClick={() => !disabled && onChange && onChange(value)}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            !disabled && onChange && onChange(value);
          }
        }}
        {...props}
      >
        {checked && (
          <div className={`${sizes.inner} rounded-full bg-primary-500`} />
        )}
      </div>
      {label && (
        <label
          className={`ml-2 ${sizes.label} ${disabled ? 'text-gray-400' : 'text-gray-700 dark:text-[rgba(255,255,255,0.75)]'} cursor-pointer`}
          onClick={() => !disabled && onChange && onChange(value)}
        >
          {label}
        </label>
      )}
    </div>
  );
});

Radio.displayName = 'Radio';

const RadioGroup = forwardRef(({
  label,
  options = [],
  value,
  onChange,
  disabled = false,
  error,
  direction = 'vertical',
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const sizes = sizeClasses[size] || sizeClasses.md;
  return (
    <div ref={ref} className={className} {...props}>
      {label && (
        <label className={`block ${sizes.label} font-medium text-gray-700 dark:text-[rgba(255,255,255,0.75)] mb-2`}>
          {label}
        </label>
      )}
      <div className={`flex ${direction === 'vertical' ? 'flex-col space-y-2' : 'flex-row space-x-4'}`}>
        {options.map((option) => (
          <Radio
            key={option.value}
            label={option.label}
            value={option.value}
            checked={value === option.value}
            onChange={onChange}
            disabled={disabled || option.disabled}
            size={size}
          />
        ))}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

RadioGroup.displayName = 'RadioGroup';

export { Radio, RadioGroup };
export default Radio;
