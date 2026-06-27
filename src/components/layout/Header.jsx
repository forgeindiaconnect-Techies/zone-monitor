import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBranch } from '../../context/BranchContext';
import { Bell, User, MapPin } from 'lucide-react';

const Header = () => {
  const { user } = useAuth();
  const { branches, activeBranch, setActiveBranch } = useBranch();

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-64 flex items-center justify-between px-6 z-10 shadow-sm">
      <div className="flex items-center space-x-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Welcome back, {user?.name || 'User'}
        </h2>
        
        <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-gray-200">
          <MapPin size={16} className="text-[var(--color-brand-indigo)]" />
          {['Super Admin'].includes(user?.role) ? (
            <select 
              value={activeBranch} 
              onChange={(e) => setActiveBranch(e.target.value)}
              className="bg-transparent outline-none text-sm font-medium text-gray-700 cursor-pointer w-40"
            >
              {branches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          ) : (
            <span className="text-sm font-medium text-gray-700">{activeBranch}</span>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-400 hover:text-[var(--color-brand-indigo)] hover:bg-indigo-50 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="h-8 w-px bg-gray-200"></div>
        
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-[var(--color-brand-indigo)] text-white flex items-center justify-center font-bold">
            {user?.name?.charAt(0) || <User size={18} />}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">{user?.name || 'Admin'}</span>
            <span className="text-xs text-gray-500">{user?.role || 'Role'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
