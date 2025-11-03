import React, { useState } from 'react';
import { Menu, Bell, Search, ShoppingCart } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { LanguageSwitcher } from '../context/LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../commerce/CartContext';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  logo: string;
  user?: any;
  onCartClick?: () => void;
}

export function Header({ setSidebarOpen, logo, user, onCartClick }: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { t, isRTL } = useLanguage();
  const { getTotalItems } = useCart();

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
              className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Mobile logo */}
            <div className="flex items-center lg:hidden ml-2">
              <img 
                className="h-8 w-auto" 
                src={logo} 
                alt="CogneraX" 
              />
              <div className="ml-2">
                <h1 className="text-lg font-bold bg-gradient-to-r from-teal-500 to-purple-600 bg-clip-text text-transparent">
                  CogneraX Learn
                </h1>
              </div>
            </div>

            {/* Desktop search */}
            <div className="hidden lg:block lg:ml-6">
              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                </div>
                <Input
                  className="block w-96 pl-12 pr-4 py-3 border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition-all duration-300"
                  placeholder="Search courses, students, or content..."
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>
            </div>
          </div>

          {/* Right side - Notifications and profile */}
          <div className="flex items-center space-x-3">
            {/* Mobile search */}
            <button 
              className="lg:hidden p-2.5 rounded-xl text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all duration-200"
              onClick={handleMobileSearch}
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Language switcher */}
            <LanguageSwitcher variant="ghost" size="sm" />

            {/* Cart (Students only) */}
            {user?.role === 'student' && (
              <button 
                className="relative p-2.5 rounded-xl text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all duration-200 group"
                onClick={onCartClick}
              >
                <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                {getTotalItems() > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-gradient-to-r from-teal-500 to-purple-600 border-0"
                  >
                    {getTotalItems()}
                  </Badge>
                )}
              </button>
            )}

            {/* Notifications */}
            <button 
              className="relative p-2.5 rounded-xl text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all duration-200 group"
              onClick={handleNotificationClick}
            >
              <Bell className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </button>

            {/* AI Status Indicator */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-teal-50 to-purple-50 rounded-xl">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-gray-600">AI Active</span>
            </div>

            {/* Profile dropdown */}
            <div className="relative">
              <button 
                className="flex items-center space-x-3 max-w-xs bg-white rounded-xl p-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 group"
                onClick={handleProfileClick}
              >
                <div className="relative">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <span className="text-white font-semibold">
                      {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role || 'Member'}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}