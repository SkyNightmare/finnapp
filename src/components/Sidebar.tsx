import React from 'react';
import { BarChart3, Target, Trophy, Plus } from 'lucide-react';

interface SidebarProps {
  activeTab: 'overview' | 'budget' | 'goals';
  onTabChange: (tab: 'overview' | 'budget' | 'goals') => void;
  onAddTransaction: () => void;
}

export function Sidebar({ activeTab, onTabChange, onAddTransaction }: SidebarProps) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'budget', label: 'Budget', icon: Target },
    { id: 'goals', label: 'Goals', icon: Trophy }
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-white via-gray-50 to-white shadow-2xl border-r border-gray-100 h-screen fixed left-0 top-0 z-40 backdrop-blur-sm">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800 bg-clip-text text-transparent">Finance Tracker</h1>
            <p className="text-xs font-medium text-gray-600">Professional Management</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <button
          onClick={onAddTransaction}
          className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all duration-300 font-bold shadow-xl transform hover:scale-105 active:scale-95 mb-6"
        >
          <Plus className="w-5 h-5" />
          Add Transaction
        </button>

        <nav className="space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 text-left ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl transform scale-105'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
        <div className="text-center text-gray-500 text-xs">
          <p>Data stored locally</p>
          <p className="mt-1">Built with React & TypeScript</p>
        </div>
      </div>
    </div>
  );
}