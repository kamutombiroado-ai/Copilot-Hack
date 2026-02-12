
import React from 'react';
import { Icons } from '../constants';
import { UserSubscription } from '../types';
import { formatDate } from '../utils/formatters';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  onCurrencyChange: (currency: string) => void;
  onExportData: () => void;
  onLoadDemoData: () => void;
  subscription: UserSubscription;
  onUpgrade: () => void;
}

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'ZWG', symbol: 'ZiG', name: 'Zimbabwe Gold' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  currency, 
  onCurrencyChange, 
  onExportData,
  onLoadDemoData,
  subscription,
  onUpgrade
}) => {
  if (!isOpen) return null;

  const isPremium = subscription.status === 'ACTIVE' || subscription.status === 'TRIAL';

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-slate-100">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Settings</h3>
            <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-500 transition-colors">
              <Icons.X />
            </button>
          </div>
          <div className="p-6">
            {/* Subscription Management Section */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-700 mb-3">Subscription</label>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                {/* Background Pattern */}
                {isPremium && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-bl-full -mr-8 -mt-8 -z-0"></div>
                )}
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                          {subscription.plan === 'FREE' ? 'Free Plan' : subscription.plan === 'MONTHLY' ? 'Premium Monthly' : 'Premium Yearly'}
                          {isPremium && <Icons.Crown />}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {subscription.status === 'TRIAL' 
                              ? `Trial ends on ${formatDate(subscription.trialEndsAt || Date.now())}` 
                              : `Started on ${formatDate(subscription.startDate)}`}
                        </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                        subscription.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                        subscription.status === 'TRIAL' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                    }`}>
                        {subscription.status}
                    </span>
                  </div>

                  {!isPremium ? (
                    <button 
                        onClick={onUpgrade}
                        className="w-full mt-2 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                        Upgrade to Premium
                    </button>
                  ) : (
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                       <div className="text-xs text-slate-400 flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          <span>Features active</span>
                       </div>
                       <button onClick={onUpgrade} className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                          {subscription.status === 'TRIAL' ? 'Subscribe Now' : 'Change Plan'}
                       </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <label className="block text-sm font-medium text-slate-700 mb-3">Preferred Currency</label>
            <div className="grid grid-cols-1 gap-2 max-h-[40vh] overflow-y-auto mb-6">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => onCurrencyChange(c.code)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    currency === c.code 
                      ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' 
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-medium text-sm">{c.name} ({c.code})</span>
                  <span className="font-bold text-lg">{c.symbol}</span>
                </button>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-3">
              <label className="block text-sm font-medium text-slate-700 mb-3">Data Management</label>
              
              <button 
                onClick={onLoadDemoData}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold transition-colors"
              >
                <Icons.Sparkles />
                Load Demo Data
              </button>

              <button 
                onClick={onExportData}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold transition-colors"
              >
                <Icons.Download />
                Export Data as CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
