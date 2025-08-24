import React, { useState } from 'react';
import { Target, Plus, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { Transaction, Budget } from '../types';
import { formatCurrency } from '../utils/dataUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface BudgetTrackerProps {
  transactions: Transaction[];
}

export function BudgetTracker({ transactions }: BudgetTrackerProps) {
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('finance-budgets', []);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly' as 'monthly' | 'yearly'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0 || !formData.category.trim()) return;

    const newBudget: Budget = {
      id: Date.now().toString(),
      category: formData.category.trim(),
      amount,
      period: formData.period,
      spent: 0
    };

    setBudgets(prev => [...prev, newBudget]);
    setFormData({ category: '', amount: '', period: 'monthly' });
    setShowForm(false);
  };

  const getBudgetProgress = (budget: Budget) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let relevantTransactions = transactions.filter(t => 
      t.type === 'expense' && 
      t.category.toLowerCase() === budget.category.toLowerCase()
    );

    if (budget.period === 'monthly') {
      relevantTransactions = relevantTransactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      });
    } else {
      relevantTransactions = relevantTransactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getFullYear() === currentYear;
      });
    }

    const spent = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
    const percentage = (spent / budget.amount) * 100;
    
    return { spent, percentage: Math.min(percentage, 100) };
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl shadow-2xl border border-gray-100 p-8 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Budget Tracker</h2>
            <p className="text-sm font-medium text-gray-600">Monitor your spending limits</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 focus:ring-4 focus:ring-purple-200 transition-all duration-300 shadow-xl hover:shadow-2xl font-semibold transform hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Budget
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 shadow-inner">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Category name"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white shadow-inner font-medium"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Budget amount"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white shadow-inner font-medium"
              required
            />
            <div className="flex gap-2">
              <select
                value={formData.period}
                onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value as 'monthly' | 'yearly' }))}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white shadow-inner font-medium"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-lg font-semibold"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      )}

      {budgets.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No budgets set yet</p>
          <p className="text-gray-400 text-sm">Create your first budget to start tracking spending</p>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map(budget => {
            const { spent, percentage } = getBudgetProgress(budget);
            const isOverBudget = percentage >= 100;
            const isNearLimit = percentage >= 80 && percentage < 100;
            
            return (
              <div key={budget.id} className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                      isOverBudget ? 'bg-gradient-to-br from-red-400 to-red-500' :
                      isNearLimit ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                      'bg-gradient-to-br from-green-400 to-emerald-500'
                    }`}>
                      {isOverBudget ? (
                        <AlertTriangle className="w-5 h-5 text-white" />
                      ) : isNearLimit ? (
                        <TrendingUp className="w-5 h-5 text-white" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{budget.category}</h3>
                      <p className="text-sm text-gray-600 capitalize">{budget.period} budget</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                    </p>
                    <p className={`text-sm font-bold ${
                      isOverBudget ? 'text-red-600' :
                      isNearLimit ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {percentage.toFixed(1)}% used
                    </p>
                  </div>
                  
                  <button
                    onClick={() => deleteBudget(budget.id)}
                    className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                  >
                    ×
                  </button>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      isOverBudget ? 'bg-gradient-to-r from-red-400 to-red-500' :
                      isNearLimit ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                      'bg-gradient-to-r from-green-400 to-emerald-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                
                {isOverBudget && (
                  <p className="text-red-600 text-sm font-medium mt-2">
                    Over budget by {formatCurrency(spent - budget.amount)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}