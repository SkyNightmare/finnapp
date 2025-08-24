import React from 'react';
import { TrendingUp, TrendingDown, Calendar, CreditCard, PieChart, Target } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/dataUtils';
import { startOfWeek, endOfWeek, startOfYear, endOfYear, isWithinInterval } from 'date-fns';

interface QuickStatsProps {
  transactions: Transaction[];
}

export function QuickStats({ transactions }: QuickStatsProps) {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const yearStart = startOfYear(now);
  const yearEnd = endOfYear(now);

  // This week stats
  const thisWeekTransactions = transactions.filter(t => 
    isWithinInterval(new Date(t.date), { start: weekStart, end: weekEnd })
  );
  const thisWeekIncome = thisWeekTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const thisWeekExpenses = thisWeekTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  // This year stats
  const thisYearTransactions = transactions.filter(t => 
    isWithinInterval(new Date(t.date), { start: yearStart, end: yearEnd })
  );
  const thisYearIncome = thisYearTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const thisYearExpenses = thisYearTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  // Average transaction
  const avgTransaction = transactions.length > 0 ? 
    transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length : 0;

  // Most expensive category
  const categoryTotals = transactions.reduce((acc, t) => {
    if (t.type === 'expense') {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const topCategory = Object.entries(categoryTotals).sort(([,a], [,b]) => b - a)[0];

  const stats = [
    {
      title: 'This Week',
      value: thisWeekIncome - thisWeekExpenses,
      subtitle: `${formatCurrency(thisWeekIncome)} in, ${formatCurrency(thisWeekExpenses)} out`,
      icon: Calendar,
      color: thisWeekIncome - thisWeekExpenses >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: thisWeekIncome - thisWeekExpenses >= 0 ? 'bg-green-100' : 'bg-red-100',
    },
    {
      title: 'This Year',
      value: thisYearIncome - thisYearExpenses,
      subtitle: `${formatCurrency(thisYearIncome)} in, ${formatCurrency(thisYearExpenses)} out`,
      icon: TrendingUp,
      color: thisYearIncome - thisYearExpenses >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: thisYearIncome - thisYearExpenses >= 0 ? 'bg-green-100' : 'bg-red-100',
    },
    {
      title: 'Avg Transaction',
      value: avgTransaction,
      subtitle: `Across ${transactions.length} transactions`,
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Top Expense Category',
      value: topCategory ? topCategory[1] : 0,
      subtitle: topCategory ? topCategory[0] : 'No expenses yet',
      icon: PieChart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl shadow-2xl border border-gray-100 p-6 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl ${stat.bgColor} flex items-center justify-center shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
          
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wide">{stat.title}</p>
            <p className={`text-2xl font-black ${stat.color} tracking-tight mb-1`}>
              {stat.title === 'Top Expense Category' && !topCategory ? 
                'N/A' : 
                formatCurrency(stat.value)
              }
            </p>
            <p className="text-xs text-gray-600 font-medium">{stat.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}