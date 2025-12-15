import React, { useState } from 'react';
import { Menu, Search } from 'lucide-react';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { LanguageSwitcher } from '../context/LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';
import { NotificationBell } from './NotificationBell';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  logo: string;
  user?: any;
}

export function Header({ setSidebarOpen, logo, user }: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { t, isRTL } = useLanguage();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      toast.success(`Searching for: "${searchTerm}"`);
      // In a real app, this would trigger actual search functionality
    }
  };

  const handleNotificationClick = () => {
    toast.info('Opening notifications panel...');
    // In a real app, this would open notifications
  };

  const handleMobileSearch = () => {
    toast.info('Opening mobile search...');
    // In a real app, this would open mobile search modal
  };

  const handleProfileClick = () => {
    toast.info('Opening profile menu...');
    // In a real app, this would open profile dropdown
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 lg:border-l-0 sticky top-0 z-30 pointer-events-auto">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Mobile menu button and logo */}
          <div className="flex items-center">
            <button
              type="button"
              className={`lg:hidden -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-zinc-500 ${isRTL ? '-mr-0.5' : '-ml-0.5'}`}
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Mobile logo */}
            <div className={`flex items-center lg:hidden ${isRTL ? 'mr-2' : 'ml-2'}`}>
              <img 
                className="h-8 w-auto" 
                src={logo} 
                alt="CogneraX" 
              />
              <div className={`${isRTL ? 'mr-2' : 'ml-2'}`}>
                <h1 className="text-lg font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
                  CogneraX Learn
                </h1>
              </div>
            </div>

            {/* Desktop search */}
            <div className={`hidden lg:block ${isRTL ? 'lg:mr-6' : 'lg:ml-6'}`}>
              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-zinc-500 transition-colors" />
                </div>
                <Input
                  className="block w-96 py-3 pl-12 pr-4 border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 focus:bg-white transition-all duration-300"
                  placeholder={t('common.search') + '...'}
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  dir="auto"
                />
              </form>
            </div>
          </div>

          {/* Right side - Notifications and profile */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {/* Mobile search */}
            <button 
              className="lg:hidden p-2.5 rounded-xl text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-zinc-500 transition-all duration-200"
              onClick={handleMobileSearch}
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Language Switcher */}
            <div className="hidden sm:block">
              <LanguageSwitcher variant="ghost" size="sm" />
            </div>



            {/* Notifications - Using NotificationBell Component */}
            <NotificationBell />

            {/* Profile dropdown */}
            <div className="relative flex items-center">
              <button
                type="button"
                className={`flex items-center max-w-xs bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-500 hover:bg-zinc-50 p-1 pr-2 transition-all duration-200 group border border-transparent hover:border-gray-200 ${isRTL ? 'rtl:flex-row-reverse' : ''}`}
                onClick={handleProfileClick}
              >
                <div className={`relative ${isRTL ? 'ml-3' : ''}`}>
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <span className="text-white font-semibold">
                      {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-zinc-900 rounded-full border-2 border-white"></div>
                </div>
                <div className={`hidden lg:block ${isRTL ? 'mr-3 text-right' : 'ml-3 text-left'}`}>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-black transition-colors">{user?.name || 'User Name'}</p>
                  <p className="text-xs text-zinc-500 font-medium">{t(`roles.${user?.role?.toLowerCase()}` as any) || user?.role || 'Role'}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}