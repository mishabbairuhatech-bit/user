import { useState, createContext, useContext } from 'react';

const TabsContext = createContext(null);

const Tabs = ({
  defaultValue,
  value: controlledValue,
  onChange,
  children,
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = (newValue) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange && onChange(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, onChange: handleChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ children, className = '' }) => {
  return (
    <div className={`flex border-b border-gray-200 dark:border-[#424242] ${className}`}>
      {children}
    </div>
  );
};

const TabsTrigger = ({ value, children, disabled = false, className = '' }) => {
  const context = useContext(TabsContext);
  const isActive = context.value === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      className={`
        px-4 py-2 text-sm font-medium border-b-2 -mb-px
        transition-colors duration-200
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        ${isActive
          ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
        }
        ${className}
      `}
      onClick={() => !disabled && context.onChange(value)}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, children, className = '' }) => {
  const context = useContext(TabsContext);

  if (context.value !== value) return null;

  return (
    <div role="tabpanel" className={`py-4 ${className}`}>
      {children}
    </div>
  );
};

Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

export { Tabs, TabsList, TabsTrigger, TabsContent };
export default Tabs;
