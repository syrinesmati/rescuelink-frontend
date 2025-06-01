
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Shield, Users, User, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-red-50 dark:from-gray-900 dark:to-red-950/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4 tracking-tight gradient-text">
            Welcome to <span className="text-red-600 dark:text-red-500">RescueLink</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Connecting citizens, responders, and coordinators in times of emergency
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 border-red-100 dark:border-red-900/30 glass-card">
              <CardHeader className="text-center">
                <User className="w-12 h-12 text-red-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-xl mb-2 text-red-700 dark:text-red-400">Citizen Portal</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Report emergencies and track response status in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/citizen">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2">
                    Access Portal <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 border-red-100 dark:border-red-900/30 glass-card">
              <CardHeader className="text-center">
                <Shield className="w-12 h-12 text-red-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-xl mb-2 text-red-700 dark:text-red-400">Responder Portal</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Receive mission details and provide real-time updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/responder">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2">
                    Access Portal <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 border-red-100 dark:border-red-900/30 glass-card">
              <CardHeader className="text-center">
                <Users className="w-12 h-12 text-red-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-xl mb-2 text-red-700 dark:text-red-400">Coordinator Portal</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Manage emergency responses and coordinate teams
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/coordinator">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2">
                    Access Portal <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Emergency Response Made Simple
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Our platform streamlines emergency management by connecting those in need with first responders and coordinators, ensuring swift and efficient response times.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;