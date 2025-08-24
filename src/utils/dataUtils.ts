import { Transaction, CategorySummary, MonthlyData } from '../types';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import * as XLSX from 'xlsx';

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const getCategorySummary = (transactions: Transaction[], type: 'income' | 'expense'): CategorySummary[] => {
  const categoryMap = new Map<string, { amount: number; count: number }>();
  
  transactions
    .filter(t => t.type === type)
    .forEach(transaction => {
      const existing = categoryMap.get(transaction.category) || { amount: 0, count: 0 };
      categoryMap.set(transaction.category, {
        amount: existing.amount + transaction.amount,
        count: existing.count + 1,
      });
    });

  return Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    amount: data.amount,
    count: data.count,
  })).sort((a, b) => b.amount - a.amount);
};

export const getMonthlyData = (transactions: Transaction[]): MonthlyData[] => {
  const monthlyMap = new Map<string, { income: number; expenses: number }>();
  
  transactions.forEach(transaction => {
    const monthKey = format(new Date(transaction.date), 'yyyy-MM');
    const existing = monthlyMap.get(monthKey) || { income: 0, expenses: 0 };
    
    if (transaction.type === 'income') {
      existing.income += transaction.amount;
    } else {
      existing.expenses += transaction.amount;
    }
    
    monthlyMap.set(monthKey, existing);
  });

  return Array.from(monthlyMap.entries())
    .map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      balance: data.income - data.expenses,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

export const filterTransactionsByMonth = (transactions: Transaction[], month: string): Transaction[] => {
  if (month === 'all') return transactions;
  
  const [year, monthNum] = month.split('-').map(Number);
  const monthStart = startOfMonth(new Date(year, monthNum - 1));
  const monthEnd = endOfMonth(new Date(year, monthNum - 1));
  
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return isWithinInterval(transactionDate, { start: monthStart, end: monthEnd });
  });
};

export const exportToExcel = (transactions: Transaction[], filename = 'transactions.xlsx') => {
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;
  
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  
  // Summary data
  const summaryData = [
    ['PERSONAL FINANCE TRACKER', '', '', '', ''],
    ['FINANCIAL REPORT', '', '', '', ''],
    ['', '', '', '', ''],
    ['Generated on:', format(new Date(), 'MMMM dd, yyyy'), '', '', ''],
    ['Report Period:', filename.includes('all') ? 'All Time' : format(new Date(filename.split('-')[1] + '-' + filename.split('-')[2].replace('.xlsx', '') + '-01'), 'MMMM yyyy'), '', '', ''],
    ['Total Transactions:', transactions.length, '', '', ''],
    ['', '', '', '', ''],
    ['FINANCIAL SUMMARY', '', '', '', ''],
    ['Total Income:', `$${totalIncome.toFixed(2)}`, '', '', ''],
    ['Total Expenses:', `$${totalExpenses.toFixed(2)}`, '', '', ''],
    ['Net Balance:', `$${netBalance.toFixed(2)}`, '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', '']
  ];
  
  let runningBalance = 0;
  const transactionsWithBalance = transactions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(t => {
      runningBalance += t.type === 'income' ? t.amount : -t.amount;
      return { ...t, runningBalance };
    });
  
  // Transaction details
  const transactionHeaders = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Running Balance'];
  const transactionData = [
    ['TRANSACTION DETAILS', '', '', '', '', ''],
    ['', '', '', '', '', ''],
    transactionHeaders,
    ...transactionsWithBalance.map(t => [
      format(new Date(t.date), 'MM/dd/yyyy'),
      t.type.charAt(0).toUpperCase() + t.type.slice(1),
      t.category,
      t.description,
      parseFloat(t.amount.toFixed(2)),
      parseFloat(t.runningBalance.toFixed(2))
    ])
  ];
  
  // Combine all data
  const allData = [...summaryData, ...transactionData];
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(allData);
  
  // Set column widths
  worksheet['!cols'] = [
    { width: 20 }, // Date/Labels
    { width: 15 }, // Type/Values
    { width: 20 }, // Category
    { width: 30 }, // Description
    { width: 15 }, // Amount
    { width: 18 }  // Running Balance
  ];
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Financial Report');
  
  // Write and download file
  XLSX.writeFile(workbook, filename);
};