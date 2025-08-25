import React, { useState, useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { Transaction } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { filterTransactionsByMonth } from './utils/dataUtils';
import { TransactionModal } from './components/TransactionModal';
import { TransactionList } from './components/TransactionList';
import { Summary } from './components/Summary';
import { Charts } from './components/Charts';
import { Filters } from './components/Filters';
import { BudgetTracker } from './components/BudgetTracker';
import { GoalTracker } from './components/GoalTracker';
import { SearchAndFilter } from './components/SearchAndFilter';
import { QuickStats } from './components/QuickStats';
import { Sidebar } from './components/Sidebar';

function App() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('finance-transactions', []);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'goals'>('overview');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddTransaction={() => setIsTransactionModalOpen(true)}
      />

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl border border-gray-100 rounded-2xl mb-8 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                {activeTab === 'overview' ? 'Financial Overview' : 
                 activeTab === 'budget' ? 'Budget Management' : 
                 'Savings Goals'}
              </h1>
              <p className="text-sm font-medium text-gray-600 mt-1">
                {activeTab === 'overview' ? 'Track your income and expenses' : 
                 activeTab === 'budget' ? 'Monitor your spending limits' : 
                 'Achieve your financial objectives'}
              </p>
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

            {/* Transaction List */}
            <TransactionList
              transactions={displayTransactions}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </>
        )}

        {activeTab === 'budget' && (
          <BudgetTracker transactions={monthFilteredTransactions} />
        )}

        {activeTab === 'goals' && (
          <GoalTracker transactions={monthFilteredTransactions} />
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onAddTransaction={handleAddTransaction}
      />
    </div>
  );
}

export default App;