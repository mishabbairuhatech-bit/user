import { forwardRef, useState } from 'react';
import { Eye, EyeOff, Plus, Minus } from 'lucide-react';

const sizeClasses = {
  sm: {
    input: 'px-2 py-1.5 text-xs min-h-[32px]',
    label: 'text-[10px]',
    icon: 'w-3.5 h-3.5',
    iconWrapper: 'px-1.5',
    error: 'text-[10px]',
  },
  md: {
    input: 'px-3 py-2 text-sm min-h-[38px]',
    label: 'text-xs',
    icon: 'w-4 h-4',
    iconWrapper: 'px-2',
    error: 'text-[11px]',
  },
  lg: {
    input: 'px-4 py-2.5 text-base min-h-[46px]',
    label: 'text-sm',
    icon: 'w-5 h-5',
    iconWrapper: 'px-2.5',
    error: 'text-xs',
  }
};

const Input = forwardRef(({
  label,
  error,
  type = 'text',
  size = 'md',
  variant = 'default',
  prefix,
  suffix,
  prefixIcon: PrefixIcon,
  suffixIcon: SuffixIcon,
  min,
  max,
  step = 1,
  className = '',
  disabled = false,
  value,
  onChange,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const sizes = sizeClasses[size] || sizeClasses.md;

  const isPassword = type === 'password';
  const isNumber = type === 'number';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const handleIncrement = () => {
    if (disabled) return;
    const currentValue = parseFloat(value) || 0;
    const newValue = max !== undefined ? Math.min(currentValue + step, max) : currentValue + step;
    onChange?.({ target: { value: newValue } });
  };

  const handleDecrement = () => {
    if (disabled) return;
    const currentValue = parseFloat(value) || 0;
    const newValue = min !== undefined ? Math.max(currentValue - step, min) : currentValue - step;
    onChange?.({ target: { value: newValue } });
  };

  const togglePassword = () => {
    setShowPassword(prev => !prev);
  };

  // ── Floating label variant ──
  if (variant === 'floating') {
    return (
      <div className="w-full">
        <div className="relative">
          <input
            ref={ref}
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder=" "
            className={`
              peer w-full rounded-full border bg-transparent
              px-5 pt-4 pb-1.5 text-sm outline-none transition-colors
              text-black dark:text-[rgba(255,255,255,0.85)]
              placeholder-transparent
              ${disabled ? 'bg-gray-100 dark:bg-[#2a2a2a] cursor-not-allowed' : ''}
              ${error
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-gray-300 dark:border-[#424242] focus:border-primary-500 focus:ring-1 focus:ring-primary-500'}
              ${className}
            `}
            {...props}
          />

          {label && (
            <label
              className={`
                pointer-events-none absolute left-5 top-1/2 -translate-y-1/2
                text-base text-gray-400 dark:text-gray-500
                transition-all duration-200 origin-left
                peer-focus:top-0 peer-focus:translate-y-[-50%] peer-focus:scale-[0.8] peer-focus:px-1.5
                peer-focus:bg-white peer-focus:dark:bg-[#141414]
                peer-focus:text-primary-500
                peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:translate-y-[-50%]
                peer-[:not(:placeholder-shown)]:scale-[0.8] peer-[:not(:placeholder-shown)]:px-1.5
                peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:dark:bg-[#141414]
                ${error ? 'peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-red-500' : 'peer-[:not(:placeholder-shown)]:text-gray-500 peer-[:not(:placeholder-shown)]:dark:text-gray-400'}
              `}
            >
              {label}
            </label>
          )}

          {isPassword && (
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              onClick={togglePassword}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}

          {SuffixIcon && !isPassword && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              <SuffixIcon className="w-5 h-5" />
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1.5 ml-2 text-xs text-red-600">{error}</p>
        )}
      </div>
    );
  }

  // ── Default variant ──
  return (
    <div className="w-full">
      {label && (
        <label className={`block font-medium text-black dark:text-[rgba(255,255,255,0.85)] mb-1 ${sizes.label}`}>
          {label}
        </label>
      )}
      <div
        className={`
          w-full border rounded-xl shadow-sm
          bg-white dark:bg-[#1f1f1f] flex items-center
          ${sizes.input}
          ${disabled ? 'bg-gray-100 dark:bg-[#2a2a2a] cursor-not-allowed' : ''}
          ${error ? 'border-red-500 focus-within:ring-red-500 focus-within:border-red-500' : 'border-gray-300 dark:border-[#424242] focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500'}
          ${className}
        `}
      >
        {isNumber && (
          <button
            type="button"
            className={`flex items-center justify-center ${sizes.iconWrapper} hover:bg-gray-100 rounded-l-xl ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            onClick={handleDecrement}
            disabled={disabled}
          >
            <Minus className={`${sizes.icon} text-gray-500`} />
          </button>
        )}

        {PrefixIcon && (
          <div className={`flex items-center justify-center ${sizes.iconWrapper}`}>
            <PrefixIcon className={`${sizes.icon} text-gray-400`} />
          </div>
        )}

        {prefix && (
          <span className={`text-gray-500 ${sizes.iconWrapper}`}>
            {prefix}
          </span>
        )}

        <input
          ref={ref}
          type={isNumber ? 'text' : inputType}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            flex-1 outline-none bg-transparent
            placeholder-gray-400 dark:placeholder-gray-500
            text-black dark:text-[rgba(255,255,255,0.85)]
            disabled:cursor-not-allowed
            ${isNumber ? 'text-center' : ''}
          `}
          {...props}
        />

        {suffix && (
          <span className={`text-gray-500 ${sizes.iconWrapper}`}>
            {suffix}
          </span>
        )}

        {SuffixIcon && !isPassword && (
          <div className={`flex items-center justify-center ${sizes.iconWrapper}`}>
            <SuffixIcon className={`${sizes.icon} text-gray-400`} />
          </div>
        )}

        {isPassword && (
          <button
            type="button"
            className={`flex items-center justify-center ${sizes.iconWrapper} hover:bg-gray-100 rounded-r-xl cursor-pointer`}
            onClick={togglePassword}
          >
            {showPassword ? (
              <EyeOff className={`${sizes.icon} text-gray-400`} />
            ) : (
              <Eye className={`${sizes.icon} text-gray-400`} />
            )}
          </button>
        )}

        {isNumber && (
          <button
            type="button"
            className={`flex items-center justify-center ${sizes.iconWrapper} hover:bg-gray-100 rounded-r-xl ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            onClick={handleIncrement}
            disabled={disabled}
          >
            <Plus className={`${sizes.icon} text-gray-500`} />
          </button>
        )}
      </div>
      {error && (
        <p className={`mt-1 text-red-600 ${sizes.error}`}>{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
