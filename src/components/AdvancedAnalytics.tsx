import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Target, Calendar, DollarSign } from 'lucide-react';
import { Transaction, FinancialHealthMetrics } from '../types';
import { formatCurrency } from '../utils/dataUtils';
import { startOfMonth, endOfMonth, subMonths, isWithinInterval, format } from 'date-fns';

interface AdvancedAnalyticsProps {
  transactions: Transaction[];
}

export function AdvancedAnalytics({ transactions }: AdvancedAnalyticsProps) {
  const calculateFinancialHealth = (): FinancialHealthMetrics => {
    const now = new Date();
    const thisMonth = transactions.filter(t => 
      isWithinInterval(new Date(t.date), { 
        start: startOfMonth(now), 
        end: endOfMonth(now) 
      })
    );
    
    const lastMonth = transactions.filter(t => 
      isWithinInterval(new Date(t.date), { 
        start: startOfMonth(subMonths(now, 1)), 
        end: endOfMonth(subMonths(now, 1)) 
      })
    );

    const monthlyIncome = thisMonth.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpenses = thisMonth.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
    const expenseRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;
    
    // Calculate emergency fund (assuming 3-6 months of expenses is ideal)
    const avgMonthlyExpenses = monthlyExpenses || 2000; // fallback
    const totalBalance = transactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
    const emergencyFundMonths = totalBalance / avgMonthlyExpenses;

    let score = 0;
    const recommendations: string[] = [];

    // Scoring system (0-100)
    if (savingsRate >= 20) score += 30;
    else if (savingsRate >= 10) score += 20;
    else if (savingsRate >= 0) score += 10;
    else recommendations.push('Try to save at least 10% of your income');

    if (emergencyFundMonths >= 6) score += 25;
    else if (emergencyFundMonths >= 3) score += 15;
    else recommendations.push('Build an emergency fund covering 3-6 months of expenses');

    if (expenseRatio <= 80) score += 25;
    else if (expenseRatio <= 90) score += 15;
    else recommendations.push('Consider reducing expenses to below 80% of income');

    // Transaction consistency bonus
    if (transactions.length >= 10) score += 20;
    else recommendations.push('Track more transactions for better insights');

    return {
      score: Math.min(score, 100),
      savingsRate,
      expenseRatio,
      emergencyFundMonths,
      debtToIncomeRatio: 0, // Would need liability data
      recommendations
    };
  };

  const getSpendingTrends = () => {
    const now = new Date();
    const categories = Array.from(new Set(transactions.filter(t => t.type === 'expense').map(t => t.category)));
    
    return categories.map(category => {
      const thisMonth = transactions.filter(t => 
        t.category === category && 
        t.type === 'expense' &&
        isWithinInterval(new Date(t.date), { start: startOfMonth(now), end: endOfMonth(now) })
      ).reduce((sum, t) => sum + t.amount, 0);
      
      const lastMonth = transactions.filter(t => 
        t.category === category && 
        t.type === 'expense' &&
        isWithinInterval(new Date(t.date), { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) })
      ).reduce((sum, t) => sum + t.amount, 0);
      
      const change = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;
      
      return {
        category,
        thisMonth,
        lastMonth,
        change,
        trend: change > 10 ? 'up' : change < -10 ? 'down' : 'stable'
      };
    }).filter(item => item.thisMonth > 0 || item.lastMonth > 0);
  };

  const healthMetrics = calculateFinancialHealth();
  const spendingTrends = getSpendingTrends();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  return (
    <div className="space-y-8">
      {/* Financial Health Score */}
      <div className="bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">Financial Health</h2>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall assessment of your financial wellness</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Health Score */}
          <div className="text-center">
            <div className={`w-32 h-32 mx-auto rounded-full ${getScoreBg(healthMetrics.score)} flex items-center justify-center mb-4 shadow-xl`}>
              <div className="text-center">
                <div className={`text-3xl font-black ${getScoreColor(healthMetrics.score)}`}>
                  {healthMetrics.score}
                </div>
                <div className="text-xs font-bold text-gray-600 dark:text-gray-400">SCORE</div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
              {healthMetrics.score >= 80 ? 'Excellent' : 
               healthMetrics.score >= 60 ? 'Good' : 'Needs Improvement'}
            </h3>
          </div>

          {/* Key Metrics */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Savings Rate</span>
              <span className={`font-bold ${healthMetrics.savingsRate >= 20 ? 'text-green-600' : 'text-yellow-600'}`}>
                {healthMetrics.savingsRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Emergency Fund</span>
              <span className={`font-bold ${healthMetrics.emergencyFundMonths >= 3 ? 'text-green-600' : 'text-red-600'}`}>
                {healthMetrics.emergencyFundMonths.toFixed(1)} months
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Expense Ratio</span>
              <span className={`font-bold ${healthMetrics.expenseRatio <= 80 ? 'text-green-600' : 'text-red-600'}`}>
                {healthMetrics.expenseRatio.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {healthMetrics.recommendations.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <h4 className="font-bold text-blue-800 dark:text-blue-400 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Recommendations
            </h4>
            <ul className="space-y-1">
              {healthMetrics.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-blue-700 dark:text-blue-300">• {rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Spending Trends */}
      <div className="bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">Spending Trends</h2>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Month-over-month category analysis</p>
          </div>
        </div>

        {spendingTrends.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Add more transactions to see spending trends</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {spendingTrends.map(trend => (
              <div key={trend.category} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">{trend.category}</h4>
                  <div className={`flex items-center gap-1 ${
                    trend.trend === 'up' ? 'text-red-600' :
                    trend.trend === 'down' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {trend.trend === 'up' ? <TrendingUp className="w-4 h-4" /> :
                     trend.trend === 'down' ? <TrendingDown className="w-4 h-4" /> :
                     <div className="w-4 h-4 bg-gray-400 rounded-full" />}
                    <span className="text-xs font-bold">
                      {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">This month:</span>
                    <span className="font-semibold dark:text-gray-200">{formatCurrency(trend.thisMonth)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last month:</span>
                    <span className="font-semibold dark:text-gray-200">{formatCurrency(trend.lastMonth)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}