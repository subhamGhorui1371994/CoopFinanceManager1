import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  Building, 
  Users, 
  DollarSign, 
  Receipt, 
  PiggyBank, 
  FileBarChart, 
  Settings, 
  LogOut,
  University,
  User
} from "lucide-react";
import { getCurrentUser, logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const navItems = [
  { path: "/", label: "Dashboard", icon: BarChart3, tab: "dashboard" },
  { path: "/organizations", label: "Organizations", icon: Building, tab: "organizations", adminOnly: true },
  { path: "/members", label: "Members", icon: Users, tab: "members" },
  { path: "/loans", label: "Loans", icon: DollarSign, tab: "loans" },
  { path: "/repayments", label: "Repayments", icon: Receipt, tab: "repayments" },
  { path: "/contributions", label: "Contributions", icon: PiggyBank, tab: "contributions" },
  { path: "/reports", label: "Reports", icon: FileBarChart, tab: "reports" },
];

export function Sidebar() {
  const [location] = useLocation();
  const currentUser = getCurrentUser();

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
  };

  const filteredNavItems = navItems.filter(item => 
    !item.adminOnly || currentUser.isAdmin || currentUser.isSuperAdmin
  );

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col h-full">
      {/* Logo & Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <University className="text-white text-lg h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">CoopLoan</h1>
            <p className="text-xs text-gray-500">Management System</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="text-primary h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{currentUser.name}</p>
            <p className="text-xs text-gray-500">
              {currentUser.isSuperAdmin ? "Super Administrator" : 
               currentUser.isAdmin ? "Administrator" : "Member"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <div className={`
                flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer
                ${isActive 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}>
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Settings & Logout */}
      <div className="p-4 border-t border-gray-200 space-y-1">
        <div className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 px-3 py-2 h-auto"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
}
