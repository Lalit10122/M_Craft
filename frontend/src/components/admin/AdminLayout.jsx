import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa', position: 'relative' }}>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="show-mobile"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'none' }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
        <AdminHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main style={{ padding: 'var(--spacing-lg)', flex: 1, overflowY: 'auto' }}>
          <React.Suspense fallback={<div style={{ textAlign: 'center', padding: '32px' }}>Loading Admin Panel...</div>}>
            {children}
          </React.Suspense>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
