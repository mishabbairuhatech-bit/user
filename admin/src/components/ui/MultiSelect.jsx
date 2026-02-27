import { forwardRef, useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, CircleX } from 'lucide-react';

const sizeClasses = {
  sm: {
    input: 'text-xs min-h-[32px]',
    label: 'text-[10px]',
    icon: 'w-3.5 h-3.5',
    iconWrapper: 'px-1.5',
    chip: 'px-1.5 py-0.5 text-[10px]',
    chipIcon: 'w-2.5 h-2.5',
    placeholder: 'px-2',
  },
  md: {
    input: 'text-sm min-h-[38px]',
    label: 'text-xs',
    icon: 'w-4 h-4',
    iconWrapper: 'px-2',
    chip: 'px-2 py-1 text-xs',
    chipIcon: 'w-3 h-3',
    placeholder: 'px-3',
  },
  lg: {
    input: 'text-base min-h-[46px]',
    label: 'text-sm',
    icon: 'w-5 h-5',
    iconWrapper: 'px-2.5',
    chip: 'px-2.5 py-1.5 text-sm',
    chipIcon: 'w-3.5 h-3.5',
    placeholder: 'px-4',
  }
};

const MultiSelect = forwardRef(({
  label,
  options = [],
  value = [],
  onChange,
  placeholder = 'Select options',
  error,
  disabled = false,
  searchable = false,
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [alignRight, setAlignRight] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const sizes = sizeClasses[size] || sizeClasses.md;
  const selectedOptions = options.filter(opt => value.includes(opt.value));

  const filteredOptions = searchable
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceOnRight = window.innerWidth - rect.left;
      setAlignRight(spaceOnRight < 250);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleToggle = (option) => {
    if (option.disabled) return;

    const newValue = value.includes(option.value)
      ? value.filter(v => v !== option.value)
      : [...value, option.value];

    onChange(newValue);
  };

  const handleRemove = (e, optionValue) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== optionValue));
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const renderSelectedItems = () => {
    if (selectedOptions.length === 0 && !isOpen) {
      return <span className={`text-gray-400 ${sizes.placeholder}`}>{placeholder}</span>;
    }

    return (
      <div className="flex flex-wrap items-center gap-1 p-1.5">
        {selectedOptions.map(option => (
          <span
            key={option.value}
            className={`inline-flex items-center gap-1 bg-primary-100 dark:bg-[#2a2a2a] dark:border dark:border-[#424242] text-primary-700 dark:text-primary-400 rounded-md ${sizes.chip}`}
          >
            {option.label}
            <X
              className={`${sizes.chipIcon} cursor-pointer hover:text-primary-900 dark:hover:text-primary-300`}
              onClick={(e) => handleRemove(e, option.value)}
            />
          </span>
        ))}
        {isOpen && searchable && (
          <input
            ref={inputRef}
            type="text"
            className="flex-1 min-w-[60px] outline-none bg-transparent text-sm text-black dark:text-[rgba(255,255,255,0.85)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            placeholder={selectedOptions.length === 0 ? placeholder : ''}
          />
        )}
      </div>
    );
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      {label && (
        <label className={`block font-medium text-black dark:text-[rgba(255,255,255,0.85)] mb-1 ${sizes.label}`}>
          {label}
        </label>
      )}
      <div
        ref={ref}
        className={`
          w-full border rounded-xl shadow-sm cursor-pointer overflow-hidden
          bg-white dark:bg-[#1f1f1f] flex items-center
          ${sizes.input}
          ${disabled ? 'bg-gray-100 dark:bg-[#2a2a2a] cursor-not-allowed' : ''}
          ${error ? 'border-red-500 focus-within:ring-red-500 focus-within:border-red-500' : 'border-gray-300 dark:border-[#424242] focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500'}
          ${className}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        {...props}
      >
        <div className="flex-1 min-w-0">
          {renderSelectedItems()}
        </div>
        <div
          className={`flex items-center justify-center ${sizes.iconWrapper}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {selectedOptions.length > 0 && !disabled && isHovered ? (
            <CircleX
              className={`${sizes.icon} text-gray-400 cursor-pointer`}
              onClick={handleClearAll}
            />
          ) : (
            <ChevronDown className={`${sizes.icon} text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </div>
      </div>

      {isOpen && !disabled && (
        <div
          className={`absolute z-50 top-full mt-1 bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#424242] rounded-xl shadow-xl max-h-60 overflow-y-auto w-full ${alignRight ? 'right-0' : 'left-0'}`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <div className="hide-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">No options found</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`
                    px-3 py-2 cursor-pointer flex items-center justify-between
                    ${value.includes(option.value) ? 'bg-primary-50 dark:bg-[#2a2a2a] text-primary-600 dark:text-primary-400' : 'text-black dark:text-[rgba(255,255,255,0.85)] hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'}
                    ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(option);
                  }}
                >
                  <span>{option.label}</span>
                  {value.includes(option.value) && <Check className="w-4 h-4" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {error && (
        <p className="mt-1 text-[11px] text-red-600">{error}</p>
      )}
    </div>
  );
});

MultiSelect.displayName = 'MultiSelect';

export default MultiSelect;
