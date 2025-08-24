import React, { useState, useMemo } from 'react';
import { Wallet, BarChart3, Target, Trophy } from 'lucide-react';
import { Transaction } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { filterTransactionsByMonth } from './utils/dataUtils';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { Summary } from './components/Summary';
import { Charts } from './components/Charts';
import { Filters } from './components/Filters';
import { BudgetTracker } from './components/BudgetTracker';
import { GoalTracker } from './components/GoalTracker';
import { SearchAndFilter } from './components/SearchAndFilter';
import { QuickStats } from './components/QuickStats';

function App() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('finance-transactions', []);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'goals'>('overview');

  const monthFilteredTransactions = useMemo(() => {
    return filterTransactionsByMonth(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  const displayTransactions = filteredTransactions.length > 0 ? filteredTransactions : monthFilteredTransactions;

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions(prev => [...prev, transaction]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  const handleFilteredTransactions = (filtered: Transaction[]) => {
    setFilteredTransactions(filtered);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-2xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800 bg-clip-text text-transparent">Finance Tracker</h1>
                <p className="text-sm font-medium text-gray-600">Professional Financial Management</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-2 rounded-xl shadow-lg border border-gray-100">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span className="hidden sm:inline">
                <span className="font-bold text-gray-800">{transactions.length}</span>
                <span className="text-gray-600 ml-1">transactions</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-r from-white via-gray-50 to-white rounded-2xl shadow-2xl border border-gray-100 p-2 backdrop-blur-sm">
            <div className="flex gap-2">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'budget', label: 'Budget', icon: Target },
                { id: 'goals', label: 'Goals', icon: Trophy }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl transform scale-105'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Quick Stats */}
            <QuickStats transactions={monthFilteredTransactions} />

            {/* Summary Cards */}
            <Summary transactions={monthFilteredTransactions} />

            {/* Search and Filter */}
            <SearchAndFilter 
              transactions={monthFilteredTransactions}
              onFilteredTransactions={handleFilteredTransactions}
            />

            {/* Filters */}
            <Filters 
              transactions={transactions}
              selectedMonth={selectedMonth}
              onMonthChange={handleMonthChange}
            />

            {/* Charts */}
            <div className="mb-8">
              <Charts transactions={displayTransactions} />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Transaction Form */}
              <div className="lg:col-span-1">
                <TransactionForm onAddTransaction={handleAddTransaction} />
              </div>

              {/* Transaction List */}
              <div className="lg:col-span-2">
                <TransactionList
                  transactions={displayTransactions}
                  onDeleteTransaction={handleDeleteTransaction}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'budget' && (
          <BudgetTracker transactions={monthFilteredTransactions} />
        )}

        {activeTab === 'goals' && (
          <GoalTracker transactions={monthFilteredTransactions} />
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center text-gray-500 text-sm">
            <p>Your data is stored locally in your browser and never sent to any server.</p>
            <p className="mt-2">Professional Finance Tracker • Built with React & TypeScript</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;