
import React, { useState, useEffect, useMemo } from 'react';
import { FinancialEntry, EntryType, AssetCategory, LiabilityCategory, BudgetEntry, IncomeEntry, UserSubscription, SubscriptionPlan } from './types';
import SummaryCards from './components/SummaryCards';
import EntryForm from './components/EntryForm';
import FinancialTable from './components/FinancialTable';
import Visualizations from './components/Visualizations';
import AIInsights from './components/AIInsights';
import AmortizationModal from './components/AmortizationModal';
import BudgetPanel from './components/BudgetPanel';
import IncomePanel from './components/IncomePanel';
import DebtDashboard from './components/DebtDashboard';
import SettingsModal from './components/SettingsModal';
import PremiumModal from './components/PremiumModal';
import TrialNotification from './components/TrialNotification';
import CashflowManager from './components/CashflowManager';
import OnboardingTour from './components/OnboardingTour';
import ConfirmationModal from './components/ConfirmationModal';
import InstallBanner from './components/InstallBanner';
import { Icons } from './constants';
import { calculateDepreciation } from './utils/calculations';
import { getDemoData } from './utils/demoData';

const App: React.FC = () => {
  // Financial Entries State
  const [entries, setEntries] = useState<FinancialEntry[]>(() => {
    const saved = localStorage.getItem('wealthtrack_entries');
    return saved ? JSON.parse(saved) : [];
  });

  // Categories State
  const [assetCategories, setAssetCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('wealthtrack_asset_categories');
    return saved ? JSON.parse(saved) : Object.values(AssetCategory);
  });

  const [liabilityCategories, setLiabilityCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('wealthtrack_liability_categories');
    return saved ? JSON.parse(saved) : Object.values(LiabilityCategory);
  });

  // Budget State
  const [budgets, setBudgets] = useState<BudgetEntry[]>(() => {
    const saved = localStorage.getItem('wealthtrack_budgets');
    return saved ? JSON.parse(saved) : [];
  });

  // Income State
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>(() => {
    const saved = localStorage.getItem('wealthtrack_income');
    return saved ? JSON.parse(saved) : [];
  });

  // Currency State
  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem('wealthtrack_currency') || 'USD';
  });

  // Subscription State
  const [subscription, setSubscription] = useState<UserSubscription>(() => {
    const saved = localStorage.getItem('wealthtrack_subscription');
    return saved ? JSON.parse(saved) : {
      plan: 'FREE',
      status: 'ACTIVE',
      startDate: Date.now()
    };
  });

  const [selectedEntry, setSelectedEntry] = useState<FinancialEntry | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isTrialNotificationVisible, setIsTrialNotificationVisible] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'ENTRY' | 'BUDGET' | 'INCOME' | null;
    id: string | null;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: null,
    id: null,
    title: '',
    message: ''
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('wealthtrack_entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('wealthtrack_asset_categories', JSON.stringify(assetCategories));
    localStorage.setItem('wealthtrack_liability_categories', JSON.stringify(liabilityCategories));
  }, [assetCategories, liabilityCategories]);

  useEffect(() => {
    localStorage.setItem('wealthtrack_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('wealthtrack_income', JSON.stringify(incomeEntries));
  }, [incomeEntries]);

  useEffect(() => {
    localStorage.setItem('wealthtrack_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('wealthtrack_subscription', JSON.stringify(subscription));
  }, [subscription]);

  // Check Trial Expiration Logic on Mount
  useEffect(() => {
    if (subscription.status === 'TRIAL' && subscription.trialEndsAt) {
      if (Date.now() > subscription.trialEndsAt) {
        setSubscription(prev => ({
          ...prev,
          plan: 'FREE',
          status: 'EXPIRED',
          trialEndsAt: undefined
        }));
      }
    }
  }, []);

  // Check Onboarding Status
  useEffect(() => {
    const completed = localStorage.getItem('wealthtrack_onboarding_completed');
    if (!completed) {
      setShowOnboarding(true);
    }
  }, []);

  const handleCompleteOnboarding = () => {
    localStorage.setItem('wealthtrack_onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  // Recalculate Depreciated Assets on Mount
  useEffect(() => {
    setEntries(prevEntries => {
      let hasChanges = false;
      const updated = prevEntries.map(entry => {
        if (entry.type === EntryType.ASSET && entry.isDepreciating) {
          const newValue = calculateDepreciation(entry);
          if (newValue !== entry.value) {
            hasChanges = true;
            return { ...entry, value: newValue };
          }
        }
        return entry;
      });
      return hasChanges ? updated : prevEntries;
    });
  }, []);

  // Calculate days remaining for trial
  const trialDaysRemaining = useMemo(() => {
    if (subscription.status !== 'TRIAL' || !subscription.trialEndsAt) return 0;
    const diff = subscription.trialEndsAt - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [subscription]);

  // Show notification if in trial and <= 3 days remaining
  const showTrialNotification = subscription.status === 'TRIAL' && 
                                trialDaysRemaining <= 3 && 
                                trialDaysRemaining > 0 && 
                                isTrialNotificationVisible;

  // Handlers
  const handleAddEntry = (newEntry: Omit<FinancialEntry, 'id' | 'updatedAt'>) => {
    const entry: FinancialEntry = {
      ...newEntry,
      id: crypto.randomUUID(),
      updatedAt: Date.now()
    };
    setEntries(prev => [entry, ...prev]);
  };

  const handleDeleteEntry = (id: string) => {
    const entry = entries.find(e => e.id === id);
    setDeleteConfirm({
      isOpen: true,
      type: 'ENTRY',
      id,
      title: 'Delete Financial Entry',
      message: `Are you sure you want to delete "${entry?.name || 'this entry'}"? This action cannot be undone.`
    });
  };

  const handleAddCategory = (type: EntryType, category: string) => {
    if (type === EntryType.ASSET) {
      if (!assetCategories.includes(category)) {
        setAssetCategories(prev => [...prev, category]);
      }
    } else {
      if (!liabilityCategories.includes(category)) {
        setLiabilityCategories(prev => [...prev, category]);
      }
    }
  };

  const handleAddBudget = (newBudget: Omit<BudgetEntry, 'id'>) => {
    const budget: BudgetEntry = {
      ...newBudget,
      id: crypto.randomUUID()
    };
    setBudgets(prev => [...prev, budget]);
  };

  const handleUpdateSpent = (id: string, spent: number) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, spent } : b));
  };

  const handleDeleteBudget = (id: string) => {
    const budget = budgets.find(b => b.id === id);
    setDeleteConfirm({
      isOpen: true,
      type: 'BUDGET',
      id,
      title: 'Delete Budget',
      message: `Are you sure you want to delete the budget for "${budget?.category}"?`
    });
  };

  const handleAddIncome = (newIncome: Omit<IncomeEntry, 'id'>) => {
    const entry: IncomeEntry = {
      ...newIncome,
      id: crypto.randomUUID()
    };
    setIncomeEntries(prev => [...prev, entry]);
  };

  const handleDeleteIncome = (id: string) => {
    const income = incomeEntries.find(i => i.id === id);
    setDeleteConfirm({
      isOpen: true,
      type: 'INCOME',
      id,
      title: 'Delete Income Source',
      message: `Are you sure you want to delete "${income?.category}"?`
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm.id) return;

    if (deleteConfirm.type === 'ENTRY') {
      setEntries(prev => prev.filter(e => e.id !== deleteConfirm.id));
    } else if (deleteConfirm.type === 'BUDGET') {
      setBudgets(prev => prev.filter(b => b.id !== deleteConfirm.id));
    } else if (deleteConfirm.type === 'INCOME') {
      setIncomeEntries(prev => prev.filter(e => e.id !== deleteConfirm.id));
    }
    
    setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    setSubscription({
      plan: plan,
      status: 'ACTIVE',
      startDate: Date.now()
    });
    setIsPremiumModalOpen(false);
  };

  const handleStartTrial = async () => {
    // 7 days in milliseconds
    const trialDuration = 7 * 24 * 60 * 60 * 1000;
    setSubscription({
      plan: 'MONTHLY', // Assumption: Trial defaults to monthly intent
      status: 'TRIAL',
      startDate: Date.now(),
      trialEndsAt: Date.now() + trialDuration
    });
    setIsPremiumModalOpen(false);
  };

  const handleLoadDemoData = () => {
    const demo = getDemoData();
    setEntries(demo.entries);
    setBudgets(demo.budgets);
    setIncomeEntries(demo.income);
    setIsSettingsOpen(false);
  };

  const handleExportData = () => {
    if (entries.length === 0) return;

    const headers = [
      'ID',
      'Type',
      'Category',
      'Name',
      'Current Value',
      'Currency',
      'Last Updated',
      'Original Value',
      'Purchase Date',
      'Depreciation Rate (%)',
      'Depreciation Method',
      'Interest Rate (%)',
      'Term (Years)',
      'Interest Type',
      '1Y Return (%)',
      '5Y Return (%)',
      'Max Return (%)'
    ];

    const escapeCsv = (str: string | number | undefined | boolean | null) => {
        if (str === undefined || str === null) return '';
        const stringValue = String(str);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return '';
        return new Date(timestamp).toLocaleDateString();
    };

    const csvContent = [
      headers.join(','),
      ...entries.map(e => {
        const row = [
          e.id,
          e.type,
          e.category,
          e.name,
          e.value,
          currency,
          formatDate(e.updatedAt),
          e.originalValue,
          formatDate(e.purchaseDate),
          e.depreciationRate,
          e.depreciationMethod,
          e.interestRate,
          e.termYears,
          e.interestType,
          e.performance?.return1Y,
          e.performance?.return5Y,
          e.performance?.returnMax
        ].map(escapeCsv);
        return row.join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `wealthtrack_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isPremium = subscription.plan !== 'FREE' && (subscription.status === 'ACTIVE' || subscription.status === 'TRIAL');

  const totals = useMemo(() => {
    const assets = entries.filter(e => e.type === EntryType.ASSET).reduce((sum, e) => sum + e.value, 0);
    const liabilities = entries.filter(e => e.type === EntryType.LIABILITY).reduce((sum, e) => sum + e.value, 0);
    return {
      totalAssets: assets,
      totalLiabilities: liabilities,
      netWorth: assets - liabilities
    };
  }, [entries]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Install App Banner (Mobile PWA) */}
      <InstallBanner />

      {/* Onboarding Tour */}
      {showOnboarding && <OnboardingTour onComplete={handleCompleteOnboarding} />}

      {/* Trial Notification Banner */}
      {showTrialNotification && (
        <TrialNotification 
          daysRemaining={trialDaysRemaining}
          onSubscribe={() => setIsPremiumModalOpen(true)}
          onDismiss={() => setIsTrialNotificationVisible(false)}
        />
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-blue-200 shadow-lg">
                <Icons.TrendingUp />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">WealthTrack AI</h1>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Smart Net Worth Analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Premium Button */}
              {!isPremium ? (
                <button 
                  onClick={() => setIsPremiumModalOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-200 to-yellow-400 hover:from-amber-300 hover:to-yellow-500 text-amber-900 text-xs font-bold rounded-full transition-all shadow-sm"
                >
                  <Icons.Crown />
                  Upgrade
                </button>
              ) : (
                 <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                   {subscription.status === 'TRIAL' ? 'Trial Active' : 'Premium'}
                 </span>
              )}

              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                title="Settings"
              >
                <Icons.Settings />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Welcome Section */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Financial Dashboard</h2>
            <p className="text-slate-500">Track your progress and get intelligent feedback on your portfolio.</p>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <SummaryCards 
          totalAssets={totals.totalAssets} 
          totalLiabilities={totals.totalLiabilities} 
          netWorth={totals.netWorth} 
          currency={currency}
        />

        {/* Entry Form */}
        <EntryForm 
          onAdd={handleAddEntry} 
          assetCategories={assetCategories}
          liabilityCategories={liabilityCategories}
          onAddCategory={handleAddCategory}
          currency={currency}
          isPremium={isPremium}
          onUpgrade={() => setIsPremiumModalOpen(true)}
        />

        {/* Cashflow Manager - PREMIUM FEATURE */}
        {(incomeEntries.length > 0 || budgets.length > 0 || entries.some(e => e.type === EntryType.LIABILITY)) && (
          <CashflowManager
            incomeEntries={incomeEntries}
            budgets={budgets}
            entries={entries}
            isPremium={isPremium}
            onUpgrade={() => setIsPremiumModalOpen(true)}
            currency={currency}
          />
        )}

        {/* AI Insights - Show if there is data, GATED CONTENT */}
        {entries.length > 0 && (
          <AIInsights 
            entries={entries} 
            isPremium={isPremium}
            onUpgrade={() => setIsPremiumModalOpen(true)}
          />
        )}

        {/* Charts Section */}
        {entries.length > 0 && <Visualizations entries={entries} currency={currency} />}

        {/* Income & Budget Section */}
        <div className="grid grid-cols-1 gap-0">
          <IncomePanel 
            entries={incomeEntries}
            budgets={budgets}
            onAdd={handleAddIncome}
            onDelete={handleDeleteIncome}
            currency={currency}
          />
          
          <BudgetPanel 
            budgets={budgets}
            incomeEntries={incomeEntries}
            onAddBudget={handleAddBudget}
            onUpdateSpent={handleUpdateSpent}
            onDeleteBudget={handleDeleteBudget}
            currency={currency}
            isPremium={isPremium}
            onUpgrade={() => setIsPremiumModalOpen(true)}
          />
        </div>

        {/* Debt Dashboard - Only show if there are liabilities */}
        {totals.totalLiabilities > 0 && (
           <DebtDashboard 
             entries={entries} 
             currency={currency} 
             isPremium={isPremium}
             onUpgrade={() => setIsPremiumModalOpen(true)}
           />
        )}

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <FinancialTable 
            entries={entries} 
            type={EntryType.ASSET} 
            onDelete={handleDeleteEntry} 
            currency={currency}
            isPremium={isPremium}
            onUpgrade={() => setIsPremiumModalOpen(true)}
          />
          <FinancialTable 
            entries={entries} 
            type={EntryType.LIABILITY} 
            onDelete={handleDeleteEntry}
            onViewSchedule={setSelectedEntry}
            currency={currency}
            isPremium={isPremium}
            onUpgrade={() => setIsPremiumModalOpen(true)}
          />
        </div>
        
        {entries.length === 0 && incomeEntries.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm animate-in fade-in zoom-in-95 duration-500">
            <div className="inline-flex p-5 bg-slate-50 rounded-full mb-4 text-slate-300">
              <Icons.Wallet />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No financial data yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-6">
              Start by adding your first asset, liability, or income source using the forms above.
            </p>
            <button
               onClick={handleLoadDemoData}
               className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl transition-colors border border-indigo-200"
            >
               <Icons.Sparkles />
               Load Demo Data
            </button>
          </div>
        )}
      </main>

      {/* Amortization Modal */}
      {selectedEntry && (
        <AmortizationModal 
          entry={selectedEntry} 
          onClose={() => setSelectedEntry(null)} 
          currency={currency}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currency={currency}
        onCurrencyChange={(c) => { setCurrency(c); setIsSettingsOpen(false); }}
        onExportData={handleExportData}
        onLoadDemoData={handleLoadDemoData}
        subscription={subscription}
        onUpgrade={() => { setIsSettingsOpen(false); setIsPremiumModalOpen(true); }}
      />

      {/* Premium Modal */}
      <PremiumModal 
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        onSubscribe={handleSubscribe}
        onStartTrial={handleStartTrial}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        title={deleteConfirm.title}
        message={deleteConfirm.message}
      />

      {/* Simple Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pb-10 text-center border-t border-slate-200 pt-10">
        <p className="text-sm text-slate-400">WealthTrack AI - Built with React, Tailwind & Gemini API</p>
      </footer>
    </div>
  );
};

export default App;
