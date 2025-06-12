import { ReactNode, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const location = useLocation();

  const handleSidebarToggle = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  // Don't render footer on AI Learning page
  const showFooter = location.pathname !== '/learn/ai';

  return (
    <div className="min-h-screen flex flex-col m-6">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar onToggle={handleSidebarToggle} />
        
        <div className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          <main className="flex-1 pt-24 pb-16">
            <div className="container max-w-[1600px] px-4">
              {children}
            </div>
          </main>
          
          {showFooter && <Footer />}
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;