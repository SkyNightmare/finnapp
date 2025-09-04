import React, { useState, useMemo } from 'react';
import { BarChart3, RotateCcw } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { Transaction } from './types';
import { useUndoRedo } from './hooks/useUndoRedo';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { filterTransactionsByMonth } from './utils/dataUtils';
import { ThemeProvider } from './contexts/ThemeContext';
import { TransactionModal } from './components/TransactionModal';
import { TransactionList } from './components/TransactionList';
import { Summary } from './components/Summary';
import { Charts } from './components/Charts';
import { Filters } from './components/Filters';
import { GoalTracker } from './components/GoalTracker';
import { SearchAndFilter } from './components/SearchAndFilter';
import { QuickStats } from './components/QuickStats';
import { Sidebar } from './components/Sidebar';
import { AdvancedAnalytics } from './components/AdvancedAnalytics';
import { DataImport } from './components/DataImport';
import { RecurringTransactions } from './components/RecurringTransactions';
import { BillReminders } from './components/BillReminders';
import { TransactionTemplates } from './components/TransactionTemplates';
import { NetWorthTracker } from './components/NetWorthTracker';
import { BudgetTracker } from './components/BudgetTracker';
function AppContent() {
  const { state: transactions, set: setTransactions, undo, canUndo } = useUndoRedo<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'analytics' | 'import' | 'recurring' | 'bills' | 'templates' | 'networth'>('overview');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  // Load transactions from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('finance-transactions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTransactions(parsed);
      } catch (error) {
        console.error('Error loading transactions:', error);
      }
    }
  }, [setTransactions]);

  // Save transactions to localStorage when they change
  React.useEffect(() => {
    localStorage.setItem('finance-transactions', JSON.stringify(transactions));
  }, [transactions]);

  const monthFilteredTransactions = useMemo(() => {
    return filterTransactionsByMonth(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  const displayTransactions = filteredTransactions.length > 0 ? filteredTransactions : monthFilteredTransactions;

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions([...transactions, transaction]);
    toast.success('Transaction added successfully!');
  };

  const handleImportTransactions = (importedTransactions: Transaction[]) => {
    setTransactions([...transactions, ...importedTransactions]);
    toast.success(`Imported ${importedTransactions.length} transactions!`);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
    toast.success('Transaction deleted');
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  const handleFilteredTransactions = (filtered: Transaction[]) => {
    setFilteredTransactions(filtered);
  };

  const handleExport = () => {
    // This would trigger the export functionality
    toast.success('Export feature activated! Use the Export button in filters.');
  };

  useKeyboardShortcuts({
    onAddTransaction: () => setIsTransactionModalOpen(true),
    onExport: handleExport,
    onToggleTheme: () => {}, // Will be handled by ThemeProvider
    onUndo: canUndo ? undo : undefined
  });

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
        {/* Undo Button */}
        {canUndo && (
          <button
            onClick={undo}
            className="fixed top-4 right-4 z-30 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
            Undo
          </button>
        )}

        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl border border-gray-100 dark:border-gray-700 rounded-2xl mb-8 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800 dark:from-gray-200 dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                {activeTab === 'overview' && 'Financial Overview'}
                {activeTab === 'goals' && 'Savings Goals'}
                {activeTab === 'analytics' && 'Advanced Analytics'}
                {activeTab === 'import' && 'Data Import'}
                {activeTab === 'recurring' && 'Recurring Transactions'}
                {activeTab === 'bills' && 'Bill Reminders'}
                {activeTab === 'templates' && 'Transaction Templates'}
                {activeTab === 'networth' && 'Net Worth Tracking'}
              </h1>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
                {activeTab === 'overview' && 'Track your income and expenses'}
                {activeTab === 'goals' && 'Achieve your financial objectives'}
                {activeTab === 'analytics' && 'Deep insights into your financial health'}
                {activeTab === 'import' && 'Import transactions from CSV or bank files'}
                {activeTab === 'recurring' && 'Automate regular transactions'}
                {activeTab === 'bills' && 'Never miss a payment deadline'}
                {activeTab === 'templates' && 'Quick entry for common transactions'}
                {activeTab === 'networth' && 'Track your assets and liabilities'}
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/50 px-4 py-2 rounded-xl shadow-lg border border-gray-100 dark:border-gray-600">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span className="hidden sm:inline">
                <span className="font-bold text-gray-800 dark:text-gray-200">{transactions.length}</span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">transactions</span>
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

        {activeTab === 'goals' && (
          <GoalTracker transactions={monthFilteredTransactions} />
        )}

        {activeTab === 'analytics' && (
          <AdvancedAnalytics transactions={monthFilteredTransactions} />
        )}

        {activeTab === 'import' && (
          <DataImport onImportTransactions={handleImportTransactions} />
        )}

        {activeTab === 'recurring' && (
          <RecurringTransactions onAddTransaction={handleAddTransaction} />
        )}

        {activeTab === 'bills' && (
          <BillReminders />
        )}

        {activeTab === 'templates' && (
          <TransactionTemplates onAddTransaction={handleAddTransaction} />
        )}

        {activeTab === 'networth' && (
          <NetWorthTracker />
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onAddTransaction={handleAddTransaction}
      />
      
      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;