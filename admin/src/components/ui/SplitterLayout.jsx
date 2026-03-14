import React, { useState, useRef, useEffect, useCallback } from 'react';

const SplitterLayout = ({
  leftPanel,
  rightPanel,
  initialRightWidth = 350,
  minRightWidth = 200,
  maxRightWidth = 500,
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
    
    // Using rect coordinates
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calculate right width from mouse X to right edge of the container
    const newWidth = containerRect.right - e.clientX;
    
    // Clamp the width
    const clampedWidth = Math.max(minRightWidth, Math.min(newWidth, maxRightWidth));
    setRightWidth(clampedWidth);
  }, [isDragging, minRightWidth, maxRightWidth]);

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
      <div className="flex-1 overflow-auto min-w-0 h-full">
        {leftPanel}
      </div>

      {/* Splitter Resizer */}
      <div 
        role="separator"
        className={`relative z-10 flex-shrink-0 cursor-col-resize transition-all duration-150 ease-in-out border-l border-gray-200 dark:border-[#2a2a2a] group ${isDragging ? 'bg-primary-500 border-primary-500' : 'bg-transparent hover:bg-primary-400 hover:border-primary-400'}`}
        style={{ width: '4px', marginLeft: '-2px', marginRight: '-2px' }}
        onMouseDown={startDragging}
      >
        {/* invisible wider hit area for easier grabbing */}
        <div className="absolute inset-y-0 -inset-x-2 z-20 cursor-col-resize" />
      </div>

      {/* Right Panel */}
      <div 
        style={{ width: `${rightWidth}px` }}
        className="h-full flex-shrink-0 overflow-auto bg-gray-50 dark:bg-[#141414] relative"
      >
        {/* Prevent pointer events from interfering with dragging if rightPanel has iframes or things that eat events */}
        {isDragging && (
           <div className="absolute inset-0 z-50 bg-transparent pointer-events-none" />
        )}
        {rightPanel}
      </div>
    </div>
  );
};

export default SplitterLayout;
