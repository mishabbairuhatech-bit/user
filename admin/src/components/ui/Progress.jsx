import { forwardRef } from 'react';

const variants = {
  primary: 'bg-primary-600',
  secondary: 'bg-gray-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-500',
  danger: 'bg-red-600',
  info: 'bg-blue-600',
};

const sizes = {
  xs: 'h-1',
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
  xl: 'h-5',
};

const Progress = forwardRef(({
  value = 0,
  max = 100,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  labelPosition = 'right',
  animated = false,
  striped = false,
  className = '',
  ...props
}, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div ref={ref} className={`w-full ${className}`} {...props}>
      <div className="flex items-center gap-2">
        {showLabel && labelPosition === 'left' && (
          <span className="text-sm font-medium text-gray-700 dark:text-[rgba(255,255,255,0.75)] min-w-[3rem]">
            {Math.round(percentage)}%
          </span>
        )}
        <div
          className={`
            flex-1 bg-gray-200 dark:bg-[#424242] rounded-full overflow-hidden
            ${sizes[size]}
          `}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <div
            className={`
              h-full rounded-full transition-all duration-300 ease-out
              ${variants[variant]}
              ${striped ? 'bg-stripes' : ''}
              ${animated ? 'animate-progress-stripes' : ''}
            `}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && labelPosition === 'right' && (
          <span className="text-sm font-medium text-gray-700 dark:text-[rgba(255,255,255,0.75)] min-w-[3rem]">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    </div>
  );
});

Progress.displayName = 'Progress';

const CircularProgress = forwardRef(({
  value = 0,
  max = 100,
  size = 'md',
  variant = 'primary',
  showLabel = true,
  strokeWidth = 4,
  className = '',
  ...props
}, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizePx = {
    sm: 48,
    md: 64,
    lg: 80,
    xl: 96,
  }[size] || 64;

  const radius = (sizePx - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const variantColors = {
    primary: 'stroke-primary-600',
    secondary: 'stroke-gray-600',
    success: 'stroke-green-600',
    warning: 'stroke-yellow-500',
    danger: 'stroke-red-600',
    info: 'stroke-blue-600',
  };

  return (
    <div
      ref={ref}
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: sizePx, height: sizePx }}
      {...props}
    >
      <svg
        className="transform -rotate-90"
        width={sizePx}
        height={sizePx}
      >
        {/* Background circle */}
        <circle
          className="stroke-gray-200 dark:stroke-[#424242]"
          fill="none"
          strokeWidth={strokeWidth}
          r={radius}
          cx={sizePx / 2}
          cy={sizePx / 2}
        />
        {/* Progress circle */}
        <circle
          className={`${variantColors[variant]} transition-all duration-300 ease-out`}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          r={radius}
          cx={sizePx / 2}
          cy={sizePx / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      {showLabel && (
        <span className="absolute text-sm font-medium text-gray-700 dark:text-[rgba(255,255,255,0.75)]">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
});

CircularProgress.displayName = 'CircularProgress';

export { Progress, CircularProgress };
export default Progress;
