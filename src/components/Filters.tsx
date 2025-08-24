import React from 'react';
import { Calendar, Download, Filter } from 'lucide-react';
import { Transaction } from '../types';
import { exportToExcel } from '../utils/dataUtils';
import { format } from 'date-fns';

interface FiltersProps {
  transactions: Transaction[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export function Filters({ transactions, selectedMonth, onMonthChange }: FiltersProps) {
  const availableMonths = Array.from(
    new Set(
      transactions.map(t => {
        const date = new Date(t.date);
        return format(date, 'yyyy-MM');
      })
    )
  ).sort().reverse();

  const handleExportExcel = () => {
    const filteredTransactions = selectedMonth === 'all' 
      ? transactions 
      : transactions.filter(t => format(new Date(t.date), 'yyyy-MM') === selectedMonth);
    
    const filename = selectedMonth === 'all' 
      ? 'all-transactions.xlsx' 
      : `transactions-${selectedMonth}.xlsx`;
    
    exportToExcel(filteredTransactions, filename);
  };

  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl shadow-2xl border border-gray-100 p-8 mb-8 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Filters & Actions</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-2 shadow-lg border border-gray-100">
            <Calendar className="w-4 h-4 text-blue-600" />
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="border-none outline-none bg-transparent font-medium text-gray-700 min-w-[140px] cursor-pointer"
            >
              <option value="all">All Time</option>
              {availableMonths.map(month => (
                <option key={month} value={month}>
                  {format(new Date(month + '-15'), 'MMMM yyyy')}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleExportExcel}
            disabled={transactions.length === 0}
            className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 focus:ring-4 focus:ring-emerald-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl font-semibold text-sm transform hover:scale-105 active:scale-95"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>
      
      {selectedMonth !== 'all' && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-inner">
          <p className="text-sm font-medium text-blue-800">
            Showing transactions for {format(new Date(selectedMonth + '-15'), 'MMMM yyyy')}
          </p>
        </div>
      )}
    </div>
  );
}