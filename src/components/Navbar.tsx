import React from 'react';
import { LogOut, User, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  currentPage: 'home' | 'profile';
  onNavigate: (page: 'home' | 'profile') => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-300 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-blue-600">ConnectHub</h1>
            
            <div className="hidden md:flex space-x-6">
              <button
                onClick={() => onNavigate('home')}
                className={`flex flex-col items-center space-y-1 px-3 py-1 text-xs font-medium transition-colors ${
                  currentPage === 'home'
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Home className="w-6 h-6" />
                <span>Home</span>
              </button>
              
              <button
                onClick={() => onNavigate('profile')}
                className={`flex flex-col items-center space-y-1 px-3 py-1 text-xs font-medium transition-colors ${
                  currentPage === 'profile'
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="w-6 h-6" />
                <span>Me</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden border-t border-gray-200">
          <div className="flex justify-around py-2">
            <button
              onClick={() => onNavigate('home')}
              className={`flex flex-col items-center space-y-1 px-3 py-2 text-xs font-medium transition-colors ${
                currentPage === 'home'
                  ? 'text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Home className="w-6 h-6" />
              <span>Home</span>
            </button>
            
            <button
              onClick={() => onNavigate('profile')}
              className={`flex flex-col items-center space-y-1 px-3 py-2 text-xs font-medium transition-colors ${
                currentPage === 'profile'
                  ? 'text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-6 h-6" />
              <span>Me</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;