import React, { useState } from 'react';
import { Upload, FileText, Download, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Transaction } from '../types';
import { generateId } from '../utils/dataUtils';
import toast from 'react-hot-toast';

interface DataImportProps {
  onImportTransactions: (transactions: Transaction[]) => void;
}

export function DataImport({ onImportTransactions }: DataImportProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState({
    date: '',
    amount: '',
    description: '',
    category: '',
    type: ''
  });

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setPreviewData(results.data.slice(0, 5)); // Show first 5 rows for preview
        setIsProcessing(false);
        toast.success('File uploaded successfully! Please map the columns.');
      },
      error: (error) => {
        toast.error('Error parsing CSV file');
        setIsProcessing(false);
      }
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false
  });

  const handleImport = () => {
    if (!columnMapping.date || !columnMapping.amount) {
      toast.error('Please map at least Date and Amount columns');
      return;
    }

    const transactions: Transaction[] = previewData.map(row => {
      const amount = Math.abs(parseFloat(row[columnMapping.amount]) || 0);
      const type = columnMapping.type ? 
        (row[columnMapping.type]?.toLowerCase().includes('income') ? 'income' : 'expense') :
        'expense';

      return {
        id: generateId(),
        amount,
        type,
        category: row[columnMapping.category] || 'Imported',
        description: row[columnMapping.description] || 'Imported transaction',
        date: new Date(row[columnMapping.date]),
      };
    }).filter(t => !isNaN(t.amount) && t.amount > 0);

    onImportTransactions(transactions);
    setPreviewData([]);
    setColumnMapping({ date: '', amount: '', description: '', category: '', type: '' });
    toast.success(`Imported ${transactions.length} transactions successfully!`);
  };

  const downloadTemplate = () => {
    const template = [
      ['Date', 'Amount', 'Description', 'Category', 'Type'],
      ['2024-01-15', '50.00', 'Grocery shopping', 'Food', 'expense'],
      ['2024-01-16', '3000.00', 'Salary payment', 'Salary', 'income'],
      ['2024-01-17', '25.99', 'Netflix subscription', 'Entertainment', 'expense']
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'transaction-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const availableColumns = previewData.length > 0 ? Object.keys(previewData[0]) : [];

  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-8 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
          <Upload className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">Import Data</h2>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upload CSV files or bank statements</p>
        </div>
      </div>

      {/* Download Template */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-800 dark:text-blue-400">Need a template?</h3>
            <p className="text-sm text-blue-600 dark:text-blue-300">Download our CSV template to get started</p>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 font-medium"
          >
            <Download className="w-4 h-4" />
            Template
          </button>
        </div>
      </div>

      {/* File Upload */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
        }`}
      >
        <input {...getInputProps()} />
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        {isDragActive ? (
          <p className="text-blue-600 dark:text-blue-400 font-medium">Drop the file here...</p>
        ) : (
          <div>
            <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
              Drag & drop a CSV file here, or click to select
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Supports CSV, XLS, and XLSX files
            </p>
          </div>
        )}
      </div>

      {/* Column Mapping */}
      {previewData.length > 0 && (
        <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4">Map Your Columns</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {Object.entries(columnMapping).map(([field, value]) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                  {field} {field === 'date' || field === 'amount' ? '*' : ''}
                </label>
                <select
                  value={value}
                  onChange={(e) => setColumnMapping(prev => ({ ...prev, [field]: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Select column</option>
                  {availableColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Preview */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Preview (first 5 rows)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-600">
                    {availableColumns.map(col => (
                      <th key={col} className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, index) => (
                    <tr key={index} className="border-t border-gray-200 dark:border-gray-600">
                      {availableColumns.map(col => (
                        <td key={col} className="px-3 py-2 text-gray-600 dark:text-gray-400">{row[col]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleImport}
              disabled={!columnMapping.date || !columnMapping.amount}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold"
            >
              Import Transactions
            </button>
            <button
              onClick={() => {
                setPreviewData([]);
                setColumnMapping({ date: '', amount: '', description: '', category: '', type: '' });
              }}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-500 transition-all duration-300 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}