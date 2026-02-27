import { forwardRef, useState, useRef, useEffect } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, CircleX } from 'lucide-react';

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sat', 'Su'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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


const DateRangePicker = forwardRef(({
  label,
  startDate,
  endDate,
  onChange,
  placeholder = 'Select date range',
  error,
  disabled = false,
  clearable = true,
  minDate = null,
  maxDate = null,
  className = '',
  size = 'md',
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (startDate) return new Date(startDate);
    return new Date();
  });
  const [hoverDate, setHoverDate] = useState(null);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [selecting, setSelecting] = useState('start');
  const [activePreset, setActivePreset] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);

  const sizes = sizeClasses[size] || sizeClasses.md;

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownWidth = isMobile ? 320 : 620;
      const spaceOnRight = window.innerWidth - rect.left;
      setAlignRight(spaceOnRight < dropdownWidth);
    }
  }, [isOpen, isMobile]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTempStartDate(startDate);
      setTempEndDate(endDate);
      setSelecting('start');
    }
  }, [isOpen, startDate, endDate]);

  const formatDateISO = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getDate()} ${SHORT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatDateShort = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    // Adjust for Monday start (0 = Monday, 6 = Sunday)
    let startingDay = firstDay.getDay() - 1;
    if (startingDay < 0) startingDay = 6;

    const days = [];

    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return days;
  };

  const isDateDisabled = (date) => {
    if (minDate && date < new Date(minDate)) return true;
    if (maxDate && date > new Date(maxDate)) return true;
    return false;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isStartDate = (date) => {
    if (!tempStartDate) return false;
    return new Date(tempStartDate).toDateString() === date.toDateString();
  };

  const isEndDate = (date) => {
    if (!tempEndDate) return false;
    return new Date(tempEndDate).toDateString() === date.toDateString();
  };

  const isInRange = (date) => {
    if (!tempStartDate) return false;

    const start = new Date(tempStartDate);
    const end = tempEndDate ? new Date(tempEndDate) : (hoverDate || null);

    if (!end) return false;

    const dateTime = date.getTime();
    const startTime = start.getTime();
    const endTime = end.getTime();

    if (startTime <= endTime) {
      return dateTime > startTime && dateTime < endTime;
    } else {
      return dateTime > endTime && dateTime < startTime;
    }
  };

  const handleSelectDate = (date) => {
    if (isDateDisabled(date)) return;

    const formattedDate = formatDateISO(date);
    setActivePreset(null);

    if (selecting === 'start' || !tempStartDate) {
      setTempStartDate(formattedDate);
      setTempEndDate(null);
      setSelecting('end');
    } else {
      const start = new Date(tempStartDate);
      const selected = new Date(date);

      if (selected < start) {
        setTempStartDate(formattedDate);
        setTempEndDate(tempStartDate);
      } else {
        setTempEndDate(formattedDate);
      }
      setSelecting('start');
    }
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({ startDate: null, endDate: null });
    setTempStartDate(null);
    setTempEndDate(null);
    setSelecting('start');
    setActivePreset(null);
  };

  const handleCancel = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setIsOpen(false);
  };

  const handleConfirm = () => {
    onChange({ startDate: tempStartDate, endDate: tempEndDate });
    setIsOpen(false);
  };

  const getDisplayValue = () => {
    if (!startDate && !endDate) return placeholder;
    if (startDate && !endDate) return formatDateDisplay(startDate);
    return `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`;
  };

  // Preset calculations
  const getPresetDates = (preset) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() + mondayOffset);
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(lastWeekStart);
    lastWeekEnd.setDate(lastWeekStart.getDate() + 6);

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const thisYearStart = new Date(today.getFullYear(), 0, 1);
    const thisYearEnd = new Date(today.getFullYear(), 11, 31);

    const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);

    const presets = {
      today: { start: today, end: today },
      yesterday: { start: yesterday, end: yesterday },
      thisWeek: { start: thisWeekStart, end: thisWeekEnd },
      lastWeek: { start: lastWeekStart, end: lastWeekEnd },
      thisMonth: { start: thisMonthStart, end: thisMonthEnd },
      lastMonth: { start: lastMonthStart, end: lastMonthEnd },
      thisYear: { start: thisYearStart, end: thisYearEnd },
      lastYear: { start: lastYearStart, end: lastYearEnd },
      wtd: { start: thisWeekStart, end: today },
      mtd: { start: thisMonthStart, end: today },
    };

    return presets[preset];
  };

  const handlePresetClick = (preset) => {
    const dates = getPresetDates(preset);
    setTempStartDate(formatDateISO(dates.start));
    setTempEndDate(formatDateISO(dates.end));
    setActivePreset(preset);
    setViewDate(dates.start);
  };

  const presets = [
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'thisWeek', label: 'This week' },
    { key: 'lastWeek', label: 'Last week' },
    { key: 'thisMonth', label: 'This month' },
    { key: 'lastMonth', label: 'Last month' },
  ];

  const days = getDaysInMonth(viewDate);
  const nextMonthDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
  const nextMonthDays = getDaysInMonth(nextMonthDate);

  const renderCalendar = (monthDate, monthDays, showPrevArrow, showNextArrow) => (
    <div className={isMobile ? "w-full" : "w-[220px]"}>
      <div className="flex items-center justify-between mb-3">
        {showPrevArrow ? (
          <button
            type="button"
            className="p-1 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-full"
            onClick={(e) => { e.stopPropagation(); handlePrevMonth(); }}
          >
            <ChevronLeft className="w-4 h-4 text-black dark:text-[rgba(255,255,255,0.85)]" />
          </button>
        ) : (
          <div className="w-7" />
        )}
        <span className="font-semibold text-black dark:text-[rgba(255,255,255,0.85)]">
          {MONTHS[monthDate.getMonth()]} {monthDate.getFullYear()}
        </span>
        {showNextArrow ? (
          <button
            type="button"
            className="p-1 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-full"
            onClick={(e) => { e.stopPropagation(); handleNextMonth(); }}
          >
            <ChevronRight className="w-4 h-4 text-black dark:text-[rgba(255,255,255,0.85)]" />
          </button>
        ) : (
          <div className="w-7" />
        )}
      </div>

      <div className="grid grid-cols-7 gap-0 mb-2">
        {DAYS.map(day => (
          <div key={day} className="text-center text-[10px] font-medium text-black dark:text-[rgba(255,255,255,0.65)] py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0">
        {monthDays.map((day, index) => {
          const isStart = isStartDate(day.date);
          const isEnd = isEndDate(day.date);
          const inRange = isInRange(day.date);
          const isTodayDate = isToday(day.date);
          const isDisabled = isDateDisabled(day.date) || !day.isCurrentMonth;

          return (
            <div
              key={index}
              className={`
                relative h-7 flex items-center justify-center
                ${inRange && day.isCurrentMonth ? 'bg-primary-100 dark:bg-[#2a2a2a]' : ''}
                ${isStart && tempEndDate && day.isCurrentMonth ? 'bg-gradient-to-r from-transparent to-primary-100 dark:to-[#2a2a2a] rounded-l-full' : ''}
                ${isEnd && tempStartDate && day.isCurrentMonth ? 'bg-gradient-to-r from-primary-100 dark:from-[#2a2a2a] to-transparent rounded-r-full' : ''}
              `}
            >
              <button
                type="button"
                className={`
                  w-7 h-7 aspect-square text-[11px] flex items-center justify-center rounded-full relative z-10
                  transition-colors duration-150
                  ${!day.isCurrentMonth ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : (isStart || isEnd) ? '' : 'text-black dark:text-[rgba(255,255,255,0.85)]'}
                  ${isTodayDate && !isStart && !isEnd && day.isCurrentMonth ? 'border border-primary-500 text-primary-600 dark:text-primary-400 font-medium' : ''}
                  ${(isStart || isEnd) && day.isCurrentMonth ? 'bg-primary-600 !text-white font-semibold' : ''}
                  ${!isStart && !isEnd && day.isCurrentMonth && !isDateDisabled(day.date) ? 'hover:bg-gray-100 dark:hover:bg-[#2a2a2a]' : ''}
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isDisabled) return;
                  handleSelectDate(day.date);
                }}
                onMouseEnter={() => {
                  if (selecting === 'end' && tempStartDate && !isDisabled) {
                    setHoverDate(day.date);
                  }
                }}
                onMouseLeave={() => setHoverDate(null)}
                disabled={isDisabled}
              >
                {day.date.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

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
          ${sizes.input}
          bg-white dark:bg-[#121212]
          ${disabled ? 'bg-gray-100 dark:bg-[#2a2a2a] cursor-not-allowed' : ''}
          ${error ? 'border-red-500 focus-within:ring-red-500 focus-within:border-red-500' : 'border-gray-300 dark:border-[#424242] focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500'}
          ${className}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        {...props}
      >
        <div className="flex items-center justify-between">
          <span className={(startDate || endDate) ? 'text-black dark:text-[rgba(255,255,255,0.85)]' : 'text-gray-400'}>
            {getDisplayValue()}
          </span>
          <div
            className={`relative flex items-center justify-center ${sizes.iconWrapper}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {clearable && (startDate || endDate) && !disabled && isHovered ? (
              <CircleX
                className={`${sizes.icon} text-gray-400 cursor-pointer`}
                onClick={handleClear}
              />
            ) : (
              <CalendarDays className={`${sizes.icon} text-gray-400`} />
            )}
          </div>
        </div>

        {isOpen && !disabled && (
          <div
            className={`absolute z-50 top-full mt-1 bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#424242] rounded-xl shadow-xl ${alignRight ? "right-0" : "left-0"} ${isMobile ? "left-0 right-0" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex ${isMobile ? "flex-col" : ""}`}>
              {/* Left Sidebar Presets */}
              <div className={`${isMobile ? "border-b w-full" : "w-28 border-r"} border-gray-100 dark:border-[#424242] py-2`}>
                {presets.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    className={`
                      w-full px-3 py-1.5 text-left text-[11px]
                      transition-colors
                      ${activePreset === preset.key
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-[#2a2a2a]'
                        : 'text-black dark:text-[rgba(255,255,255,0.85)] hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
                      }
                    `}
                    onClick={() => handlePresetClick(preset.key)}
                  >
                    <span className="font-medium">{preset.label}</span>

                  </button>
                ))}
              </div>

              {/* Calendars */}
              <div className="p-3">
                <div className={`flex ${isMobile ? "justify-center" : "gap-4"}`}>
                  {isMobile ? (
                    renderCalendar(viewDate, days, true, true)
                  ) : (
                    <>
                      {renderCalendar(viewDate, days, true, false)}
                      {renderCalendar(nextMonthDate, nextMonthDays, false, true)}
                    </>
                  )}
                </div>

                {/* Date Inputs & Actions */}
                <div className={`mt-3 pt-3 border-t border-gray-100 dark:border-[#424242] ${isMobile ? "flex flex-col gap-2" : "flex items-center justify-between"}`}>
                  <div className={`flex items-center gap-2 ${isMobile ? "justify-center" : ""}`}>
                    <div className="px-2 py-1 bg-gray-50 dark:bg-[#2a2a2a] rounded-xl text-xs font-medium text-black dark:text-[rgba(255,255,255,0.85)] min-w-[80px] text-center">
                      {tempStartDate ? formatDateShort(tempStartDate) : 'Start date'}
                    </div>
                    <span className="text-black dark:text-[rgba(255,255,255,0.85)]">–</span>
                    <div className="px-2 py-1 bg-gray-50 dark:bg-[#2a2a2a] rounded-xl text-xs font-medium text-black dark:text-[rgba(255,255,255,0.85)] min-w-[80px] text-center">
                      {tempEndDate ? formatDateShort(tempEndDate) : 'End date'}
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 ${isMobile ? "justify-center" : ""}`}>
                    <button
                      type="button"
                      className="px-3 py-1 text-xs font-medium text-black dark:text-[rgba(255,255,255,0.85)] bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#424242] rounded-xl hover:bg-gray-50 dark:hover:bg-[#363636]"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 text-xs font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleConfirm}
                      disabled={!tempStartDate}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
});

DateRangePicker.displayName = 'DateRangePicker';

export default DateRangePicker;
