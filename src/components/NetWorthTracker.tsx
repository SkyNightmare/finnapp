import React, { useState } from 'react';
import { TrendingUp, Plus, Building, CreditCard, DollarSign, Minus } from 'lucide-react';
import { Asset, Liability, NetWorthEntry } from '../types';
import { formatCurrency, generateId } from '../utils/dataUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';

export function NetWorthTracker() {
  const [assets, setAssets] = useLocalStorage<Asset[]>('assets', []);
  const [liabilities, setLiabilities] = useLocalStorage<Liability[]>('liabilities', []);
  const [netWorthHistory, setNetWorthHistory] = useLocalStorage<NetWorthEntry[]>('net-worth-history', []);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showLiabilityForm, setShowLiabilityForm] = useState(false);
  
  const [assetForm, setAssetForm] = useState({
    name: '',
    value: '',
    type: 'cash' as Asset['type']
  });
  
  const [liabilityForm, setLiabilityForm] = useState({
    name: '',
    amount: '',
    type: 'credit_card' as Liability['type'],
    interestRate: '',
    minimumPayment: ''
  });

  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  const handleAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(assetForm.value);
    if (isNaN(value) || !assetForm.name.trim()) return;

    const newAsset: Asset = {
      id: generateId(),
      name: assetForm.name.trim(),
      value,
      type: assetForm.type,
      lastUpdated: new Date()
    };

    setAssets(prev => [...prev, newAsset]);
    setAssetForm({ name: '', value: '', type: 'cash' });
    setShowAssetForm(false);
    updateNetWorthHistory();
  };

  const handleLiabilitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(liabilityForm.amount);
    if (isNaN(amount) || !liabilityForm.name.trim()) return;

    const newLiability: Liability = {
      id: generateId(),
      name: liabilityForm.name.trim(),
      amount,
      type: liabilityForm.type,
      interestRate: liabilityForm.interestRate ? parseFloat(liabilityForm.interestRate) : undefined,
      minimumPayment: liabilityForm.minimumPayment ? parseFloat(liabilityForm.minimumPayment) : undefined,
      lastUpdated: new Date()
    };

    setLiabilities(prev => [...prev, newLiability]);
    setLiabilityForm({ name: '', amount: '', type: 'credit_card', interestRate: '', minimumPayment: '' });
    setShowLiabilityForm(false);
    updateNetWorthHistory();
  };

  const updateNetWorthHistory = () => {
    const newEntry: NetWorthEntry = {
      date: new Date(),
      assets: totalAssets,
      liabilities: totalLiabilities,
      netWorth: totalAssets - totalLiabilities
    };

    setNetWorthHistory(prev => {
      const filtered = prev.filter(entry => 
        format(new Date(entry.date), 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd')
      );
      return [...filtered, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });
  };

  const chartData = {
    labels: netWorthHistory.map(entry => format(new Date(entry.date), 'MMM dd')),
    datasets: [
      {
        label: 'Net Worth',
        data: netWorthHistory.map(entry => entry.netWorth),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Assets',
        data: netWorthHistory.map(entry => entry.assets),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4
      },
      {
        label: 'Liabilities',
        data: netWorthHistory.map(entry => -entry.liabilities),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4
      }
    ]
  };

  return (
    <div className="space-y-8">
      {/* Net Worth Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-xl border border-green-100 dark:border-green-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="font-bold text-green-800 dark:text-green-400">Net Worth</h3>
              <p className="text-2xl font-black text-green-600">{formatCurrency(netWorth)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-xl border border-blue-100 dark:border-blue-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Building className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="font-bold text-blue-800 dark:text-blue-400">Total Assets</h3>
              <p className="text-2xl font-black text-blue-600">{formatCurrency(totalAssets)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl shadow-xl border border-red-100 dark:border-red-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-8 h-8 text-red-600" />
            <div>
              <h3 className="font-bold text-red-800 dark:text-red-400">Total Liabilities</h3>
              <p className="text-2xl font-black text-red-600">{formatCurrency(totalLiabilities)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Net Worth Chart */}
      {netWorthHistory.length > 1 && (
        <div className="bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-8 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Net Worth Trend</h3>
          <div className="h-80">
            <Line data={chartData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top' },
                tooltip: {
                  callbacks: {
                    label: (context: any) => `${context.dataset.label}: ${formatCurrency(Math.abs(context.parsed.y))}`
                  }
                }
              },
              scales: {
                y: {
                  ticks: {
                    callback: (value: any) => formatCurrency(value)
                  }
                }
              }
            }} />
          </div>
        </div>
      )}

      {/* Assets & Liabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assets */}
        <div className="bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Building className="w-8 h-8 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Assets</h3>
            </div>
            <button
              onClick={() => setShowAssetForm(!showAssetForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Asset
            </button>
          </div>

          {showAssetForm && (
            <form onSubmit={handleAssetSubmit} className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl space-y-3">
              <input
                type="text"
                placeholder="Asset name"
                value={assetForm.name}
                onChange={(e) => setAssetForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Value"
                  value={assetForm.value}
                  onChange={(e) => setAssetForm(prev => ({ ...prev, value: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                  required
                />
                <select
                  value={assetForm.type}
                  onChange={(e) => setAssetForm(prev => ({ ...prev, type: e.target.value as Asset['type'] }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="cash">Cash</option>
                  <option value="investment">Investment</option>
                  <option value="property">Property</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 font-medium">
                  Add Asset
                </button>
                <button type="button" onClick={() => setShowAssetForm(false)} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-all duration-300">
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {assets.map(asset => (
              <div key={asset.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">{asset.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{asset.type}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-green-600">{formatCurrency(asset.value)}</span>
                  <button
                    onClick={() => setAssets(prev => prev.filter(a => a.id !== asset.id))}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Liabilities */}
        <div className="bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-red-600" />
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Liabilities</h3>
            </div>
            <button
              onClick={() => setShowLiabilityForm(!showLiabilityForm)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Debt
            </button>
          </div>

          {showLiabilityForm && (
            <form onSubmit={handleLiabilitySubmit} className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl space-y-3">
              <input
                type="text"
                placeholder="Debt name"
                value={liabilityForm.name}
                onChange={(e) => setLiabilityForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount owed"
                  value={liabilityForm.amount}
                  onChange={(e) => setLiabilityForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                  required
                />
                <select
                  value={liabilityForm.type}
                  onChange={(e) => setLiabilityForm(prev => ({ ...prev, type: e.target.value as Liability['type'] }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="loan">Loan</option>
                  <option value="mortgage">Mortgage</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Interest rate (%)"
                  value={liabilityForm.interestRate}
                  onChange={(e) => setLiabilityForm(prev => ({ ...prev, interestRate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Min payment"
                  value={liabilityForm.minimumPayment}
                  onChange={(e) => setLiabilityForm(prev => ({ ...prev, minimumPayment: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 font-medium">
                  Add Debt
                </button>
                <button type="button" onClick={() => setShowLiabilityForm(false)} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-all duration-300">
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {liabilities.map(liability => (
              <div key={liability.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">{liability.name}</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="capitalize">{liability.type.replace('_', ' ')}</p>
                    {liability.interestRate && <p>{liability.interestRate}% APR</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-red-600">{formatCurrency(liability.amount)}</span>
                  <button
                    onClick={() => setLiabilities(prev => prev.filter(l => l.id !== liability.id))}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}