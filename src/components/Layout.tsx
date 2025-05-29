
import React, { ReactNode, useState } from 'react';
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Package, PackageOpen, Users, Truck, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const AppSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed top-0 right-0 h-full w-64 bg-blue-500 z-40 shadow-lg">
      <div className="flex flex-col h-full">
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold mb-1 text-white">معرض الملابس</h1>
              <h2 className="text-sm text-blue-100">نظام إدارة الطلبات</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 hover:bg-blue-600 text-white p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-600" asChild>
              <Link to="/customers">
                <Users className="ml-2 h-4 w-4" />
                <span>العملاء</span>
              </Link>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-600" asChild>
              <Link to="/orders">
                <Package className="ml-2 h-4 w-4" />
                <span>الطلبات</span>
              </Link>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-600" asChild>
              <Link to="/new-order">
                <PackageOpen className="ml-2 h-4 w-4" />
                <span>طلب جديد</span>
              </Link>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-600" asChild>
              <Link to="/shipments">
                <Truck className="ml-2 h-4 w-4" />
                <span>الشحنات</span>
              </Link>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-600" asChild>
              <Link to="/calendar">
                <Calendar className="ml-2 h-4 w-4" />
                <span>التقويم</span>
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="mt-auto p-4 border-t border-blue-400">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-blue-200 text-blue-800 font-bold w-8 h-8 rounded-full flex items-center justify-center">
              {user?.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-blue-100">
                {user?.role === 'admin' ? 'مدير' : 'موظف'}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full bg-transparent border-blue-300 text-white hover:bg-blue-600" onClick={logout}>
            تسجيل الخروج
          </Button>
        </div>
      </div>
    </div>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="min-h-screen flex w-full" dir="rtl">
      {/* Overlay للخلفية عند فتح البار */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* المحتوى الرئيسي */}
      <main className="flex-1 overflow-y-auto flex flex-col w-full">
        <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm relative z-20">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8 hover:bg-gray-100 transition-colors z-50"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <h1 className="text-lg font-semibold text-gray-800 hidden sm:block">
              نظام إدارة الطلبات
            </h1>
          </div>
          <div className="text-sm text-gray-600 hidden md:block">
            مرحباً، {user?.name}
          </div>
        </div>
        <div className="p-4 md:p-6 flex-1 bg-gray-50">
          {children}
        </div>
      </main>
      
      {/* البار الجانبي */}
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
};
