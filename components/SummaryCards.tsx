
import React from 'react';
import { formatCurrency } from '../utils/formatters';
import { Icons } from '../constants';

interface SummaryCardsProps {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  currency: string;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ totalAssets, totalLiabilities, netWorth, currency }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Assets */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <Icons.Wallet />
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+ Total Assets</span>
        </div>
        <h3 className="text-slate-500 text-sm font-medium">Total Assets</h3>
        <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalAssets, currency)}</p>
      </div>

      {/* Total Liabilities */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-red-50 text-red-600 rounded-lg">
            <Icons.MinusCircle />
          </div>
          <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">- Total Liabilities</span>
        </div>
        <h3 className="text-slate-500 text-sm font-medium">Total Liabilities</h3>
        <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalLiabilities, currency)}</p>
      </div>

      {/* Net Worth */}
      <div className="bg-slate-900 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
            <Icons.TrendingUp />
          </div>
          <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">= Net Worth</span>
        </div>
        <h3 className="text-slate-400 text-sm font-medium">Total Net Worth</h3>
        <p className="text-2xl font-bold text-white">{formatCurrency(netWorth, currency)}</p>
      </div>
    </div>
  );
};

export default SummaryCards;
