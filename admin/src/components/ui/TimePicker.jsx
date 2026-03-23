import { forwardRef, useState, useRef, useEffect } from 'react';
import { Clock, ChevronUp, ChevronDown, CircleX } from 'lucide-react';

const sizeClasses = {
  sm: {
    input: 'px-2 py-1.5 text-xs',
    label: 'text-[10px]',
    icon: 'w-3.5 h-3.5',
    iconWrapper: 'w-4 h-4',
    popup: 'p-2',
    spinnerGap: 'gap-1.5',
    chevron: 'w-3.5 h-3.5',
    chevronBtn: 'p-0.5',
    display: 'w-8 h-6 text-sm rounded-lg',
    colon: 'text-sm',
    periodDisplay: 'w-8 h-6 text-[10px] rounded-lg',
    preset: 'px-1.5 py-0.5 text-[8px] rounded-lg',
    presetGap: 'mt-1.5 gap-1',
    confirmSection: 'mt-2 pt-2',
    confirmBtn: 'px-2 py-1 text-[10px] rounded-lg',
  },
  md: {
    input: 'px-3 py-2 text-sm',
    label: 'text-xs',
    icon: 'w-4 h-4',
    iconWrapper: 'w-5 h-5',
    popup: 'p-3',
    spinnerGap: 'gap-2',
    chevron: 'w-4 h-4',
    chevronBtn: 'p-1',
    display: 'w-10 h-8 text-lg rounded-xl',
    colon: 'text-lg',
    periodDisplay: 'w-10 h-8 text-sm rounded-xl',
    preset: 'px-2 py-1 text-[10px] rounded-xl',
    presetGap: 'mt-2 gap-1.5',
    confirmSection: 'mt-3 pt-3',
    confirmBtn: 'px-3 py-1.5 text-xs rounded-xl',
  },
  lg: {
    input: 'px-4 py-2.5 text-base',
    label: 'text-sm',
    icon: 'w-5 h-5',
    iconWrapper: 'w-6 h-6',
    popup: 'p-4',
    spinnerGap: 'gap-2.5',
    chevron: 'w-5 h-5',
    chevronBtn: 'p-1',
    display: 'w-12 h-10 text-xl rounded-xl',
    colon: 'text-xl',
    periodDisplay: 'w-12 h-10 text-base rounded-xl',
    preset: 'px-2.5 py-1 text-xs rounded-xl',
    presetGap: 'mt-2.5 gap-1.5',
    confirmSection: 'mt-3 pt-3',
    confirmBtn: 'px-4 py-2 text-sm rounded-xl',
  }
};

const TimePicker = forwardRef(({
  label,
  value,
  onChange,
  placeholder = 'Select time',
  error,
  disabled = false,
  clearable = true,
  format = '12h',
  minuteStep = 1,
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState(12);
  const [minutes, setMinutes] = useState(0);
  const [period, setPeriod] = useState('AM');
  const [alignRight, setAlignRight] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);

  const sizes = sizeClasses[size] || sizeClasses.md;

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceOnRight = window.innerWidth - rect.left;
      setAlignRight(spaceOnRight < 250);
    }
  }, [isOpen]);

  useEffect(() => {
    if (value) {
      const [time, timePeriod] = value.split(' ');
      const [h, m] = time.split(':').map(Number);

      if (format === '12h') {
        setHours(h === 0 ? 12 : h > 12 ? h - 12 : h);
        setPeriod(timePeriod || (h >= 12 ? 'PM' : 'AM'));
      } else {
        setHours(h);
      }
      setMinutes(m);
    }
  }, [value, format]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = () => {
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');

    if (format === '12h') {
      return `${h}:${m} ${period}`;
    }
    return `${h}:${m}`;
  };

  const handleConfirm = () => {
    onChange(formatTime());
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
    setHours(12);
    setMinutes(0);
    setPeriod('AM');
  };

  const incrementHours = () => {
    if (format === '12h') {
      setHours(prev => prev === 12 ? 1 : prev + 1);
    } else {
      setHours(prev => prev === 23 ? 0 : prev + 1);
    }
  };

  const decrementHours = () => {
    if (format === '12h') {
      setHours(prev => prev === 1 ? 12 : prev - 1);
    } else {
      setHours(prev => prev === 0 ? 23 : prev - 1);
    }
  };

  const incrementMinutes = () => {
    setMinutes(prev => {
      const next = prev + minuteStep;
      return next >= 60 ? 0 : next;
    });
  };

  const decrementMinutes = () => {
    setMinutes(prev => {
      const next = prev - minuteStep;
      return next < 0 ? 60 - minuteStep : next;
    });
  };

  const togglePeriod = () => {
    setPeriod(prev => prev === 'AM' ? 'PM' : 'AM');
  };

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
          {value || placeholder}
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
            <Clock className={`${sizes.icon} text-gray-400`} />
          )}
        </div>

        {isOpen && !disabled && (
          <div
            className={`absolute z-50 top-full mt-1 bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#424242] rounded-xl shadow-xl ${sizes.popup} ${alignRight ? 'right-0' : 'left-0'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center ${sizes.spinnerGap}`}>
              <div className="flex flex-col items-center">
                <button type="button" className={`${sizes.chevronBtn} hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-full transition-colors group/btn`} onClick={incrementHours}>
                  <ChevronUp className={`${sizes.chevron} text-black dark:text-[rgba(255,255,255,0.85)] group-hover/btn:text-primary-600 dark:group-hover/btn:text-primary-400 transition-colors`} />
                </button>
                <div className={`${sizes.display} flex items-center justify-center font-semibold bg-gray-50 dark:bg-[#2a2a2a] text-black dark:text-[rgba(255,255,255,0.85)]`}>
                  {String(hours).padStart(2, '0')}
                </div>
                <button type="button" className={`${sizes.chevronBtn} hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-full transition-colors group/btn`} onClick={decrementHours}>
                  <ChevronDown className={`${sizes.chevron} text-black dark:text-[rgba(255,255,255,0.85)] group-hover/btn:text-primary-600 dark:group-hover/btn:text-primary-400 transition-colors`} />
                </button>
              </div>

              <span className={`${sizes.colon} font-semibold text-black dark:text-[rgba(255,255,255,0.85)]`}>:</span>

              <div className="flex flex-col items-center">
                <button type="button" className={`${sizes.chevronBtn} hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-full transition-colors group/btn`} onClick={incrementMinutes}>
                  <ChevronUp className={`${sizes.chevron} text-black dark:text-[rgba(255,255,255,0.85)] group-hover/btn:text-primary-600 dark:group-hover/btn:text-primary-400 transition-colors`} />
                </button>
                <div className={`${sizes.display} flex items-center justify-center font-semibold bg-gray-50 dark:bg-[#2a2a2a] text-black dark:text-[rgba(255,255,255,0.85)]`}>
                  {String(minutes).padStart(2, '0')}
                </div>
                <button type="button" className={`${sizes.chevronBtn} hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-full transition-colors group/btn`} onClick={decrementMinutes}>
                  <ChevronDown className={`${sizes.chevron} text-black dark:text-[rgba(255,255,255,0.85)] group-hover/btn:text-primary-600 dark:group-hover/btn:text-primary-400 transition-colors`} />
                </button>
              </div>

              {format === '12h' && (
                <div className="flex flex-col items-center ml-0.5">
                  <button type="button" className={`${sizes.chevronBtn} hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-full transition-colors group/btn`} onClick={togglePeriod}>
                    <ChevronUp className={`${sizes.chevron} text-black dark:text-[rgba(255,255,255,0.85)] group-hover/btn:text-primary-600 dark:group-hover/btn:text-primary-400 transition-colors`} />
                  </button>
                  <div className={`${sizes.periodDisplay} flex items-center justify-center font-semibold bg-primary-50 dark:bg-[#2a2a2a] dark:border dark:border-[#424242] text-primary-600 dark:text-primary-400`}>
                    {period}
                  </div>
                  <button type="button" className={`${sizes.chevronBtn} hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-full transition-colors group/btn`} onClick={togglePeriod}>
                    <ChevronDown className={`${sizes.chevron} text-black dark:text-[rgba(255,255,255,0.85)] group-hover/btn:text-primary-600 dark:group-hover/btn:text-primary-400 transition-colors`} />
                  </button>
                </div>
              )}
            </div>

            {format === '12h' && (
              <div className={`flex flex-wrap ${sizes.presetGap}`}>
                {[
                  { h: 9, m: 0, p: 'AM', label: '9:00 AM' },
                  { h: 12, m: 0, p: 'PM', label: '12:00 PM' },
                  { h: 6, m: 0, p: 'PM', label: '6:00 PM' },
                ].map((time) => (
                  <button
                    key={time.label}
                    type="button"
                    className={`${sizes.preset} bg-gray-50 dark:bg-[#2a2a2a] hover:bg-gray-100 dark:hover:bg-[#363636] text-black dark:text-[rgba(255,255,255,0.85)] font-medium`}
                    onClick={() => { setHours(time.h); setMinutes(time.m); setPeriod(time.p); }}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            )}

            {format === '24h' && (
              <div className={`flex flex-wrap ${sizes.presetGap}`}>
                {[
                  { h: 6, m: 0, label: '06:00' },
                  { h: 12, m: 0, label: '12:00' },
                  { h: 15, m: 0, label: '15:00' },
                  { h: 18, m: 0, label: '18:00' },
                ].map((time) => (
                  <button
                    key={time.label}
                    type="button"
                    className={`${sizes.preset} bg-gray-50 dark:bg-[#2a2a2a] hover:bg-gray-100 dark:hover:bg-[#363636] text-black dark:text-[rgba(255,255,255,0.85)] font-medium`}
                    onClick={() => { setHours(time.h); setMinutes(time.m); }}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            )}

            <div className={`${sizes.confirmSection} border-t border-gray-100 dark:border-[#424242]`}>
              <button
                type="button"
                className={`w-full ${sizes.confirmBtn} bg-primary-600 text-white font-medium hover:bg-primary-700`}
                onClick={handleConfirm}
              >
                Confirm
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

TimePicker.displayName = 'TimePicker';

export default TimePicker;
