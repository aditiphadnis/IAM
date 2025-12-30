
import React from 'react';
import { SIDEBAR_ITEMS } from '../constants';

interface SidebarProps {
  activeId: string;
  onNavigate: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeId, onNavigate }) => {
  return (
    <aside className="w-20 lg:w-64 bg-white border-r border-slate-200 h-screen flex flex-col transition-all duration-300 overflow-hidden">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200 shrink-0">
          e
        </div>
        <span className="font-bold text-xl text-slate-800 hidden lg:block tracking-tight">Enterprise.ai</span>
      </div>

      <nav className="flex-1 px-3 mt-4 space-y-1">
        {SIDEBAR_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all group ${
              activeId === item.id 
                ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <span className={`${activeId === item.id ? 'text-indigo-600' : 'group-hover:text-slate-700'}`}>
              {item.icon}
            </span>
            <span className="hidden lg:block">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 mb-4">
        <div className="flex items-center gap-3 px-2 py-3">
          <img 
            src="https://picsum.photos/seed/admin/40/40" 
            className="w-8 h-8 rounded-full border border-slate-200"
            alt="User"
          />
          <div className="hidden lg:block overflow-hidden">
            <p className="text-sm font-semibold text-slate-900 truncate">Support User</p>
            <p className="text-xs text-slate-500 truncate">support@enterprise.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
