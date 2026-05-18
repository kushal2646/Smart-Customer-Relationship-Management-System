import React, { useContext } from 'react';
import { LogOut, Bell, Search, Settings } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm z-20 sticky top-0">
      <div className="flex items-center justify-between px-8 py-4">
        
        {/* Search Bar */}
        <div className="flex items-center bg-gray-100/80 border border-gray-200 rounded-full px-4 py-2.5 w-96 transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 focus-within:bg-white shadow-inner">
          <Search className="w-4 h-4 text-gray-400 mr-3" />
          <input 
            type="text" 
            placeholder="Search customers, leads, or tasks..." 
            className="bg-transparent border-none focus:outline-none w-full text-sm text-gray-700 placeholder-gray-400"
          />
        </div>
        
        {/* Right Actions */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <button className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all relative group">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full group-hover:animate-ping"></span>
            </button>
            <button className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
              <Settings className="w-5 h-5" />
            </button>
          </div>
          
          <div className="h-8 w-px bg-gray-200"></div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-gray-700">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
