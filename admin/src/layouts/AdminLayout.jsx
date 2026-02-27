import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const mobile = width < 768; // Mobile: < 768px
      const tablet = width >= 768 && width < 1024; // Tablet: 768px - 1024px

      setIsMobile(mobile);
      setIsTablet(tablet);

      // Auto-collapse on tablet
      if (tablet) {
        setIsSidebarCollapsed(true);
      }

      // Close mobile menu when resizing away from mobile
      if (!mobile) {
        setIsMobileMenuOpen(false);
        setIsClosing(false);
      }
    };

    // Check on mount
    checkScreenSize();

    // Listen for resize
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    // On tablet, keep it collapsed
    if (isTablet) {
      return;
    }
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Handle drawer open animation
  useEffect(() => {
    if (isMobileMenuOpen && !isClosing) {
      // Small delay to trigger CSS transition
      const timer = setTimeout(() => {
        setIsDrawerVisible(true);
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [isMobileMenuOpen, isClosing]);

  const toggleMobileMenu = () => {
    if (isMobileMenuOpen) {
      closeMobileMenu();
    } else {
      setIsDrawerVisible(false);
      setIsMobileMenuOpen(true);
    }
  };

  const closeMobileMenu = () => {
    setIsClosing(true);
    setIsDrawerVisible(false);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] p-2 lg:p-4 transition-colors duration-300">
      <div className="flex gap-2 lg:gap-4 h-[calc(100vh-16px)] lg:h-[calc(100vh-32px)]">
        {/* Sidebar Card - Hidden on mobile, collapsed on tablet, full on desktop */}
        {!isMobile && (
          <div className={`${isSidebarCollapsed || isTablet ? 'w-[60px]' : 'w-[260px]'} flex-shrink-0 h-full transition-all duration-300`}>
            <div className="bg-[#f6f6f6] dark:bg-[#1e1e1e] rounded-3xl h-full overflow-y-auto scrollbar-hide transition-colors duration-300">
              <Sidebar isCollapsed={isSidebarCollapsed || isTablet} onToggle={toggleSidebar} isMobile={false} isTablet={isTablet} onCloseMobile={closeMobileMenu} />
            </div>
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobile && isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ease-out ${
                isDrawerVisible ? 'opacity-50' : 'opacity-0'
              }`}
              onClick={closeMobileMenu}
            />
            {/* Sidebar Drawer */}
            <div
              className={`fixed left-2 top-2 bottom-2 w-[260px] z-50 transition-transform duration-300 ease-out ${
                isDrawerVisible ? 'translate-x-0' : '-translate-x-[calc(100%+8px)]'
              }`}
            >
              <div className="bg-[#f6f6f6] dark:bg-[#1e1e1e] rounded-3xl h-full overflow-y-auto scrollbar-hide shadow-2xl transition-colors duration-300">
                <Sidebar isCollapsed={false} onToggle={toggleSidebar} isMobile={true} onCloseMobile={closeMobileMenu} />
              </div>
            </div>
          </>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-2 lg:gap-4 min-w-0 h-full overflow-hidden">
          {/* Header Card - Sticky */}
          <div className="bg-[#f6f6f6] dark:bg-[#1e1e1e] rounded-3xl flex-shrink-0 overflow-hidden transition-colors duration-300">
            <Header isMobile={isMobile} onMenuClick={toggleMobileMenu} />
          </div>

          {/* Content Card - Scrollable */}
          <div className="bg-[#f6f6f6] dark:bg-[#1e1e1e] rounded-3xl flex-1 overflow-hidden transition-colors duration-300">
            <div className="h-full overflow-y-auto scrollbar-hide p-3 lg:p-5">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
