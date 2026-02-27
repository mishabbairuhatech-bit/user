import { forwardRef } from 'react';
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Bell,
  X,
  Clock,
  ShieldCheck,
  UserPlus,
  Package,
  MessageSquare,
} from 'lucide-react';

// ─── Variant Config ──────────────────────────────────────────────
const variantConfig = {
  success: {
    icon: CheckCircle,
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  danger: {
    icon: AlertCircle,
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  default: {
    icon: Bell,
    iconBg: 'bg-gray-100 dark:bg-[#2a2a2a]',
    iconColor: 'text-gray-600 dark:text-gray-400',
  },
  security: {
    icon: ShieldCheck,
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  user: {
    icon: UserPlus,
    iconBg: 'bg-teal-100 dark:bg-teal-900/30',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
  order: {
    icon: Package,
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  message: {
    icon: MessageSquare,
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
};

// ─── Single Notification Item ────────────────────────────────────
const Notification = forwardRef(({
  variant = 'default',
  title,
  description,
  timestamp,
  avatar,
  icon: CustomIcon,
  read = false,
  dismissible = false,
  onDismiss,
  onClick,
  actions,
  className = '',
  ...props
}, ref) => {
  const config = variantConfig[variant] || variantConfig.default;
  const IconComponent = CustomIcon || config.icon;

  return (
    <div
      ref={ref}
      className={`
        relative flex items-start gap-3 p-4 rounded-xl border transition-all duration-200
        ${read
          ? 'bg-white dark:bg-[#121212] border-gray-200 dark:border-[#424242]'
          : 'bg-primary-50/50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800/50'
        }
        ${onClick ? 'cursor-pointer hover:shadow-md' : ''}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {/* Unread Indicator */}
      {!read && (
        <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-primary-500" />
      )}

      {/* Avatar or Icon */}
      {avatar ? (
        <img
          src={avatar}
          alt=""
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.iconBg}`}>
          <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className={`text-sm font-semibold ${read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
            {title}
          </p>
        )}
        {description && (
          <p className={`text-sm mt-0.5 ${read ? 'text-gray-500 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'}`}>
            {description}
          </p>
        )}
        {timestamp && (
          <div className="flex items-center gap-1 mt-1.5">
            <Clock className="w-3 h-3 text-gray-400 dark:text-gray-500" />
            <span className="text-xs text-gray-400 dark:text-gray-500">{timestamp}</span>
          </div>
        )}
        {actions && actions.length > 0 && (
          <div className="flex items-center gap-2 mt-2.5">
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick?.();
                }}
                className={`
                  px-3 py-1 text-xs font-medium rounded-lg transition-colors
                  ${action.variant === 'primary'
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#363636]'
                  }
                `}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dismiss */}
      {dismissible && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss?.();
          }}
          className="flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
});

Notification.displayName = 'Notification';

// ─── Notification Group ──────────────────────────────────────────
const NotificationGroup = ({ title, children, onClearAll, className = '' }) => {
  return (
    <div className={className}>
      {(title || onClearAll) && (
        <div className="flex items-center justify-between mb-3">
          {title && (
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
          )}
          {onClearAll && (
            <button
              onClick={onClearAll}
              className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
            >
              Clear all
            </button>
          )}
        </div>
      )}
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
};

NotificationGroup.displayName = 'NotificationGroup';

Notification.Group = NotificationGroup;

export default Notification;
