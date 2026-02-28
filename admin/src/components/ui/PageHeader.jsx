import Breadcrumb from './Breadcrumb';

const PageHeader = ({
  title,
  subtitle,
  children,
  breadcrumb,
  sticky = false,
  className = ''
}) => {
  const content = (
    <>
      {breadcrumb && (
        <Breadcrumb
          items={breadcrumb.items || []}
          homeHref={breadcrumb.homeHref || '/admin/dashboard'}
          homeLabel={breadcrumb.homeLabel || 'Dashboard'}
          showHome={breadcrumb.showHome !== false}
        />
      )}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${breadcrumb ? 'mt-2' : ''}`}>
        <div>
          <h1 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-500 mt-1 text-[11px] md:text-xs lg:text-[13px]">
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
    </>
  );

  if (sticky) {
    return (
      <div className={`sticky top-0 z-10 bg-white dark:bg-[#121212] pb-1 -mt-4 pt-4 lg:-mt-6 lg:pt-6 -mx-4 px-4 lg:-mx-6 lg:px-6 ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
};

export default PageHeader;
