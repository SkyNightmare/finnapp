import React, { useState, useMemo } from 'react';
import { Wallet, BarChart3, User, LogOut } from 'lucide-react';
import { Transaction } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { filterTransactionsByMonth } from './utils/dataUtils';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { Summary } from './components/Summary';
import { Charts } from './components/Charts';
import { Filters } from './components/Filters';
import { SearchAndFilter } from './components/SearchAndFilter';
import { QuickStats } from './components/QuickStats';
import { AuthForm } from './components/AuthForm';

function App() {
  const [user, setUser] = useLocalStorage<{ id: string; email: string; name: string } | null>('finance-user', null);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('finance-transactions', []);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

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

  const handleLogin = (userData: { id: string; email: string; name: string }) => {
    setUser(userData);
    // Load user's transactions from localStorage with user-specific key
    const userTransactions = localStorage.getItem(`finance-transactions-${userData.id}`);
    if (userTransactions) {
      setTransactions(JSON.parse(userTransactions));
    } else {
      setTransactions([]);
    }
  };

  const handleLogout = () => {
    // Save current transactions to user-specific storage before logout
    if (user) {
      localStorage.setItem(`finance-transactions-${user.id}`, JSON.stringify(transactions));
    }
    setUser(null);
    setTransactions([]);
  };

  // Save transactions to user-specific storage whenever transactions change
  React.useEffect(() => {
    if (user && transactions.length >= 0) {
      localStorage.setItem(`finance-transactions-${user.id}`, JSON.stringify(transactions));
    }
  }, [transactions, user]);

  // Show auth form if user is not logged in
  if (!user) {
    return <AuthForm onLogin={handleLogin} />;
  }

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
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-2 rounded-xl shadow-lg border border-gray-100">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="hidden sm:inline">
                  <span className="font-bold text-gray-800">{transactions.length}</span>
                  <span className="text-gray-600 ml-1">transactions</span>
                </span>
              </div>
              
              <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-xl shadow-lg border border-green-100">
                <User className="w-5 h-5 text-green-600" />
                <span className="hidden sm:inline">
                  <span className="font-medium text-green-800">{user.name}</span>
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-50 to-pink-50 text-red-700 rounded-xl hover:from-red-100 hover:to-pink-100 transition-all duration-300 shadow-lg font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center text-gray-500 text-sm">
            <p>Your data is stored locally in your browser and associated with your account.</p>
            <p className="mt-2">Professional Finance Tracker • Built with React & TypeScript</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
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