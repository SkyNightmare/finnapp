import React, { useState, useMemo } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';
import { Transaction } from './types';
import { filterTransactionsByMonth } from './utils/dataUtils';
import { useAuth } from './hooks/useAuth';
import { useTransactions } from './hooks/useTransactions';
import { useGoals } from './hooks/useGoals';
import { AuthModal } from './components/AuthModal';
import { TransactionModal } from './components/TransactionModal';
import { TransactionList } from './components/TransactionList';
import { Summary } from './components/Summary';
import { Charts } from './components/Charts';
import { BudgetTracker } from './components/BudgetTracker';
import { GoalTracker } from './components/GoalTracker';
import { SearchAndFilter } from './components/SearchAndFilter';
import { QuickStats } from './components/QuickStats';
import { Sidebar } from './components/Sidebar';
function App() {
  const { user, loading: authLoading } = useAuth();
  const { transactions, loading: transactionsLoading, addTransaction, deleteTransaction } = useTransactions();
  const { goals, addGoal, updateGoal, deleteGoal } = useGoals();
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'goals'>('overview');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const monthFilteredTransactions = useMemo(() => {
    return filterTransactionsByMonth(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  const displayTransactions = filteredTransactions.length > 0 ? filteredTransactions : monthFilteredTransactions;

  const handleAddTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
    try {
      await addTransaction(transactionData);
      setIsTransactionModalOpen(false);
    } catch (error) {
      console.error('Failed to add transaction:', error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  const handleFilteredTransactions = (filtered: Transaction[]) => {
    setFilteredTransactions(filtered);
  };

  const handleAuthSuccess = () => {
    // Auth success is handled by the useAuth hook
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddTransaction={() => user ? setIsTransactionModalOpen(true) : setIsAuthModalOpen(true)}
        onShowAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl border border-gray-100 rounded-2xl mb-8 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                {activeTab === 'overview' ? 'Financial Overview' : 'Savings Goals'}
              </h1>
              <p className="text-sm font-medium text-gray-600 mt-1">
                {activeTab === 'overview' ? 'Track your income and expenses' : 'Achieve your financial objectives'}
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

        {!user ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <BarChart3 className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Finance Tracker</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Sign in or create an account to start tracking your finances and achieve your financial goals.
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-4 px-8 rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all duration-300 font-bold text-lg shadow-xl transform hover:scale-105 active:scale-95"
            >
              Get Started
            </button>
          </div>
        ) : activeTab === 'overview' ? (
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
        ) : (
          <GoalTracker 
            transactions={monthFilteredTransactions}
            goals={goals}
            onAddGoal={addGoal}
            onUpdateGoal={updateGoal}
            onDeleteGoal={deleteGoal}
          />
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Transaction Modal */}
      {user && (
        <TransactionModal
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          onAddTransaction={handleAddTransaction}
        />
      )}
    </div>
  );
}

export default App;