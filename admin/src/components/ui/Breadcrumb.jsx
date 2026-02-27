import { forwardRef } from 'react';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = forwardRef(({
  items = [],
  separator,
  showHome = true,
  homeHref = '/',
  onNavigate,
  className = '',
  ...props
}, ref) => {
  const handleClick = (item, e) => {
    if (onNavigate && item.href) {
      e.preventDefault();
      onNavigate(item);
    }
  };

  const renderSeparator = () => {
    if (separator) return separator;
    return <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 mx-2" />;
  };

  return (
    <nav ref={ref} aria-label="Breadcrumb" className={className} {...props}>
      <ol className="flex items-center flex-wrap">
        {showHome && (
          <>
            <li>
              <a
                href={homeHref}
                className="text-gray-500 dark:text-[rgba(255,255,255,0.55)] hover:text-gray-700 dark:hover:text-[rgba(255,255,255,0.85)] transition-colors"
                onClick={(e) => handleClick({ href: homeHref, label: 'Home' }, e)}
              >
                <Home className="w-4 h-4" />
              </a>
            </li>
            {items.length > 0 && renderSeparator()}
          </>
        )}
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && renderSeparator()}
            {item.href && index !== items.length - 1 ? (
              <a
                href={item.href}
                className="text-sm text-gray-500 dark:text-[rgba(255,255,255,0.55)] hover:text-gray-700 dark:hover:text-[rgba(255,255,255,0.85)] transition-colors"
                onClick={(e) => handleClick(item, e)}
              >
                {item.icon && <item.icon className="w-4 h-4 mr-1 inline" />}
                {item.label}
              </a>
            ) : (
              <span
                className={`text-sm ${
                  index === items.length - 1
                    ? 'text-gray-900 dark:text-[rgba(255,255,255,0.85)] font-medium'
                    : 'text-gray-500 dark:text-[rgba(255,255,255,0.55)]'
                }`}
                aria-current={index === items.length - 1 ? 'page' : undefined}
              >
                {item.icon && <item.icon className="w-4 h-4 mr-1 inline" />}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
});

Breadcrumb.displayName = 'Breadcrumb';

export default Breadcrumb;
