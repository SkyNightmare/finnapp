import React from 'react';
import { BarChart3, Trophy, Plus, TrendingUp, Upload, Repeat, Bell, Bookmark, Building, Moon, Sun, Keyboard } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  activeTab: 'overview' | 'goals' | 'analytics' | 'import' | 'recurring' | 'bills' | 'templates' | 'networth';
  onTabChange: (tab: 'overview' | 'goals' | 'analytics' | 'import' | 'recurring' | 'bills' | 'templates' | 'networth') => void;
  onAddTransaction: () => void;
}

export function Sidebar({ activeTab, onTabChange, onAddTransaction }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'goals', label: 'Goals', icon: Trophy },
    { id: 'import', label: 'Import Data', icon: Upload },
    { id: 'recurring', label: 'Recurring', icon: Repeat },
    { id: 'bills', label: 'Bill Reminders', icon: Bell },
    { id: 'templates', label: 'Templates', icon: Bookmark },
    { id: 'networth', label: 'Net Worth', icon: Building }
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

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
        <div className="flex gap-2">
          <button
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 font-medium text-sm"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="flex items-center justify-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
        
        {showShortcuts && (
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs space-y-1">
            <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Keyboard Shortcuts</div>
            <div className="flex justify-between"><span>Add Transaction</span><kbd className="bg-gray-200 dark:bg-gray-600 px-1 rounded">A</kbd></div>
            <div className="flex justify-between"><span>Export Data</span><kbd className="bg-gray-200 dark:bg-gray-600 px-1 rounded">E</kbd></div>
            <div className="flex justify-between"><span>Toggle Theme</span><kbd className="bg-gray-200 dark:bg-gray-600 px-1 rounded">T</kbd></div>
            <div className="flex justify-between"><span>Undo</span><kbd className="bg-gray-200 dark:bg-gray-600 px-1 rounded">Ctrl+Z</kbd></div>
          </div>
        )}
        
        <div className="text-center text-gray-500 text-xs">
          <p>Data stored locally</p>
          <p className="mt-1">Built with React & TypeScript</p>
        </div>
      </div>
    </div>
  );
}