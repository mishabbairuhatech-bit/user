import { forwardRef, useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const Pagination = forwardRef(({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = false,
  disabled = false,
  className = '',
  // Page size props
  pageSize = 10,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSize = true,
  pageSizeLabel = 'Documents',
  ...props
}, ref) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const range = (start, end) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, i) => start + i);
  };

  const getPageNumbers = () => {
    const totalNumbers = siblingCount * 2 + 3;
    const totalBlocks = totalNumbers + 2;

    if (totalPages <= totalBlocks) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, '...', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [1, '...', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [1, '...', ...middleRange, '...', totalPages];
    }

    return range(1, totalPages);
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      ref={ref}
      className={`flex items-center justify-between ${className}`}
      aria-label="Pagination"
      {...props}
    >
      {/* Page Size Selector */}
      {showPageSize && onPageSizeChange ? (
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={disabled}
            className={`
              flex items-center gap-1.5 px-2.5 py-1.5 text-xs border border-gray-300 dark:border-[#424242] rounded-md
              bg-white dark:bg-[#1f1f1f] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className="text-gray-900 dark:text-[rgba(255,255,255,0.85)]">{pageSize} {pageSizeLabel}</span>
            <ChevronDown className={`w-3 h-3 text-gray-500 dark:text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#424242] rounded-md shadow-lg z-50 min-w-full">
              {pageSizeOptions.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    onPageSizeChange(size);
                    setIsDropdownOpen(false);
                  }}
                  className={`
                    w-full px-2.5 py-1.5 text-xs text-left hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors
                    ${size === pageSize ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30' : 'text-gray-900 dark:text-[rgba(255,255,255,0.85)]'}
                    first:rounded-t-md last:rounded-b-md
                  `}
                >
                  {size} {pageSizeLabel}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div />
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-0.5">
        {pageNumbers.map((page, index) => (
          page === '...' ? (
            <span key={`dots-${index}`} className="w-7 h-7 flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              disabled={disabled}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
              className={`
                w-7 h-7 flex items-center justify-center text-xs font-medium rounded-md
                transition-colors duration-200
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${page === currentPage
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-[#2a2a2a] dark:border dark:border-[#424242]'
                  : 'text-gray-900 dark:text-[rgba(255,255,255,0.85)] hover:bg-gray-100 dark:hover:bg-[#2a2a2a]'
                }
              `}
            >
              {page}
            </button>
          )
        ))}
      </div>

      {/* Previous/Next Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || disabled}
          aria-label="Previous page"
          className={`
            flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-gray-300 dark:border-[#424242] rounded-md
            transition-colors duration-200
            ${currentPage === 1 || disabled
              ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-[#2a2a2a] text-gray-400'
              : 'cursor-pointer bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-[rgba(255,255,255,0.85)] hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
            }
          `}
        >
          <ChevronLeft className="w-3 h-3" />
          <span>Previous</span>
        </button>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || disabled}
          aria-label="Next page"
          className={`
            flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-gray-300 dark:border-[#424242] rounded-md
            transition-colors duration-200
            ${currentPage === totalPages || disabled
              ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-[#2a2a2a] text-gray-400'
              : 'cursor-pointer bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-[rgba(255,255,255,0.85)] hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
            }
          `}
        >
          <span>Next</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </nav>
  );
});

Pagination.displayName = 'Pagination';

export default Pagination;
