import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = forwardRef(({
  items = [],
  separator,
  showHome = true,
  homeHref = '/',
  homeLabel = 'Dashboard',
  className = '',
  ...props
}, ref) => {
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
              <Link
                to={homeHref}
                className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-[rgba(255,255,255,0.55)] hover:text-gray-700 dark:hover:text-[rgba(255,255,255,0.85)] transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>{homeLabel}</span>
              </Link>
            </li>
            {items.length > 0 && renderSeparator()}
          </>
        )}
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && renderSeparator()}
            {item.href && index !== items.length - 1 ? (
              <Link
                to={item.href}
                className="text-sm text-gray-500 dark:text-[rgba(255,255,255,0.55)] hover:text-gray-700 dark:hover:text-[rgba(255,255,255,0.85)] transition-colors"
              >
                {item.icon && <item.icon className="w-4 h-4 mr-1 inline" />}
                {item.label}
              </Link>
            ) : (
              <span
                className={`text-sm ${index === items.length - 1
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
