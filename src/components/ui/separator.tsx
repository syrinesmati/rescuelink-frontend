
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Shield, Users, User } from "lucide-react";
import { Layout } from '../Layout';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-red-600 text-xl font-bold">
                RescueLink
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/citizen">
                <Button
                  variant={location.pathname === '/citizen' ? 'default' : 'ghost'}
                  className="flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>Citizen</span>
                </Button>
              </Link>
              <Link to="/responder">
                <Button
                  variant={location.pathname === '/responder' ? 'default' : 'ghost'}
                  className="flex items-center space-x-2"
                >
                  <Shield className="h-4 w-4" />
                  <span>Responder</span>
                </Button>
              </Link>
              <Link to="/coordinator">
                <Button
                  variant={location.pathname === '/coordinator' ? 'default' : 'ghost'}
                  className="flex items-center space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span>Coordinator</span>
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