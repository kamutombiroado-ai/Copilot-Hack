
import React, { useState } from 'react';
import { BudgetEntry, IncomeEntry } from '../types';
import { Icons, EXPENSE_CATEGORIES } from '../constants';
import { formatCurrency } from '../utils/formatters';

interface BudgetPanelProps {
  budgets: BudgetEntry[];
  incomeEntries: IncomeEntry[];
  onAddBudget: (budget: Omit<BudgetEntry, 'id'>) => void;
  onUpdateSpent: (id: string, spent: number) => void;
  onDeleteBudget: (id: string) => void;
  currency: string;
  isPremium: boolean;
  onUpgrade: () => void;
}

const BudgetPanel: React.FC<BudgetPanelProps> = ({ 
  budgets, 
  incomeEntries, 
  onAddBudget, 
  onUpdateSpent, 
  onDeleteBudget, 
  currency,
  isPremium,
  onUpgrade
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newLimit, setNewLimit] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory || !newLimit) return;
    
    onAddBudget({
      category: newCategory,
      limit: parseFloat(newLimit),
      spent: 0
    });
    
    setNewCategory('');
    setNewLimit('');
    setIsAdding(false);
  };

  const calculateProgress = (spent: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min((spent / limit) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getBadgeStyle = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-50 text-red-600';
    if (percentage >= 80) return 'bg-amber-50 text-amber-600';
    return 'bg-emerald-50 text-emerald-600';
  };

  return (
    <div id="tour-budget-panel" className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8 transition-shadow relative">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Icons.Target />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                Monthly Budgets
                {!isPremium && <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide flex items-center gap-1"><Icons.Lock /> Premium</span>}
              </h3>
              <p className="text-xs text-slate-500">Track spending limits</p>
            </div>
          </div>
          {isPremium && (
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
            >
              {isAdding ? <Icons.X /> : <Icons.Plus />}
              {isAdding ? 'Cancel' : 'Add Budget'}
            </button>
          )}
        </div>

        {!isPremium ? (
           <div className="relative py-12 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 overflow-hidden text-center">
             <div className="mx-auto w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-indigo-600 mb-4">
               <Icons.Lock />
             </div>
             <h4 className="text-lg font-bold text-slate-900 mb-2">Unlock Budgeting Tools</h4>
             <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
               Set spending limits, track expenses, and manage your monthly budget with Premium.
             </p>
             <button
               onClick={onUpgrade}
               className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
             >
               <Icons.Crown />
               Unlock Features
             </button>
           </div>
        ) : (
          <>
            {/* Add Budget Form */}
            {isAdding && (
              <form onSubmit={handleAddSubmit} className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-top-2">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Category</label>
                    <div className="relative">
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none"
                        autoFocus
                        required
                      >
                        <option value="">Select Category</option>
                        {EXPENSE_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                  <div className="w-32">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Limit</label>
                    <input
                      type="number"
                      value={newLimit}
                      onChange={(e) => setNewLimit(e.target.value)}
                      placeholder="500"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}

            {/* Budget Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgets.length === 0 && !isAdding && (
                <div className="col-span-2 text-center py-8 text-slate-400 text-sm">
                  No budgets set. Click "Add Budget" to get started.
                </div>
              )}
              
              {budgets.map((budget) => {
                const percentage = calculateProgress(budget.spent, budget.limit);
                const remaining = budget.limit - budget.spent;
                
                // Calculate allocated income for this budget category
                const allocatedIncome = incomeEntries
                  .filter(inc => inc.allocatedCategory === budget.category)
                  .reduce((sum, inc) => sum + inc.amount, 0);

                const isFullyFunded = allocatedIncome >= budget.spent;

                return (
                  <div key={budget.id} className="border border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow relative group bg-white">
                    <button 
                      onClick={() => onDeleteBudget(budget.id)}
                      className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Icons.X />
                    </button>

                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-800">{budget.category}</h4>
                        <p className={`text-xs mt-1 ${remaining < 0 ? 'text-red-500 font-semibold' : 'text-slate-500'}`}>
                          {remaining < 0 ? 'Over budget by ' : 'Remaining: '} 
                          {formatCurrency(Math.abs(remaining), currency)}
                        </p>
                      </div>
                      <div className={`text-xs font-bold px-2 py-1 rounded-full ${getBadgeStyle(percentage)}`}>
                        {Math.round(percentage)}%
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 flex items-baseline gap-1">
                         <span className="text-xs text-slate-400 font-medium">Spent:</span>
                         <input
                            type="number"
                            value={budget.spent === 0 ? '' : budget.spent}
                            onChange={(e) => onUpdateSpent(budget.id, parseFloat(e.target.value) || 0)}
                            className="w-24 bg-slate-50 border-b border-slate-300 focus:border-indigo-500 focus:outline-none text-sm font-semibold text-slate-900 px-1 py-0.5"
                            placeholder="0"
                          />
                      </div>
                      <div className="text-xs text-slate-400">
                        of {formatCurrency(budget.limit, currency)}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${getProgressColor(percentage)}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>

                    {/* Allocated Income Indicator */}
                    {allocatedIncome > 0 && (
                      <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-700 px-2 py-1.5 rounded-lg">
                        <Icons.Banknote />
                        <span className="font-medium">Funded: {formatCurrency(allocatedIncome, currency)}</span>
                        {budget.spent > 0 && (
                          <span className={`ml-auto font-bold ${isFullyFunded ? 'text-emerald-600' : 'text-amber-500'}`}>
                            {isFullyFunded ? 'Fully Covered' : `${Math.round((allocatedIncome / budget.spent) * 100)}% Covered`}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BudgetPanel;
