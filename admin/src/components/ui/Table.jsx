import { forwardRef, useState } from 'react';
import { ArrowDown, List, LayoutGrid, Columns3 } from 'lucide-react';
import Checkbox from './Checkbox';
import Pagination from './Pagination';

const Table = forwardRef(({
  columns,
  data = [],
  loading = false,
  emptyMessage = 'No data available',
  sortColumn = null,
  sortDirection = null,
  onSort = null,
  onRowClick = null,
  activeRowId = null,
  selectable = false,
  selectedRows = [],
  onSelectRow = null,
  onSelectAll = null,
  className = '',
  striped = false,
  bordered = false,
  compact = false,
  // Header props
  title = null,
  headerActions = null,
  // View toggle props
  showViewToggle = false,
  viewMode: controlledViewMode,
  onViewModeChange,
  gridRender = null,
  // Kanban props
  kanbanGroupBy = null,
  kanbanColumns = [],
  kanbanCardRender = null,
  onKanbanDrop = null,
  // Pagination props
  showPagination = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange = null,
  pageSize = 10,
  onPageSizeChange = null,
  pageSizeOptions = [10, 20, 50, 100],
  pageSizeLabel = 'Entries',
  ...props
}, ref) => {
  const [internalViewMode, setInternalViewMode] = useState('list');
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Use controlled or internal view mode
  const viewMode = controlledViewMode !== undefined ? controlledViewMode : internalViewMode;
  const setViewMode = onViewModeChange || setInternalViewMode;

  const handleSort = (column) => {
    if (!column.sortable || !onSort) return;

    let direction = 'asc';
    if (sortColumn === column.key && sortDirection === 'asc') {
      direction = 'desc';
    }
    onSort(column.key, direction);
  };

  const renderSortIcon = (column) => {
    if (!column.sortable) return null;

    if (sortColumn === column.key) {
      return (
        <ArrowDown
          className={`w-4 h-4 text-gray-700 dark:text-[rgba(255,255,255,0.75)] transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`}
        />
      );
    }
    return null;
  };

  const isAllSelected = data.length > 0 && selectedRows.length === data.length;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length;

  const handleSelectAll = () => {
    if (onSelectAll) {
      onSelectAll(isAllSelected ? [] : data.map(row => row.id));
    }
  };

  const handleSelectRow = (e, row) => {
    e.stopPropagation();
    if (onSelectRow) {
      const isSelected = selectedRows.includes(row.id);
      if (isSelected) {
        onSelectRow(selectedRows.filter(id => id !== row.id));
      } else {
        onSelectRow([...selectedRows, row.id]);
      }
    }
  };

  const totalColumns = selectable ? columns.length + 1 : columns.length;
  const paddingClass = compact ? 'px-4 py-1.5' : 'px-6 py-3';
  const headerPaddingClass = compact ? 'px-4 py-1.5' : 'px-6 py-3.5';

  // Calculate fixed column positions
  const getFixedStyle = (column, index) => {
    if (!column.fixed) return {};

    const style = {
      position: 'sticky',
      zIndex: 10,
    };

    if (column.fixed === 'left') {
      let leftOffset = selectable ? 48 : 0;
      for (let i = 0; i < index; i++) {
        if (columns[i].fixed === 'left') {
          leftOffset += parseInt(columns[i].width) || 150;
        }
      }
      style.left = leftOffset;
    } else if (column.fixed === 'right') {
      let rightOffset = 0;
      for (let i = columns.length - 1; i > index; i--) {
        if (columns[i].fixed === 'right') {
          rightOffset += parseInt(columns[i].width) || 150;
        }
      }
      style.right = rightOffset;
    }

    return style;
  };

  const getFixedClassName = (column, isHeader = false) => {
    if (!column.fixed) return '';
    const bgColor = isHeader ? 'bg-gray-50 dark:bg-[#2a2a2a]' : 'bg-white dark:bg-[#121212]';
    const shadow = column.fixed === 'left'
      ? 'shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]'
      : 'shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.3)]';
    return `${bgColor} ${shadow}`;
  };

  // Drag handlers for Kanban
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnKey);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e, targetColumnKey) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (draggedItem && onKanbanDrop && draggedItem[kanbanGroupBy] !== targetColumnKey) {
      onKanbanDrop(draggedItem, targetColumnKey);
    }
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverColumn(null);
  };

  const hasKanban = kanbanGroupBy && kanbanColumns.length > 0 && kanbanCardRender;
  const hasViewToggle = gridRender || hasKanban;
  const showHeader = title || headerActions || hasViewToggle;
  const showFooter = showPagination && onPageChange && viewMode === 'list';

  // Render table content
  const renderTableContent = () => (
    <div className="overflow-x-auto scrollbar-hide">
      <table className={`w-max min-w-full table-fixed ${bordered ? 'border border-gray-200 dark:border-[#424242]' : ''}`}>
        <thead className="bg-gray-50 dark:bg-[#2a2a2a] border-gray-200 dark:border-[#424242]">
          <tr>
            {selectable && (
              <th scope="col" className={`${headerPaddingClass} w-12`}>
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={handleSelectAll}
                  size="md"
                />
              </th>
            )}
            {columns.map((column, index) => (
              <th
                key={column.key}
                scope="col"
                className={`
                  ${headerPaddingClass} text-left text-sm font-medium text-gray-900 dark:text-[rgba(255,255,255,0.85)]
                  ${column.sortable ? 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-white' : ''}
                  ${column.headerClassName || ''}
                  ${getFixedClassName(column, true)}
                `}
                style={{ width: column.width, ...getFixedStyle(column, index) }}
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center gap-1.5">
                  <span>{column.header}</span>
                  {renderSortIcon(column)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-[#121212]">
          {loading ? (
            <tr>
              <td colSpan={totalColumns} className="px-6 py-12 text-center">
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={totalColumns} className="px-6 py-12 text-center text-gray-500 dark:text-[rgba(255,255,255,0.55)]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const isSelected = selectedRows.includes(row.id);
              return (
                <tr
                  key={row.id || rowIndex}
                  className={`
                    transition-colors border-b border-gray-200 dark:border-[#424242]
                    ${onRowClick ? 'cursor-pointer' : ''}
                    ${activeRowId && row.id === activeRowId
                      ? 'bg-gray-100 dark:bg-[#2a2a2a]'
                      : striped && rowIndex % 2 === 1 ? 'bg-gray-50/50 dark:bg-[#2a2a2a]/50' : 'bg-white dark:bg-[#121212]'}
                    ${activeRowId && row.id === activeRowId ? '' : 'hover:bg-gray-50/50 dark:hover:bg-[#2a2a2a]/50'}
                  `}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {selectable && (
                    <td className={`${paddingClass} w-12`} onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleSelectRow({ stopPropagation: () => { } }, row)}
                        size="md"
                      />
                    </td>
                  )}
                  {columns.map((column, index) => (
                    <td
                      key={column.key}
                      className={`${paddingClass} text-sm text-gray-900 dark:text-[rgba(255,255,255,0.85)] whitespace-nowrap ${column.cellClassName || ''} ${getFixedClassName(column, false)}`}
                      style={{ width: column.width, ...getFixedStyle(column, index) }}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );

  // Render grid content
  const renderGridContent = () => {
    if (!gridRender) return null;
    return (
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.map((item, index) => gridRender(item, index))}
      </div>
    );
  };

  // Render kanban content
  const renderKanbanContent = () => {
    if (!hasKanban) return null;

    return (
      <div className="p-6 overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 min-w-max">
          {kanbanColumns.map((column) => {
            const columnItems = data.filter(item => item[kanbanGroupBy] === column.key);
            const isOver = dragOverColumn === column.key;

            return (
              <div
                key={column.key}
                className={`
                  w-72 flex-shrink-0 rounded-xl transition-colors
                  ${isOver ? 'bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-300 dark:ring-primary-500' : 'bg-gray-50 dark:bg-[#2a2a2a]'}
                `}
                onDragOver={(e) => handleDragOver(e, column.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.key)}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-gray-200 dark:border-[#424242]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {column.color && (
                        <span className={`w-2 h-2 rounded-full ${column.color}`} />
                      )}
                      <h4 className="font-medium text-gray-900 dark:text-[rgba(255,255,255,0.85)] text-sm">{column.title}</h4>
                    </div>
                    <span className="px-2 py-0.5 bg-gray-200 dark:bg-[#424242] text-gray-600 dark:text-[rgba(255,255,255,0.65)] text-xs rounded-full font-medium">
                      {columnItems.length}
                    </span>
                  </div>
                </div>

                {/* Column Content */}
                <div className="p-3 space-y-3 min-h-[200px]">
                  {columnItems.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      onDragEnd={handleDragEnd}
                      className={`
                        cursor-grab active:cursor-grabbing
                        ${draggedItem?.id === item.id ? 'opacity-50' : ''}
                      `}
                    >
                      {kanbanCardRender(item)}
                    </div>
                  ))}
                  {columnItems.length === 0 && (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                      No items
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render content based on view mode
  const renderContent = () => {
    if (viewMode === 'list') return renderTableContent();
    if (viewMode === 'grid') return renderGridContent();
    if (viewMode === 'kanban') return renderKanbanContent();
    return renderTableContent();
  };

  return (
    <div ref={ref} className={`bg-white dark:bg-[#121212] rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-[#424242] ${className}`} {...props}>
      {/* Header */}
      {showHeader && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-[#424242] flex flex-wrap items-center justify-between gap-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.85)]">{title}</h3>
          )}
          <div className="flex items-center gap-3">
            {headerActions}
            {hasViewToggle && (
              <div className="flex items-center border border-gray-300 dark:border-[#424242] rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary-50 dark:bg-[#2a2a2a] text-primary-600 dark:text-primary-400' : 'bg-white dark:bg-[#121212] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'}`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
                {gridRender && (
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary-50 dark:bg-[#2a2a2a] text-primary-600 dark:text-primary-400' : 'bg-white dark:bg-[#121212] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'}`}
                    title="Grid view"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                )}
                {hasKanban && (
                  <button
                    type="button"
                    onClick={() => setViewMode('kanban')}
                    className={`p-2 transition-colors ${viewMode === 'kanban' ? 'bg-primary-50 dark:bg-[#2a2a2a] text-primary-600 dark:text-primary-400' : 'bg-white dark:bg-[#121212] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'}`}
                    title="Kanban view"
                  >
                    <Columns3 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {renderContent()}

      {/* Footer with Pagination */}
      {showFooter && (
        <div className="px-6 py-4 border-gray-200 dark:border-[#424242]">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            pageSize={pageSize}
            onPageSizeChange={onPageSizeChange}
            pageSizeOptions={pageSizeOptions}
            pageSizeLabel={pageSizeLabel}
            showPageSize={!!onPageSizeChange}
          />
        </div>
      )}
    </div>
  );
});

Table.displayName = 'Table';

export default Table;
