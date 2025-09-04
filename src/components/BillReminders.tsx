import React, { useState } from 'react';
import { Bell, Plus, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import { Bill } from '../types';
import { formatCurrency, generateId } from '../utils/dataUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { format, isToday, isTomorrow, isPast, differenceInDays } from 'date-fns';

export function BillReminders() {
  const [bills, setBills] = useLocalStorage<Bill[]>('bills', []);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: '',
    category: '',
    recurring: false,
    frequency: 'monthly' as 'monthly' | 'yearly',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0 || !formData.name.trim()) return;

    const newBill: Bill = {
      id: generateId(),
      name: formData.name.trim(),
      amount,
      dueDate: new Date(formData.dueDate),
      category: formData.category.trim() || 'Bills',
      recurring: formData.recurring,
      frequency: formData.frequency,
      paid: false,
      notes: formData.notes.trim()
    };

    setBills(prev => [...prev, newBill]);
    setFormData({
      name: '',
      amount: '',
      dueDate: '',
      category: '',
      recurring: false,
      frequency: 'monthly',
      notes: ''
    });
    setShowForm(false);
  };

  const markAsPaid = (id: string) => {
    setBills(prev => prev.map(bill => 
      bill.id === id ? { ...bill, paid: true } : bill
    ));
  };

  const deleteBill = (id: string) => {
    setBills(prev => prev.filter(b => b.id !== id));
  };

  const getBillStatus = (bill: Bill) => {
    const dueDate = new Date(bill.dueDate);
    const daysUntilDue = differenceInDays(dueDate, new Date());
    
    if (bill.paid) return { status: 'paid', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' };
    if (isPast(dueDate)) return { status: 'overdue', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20' };
    if (isToday(dueDate)) return { status: 'due-today', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/20' };
    if (isTomorrow(dueDate)) return { status: 'due-tomorrow', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/20' };
    if (daysUntilDue <= 7) return { status: 'due-soon', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' };
    return { status: 'upcoming', color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-600' };
  };

  const upcomingBills = bills.filter(b => !b.paid).sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-8 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">Bill Reminders</h2>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Track upcoming bills and due dates</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 focus:ring-4 focus:ring-orange-200 transition-all duration-300 shadow-xl hover:shadow-2xl font-semibold transform hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Bill
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-100 dark:border-orange-800 shadow-inner">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Bill Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Electric Bill, Rent"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 bg-white dark:bg-gray-700 shadow-inner font-medium dark:text-white"
                  required
                />
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 bg-white dark:bg-gray-700 shadow-inner font-medium dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Utilities, Housing"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 bg-white dark:bg-gray-700 shadow-inner font-medium dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="recurring"
                checked={formData.recurring}
                onChange={(e) => setFormData(prev => ({ ...prev, recurring: e.target.checked }))}
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="recurring" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Recurring bill
              </label>
              
              {formData.recurring && (
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as any }))}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this bill"
                rows={2}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 bg-white dark:bg-gray-700 shadow-inner font-medium dark:text-white resize-none"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg font-semibold"
              >
                Add Bill
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

      {upcomingBills.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No upcoming bills</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">Add bills to track due dates and payments</p>
        </div>
      ) : (
        <div className="space-y-4">
          {upcomingBills.map(bill => {
            const status = getBillStatus(bill);
            return (
              <div key={bill.id} className={`p-6 rounded-xl border shadow-lg ${status.bg} border-gray-100 dark:border-gray-600`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                      {status.status === 'paid' ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : status.status === 'overdue' ? (
                        <AlertTriangle className="w-6 h-6 text-white" />
                      ) : (
                        <Calendar className="w-6 h-6 text-white" />
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">{bill.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">{bill.category}</span>
                        <span>Due: {format(new Date(bill.dueDate), 'MMM dd, yyyy')}</span>
                        {bill.recurring && <span className="capitalize">({bill.frequency})</span>}
                      </div>
                      {bill.notes && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{bill.notes}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
                      {formatCurrency(bill.amount)}
                    </span>
                    
                    {!bill.paid && (
                      <button
                        onClick={() => markAsPaid(bill.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 font-medium text-sm"
                      >
                        Mark Paid
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteBill(bill.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}