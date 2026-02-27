import { forwardRef, useState } from 'react';
import { User } from 'lucide-react';
import Tooltip from './Tooltip';
import { colorClassToHex, colors } from '@/config/colors';

// Background colors for letter avatars
const bgColors = [
  'bg-primary-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-orange-500',
];

// Get consistent color based on name
const getColorFromName = (name) => {
  if (!name) return 'bg-gray-100';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return bgColors[Math.abs(hash) % bgColors.length];
};

const sizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-14 h-14 text-lg',
  '2xl': 'w-16 h-16 text-xl',
};

const iconSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-7 h-7',
  '2xl': 'w-8 h-8',
};

const statusSizes = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-3.5 h-3.5',
  '2xl': 'w-4 h-4',
};

const statusColors = {
  online: 'bg-emerald-500',
  offline: 'bg-gray-400',
  busy: 'bg-red-500',
  away: 'bg-amber-500',
};

const Avatar = forwardRef(({
  src,
  alt = '',
  name,
  icon: Icon,
  color,
  size = 'md',
  rounded = true,
  status,
  showTooltip = false,
  tooltipContent,
  onClick,
  className = '',
  ...props
}, ref) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (name) => {
    if (!name) return '';
    return name.trim().charAt(0).toUpperCase();
  };

  const hasImage = src && !imageError;

  // Determine background color: custom color > icon default > name color > default gray
  const getBgColor = () => {
    // Custom color always takes priority
    if (color) return color;
    // If has image, use light gray
    if (hasImage) return 'bg-gray-100';
    // If has icon but no custom color, use primary
    if (Icon) return 'bg-primary-500';
    // If has name, generate color from name
    if (name) return getColorFromName(name);
    // Default fallback
    return 'bg-gray-100';
  };

  const renderContent = () => {
    // Priority: image > icon > name initial > default user icon
    if (hasImage) {
      return (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className={`w-full h-full object-cover ${rounded ? 'rounded-full' : 'rounded-xl'}`}
          onError={() => setImageError(true)}
        />
      );
    }

    if (Icon) {
      return <Icon className={`text-white ${iconSizes[size]}`} />;
    }

    if (name) {
      return (
        <span className="font-medium text-white">
          {getInitials(name)}
        </span>
      );
    }

    return <User className={`text-gray-400 ${iconSizes[size]}`} />;
  };

  // Get inline style for background color (using config colors)
  const getBgStyle = () => {
    const bgClass = getBgColor();
    const hexColor = colorClassToHex[bgClass];
    return hexColor ? { backgroundColor: hexColor } : {};
  };

  const avatarContent = (
    <div
      ref={ref}
      className={`
        relative inline-flex items-center justify-center flex-shrink-0
        overflow-hidden
        ${sizes[size]}
        ${rounded ? 'rounded-full' : 'rounded-xl'}
        ${onClick ? 'cursor-pointer' : ''}
        transition-transform duration-200 hover:scale-110 hover:z-10
        ${className}
      `}
      style={getBgStyle()}
      onClick={onClick}
      {...props}
    >
      {renderContent()}
      {status && (
        <span
          className={`
            absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-[#1f1f1f]
            ${statusColors[status] || statusColors.offline}
            ${statusSizes[size]}
          `}
        />
      )}
    </div>
  );

  if (showTooltip && (tooltipContent || name)) {
    return (
      <Tooltip content={tooltipContent || name} position="top">
        {avatarContent}
      </Tooltip>
    );
  }

  return avatarContent;
});

Avatar.displayName = 'Avatar';

// Avatar Group Component - supports both children and avatars array
const AvatarGroup = forwardRef(({
  children,
  avatars = [],
  max = 4,
  size = 'md',
  rounded = true,
  showTooltip = true,
  spacing = 'tight', // tight, normal, loose
  className = '',
  ...props
}, ref) => {
  const spacingClasses = {
    tight: '-space-x-3',
    normal: '-space-x-2',
    loose: '-space-x-1',
  };

  // If avatars array is provided, use it
  if (avatars.length > 0) {
    const visibleAvatars = avatars.slice(0, max);
    const remainingCount = avatars.length - max;
    const remainingNames = avatars.slice(max).map(a => a.name).filter(Boolean).join(', ');

    return (
      <div
        ref={ref}
        className={`flex items-center ${spacingClasses[spacing]} ${className}`}
        {...props}
      >
        {visibleAvatars.map((avatar, index) => (
          <Avatar
            key={avatar.id || index}
            src={avatar.src}
            name={avatar.name}
            icon={avatar.icon}
            color={avatar.color}
            size={size}
            rounded={rounded}
            status={avatar.status}
            showTooltip={showTooltip}
            tooltipContent={avatar.tooltipContent || avatar.name}
            className="ring-2 ring-white dark:ring-[#1f1f1f]"
          />
        ))}

        {remainingCount > 0 && (
          <Tooltip content={remainingNames || `+${remainingCount} more`} position="top">
            <div
              className={`
                inline-flex items-center justify-center flex-shrink-0
                ${rounded ? 'rounded-full' : 'rounded-xl'}
                ${sizes[size]}
                bg-primary-500 text-white font-medium
                ring-2 ring-white dark:ring-[#1f1f1f]
                transition-transform duration-200 hover:scale-110 hover:z-10
              `}
            >
              +{remainingCount}
            </div>
          </Tooltip>
        )}
      </div>
    );
  }

  // Legacy support: use children
  const childArray = Array.isArray(children) ? children : [children].filter(Boolean);
  const visibleAvatars = childArray.slice(0, max);
  const remainingCount = childArray.length - max;

  return (
    <div ref={ref} className={`flex items-center ${spacingClasses[spacing]} ${className}`} {...props}>
      {visibleAvatars.map((child, index) => (
        <div key={index} className="ring-2 ring-white dark:ring-[#1f1f1f] rounded-full">
          {child}
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={`
            inline-flex items-center justify-center flex-shrink-0
            rounded-full
            ${sizes[size]}
            bg-primary-500 text-white font-medium
            ring-2 ring-white dark:ring-[#1f1f1f]
          `}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
});

AvatarGroup.displayName = 'AvatarGroup';

export { Avatar, AvatarGroup };
export default Avatar;
