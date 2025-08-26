import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Transaction } from '../types';
import { generateId } from '../utils/dataUtils';
import { Modal } from './Modal';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
}

const commonCategories = {
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
  expense: ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Utilities', 'Health', 'Other']
};

export function TransactionModal({ isOpen, onClose, onAddTransaction }: TransactionModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    customCategory: '',
    type: 'expense' as 'income' | 'expense',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) return;
    
    const category = formData.category === 'custom' ? formData.customCategory : formData.category;
    if (!category.trim()) return;

    const transaction: Omit<Transaction, 'id'> = {
      amount,
      category: category.trim(),
      type: formData.type,
      description: formData.description.trim(),
      date: new Date(formData.date)
    };

    await onAddTransaction(transaction);
    setFormData({
      amount: '',
      category: '',
      customCategory: '',
      type: 'expense',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Transaction">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'income' | 'expense', category: '' }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white shadow-inner font-medium"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Amount</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white shadow-inner font-medium"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white shadow-inner font-medium"
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
            <label className="block text-sm font-bold text-gray-700 mb-2">Custom Category</label>
            <input
              type="text"
              value={formData.customCategory}
              onChange={(e) => setFormData(prev => ({ ...prev, customCategory: e.target.value }))}
              placeholder="Enter category name"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white shadow-inner font-medium"
              required
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Optional description"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white shadow-inner font-medium"
          />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white shadow-inner font-medium"
            required
          />
        </div>
        
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all duration-300 font-bold shadow-xl transform hover:scale-105 active:scale-95"
          >
            Add Transaction
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}