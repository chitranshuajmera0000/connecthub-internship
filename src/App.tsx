import React, { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { scrollToTop } from './utils/scrollToTop';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'profile'>('home');
  const [authPage, setAuthPage] = useState<'login' | 'register'>('login');
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);

  // Scroll to top when user logs in
  useEffect(() => {
    if (user) {
      scrollToTop();
    }
  }, [user]);

  const handleUserClick = (userId: string) => {
    setViewingUserId(userId);
    setCurrentPage('profile');
    scrollToTop();
  };

  const handleNavigate = (page: 'home' | 'profile') => {
    if (page === 'home') {
      setViewingUserId(null);
    } else if (page === 'profile') {
      setViewingUserId(null); // View own profile
    }
    setCurrentPage(page);
    scrollToTop();
  };

  const handleBackToFeed = () => {
    setViewingUserId(null);
    setCurrentPage('home');
    scrollToTop();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {authPage === 'login' ? (
          <Login onSwitchToRegister={() => {
            setAuthPage('register');
            scrollToTop();
          }} />
        ) : (
          <Register onSwitchToLogin={() => {
            setAuthPage('login');
            scrollToTop();
          }} />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
      
      {currentPage === 'home' ? (
        <Home onUserClick={handleUserClick} />
      ) : (
        <Profile 
          userId={viewingUserId || undefined} 
          onBack={viewingUserId ? handleBackToFeed : undefined}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;