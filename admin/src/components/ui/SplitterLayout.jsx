import React, { useState, useRef, useEffect, useCallback } from 'react';

const SplitterLayout = ({
  leftPanel,
  rightPanel,
  initialRightWidth = 350,
  minRightWidth = 200,
  maxRightWidth = 500,
  maxRightPercent = 40,
  className = ''
}) => {
  const [rightWidth, setRightWidth] = useState(initialRightWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const startDragging = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const stopDragging = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onDrag = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = containerRect.right - e.clientX;

    // Cap at maxRightWidth pixels AND maxRightPercent of container
    const percentMax = containerRect.width * (maxRightPercent / 100);
    const effectiveMax = Math.min(maxRightWidth, percentMax);

    const clampedWidth = Math.max(minRightWidth, Math.min(newWidth, effectiveMax));
    setRightWidth(clampedWidth);
  }, [isDragging, minRightWidth, maxRightWidth, maxRightPercent]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onDrag);
      window.addEventListener('mouseup', stopDragging);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none'; // Prevent text selection
    } else {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', stopDragging);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', stopDragging);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, onDrag, stopDragging]);

  return (
    <div 
      ref={containerRef} 
      className={`flex h-full w-full overflow-hidden bg-white dark:bg-[#1f1f1f] ${className}`}
    >
      {/* Left Panel */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 h-full">
        {leftPanel}
      </div>

      {/* Splitter Resizer */}
      {rightPanel && (
        <div 
          role="separator"
          className={`relative flex-shrink-0 cursor-col-resize transition-all duration-150 ease-in-out group ${isDragging ? 'bg-primary-500' : 'bg-transparent hover:bg-primary-400'}`}
          style={{ width: '4px' }}
          onMouseDown={startDragging}
        >
          {/* invisible wider hit area for easier grabbing */}
          <div className="absolute inset-y-0 -inset-x-2 z-20 cursor-col-resize" />
        </div>
      )}

      {/* Right Panel */}
      {rightPanel && (
        <div 
          style={{ width: `${rightWidth}px` }}
          className="h-full flex flex-col flex-shrink-0 overflow-hidden relative"
        >
          {/* Prevent pointer events from interfering with dragging if rightPanel has iframes or things that eat events */}
          {isDragging && (
             <div className="absolute inset-0 z-50 bg-transparent pointer-events-none" />
          )}
          {rightPanel}
        </div>
      )}
    </div>
  );
};

export default SplitterLayout;
