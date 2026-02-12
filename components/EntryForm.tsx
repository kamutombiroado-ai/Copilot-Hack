
import React, { useState, useEffect, useMemo } from 'react';
import { EntryType, FinancialEntry, AssetCategory } from '../types';
import { Icons } from '../constants';
import { calculateDepreciation, generateMockHistory } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';

interface EntryFormProps {
  onAdd: (entry: Omit<FinancialEntry, 'id' | 'updatedAt'>) => void;
  assetCategories: string[];
  liabilityCategories: string[];
  onAddCategory: (type: EntryType, category: string) => void;
  currency: string;
  isPremium: boolean;
  onUpgrade: () => void;
}

const EntryForm: React.FC<EntryFormProps> = ({ 
  onAdd, 
  assetCategories, 
  liabilityCategories, 
  onAddCategory, 
  currency,
  isPremium,
  onUpgrade
}) => {
  const [type, setType] = useState<EntryType>(EntryType.ASSET);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('');
  const [value, setValue] = useState<string>('');
  
  // Liability Specific Fields
  const [interestRate, setInterestRate] = useState<string>('');
  const [interestType, setInterestType] = useState<'SIMPLE' | 'COMPOUND_MONTHLY' | 'COMPOUND_ANNUALLY'>('COMPOUND_MONTHLY');
  const [termYears, setTermYears] = useState<string>('');

  // Depreciation Specific Fields (Assets)
  const [isDepreciating, setIsDepreciating] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState<string>('');
  const [depreciationRate, setDepreciationRate] = useState<string>('');
  const [depreciationMethod, setDepreciationMethod] = useState<'STRAIGHT_LINE' | 'DECLINING_BALANCE' | 'SUM_OF_YEARS_DIGITS'>('DECLINING_BALANCE');
  
  // Investment Specific Fields (Assets)
  const [return1Y, setReturn1Y] = useState<string>('');
  const [return5Y, setReturn5Y] = useState<string>('');
  const [returnMax, setReturnMax] = useState<string>('');

  // New Category State
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Reset toggles when category changes
  useEffect(() => {
    if (type === EntryType.ASSET) {
      const isDepreciable = category === AssetCategory.VEHICLES || category === AssetCategory.REAL_ESTATE || category === 'Property';
      if (!isDepreciable) setIsDepreciating(false);
    } else {
      setIsDepreciating(false);
    }
  }, [category, type]);

  // Calculate real-time depreciation preview
  const estimatedValue = useMemo(() => {
    if (isDepreciating && value && purchaseDate && depreciationRate) {
      const mockEntry = {
        isDepreciating: true,
        originalValue: parseFloat(value),
        purchaseDate: new Date(purchaseDate).getTime(),
        depreciationRate: parseFloat(depreciationRate),
        depreciationMethod: depreciationMethod,
        value: 0 // Not used in calculation when dep params exist
      } as FinancialEntry;
      
      return calculateDepreciation(mockEntry);
    }
    return null;
  }, [isDepreciating, value, purchaseDate, depreciationRate, depreciationMethod]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !value) return;

    const entryData: Omit<FinancialEntry, 'id' | 'updatedAt'> = {
      type,
      name,
      category,
      value: parseFloat(value),
    };

    if (type === EntryType.LIABILITY) {
      // Only add detailed liability info if premium
      if (isPremium) {
        if (interestRate) entryData.interestRate = parseFloat(interestRate);
        if (termYears) entryData.termYears = parseFloat(termYears);
        entryData.interestType = interestType;
      }
    } else if (type === EntryType.ASSET) {
      // Handle Depreciation - Only if premium
      if (isPremium && isDepreciating) {
        const pDate = new Date(purchaseDate).getTime();
        entryData.isDepreciating = true;
        entryData.originalValue = parseFloat(value);
        entryData.purchaseDate = pDate;
        entryData.depreciationRate = parseFloat(depreciationRate);
        entryData.depreciationMethod = depreciationMethod;

        // Calculate initial depreciated value
        const calculatedEntry = { ...entryData } as FinancialEntry;
        entryData.value = calculateDepreciation(calculatedEntry);
      }
      
      // Handle Investment Performance
      if (category === AssetCategory.INVESTMENTS && return1Y) {
        const r1 = parseFloat(return1Y);
        const r5 = return5Y ? parseFloat(return5Y) : undefined;
        const rMax = returnMax ? parseFloat(returnMax) : undefined;
        
        entryData.performance = {
          return1Y: r1,
          return5Y: r5,
          returnMax: rMax,
          history1Y: generateMockHistory(parseFloat(value), r1, 12), // 12 points for 1Y
          history5Y: r5 ? generateMockHistory(parseFloat(value), r5, 24) : undefined, // 24 points for 5Y
          historyMax: rMax ? generateMockHistory(parseFloat(value), rMax, 36) : undefined // 36 points for Max
        };
      }
    }

    onAdd(entryData);

    // Reset Form
    setName('');
    setValue('');
    setInterestRate('');
    setTermYears('');
    setInterestType('COMPOUND_MONTHLY');
    setIsDepreciating(false);
    setPurchaseDate('');
    setDepreciationRate('');
    setDepreciationMethod('DECLINING_BALANCE');
    setReturn1Y('');
    setReturn5Y('');
    setReturnMax('');
  };

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(type, newCategoryName.trim());
      setCategory(newCategoryName.trim());
      setIsCreatingCategory(false);
      setNewCategoryName('');
    }
  };

  const categories = type === EntryType.ASSET ? assetCategories : liabilityCategories;
  const canDepreciate = type === EntryType.ASSET && (category === AssetCategory.VEHICLES || category === AssetCategory.REAL_ESTATE || category === 'Property');
  const isInvestment = type === EntryType.ASSET && category === AssetCategory.INVESTMENTS;

  return (
    <form id="tour-entry-form" onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 transition-shadow">
      <div className="flex items-center gap-2 mb-6 text-slate-800 font-semibold">
        <Icons.PlusCircle />
        <span>Quick Add Entry</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
        {/* Type Toggle (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</label>
          <div className="flex p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => { setType(EntryType.ASSET); setCategory(''); setIsCreatingCategory(false); }}
              className={`flex-1 py-1.5 px-2 rounded-md text-xs font-bold transition-all ${
                type === EntryType.ASSET ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Asset
            </button>
            <button
              type="button"
              onClick={() => { setType(EntryType.LIABILITY); setCategory(''); setIsCreatingCategory(false); }}
              className={`flex-1 py-1.5 px-2 rounded-md text-xs font-bold transition-all ${
                type === EntryType.LIABILITY ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Debt
            </button>
          </div>
        </div>

        {/* Category (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</label>
          
          {isCreatingCategory ? (
            <div className="flex gap-2">
              <input 
                type="text"
                autoFocus
                placeholder="New Category..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateCategory();
                  }
                  if (e.key === 'Escape') {
                    setIsCreatingCategory(false);
                    setNewCategoryName('');
                  }
                }}
              />
              <button
                type="button"
                onClick={handleCreateCategory}
                className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                title="Save Category"
              >
                <Icons.Check />
              </button>
              <button
                type="button"
                onClick={() => { setIsCreatingCategory(false); setNewCategoryName(''); }}
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors"
                title="Cancel"
              >
                <Icons.X />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingCategory(true)}
                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                title="Add New Category"
              >
                <Icons.Plus />
              </button>
            </div>
          )}
        </div>

        {/* Name (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={type === EntryType.ASSET ? "e.g. Tesla Model 3" : "e.g. Mortgage"}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        {/* Value (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {isDepreciating ? `Purchase Price (${currency})` : `Balance (${currency})`}
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0.00"
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        {/* Action (2 cols) */}
        <div className="lg:col-span-2 flex flex-col justify-end">
          <button
            type="submit"
            className={`w-full py-2 rounded-lg font-semibold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
              type === EntryType.ASSET ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            Add {type === EntryType.ASSET ? 'Asset' : 'Debt'}
          </button>
        </div>

        {/* Depreciation Toggle (Assets only) */}
        {canDepreciate && (
          <div className="lg:col-span-12 border-t border-slate-100 mt-2 pt-2">
            {!isPremium ? (
               <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400">
                     <Icons.Lock />
                     <span className="text-sm font-medium">Depreciation Tracking</span>
                  </div>
                  <button type="button" onClick={onUpgrade} className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors">Unlock Premium</button>
               </div>
            ) : (
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isDepreciating} 
                    onChange={(e) => setIsDepreciating(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Track Depreciation</span>
                </label>
            )}
          </div>
        )}

        {/* Depreciation Specific Inputs */}
        {isDepreciating && isPremium && (
          <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 animate-in fade-in slide-in-from-top-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Purchase Date</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Depreciation Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={depreciationRate}
                onChange={(e) => setDepreciationRate(e.target.value)}
                placeholder="e.g. 15"
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Method</label>
              <div className="relative">
                <select
                  value={depreciationMethod}
                  onChange={(e) => setDepreciationMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none"
                >
                  <option value="DECLINING_BALANCE">Declining Balance</option>
                  <option value="STRAIGHT_LINE">Straight Line</option>
                  <option value="SUM_OF_YEARS_DIGITS">Sum of Years Digits</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {depreciationMethod === 'SUM_OF_YEARS_DIGITS' && (
              <div className="col-span-full">
                <p className="text-[10px] text-slate-400 italic">
                  * Sum-of-the-Years' Digits is an accelerated depreciation method that results in higher depreciation charges in the early years of an asset's life.
                </p>
              </div>
            )}

            {/* Live Preview of Depreciated Value */}
            {estimatedValue !== null && (
              <div className="sm:col-span-3 mt-1 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-700">
                  <Icons.TrendingDown />
                  <span className="text-sm font-medium">Estimated Current Value</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-emerald-700">{formatCurrency(estimatedValue, currency)}</span>
                  <p className="text-[10px] text-emerald-600/70">
                    Depreciated from {formatCurrency(parseFloat(value), currency)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Investment Performance Inputs */}
        {isInvestment && (
          <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 mt-2 animate-in fade-in slide-in-from-top-1">
             <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">1Y Return (%)</label>
              <input
                type="number"
                step="0.01"
                value={return1Y}
                onChange={(e) => setReturn1Y(e.target.value)}
                placeholder="e.g. 8.5"
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">5Y Return (%)</label>
              <input
                type="number"
                step="0.01"
                value={return5Y}
                onChange={(e) => setReturn5Y(e.target.value)}
                placeholder="e.g. 45.2"
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
             <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Max Return (%)</label>
              <input
                type="number"
                step="0.01"
                value={returnMax}
                onChange={(e) => setReturnMax(e.target.value)}
                placeholder="e.g. 120"
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
             <div className="col-span-full">
                <p className="text-[10px] text-slate-400 italic flex items-center gap-1">
                  <Icons.TrendingUp />
                  Returns are used to simulate historical performance charts for 1Y, 5Y, and Max timeframes.
                </p>
             </div>
          </div>
        )}

        {/* Liability Specific Inputs */}
        {type === EntryType.LIABILITY && (
          <div className="lg:col-span-12 mt-2">
            {!isPremium ? (
               <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                     <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2"><Icons.Lock /> Advanced Debt Tools</h4>
                     <p className="text-xs text-slate-500 mt-1">Unlock Amortization schedules, Interest tracking, and Payoff planning.</p>
                  </div>
                  <button type="button" onClick={onUpgrade} className="px-3 py-1.5 bg-white border border-slate-200 shadow-sm rounded-lg text-xs font-bold text-blue-600 hover:bg-slate-50">Upgrade</button>
               </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interest Rate (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        placeholder="e.g. 5.25"
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interest Type</label>
                      <div className="relative">
                        <select
                          value={interestType}
                          onChange={(e) => setInterestType(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                        >
                          <option value="COMPOUND_MONTHLY">Compound (Monthly)</option>
                          <option value="COMPOUND_ANNUALLY">Compound (Annually)</option>
                          <option value="SIMPLE">Simple Interest (Flat)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Payoff Period (Years)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={termYears}
                        onChange={(e) => setTermYears(e.target.value)}
                        placeholder="e.g. 30"
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    
                    {interestType === 'SIMPLE' && (
                      <div className="col-span-full">
                        <p className="text-[10px] text-slate-400 italic">
                          * Simple (Flat) Interest: Interest is calculated on the original principal for the entire term.
                        </p>
                      </div>
                    )}
                </div>
            )}
          </div>
        )}
      </div>
    </form>
  );
};

export default EntryForm;
