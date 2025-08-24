import React, { useState } from 'react';
import { Trophy, Plus, Calendar, DollarSign } from 'lucide-react';
import { Goal } from '../types';
import { formatCurrency } from '../utils/dataUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { format, differenceInDays } from 'date-fns';

export function GoalTracker() {
  const [goals, setGoals] = useLocalStorage<Goal[]>('finance-goals', []);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    category: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmount = parseFloat(formData.targetAmount);
    const currentAmount = parseFloat(formData.currentAmount) || 0;
    
    if (isNaN(targetAmount) || targetAmount <= 0 || !formData.name.trim()) return;

    const newGoal: Goal = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      targetAmount,
      currentAmount,
      targetDate: new Date(formData.targetDate),
      category: formData.category.trim()
    };

    setGoals(prev => [...prev, newGoal]);
    setFormData({ name: '', targetAmount: '', currentAmount: '', targetDate: '', category: '' });
    setShowForm(false);
  };

  const updateGoalProgress = (goalId: string, amount: number) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, currentAmount: Math.max(0, goal.currentAmount + amount) }
        : goal
    ));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl shadow-2xl border border-gray-100 p-8 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Savings Goals</h2>
            <p className="text-sm font-medium text-gray-600">Track your financial objectives</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:from-yellow-600 hover:to-orange-700 focus:ring-4 focus:ring-yellow-200 transition-all duration-300 shadow-xl hover:shadow-2xl font-semibold transform hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100 shadow-inner">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Goal name (e.g., Emergency Fund)"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-yellow-200 focus:border-yellow-500 transition-all duration-300 bg-white shadow-inner font-medium"
                required
              />
              <input
                type="text"
                placeholder="Category (optional)"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-yellow-200 focus:border-yellow-500 transition-all duration-300 bg-white shadow-inner font-medium"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="number"
                step="0.01"
                placeholder="Target amount"
                value={formData.targetAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-yellow-200 focus:border-yellow-500 transition-all duration-300 bg-white shadow-inner font-medium"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Current amount (optional)"
                value={formData.currentAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, currentAmount: e.target.value }))}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-yellow-200 focus:border-yellow-500 transition-all duration-300 bg-white shadow-inner font-medium"
              />
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-yellow-200 focus:border-yellow-500 transition-all duration-300 bg-white shadow-inner font-medium"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 shadow-lg font-semibold"
            >
              Create Goal
            </button>
          </form>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No goals set yet</p>
          <p className="text-gray-400 text-sm">Create your first savings goal to start tracking progress</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map(goal => {
            const percentage = (goal.currentAmount / goal.targetAmount) * 100;
            const daysLeft = differenceInDays(new Date(goal.targetDate), new Date());
            const isCompleted = percentage >= 100;
            const isOverdue = daysLeft < 0 && !isCompleted;
            
            return (
              <div key={goal.id} className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{goal.name}</h3>
                    {goal.category && (
                      <p className="text-sm text-gray-600">{goal.category}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                  >
                    ×
                  </button>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Progress</span>
                    <span className={`text-sm font-bold ${isCompleted ? 'text-green-600' : 'text-gray-800'}`}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                        'bg-gradient-to-r from-yellow-400 to-orange-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Current
                    </span>
                    <span className="font-semibold">{formatCurrency(goal.currentAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      Target
                    </span>
                    <span className="font-semibold">{formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Target Date
                    </span>
                    <span className={`font-semibold text-sm ${isOverdue ? 'text-red-600' : 'text-gray-800'}`}>
                      {format(new Date(goal.targetDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
                
                {!isCompleted && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateGoalProgress(goal.id, 50)}
                      className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all duration-300 text-sm font-medium"
                    >
                      +$50
                    </button>
                    <button
                      onClick={() => updateGoalProgress(goal.id, 100)}
                      className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all duration-300 text-sm font-medium"
                    >
                      +$100
                    </button>
                    <button
                      onClick={() => updateGoalProgress(goal.id, -50)}
                      className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-300 text-sm font-medium"
                    >
                      -$50
                    </button>
                  </div>
                )}
                
                {isCompleted && (
                  <div className="text-center p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                    <p className="text-green-800 font-bold">🎉 Goal Completed!</p>
                  </div>
                )}
                
                {isOverdue && (
                  <div className="text-center p-3 bg-gradient-to-r from-red-100 to-pink-100 rounded-lg">
                    <p className="text-red-800 font-bold">⚠️ Goal Overdue</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}