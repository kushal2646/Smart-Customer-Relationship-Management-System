import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Users, Briefcase, CheckSquare, BarChart, UsersIcon, Shield } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: BarChart },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Leads', path: '/leads', icon: Briefcase },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  ];

  if (user?.role === 'Admin') {
    navItems.push({ name: 'Employees', path: '/employees', icon: UsersIcon });
  }

  return (
    <div className="w-72 bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex flex-col shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Decorative Glow */}
      <div className="absolute top-0 -left-1/4 w-full h-1/2 bg-blue-500 rounded-full blur-[100px] opacity-10 pointer-events-none"></div>

      <div className="p-6 flex items-center justify-start border-b border-gray-700/50 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center mr-3 shadow-lg shadow-blue-500/30">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Smart<span className="text-blue-400">CRM</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto relative z-10">
        <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Main Menu</p>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `group flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 ease-in-out ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20 translate-x-1' 
                  : 'text-gray-400 hover:bg-gray-800/60 hover:text-white hover:translate-x-1'
              }`
            }
          >
            <item.icon className={`w-5 h-5 mr-3 transition-colors duration-300 group-hover:text-blue-300`} />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-5 mx-4 mb-6 rounded-2xl bg-gray-800/40 border border-gray-700/50 backdrop-blur-sm relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-inner">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'Loading...'}</p>
            <p className="text-xs text-blue-400 font-medium tracking-wide mt-0.5 uppercase">
              {user?.role || 'Role'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
