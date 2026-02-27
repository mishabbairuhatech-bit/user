import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSettings } from '@hooks';

const AdminLayout = () => {
  const { settings } = useSettings();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1024;

      setIsMobile(mobile);
      setIsTablet(tablet);

      if (tablet) {
        setIsSidebarCollapsed(true);
      }

      if (!mobile) {
        setIsMobileMenuOpen(false);
        setIsClosing(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    if (isTablet) return;
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    if (isMobileMenuOpen && !isClosing) {
      const timer = setTimeout(() => setIsDrawerVisible(true), 10);
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
    }, 300);
  };

  const isRight = settings.sidebarPosition === 'right';

  const sidebarEl = !isMobile && (
    <aside
      className={`${isSidebarCollapsed || isTablet ? 'w-[60px]' : 'w-[260px]'} flex-shrink-0 h-full ${
        isRight ? 'border-l' : 'border-r'
      } border-gray-200 dark:border-[#2a2a2a] transition-all duration-300`}
    >
      <Sidebar
        isCollapsed={isSidebarCollapsed || isTablet}
        onToggle={toggleSidebar}
        isMobile={false}
        isTablet={isTablet}
        onCloseMobile={closeMobileMenu}
      />
    </aside>
  );

  const mainEl = (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
      <Header isMobile={isMobile} onMenuClick={toggleMobileMenu} />
      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );

  return (
    <div className="h-screen flex bg-white dark:bg-[#121212] transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {isMobile && isMobileMenuOpen && (
        <>
          <div
            className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isDrawerVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={closeMobileMenu}
          />
          <div
            className={`fixed ${isRight ? 'right-0' : 'left-0'} top-0 bottom-0 w-[260px] z-50 ${
              isRight ? 'border-l' : 'border-r'
            } border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#171717] transition-transform duration-300 ${
              isDrawerVisible
                ? 'translate-x-0'
                : isRight
                  ? 'translate-x-full'
                  : '-translate-x-full'
            }`}
          >
            <Sidebar
              isCollapsed={false}
              onToggle={toggleSidebar}
              isMobile={true}
              onCloseMobile={closeMobileMenu}
            />
          </div>
        </>
      )}

      {isRight ? (
        <>
          {mainEl}
          {sidebarEl}
        </>
      ) : (
        <>
          {sidebarEl}
          {mainEl}
        </>
      )}
    </div>
  );
};

export default AdminLayout;
