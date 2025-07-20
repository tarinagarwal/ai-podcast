import React from "react";
import { Mic2, RefreshCw, Plus, LogOut, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  serverStatus: "checking" | "online" | "offline";
  isLoading: boolean;
  onRefresh: () => void;
  onNewPodcast: () => void;
  showForm: boolean;
}

const Header: React.FC<HeaderProps> = ({
  serverStatus,
  isLoading,
  onRefresh,
  onNewPodcast,
  showForm,
}) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (confirm("Are you sure you want to sign out?")) {
      await logout();
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Mic2 className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">
              AI Podcast Studio
            </h1>
            <div
              className={`ml-3 flex items-center text-xs px-2 py-1 rounded-full ${
                serverStatus === "online"
                  ? "bg-green-100 text-green-800"
                  : serverStatus === "checking"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full mr-1 ${
                  serverStatus === "online"
                    ? "bg-green-500"
                    : serverStatus === "checking"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              ></div>
              {serverStatus === "checking" ? "Checking..." : serverStatus}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="flex items-center text-sm text-gray-600">
              <User className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">{user?.name}</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              disabled={isLoading}
            >
              <RefreshCw
                className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>

            {/* New Podcast Button */}
            <button
              onClick={onNewPodcast}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">New Podcast</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-600 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
