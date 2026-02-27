import { forwardRef, useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, CircleX } from 'lucide-react';

const sizeClasses = {
  sm: {
    input: 'px-2 py-1.5 text-xs',
    label: 'text-[10px]',
    icon: 'w-3.5 h-3.5',
    iconWrapper: 'w-4 h-4',
  },
  md: {
    input: 'px-3 py-2 text-sm',
    label: 'text-xs',
    icon: 'w-4 h-4',
    iconWrapper: 'w-5 h-5',
  },
  lg: {
    input: 'px-4 py-2.5 text-base',
    label: 'text-sm',
    icon: 'w-5 h-5',
    iconWrapper: 'w-6 h-6',
  }
};

const Select = forwardRef(({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  error,
  disabled = false,
  clearable = true,
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
  const selectedOption = options.find(opt => opt.value === value);

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

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    } else if (e.key === 'Enter' && filteredOptions.length > 0) {
      handleSelect(filteredOptions[0]);
    }
  };

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className={`block font-medium text-black dark:text-[rgba(255,255,255,0.85)] mb-1 ${sizes.label}`}>
          {label}
        </label>
      )}
      <div
        ref={ref}
        className={`
          relative w-full border rounded-xl shadow-sm cursor-pointer
          bg-white dark:bg-[#121212]
          ${sizes.input}
          ${disabled ? 'bg-gray-100 dark:bg-[#2a2a2a] cursor-not-allowed' : ''}
          ${error ? 'border-red-500 focus-within:ring-red-500 focus-within:border-red-500' : 'border-gray-300 dark:border-[#424242] focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500'}
          ${className}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        {...props}
      >
        <div className="flex items-center justify-between">
          {isOpen && searchable ? (
            <input
              ref={inputRef}
              type="text"
              className="flex-1 outline-none bg-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              placeholder={selectedOption ? selectedOption.label : placeholder}
            />
          ) : (
            <span className={selectedOption ? 'text-black dark:text-[rgba(255,255,255,0.85)]' : 'text-gray-400'}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          )}
          <div
            className={`relative flex items-center justify-center ${sizes.iconWrapper}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {clearable && selectedOption && !disabled && isHovered ? (
              <CircleX
                className={`${sizes.icon} text-gray-400 cursor-pointer`}
                onClick={handleClear}
              />
            ) : (
              <ChevronDown className={`${sizes.icon} text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            )}
          </div>
        </div>

        {isOpen && !disabled && (
          <div
            className={`absolute z-50 top-full mt-1 bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#424242] rounded-xl shadow-xl max-h-60 overflow-y-auto w-full ${alignRight ? 'right-0' : 'left-0'}`}
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
                      ${option.value === value ? 'bg-primary-50 dark:bg-[#2a2a2a] text-primary-600 dark:text-primary-400' : 'text-black dark:text-[rgba(255,255,255,0.85)] hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'}
                      ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!option.disabled) handleSelect(option);
                    }}
                  >
                    <span>{option.label}</span>
                    {option.value === value && <Check className="w-4 h-4" />}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-[11px] text-red-600">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
