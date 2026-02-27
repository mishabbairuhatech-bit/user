import { useState, useRef, useEffect, createContext, useContext } from 'react';
import { ChevronDown } from 'lucide-react';

const DropdownContext = createContext(null);

const Dropdown = ({
  children,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div ref={dropdownRef} className={`relative inline-block ${className}`}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

const DropdownTrigger = ({ children, className = '' }) => {
  const { isOpen, setIsOpen } = useContext(DropdownContext);

  return (
    <button
      type="button"
      className={`
        inline-flex items-center justify-center gap-2 px-4 py-2
        text-sm font-medium text-gray-700 dark:text-[rgba(255,255,255,0.85)] bg-white dark:bg-[#1f1f1f] border border-gray-300 dark:border-[#424242]
        rounded-xl hover:bg-gray-50 dark:hover:bg-[#2a2a2a] focus:outline-none focus:ring-2
        focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-[#1f1f1f]
        ${className}
      `}
      onClick={() => setIsOpen(!isOpen)}
    >
      {children}
      <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );
};

const DropdownMenu = ({ children, align = 'left', className = '' }) => {
  const { isOpen } = useContext(DropdownContext);

  if (!isOpen) return null;

  const alignmentClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div
      className={`
        absolute z-50 mt-2 min-w-48 py-1
        bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#424242] rounded-xl shadow-lg
        ${alignmentClasses[align]}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

const DropdownItem = ({
  children,
  onClick,
  disabled = false,
  danger = false,
  icon: Icon,
  className = '',
}) => {
  const { setIsOpen } = useContext(DropdownContext);

  const handleClick = () => {
    if (disabled) return;
    onClick && onClick();
    setIsOpen(false);
  };

  return (
    <button
      type="button"
      className={`
        w-full flex items-center gap-2 px-4 py-2 text-sm text-left
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${danger
          ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
          : 'text-gray-700 dark:text-[rgba(255,255,255,0.85)] hover:bg-gray-100 dark:hover:bg-[#2a2a2a]'
        }
        ${className}
      `}
      onClick={handleClick}
      disabled={disabled}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

const DropdownDivider = () => (
  <div className="my-1 border-t border-gray-200 dark:border-[#424242]" />
);

const DropdownLabel = ({ children, className = '' }) => (
  <div className={`px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase ${className}`}>
    {children}
  </div>
);

Dropdown.Trigger = DropdownTrigger;
Dropdown.Menu = DropdownMenu;
Dropdown.Item = DropdownItem;
Dropdown.Divider = DropdownDivider;
Dropdown.Label = DropdownLabel;

export {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownDivider,
  DropdownLabel,
};
export default Dropdown;
