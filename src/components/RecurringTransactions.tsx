import React, { useState } from 'react';
import { Repeat, Plus, Play, Pause, Calendar } from 'lucide-react';
import { RecurringTransaction, Transaction } from '../types';
import { formatCurrency, generateId } from '../utils/dataUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { format, addDays, addMonths, addYears } from 'date-fns';

interface RecurringTransactionsProps {
  onAddTransaction: (transaction: Transaction) => void;
}

const commonCategories = {
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
  expense: ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Utilities', 'Health', 'Other']
};

export function RecurringTransactions({ onAddTransaction }: RecurringTransactionsProps) {
  const [recurringTransactions, setRecurringTransactions] = useLocalStorage<RecurringTransaction[]>('recurring-transactions', []);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    customCategory: '',
    type: 'expense' as 'income' | 'expense',
    description: '',
    frequency: 'monthly' as 'weekly' | 'monthly' | 'yearly',
    nextDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) return;
    
    const category = formData.category === 'custom' ? formData.customCategory : formData.category;
    if (!category.trim()) return;

    const newRecurring: RecurringTransaction = {
      id: generateId(),
      amount,
      category: category.trim(),
      type: formData.type,
      description: formData.description.trim(),
      frequency: formData.frequency,
      nextDate: new Date(formData.nextDate),
      active: true
    };

    setRecurringTransactions(prev => [...prev, newRecurring]);
    setFormData({
      amount: '',
      category: '',
      customCategory: '',
      type: 'expense',
      description: '',
      frequency: 'monthly',
      nextDate: new Date().toISOString().split('T')[0]
    });
    setShowForm(false);
  };

  const executeRecurring = (recurring: RecurringTransaction) => {
    const transaction: Transaction = {
      id: generateId(),
      amount: recurring.amount,
      category: recurring.category,
      type: recurring.type,
      description: `${recurring.description} (Recurring)`,
      date: new Date()
    };

    onAddTransaction(transaction);

    // Update next date
    const nextDate = recurring.frequency === 'weekly' ? addDays(recurring.nextDate, 7) :
                    recurring.frequency === 'monthly' ? addMonths(recurring.nextDate, 1) :
                    addYears(recurring.nextDate, 1);

    setRecurringTransactions(prev => prev.map(r => 
      r.id === recurring.id ? { ...r, nextDate } : r
    ));
  };

  const toggleActive = (id: string) => {
    setRecurringTransactions(prev => prev.map(r => 
      r.id === id ? { ...r, active: !r.active } : r
    ));
  };

  const deleteRecurring = (id: string) => {
    setRecurringTransactions(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-8 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
            <Repeat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">Recurring Transactions</h2>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Automate regular income and expenses</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl hover:from-green-600 hover:to-teal-700 focus:ring-4 focus:ring-green-200 transition-all duration-300 shadow-xl hover:shadow-2xl font-semibold transform hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Recurring
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl border border-green-100 dark:border-green-800 shadow-inner">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'income' | 'expense', category: '' }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 bg-white dark:bg-gray-700 shadow-inner font-medium dark:text-white"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
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
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 bg-white dark:bg-gray-700 shadow-inner font-medium dark:text-white"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 bg-white dark:bg-gray-700 shadow-inner font-medium dark:text-white"
                required
              >
                <option value="">Select a category</option>
                {commonCategories[formData.type].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="custom">Custom Category</option>
              </select>
            </div>
            
            {formData.category === 'custom' && (
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Custom Category</label>
                <input
                  type="text"
                  value={formData.customCategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, customCategory: e.target.value }))}
                  placeholder="Enter category name"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 bg-white dark:bg-gray-700 shadow-inner font-medium dark:text-white"
                  required
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as any }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 bg-white dark:bg-gray-700 shadow-inner font-medium dark:text-white"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Next Date</label>
                <input
                  type="date"
                  value={formData.nextDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, nextDate: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 bg-white dark:bg-gray-700 shadow-inner font-medium dark:text-white"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description for this recurring transaction"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 bg-white dark:bg-gray-700 shadow-inner font-medium dark:text-white"
                required
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 shadow-lg font-semibold"
              >
                Create Recurring
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

      {recurringTransactions.length === 0 ? (
        <div className="text-center py-12">
          <Repeat className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No recurring transactions</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">Set up automatic transactions for bills and income</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recurringTransactions.map(recurring => (
            <div key={recurring.id} className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                    recurring.type === 'income' 
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                      : 'bg-gradient-to-br from-red-400 to-pink-500'
                  }`}>
                    <Repeat className="w-6 h-6 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">{recurring.description}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">{recurring.category}</span>
                      <span className="capitalize">{recurring.frequency}</span>
                      <span>Next: {format(new Date(recurring.nextDate), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`text-xl font-bold ${
                    recurring.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {recurring.type === 'income' ? '+' : '-'}{formatCurrency(recurring.amount)}
                  </span>
                  
                  <button
                    onClick={() => executeRecurring(recurring)}
                    className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-all duration-300"
                    title="Execute now"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => toggleActive(recurring.id)}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      recurring.active 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40' 
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500'
                    }`}
                    title={recurring.active ? 'Pause' : 'Resume'}
                  >
                    {recurring.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={() => deleteRecurring(recurring.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}