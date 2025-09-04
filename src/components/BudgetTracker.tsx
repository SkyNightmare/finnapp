import React, { useState } from 'react';
import { Target, Plus, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { SpendingLimit, Transaction } from '../types';
import { formatCurrency } from '../utils/dataUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { startOfWeek, startOfMonth, endOfWeek, endOfMonth, isWithinInterval } from 'date-fns';

interface BudgetTrackerProps {
  transactions: Transaction[];
}

export function BudgetTracker({ transactions }: BudgetTrackerProps) {
  const [spendingLimits, setSpendingLimits] = useLocalStorage<SpendingLimit[]>('spending-limits', []);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    customCategory: '',
    amount: '',
    period: 'monthly' as 'weekly' | 'monthly',
    notifications: true
  });

  const expenseCategories = Array.from(
    new Set(transactions.filter(t => t.type === 'expense').map(t => t.category))
  ).sort();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) return;
    
    const category = formData.category === 'custom' ? formData.customCategory : formData.category;
    if (!category.trim()) return;

    const newLimit: SpendingLimit = {
      id: Date.now().toString(),
      category: category.trim(),
      amount,
      period: formData.period,
      spent: 0,
      notifications: formData.notifications
    };

    setSpendingLimits(prev => [...prev, newLimit]);
    setFormData({
      category: '',
      customCategory: '',
      amount: '',
      period: 'monthly',
      notifications: true
    });
    setShowForm(false);
  };

  const getSpentAmount = (limit: SpendingLimit) => {
    const now = new Date();
    let start: Date, end: Date;

    if (limit.period === 'weekly') {
      start = startOfWeek(now);
      end = endOfWeek(now);
    } else {
      start = startOfMonth(now);
      end = endOfMonth(now);
    }

    return transactions
      .filter(t => 
        t.type === 'expense' && 
        t.category === limit.category &&
        isWithinInterval(new Date(t.date), { start, end })
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const deleteLimit = (id: string) => {
    setSpendingLimits(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-8 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">Spending Limits</h2>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Set and track category spending limits</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 focus:ring-4 focus:ring-orange-200 transition-all duration-300 shadow-xl hover:shadow-2xl font-semibold transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Limit
          </button>
        </div>

        {showForm && (
          <div className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-100 dark:border-orange-800 shadow-inner">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 bg-white dark:bg-gray-700 shadow-inner font-medium dark:text-white"
                    required
                  >
                    <option value="">Select a category</option>
                    {expenseCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="custom">Custom Category</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 bg-white dark:bg-gray-700 shadow-inner font-medium dark:text-white"
                    required
                  />
                </div>
              </div>

              {formData.category === 'custom' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Custom Category</label>
                  <input
                    type="text"
                    value={formData.customCategory}
                    onChange={(e) => setFormData(prev => ({ ...prev, customCategory: e.target.value }))}
                    placeholder="Enter category name"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 bg-white dark:bg-gray-700 shadow-inner font-medium dark:text-white"
                    required
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Period</label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value as 'weekly' | 'monthly' }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 bg-white dark:bg-gray-700 shadow-inner font-medium dark:text-white"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg font-semibold"
                >
                  Create Limit
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-500 transition-all duration-300 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {spendingLimits.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No spending limits set</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Create limits to track your spending by category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spendingLimits.map(limit => {
              const spent = getSpentAmount(limit);
              const percentage = (spent / limit.amount) * 100;
              const isOverLimit = percentage > 100;
              const isNearLimit = percentage > 80 && percentage <= 100;
              
              return (
                <div key={limit.id} className="p-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-100 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">{limit.category}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{limit.period} limit</p>
                    </div>
                    <button
                      onClick={() => deleteLimit(limit.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Spent</span>
                      <span className={`text-sm font-bold ${
                        isOverLimit ? 'text-red-600' : 
                        isNearLimit ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 shadow-inner">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          isOverLimit ? 'bg-gradient-to-r from-red-400 to-red-600' :
                          isNearLimit ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                          'bg-gradient-to-r from-green-400 to-emerald-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Spent</span>
                      <span className="font-semibold dark:text-gray-200">{formatCurrency(spent)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Limit</span>
                      <span className="font-semibold dark:text-gray-200">{formatCurrency(limit.amount)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Remaining</span>
                      <span className={`font-semibold ${
                        isOverLimit ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {formatCurrency(Math.max(0, limit.amount - spent))}
                      </span>
                    </div>
                  </div>
                  
                  {isOverLimit && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <p className="text-red-800 dark:text-red-400 font-bold text-sm">Over limit!</p>
                    </div>
                  )}
                  
                  {isNearLimit && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <p className="text-yellow-800 dark:text-yellow-400 font-bold text-sm">Near limit</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}