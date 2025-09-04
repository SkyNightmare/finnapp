import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';
import { Transaction, CategorySummary, MonthlyData } from '../types';
import { getCategorySummary, getMonthlyData, formatCurrency } from '../utils/dataUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

interface ChartsProps {
  transactions: Transaction[];
}

const colors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#6366F1'
];

export function Charts({ transactions }: ChartsProps) {
  const [monthlyChartType, setMonthlyChartType] = React.useState<'bar' | 'line'>('bar');
  const [expenseChartType, setExpenseChartType] = React.useState<'doughnut' | 'pie'>('doughnut');
  
  const monthlyData = getMonthlyData(transactions);
  const expenseCategories = getCategorySummary(transactions, 'expense');
  const incomeCategories = getCategorySummary(transactions, 'income');

  const monthlyChartData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Income',
        data: monthlyData.map(d => d.income),
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1,
        fill: false,
      },
      {
        label: 'Expenses',
        data: monthlyData.map(d => d.expenses),
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
        borderWidth: 1,
        fill: false,
      },
    ],
  };

  const expensePieData = {
    labels: expenseCategories.map(c => c.category),
    datasets: [
      {
        data: expenseCategories.map(c => c.amount),
        backgroundColor: colors.slice(0, expenseCategories.length),
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y || context.parsed)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => formatCurrency(value),
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = formatCurrency(context.parsed);
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  if (transactions.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl shadow-2xl border border-gray-100 p-12 text-center backdrop-blur-sm">
          <p className="text-gray-500 text-lg font-medium">Add some transactions to see monthly trends</p>
        </div>
        <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl shadow-2xl border border-gray-100 p-12 text-center backdrop-blur-sm">
          <p className="text-gray-500 text-lg font-medium">Add expenses to see category breakdown</p>
        </div>
      </div>
    );
  }

  const renderMonthlyChart = () => {
    if (monthlyChartType === 'line') {
      return <Line data={monthlyChartData} options={chartOptions} />;
    }
    return <Bar data={monthlyChartData} options={chartOptions} />;
  };

  const renderExpenseChart = () => {
    if (expenseChartType === 'pie') {
      return <Pie data={expensePieData} options={pieOptions} />;
    }
    return <Doughnut data={expensePieData} options={pieOptions} />;
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl shadow-2xl border border-gray-100 p-8 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Monthly Overview</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setMonthlyChartType('bar')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-300 ${
                monthlyChartType === 'bar'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Bar
            </button>
            <button
              onClick={() => setMonthlyChartType('line')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-300 ${
                monthlyChartType === 'line'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Line
            </button>
          </div>
        </div>
        <div className="h-80">
          {renderMonthlyChart()}
        </div>
      </div>
      
      {expenseCategories.length > 0 && (
        <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl shadow-2xl border border-gray-100 p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Expense Breakdown</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setExpenseChartType('doughnut')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-300 ${
                  expenseChartType === 'doughnut'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Doughnut
              </button>
              <button
                onClick={() => setExpenseChartType('pie')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-300 ${
                  expenseChartType === 'pie'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Pie
              </button>
            </div>
          </div>
          <div className="h-80">
            {renderExpenseChart()}
          </div>
        </div>
      )}
    </div>
  );
}