/**
 * PageHeader Component
 * A reusable page header with title, subtitle, and optional action buttons
 *
 * @param {string} title - The main heading text
 * @param {string} subtitle - Optional description text below the title
 * @param {React.ReactNode} children - Optional action buttons/elements on the right side
 * @param {string} className - Optional additional CSS classes
 */

const PageHeader = ({
  title,
  subtitle,
  children,
  className = ''
}) => {
  return (
    <div className={className}>
      {/* Title row with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-[32px] font-bold text-gray-900 tracking-tight">
            {title}
          </h1>
          {/* Subtitle below */}
          {subtitle && (
            <p className="text-gray-500 mt-1 text-xs md:text-sm lg:text-[15px]">
              {subtitle}
            </p>
          )}
        </div>

        {children && (
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
