import React from 'react';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/dataUtils';
import { format } from 'date-fns';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

export function TransactionList({ transactions, onDeleteTransaction }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl shadow-2xl border border-gray-100 p-12 text-center backdrop-blur-sm">
        <p className="text-gray-500 text-lg font-medium">No transactions yet. Add your first transaction above!</p>
      </div>
    );
  }

  const sortedTransactions = transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm">
      <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Recent Transactions</h2>
        <p className="text-sm font-medium text-gray-600 mt-2">{transactions.length} total transactions</p>
      </div>
      
      <div className="divide-y divide-gray-50">
        {sortedTransactions.map((transaction) => (
          <div key={transaction.id} className="p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 transform hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300 ${
                  transaction.type === 'income' ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-red-400 to-pink-500'
                }`}>
                  {transaction.type === 'income' ? (
                    <TrendingUp className="w-6 h-6 text-white" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-white" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 truncate text-lg">{transaction.category}</p>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-lg ${
                      transaction.type === 'income' 
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800' 
                        : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </div>
                  {transaction.description && (
                    <p className="text-sm font-medium text-gray-600 truncate mt-1">{transaction.description}</p>
                  )}
                  <p className="text-xs font-medium text-gray-500 mt-1">{format(new Date(transaction.date), 'MMM dd, yyyy')}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <p className={`font-black text-xl ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
                
                <button
                  onClick={() => onDeleteTransaction(transaction.id)}
                  className="p-3 text-gray-400 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg"
                  title="Delete transaction"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}