import { forwardRef } from 'react';

const sizes = {
  xs: 'h-4 w-4',
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const Spinner = ({ size = 'md', className = '' }) => {
  return (
    <svg
      className={`animate-spin text-primary-600 ${sizes[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="32"
        strokeDashoffset="20"
      />
    </svg>
  );
};

// Bars Loader - Wave animation loader
const barSizes = {
  sm: { height: 16, barWidth: 2, gap: 2 },
  md: { height: 24, barWidth: 2, gap: 3 },
  lg: { height: 32, barWidth: 3, gap: 3 },
  xl: { height: 40, barWidth: 3, gap: 4 },
};

const BarsLoader = forwardRef(({
  size = 'md',
  showText = true,
  text = 'LOADING',
  className = '',
  ...props
}, ref) => {
  const config = barSizes[size] || barSizes.md;
  const barHeights = [0.5, 0.7, 1, 0.7, 0.5]; // Relative heights for 5 bars

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
      {...props}
    >
      <div className="flex items-end" style={{ gap: config.gap, height: config.height }}>
        {barHeights.map((heightRatio, index) => (
          <div
            key={index}
            className="bg-primary-500 rounded-full animate-bars-wave"
            style={{
              width: config.barWidth,
              height: config.height * heightRatio,
              animationDelay: `${index * 0.1}s`,
            }}
          />
        ))}
      </div>
      {showText && (
        <span className="text-primary-400 text-xs tracking-[0.3em] font-medium">
          {text}
        </span>
      )}

      <style>{`
        @keyframes bars-wave {
          0%, 100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(0.4);
          }
        }
        .animate-bars-wave {
          animation: bars-wave 1s ease-in-out infinite;
          transform-origin: bottom;
        }
      `}</style>
    </div>
  );
});

BarsLoader.displayName = 'BarsLoader';

// Full Page Loader - overlay with bars loader
const PageLoader = forwardRef(({
  size = 'lg',
  showText = true,
  text = 'LOADING',
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-900/95 backdrop-blur-sm ${className}`}
      {...props}
    >
      <BarsLoader size={size} showText={showText} text={text} />
    </div>
  );
});

PageLoader.displayName = 'PageLoader';

export { BarsLoader, PageLoader };
export default Spinner;
