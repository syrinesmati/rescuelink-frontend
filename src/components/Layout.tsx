
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Shield, Users, User, LogIn } from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  
  if (isAuthPage) {
    return <main>{children}</main>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b-2 border-red-100 dark:border-red-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="RescueLink Logo" className="h-10 w-auto transition-opacity duration-200 hover:opacity-80" />
            </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/citizen">
                <Button
                  variant={location.pathname === '/citizen' ? 'default' : 'ghost'}
                  className={location.pathname === '/citizen' ? 'bg-red-600 hover:bg-red-700 text-white' : 'text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400'}
                >
                  <User className="h-4 w-4 mr-2" />
                  <span>Citizen</span>
                </Button>
              </Link>
              <Link to="/responder">
                <Button
                  variant={location.pathname === '/responder' ? 'default' : 'ghost'}
                  className={location.pathname === '/responder' ? 'bg-red-600 hover:bg-red-700 text-white' : 'text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400'}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  <span>Responder</span>
                </Button>
              </Link>
              <Link to="/coordinator">
                <Button
                  variant={location.pathname === '/coordinator' ? 'default' : 'ghost'}
                  className={location.pathname === '/coordinator' ? 'bg-red-600 hover:bg-red-700 text-white' : 'text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400'}
                >
                  <Users className="h-4 w-4 mr-2" />
                  <span>Coordinator</span>
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  className="flex items-center border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  <span>Login</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default Layout;