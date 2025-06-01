
import React from "react";
import { Link } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-red-50 dark:from-slate-900 dark:to-red-950/30 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
            Welcome back to RescueLink
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Don't have an account?{" "}
            <Link to="/register" className="text-red-600 hover:text-red-500 dark:text-red-500 dark:hover:text-red-400 font-medium">
              Register here
            </Link>
          </p>
        </div>

        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;