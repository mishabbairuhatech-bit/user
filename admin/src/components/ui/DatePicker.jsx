import { forwardRef, useState, useRef, useEffect } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, CircleX } from 'lucide-react';

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sat', 'Su'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const sizeClasses = {
  sm: {
    input: 'px-2 py-1.5 text-xs',
    label: 'text-[10px]',
    icon: 'w-3.5 h-3.5',
    iconWrapper: 'w-4 h-4',
    calendar: 'w-[220px] p-2',
    calendarHeader: 'mb-2',
    calendarTitle: 'text-[10px]',
    calendarNav: 'w-3.5 h-3.5',
    calendarNavBtn: 'p-0.5',
    dayLabel: 'text-[8px] py-0.5',
    dayCell: 'w-5 h-5 text-[9px]',
    todaySection: 'mt-2 pt-2',
    todayText: 'text-[9px]',
  },
  md: {
    input: 'px-3 py-2 text-sm',
    label: 'text-xs',
    icon: 'w-4 h-4',
    iconWrapper: 'w-5 h-5',
    calendar: 'w-[280px] p-3',
    calendarHeader: 'mb-3',
    calendarTitle: 'text-xs',
    calendarNav: 'w-4 h-4',
    calendarNavBtn: 'p-1',
    dayLabel: 'text-[10px] py-1',
    dayCell: 'w-7 h-7 text-[11px]',
    todaySection: 'mt-3 pt-3',
    todayText: 'text-[11px]',
  },
  lg: {
    input: 'px-4 py-2.5 text-base',
    label: 'text-sm',
    icon: 'w-5 h-5',
    iconWrapper: 'w-6 h-6',
    calendar: 'w-[320px] p-4',
    calendarHeader: 'mb-3',
    calendarTitle: 'text-sm',
    calendarNav: 'w-5 h-5',
    calendarNavBtn: 'p-1',
    dayLabel: 'text-xs py-1',
    dayCell: 'w-9 h-9 text-xs',
    todaySection: 'mt-3 pt-3',
    todayText: 'text-xs',
  }
};

const DatePicker = forwardRef(({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  error,
  required = false,
  disabled = false,
  clearable = true,
  minDate = null,
  maxDate = null,
  dateFormat = 'YYYY-MM-DD',
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value);
    return new Date();
  });
  const [alignRight, setAlignRight] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);

  const sizes = sizeClasses[size] || sizeClasses.md;

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceOnRight = window.innerWidth - rect.left;
      setAlignRight(spaceOnRight < 300);
    }
  }, [isOpen]);

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
    if (value) {
      setViewDate(new Date(value));
    }
  }, [value]);

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return dateFormat
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
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

  const isSelected = (date) => {
    if (!value) return false;
    return new Date(value).toDateString() === date.toDateString();
  };

  const handleSelectDate = (date) => {
    if (isDateDisabled(date)) return;
    onChange(formatDate(date));
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
  };

  const days = getDaysInMonth(viewDate);

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className={`block font-medium text-black dark:text-[rgba(255,255,255,0.85)] mb-1 ${sizes.label}`}>
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div
        ref={ref}
        className={`
          relative w-full border rounded-xl shadow-sm cursor-pointer
          bg-white dark:bg-[#121212] flex items-center justify-between
          ${sizes.input}
          ${disabled ? 'bg-gray-100 dark:bg-[#2a2a2a] cursor-not-allowed' : ''}
          ${error ? 'border-red-500 focus-within:ring-red-500 focus-within:border-red-500' : 'border-gray-300 dark:border-[#424242] focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500'}
          ${className}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        {...props}
      >
        <span className={value ? 'text-black dark:text-[rgba(255,255,255,0.85)]' : 'text-gray-400'}>
          {value ? formatDate(value) : placeholder}
        </span>
        <div
          className={`relative flex items-center justify-center ${sizes.iconWrapper}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {clearable && value && !disabled && isHovered ? (
            <CircleX
              className={`${sizes.icon} text-gray-400 cursor-pointer`}
              onClick={handleClear}
            />
          ) : (
            <CalendarDays className={`${sizes.icon} text-gray-400`} />
          )}
        </div>

        {isOpen && !disabled && (
          <div className={`absolute z-50 top-full mt-1 bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#424242] rounded-xl shadow-xl ${sizes.calendar} ${alignRight ? "right-0" : "left-0"}`}>
            <div className={`flex items-center justify-between ${sizes.calendarHeader}`}>
              <button
                type="button"
                className={`${sizes.calendarNavBtn} hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded`}
                onClick={(e) => { e.stopPropagation(); handlePrevMonth(); }}
              >
                <ChevronLeft className={`${sizes.calendarNav} text-black dark:text-[rgba(255,255,255,0.85)]`} />
              </button>
              <span className={`font-medium ${sizes.calendarTitle} text-black dark:text-[rgba(255,255,255,0.85)]`}>
                {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <button
                type="button"
                className={`${sizes.calendarNavBtn} hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded`}
                onClick={(e) => { e.stopPropagation(); handleNextMonth(); }}
              >
                <ChevronRight className={`${sizes.calendarNav} text-black dark:text-[rgba(255,255,255,0.85)]`} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {DAYS.map(day => (
                <div key={day} className={`text-center ${sizes.dayLabel} font-medium text-black dark:text-[rgba(255,255,255,0.65)]`}>
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {days.map((day, index) => {
                const isDisabled = isDateDisabled(day.date) || !day.isCurrentMonth;
                return (
                  <button
                    key={index}
                    type="button"
                    className={`
                      ${sizes.dayCell} aspect-square rounded-full flex items-center justify-center
                      ${!day.isCurrentMonth ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : isSelected(day.date) ? '' : 'text-black dark:text-[rgba(255,255,255,0.85)]'}
                      ${isToday(day.date) && !isSelected(day.date) && day.isCurrentMonth ? 'border border-primary-500 text-primary-600 dark:text-primary-400 font-medium' : ''}
                      ${isSelected(day.date) && day.isCurrentMonth ? 'bg-primary-600 !text-white font-semibold' : ''}
                      ${!isSelected(day.date) && day.isCurrentMonth && !isDateDisabled(day.date) ? 'hover:bg-gray-100 dark:hover:bg-[#2a2a2a]' : ''}
                      ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    onClick={(e) => { e.stopPropagation(); if (!isDisabled) handleSelectDate(day.date); }}
                    disabled={isDisabled}
                  >
                    {day.date.getDate()}
                  </button>
                );
              })}
            </div>

            <div className={`${sizes.todaySection} border-t border-gray-100 dark:border-[#424242]`}>
              <button
                type="button"
                className={`w-full ${sizes.todayText} text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium`}
                onClick={(e) => { e.stopPropagation(); handleSelectDate(new Date()); }}
              >
                Today
              </button>
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

DatePicker.displayName = 'DatePicker';

export default DatePicker;
