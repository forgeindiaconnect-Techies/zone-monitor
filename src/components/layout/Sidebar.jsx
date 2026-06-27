import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  Map, 
  Ban, 
  FileText, 
  Settings,
  LogOut,
  Shield,
  Activity
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const role = user?.role || 'Visitor';

  const allNavItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, roles: ['Super Admin', 'MD', 'Admin', 'Security', 'Visitor'] },
    { name: 'Live Monitoring', path: '/live-monitoring', icon: <Activity size={20} />, roles: ['Super Admin', 'MD', 'Admin', 'Security'] },
    { name: 'New Visitor', path: '/visitors/new', icon: <Users size={20} />, roles: ['Super Admin', 'MD', 'Admin', 'Security'] },
    { name: 'Returning Visitor', path: '/visitors/returning', icon: <Users size={20} />, roles: ['Super Admin', 'MD', 'Admin', 'Security'] },
    { name: 'All Visitors', path: '/visitors', icon: <Users size={20} />, roles: ['Super Admin', 'MD', 'Admin', 'Security'] },
    { name: 'User Management', path: '/users', icon: <Shield size={20} />, roles: ['Super Admin'] },
    { name: 'Approvals', path: '/approvals', icon: <CheckSquare size={20} />, roles: ['Super Admin', 'MD', 'Admin'] },
    { name: 'Zones', path: '/zones', icon: <Map size={20} />, roles: ['Super Admin', 'MD', 'Admin', 'Security'] },
    { name: 'Blacklist', path: '/blacklist', icon: <Ban size={20} />, roles: ['Super Admin', 'MD', 'Admin', 'Security'] },
    { name: 'Reports', path: '/reports', icon: <FileText size={20} />, roles: ['Super Admin', 'MD', 'Admin'] },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} />, roles: ['Super Admin', 'MD', 'Admin', 'Visitor'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-[var(--color-brand-indigo)] text-white h-screen fixed top-0 left-0 flex flex-col shadow-xl z-20">
      <div className="h-16 flex items-center justify-center border-b border-white/10">
        <h1 className="text-2xl font-bold tracking-wider">ZMVMS</h1>
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto hide-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive 
                  ? 'bg-white text-[var(--color-brand-indigo)] shadow-md font-medium' 
                  : 'text-indigo-100 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium shadow-md"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
      
      <div className="pb-4 text-xs text-indigo-200 text-center">
        &copy; 2026 ZMVMS Portal
      </div>
    </aside>
  );
};

export default Sidebar;
