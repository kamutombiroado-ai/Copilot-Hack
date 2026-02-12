
import React, { useState } from 'react';
import { IncomeEntry, BudgetEntry } from '../types';
import { Icons, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../constants';
import { formatCurrency } from '../utils/formatters';

interface IncomePanelProps {
  entries: IncomeEntry[];
  budgets: BudgetEntry[];
  onAdd: (entry: Omit<IncomeEntry, 'id'>) => void;
  onDelete: (id: string) => void;
  currency: string;
}

const IncomePanel: React.FC<IncomePanelProps> = ({ entries, budgets, onAdd, onDelete, currency }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newAllocatedCategory, setNewAllocatedCategory] = useState('');

  const totalIncome = entries.reduce((sum, entry) => sum + entry.amount, 0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory || !newAmount) return;
    
    onAdd({
      category: newCategory,
      amount: parseFloat(newAmount),
      allocatedCategory: newAllocatedCategory || undefined
    });
    
    setNewCategory('');
    setNewAmount('');
    setNewAllocatedCategory('');
    setIsAdding(false);
  };

  const activeBudgetCategoryNames = budgets.map(b => b.category);
  const otherCategories = EXPENSE_CATEGORIES.filter(cat => !activeBudgetCategoryNames.includes(cat));

  return (
    <div id="tour-income-panel" className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8 transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Icons.Banknote />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Monthly Income</h3>
              <p className="text-xs text-slate-500">Track your income sources</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Total Monthly</span>
              <span className="text-lg font-bold text-emerald-600">{formatCurrency(totalIncome, currency)}</span>
            </div>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
            >
              {isAdding ? <Icons.X /> : <Icons.Plus />}
              {isAdding ? 'Cancel' : 'Add Income'}
            </button>
          </div>
        </div>

        {/* Add Income Form */}
        {isAdding && (
          <form onSubmit={handleAddSubmit} className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Source</label>
                <div className="relative">
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none"
                    autoFocus
                    required
                  >
                    <option value="">Select Source</option>
                    {INCOME_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Allocate To (Optional)</label>
                <div className="relative">
                  <select
                    value={newAllocatedCategory}
                    onChange={(e) => setNewAllocatedCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none"
                  >
                    <option value="">General Pool (Unallocated)</option>
                    {activeBudgetCategoryNames.length > 0 && (
                      <optgroup label="Active Budgets">
                        {activeBudgetCategoryNames.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="Other Categories">
                       {otherCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </optgroup>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="w-32">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Amount</label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="2000"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Income Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.length === 0 && !isAdding && (
            <div className="col-span-full text-center py-8 text-slate-400 text-sm">
              No income sources added. Click "Add Income" to get started.
            </div>
          )}
          
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white border border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow relative group flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-slate-800">{entry.category}</h4>
                {entry.allocatedCategory && (
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <span className="text-slate-400">For:</span> 
                    <span className="font-medium bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{entry.allocatedCategory}</span>
                  </p>
                )}
                <p className="text-emerald-600 font-bold mt-1">
                  {formatCurrency(entry.amount, currency)}
                  <span className="text-xs text-slate-400 font-normal ml-1">/ mo</span>
                </p>
              </div>
              
              <button 
                onClick={() => onDelete(entry.id)}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                title="Remove Income Source"
              >
                <Icons.Trash />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IncomePanel;
