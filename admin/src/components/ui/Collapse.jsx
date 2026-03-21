import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const Collapse = ({
  title,
  children,
  defaultOpen = false,
  icon,
  suffix,
  bordered = true,
  className = '',
  headerClassName = '',
  contentClassName = '',
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(defaultOpen ? 'auto' : '0px');

  useEffect(() => {
    if (isOpen) {
      setHeight(`${contentRef.current?.scrollHeight}px`);
      const timer = setTimeout(() => setHeight('auto'), 200);
      return () => clearTimeout(timer);
    } else {
      if (contentRef.current) {
        setHeight(`${contentRef.current.scrollHeight}px`);
        requestAnimationFrame(() => setHeight('0px'));
      }
    }
  }, [isOpen]);

  const toggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    onChange?.(next);
  };

  return (
    <div
      className={`
        ${bordered ? 'border border-gray-200 dark:border-[#3a3a3a] rounded-lg' : ''}
        ${className}
      `}
    >
      <button
        type="button"
        onClick={toggle}
        className={`
          w-full flex items-center justify-between gap-3 text-left transition-colors
          ${bordered ? 'px-4 py-3' : 'px-0 py-2'}
          hover:bg-gray-50 dark:hover:bg-[#252525]
          ${bordered && isOpen ? 'rounded-t-lg' : bordered ? 'rounded-lg' : ''}
          ${headerClassName}
        `}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {icon && <span className="flex-shrink-0 text-gray-400">{icon}</span>}
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
            {title}
          </span>
          {suffix && <span className="flex-shrink-0">{suffix}</span>}
        </div>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        ref={contentRef}
        style={{ height, overflow: 'hidden' }}
        className="transition-[height] duration-200 ease-in-out"
      >
        <div className={`${bordered ? 'px-4 pb-3' : 'pb-2'} ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

const CollapseGroup = ({ children, accordion = false, className = '' }) => {
  const [openIndex, setOpenIndex] = useState(null);

  if (!accordion) {
    return <div className={`space-y-2 ${className}`}>{children}</div>;
  }

  // Accordion mode: only one open at a time
  const items = Array.isArray(children) ? children : [children];
  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((child, index) => {
        if (!child) return null;
        return (
          <Collapse
            key={index}
            {...child.props}
            defaultOpen={openIndex === index}
            onChange={(isOpen) => {
              setOpenIndex(isOpen ? index : null);
              child.props.onChange?.(isOpen);
            }}
          />
        );
      })}
    </div>
  );
};

Collapse.Group = CollapseGroup;

export default Collapse;
