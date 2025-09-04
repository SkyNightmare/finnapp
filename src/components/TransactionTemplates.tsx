import React, { useState } from 'react';
import { Bookmark, Plus, Zap } from 'lucide-react';
import { TransactionTemplate, Transaction } from '../types';
import { formatCurrency, generateId } from '../utils/dataUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface TransactionTemplatesProps {
  onAddTransaction: (transaction: Transaction) => void;
}

const commonCategories = {
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
  expense: ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Utilities', 'Health', 'Other']
};

export function TransactionTemplates({ onAddTransaction }: TransactionTemplatesProps) {
  const [templates, setTemplates] = useLocalStorage<TransactionTemplate[]>('transaction-templates', []);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    customCategory: '',
    type: 'expense' as 'income' | 'expense',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0 || !formData.name.trim()) return;
    
    const category = formData.category === 'custom' ? formData.customCategory : formData.category;
    if (!category.trim()) return;

    const newTemplate: TransactionTemplate = {
      id: generateId(),
      name: formData.name.trim(),
      amount,
      category: category.trim(),
      type: formData.type,
      description: formData.description.trim()
    };

    setTemplates(prev => [...prev, newTemplate]);
    setFormData({
      name: '',
      amount: '',
      category: '',
      customCategory: '',
      type: 'expense',
      description: ''
    });
    setShowForm(false);
  };

  const useTemplate = (template: TransactionTemplate) => {
    const transaction: Transaction = {
      id: generateId(),
      amount: template.amount,
      category: template.category,
      type: template.type,
      description: template.description,
      date: new Date()
    };

    onAddTransaction(transaction);
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-8 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
            <Bookmark className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">Transaction Templates</h2>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Save frequently used transactions for quick entry</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 focus:ring-4 focus:ring-purple-200 transition-all duration-300 shadow-xl hover:shadow-2xl font-semibold transform hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-100 dark:border-purple-800 shadow-inner">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Template Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Morning Coffee, Monthly Rent"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white dark:bg-gray-700 shadow-inner font-medium dark:text-white"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'income' | 'expense', category: '' }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white dark:bg-gray-700 shadow-inner font-medium dark:text-white"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white dark:bg-gray-700 shadow-inner font-medium dark:text-white"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white dark:bg-gray-700 shadow-inner font-medium dark:text-white"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white dark:bg-gray-700 shadow-inner font-medium dark:text-white"
                  required
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Template description"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white dark:bg-gray-700 shadow-inner font-medium dark:text-white"
                required
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-lg font-semibold"
              >
                Save Template
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

      {templates.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No templates saved</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">Create templates for frequently used transactions</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(template => (
            <div key={template.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800 dark:text-gray-200">{template.name}</h3>
                <button
                  onClick={() => deleteTemplate(template.id)}
                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Category:</span>
                  <span className="font-medium dark:text-gray-200">{template.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className={`font-bold ${template.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {template.type === 'income' ? '+' : '-'}{formatCurrency(template.amount)}
                  </span>
                </div>
                {template.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
                )}
              </div>
              
              <button
                onClick={() => useTemplate(template)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 font-medium"
              >
                <Zap className="w-4 h-4" />
                Use Template
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}