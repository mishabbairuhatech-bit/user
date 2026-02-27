import { forwardRef } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

const variants = {
  info: {
    container: 'bg-blue-50 dark:bg-[#2a2a2a] border-blue-200 dark:border-[#424242]',
    icon: 'text-blue-500 dark:text-blue-400',
    title: 'text-blue-800 dark:text-blue-400',
    message: 'text-blue-700 dark:text-blue-300',
    Icon: Info,
  },
  success: {
    container: 'bg-green-50 dark:bg-[#2a2a2a] border-green-200 dark:border-[#424242]',
    icon: 'text-green-500 dark:text-green-400',
    title: 'text-green-800 dark:text-green-400',
    message: 'text-green-700 dark:text-green-300',
    Icon: CheckCircle,
  },
  warning: {
    container: 'bg-yellow-50 dark:bg-[#2a2a2a] border-yellow-200 dark:border-[#424242]',
    icon: 'text-yellow-500 dark:text-yellow-400',
    title: 'text-yellow-800 dark:text-yellow-400',
    message: 'text-yellow-700 dark:text-yellow-300',
    Icon: AlertTriangle,
  },
  danger: {
    container: 'bg-red-50 dark:bg-[#2a2a2a] border-red-200 dark:border-[#424242]',
    icon: 'text-red-500 dark:text-red-400',
    title: 'text-red-800 dark:text-red-400',
    message: 'text-red-700 dark:text-red-300',
    Icon: AlertCircle,
  },
};

const Alert = forwardRef(({
  title,
  children,
  variant = 'info',
  showIcon = true,
  dismissible = false,
  onDismiss,
  className = '',
  ...props
}, ref) => {
  const styles = variants[variant];
  const IconComponent = styles.Icon;

  return (
    <div
      ref={ref}
      role="alert"
      className={`
        flex p-4 border rounded-xl
        ${styles.container}
        ${className}
      `}
      {...props}
    >
      {showIcon && (
        <div className="flex-shrink-0">
          <IconComponent className={`w-5 h-5 ${styles.icon}`} />
        </div>
      )}
      <div className={`flex-1 ${showIcon ? 'ml-3' : ''}`}>
        {title && (
          <h3 className={`text-sm font-medium ${styles.title}`}>
            {title}
          </h3>
        )}
        {children && (
          <div className={`text-sm ${styles.message} ${title ? 'mt-1' : ''}`}>
            {children}
          </div>
        )}
      </div>
      {dismissible && (
        <button
          type="button"
          className={`flex-shrink-0 ml-3 ${styles.icon} hover:opacity-75`}
          onClick={onDismiss}
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
});

Alert.displayName = 'Alert';

export default Alert;
