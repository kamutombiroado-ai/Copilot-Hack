
import React, { useState } from 'react';
import { Icons } from '../constants';
import { SubscriptionPlan, UserSubscription } from '../types';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (plan: SubscriptionPlan) => Promise<void>;
  onStartTrial: () => Promise<void>;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onSubscribe, onStartTrial }) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('YEARLY');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    await onSubscribe(selectedPlan);
    setLoading(false);
  };

  const handleStartTrial = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    await onStartTrial();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-100">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 L100 0 L100 100 Z" fill="white" />
              </svg>
            </div>
            <div className="relative z-10 flex justify-center mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                <Icons.Crown />
              </div>
            </div>
            <h3 className="text-2xl font-bold relative z-10">Unlock WealthTrack Premium</h3>
            <p className="text-blue-100 mt-2 relative z-10">Supercharge your financial journey with AI insights</p>
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <Icons.X />
            </button>
          </div>

          <div className="p-6">
            {/* Features List */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-emerald-100 text-emerald-600 rounded-full mt-0.5">
                  <Icons.Check />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Advanced AI Insights</h4>
                  <p className="text-sm text-slate-500">Get personalized risk assessments and strategic advice powered by Gemini.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1 bg-emerald-100 text-emerald-600 rounded-full mt-0.5">
                  <Icons.Check />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Unlimited Tracking</h4>
                  <p className="text-sm text-slate-500">Track unlimited assets, liabilities, and budgets without restrictions.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1 bg-emerald-100 text-emerald-600 rounded-full mt-0.5">
                  <Icons.Check />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Priority Support</h4>
                  <p className="text-sm text-slate-500">Get help faster with our dedicated premium support channel.</p>
                </div>
              </div>
            </div>

            {/* Plan Selection */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => setSelectedPlan('MONTHLY')}
                className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                  selectedPlan === 'MONTHLY' 
                    ? 'border-blue-600 bg-blue-50/50' 
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="font-semibold text-slate-900">Monthly</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">$9.99</div>
                <div className="text-xs text-slate-500">per month</div>
              </button>
              
              <button
                onClick={() => setSelectedPlan('YEARLY')}
                className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                  selectedPlan === 'YEARLY' 
                    ? 'border-blue-600 bg-blue-50/50' 
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="absolute -top-3 right-4 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  SAVE 17%
                </div>
                <div className="font-semibold text-slate-900">Yearly</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">$99.99</div>
                <div className="text-xs text-slate-500">per year</div>
              </button>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>Subscribe Now</>
                )}
              </button>
              
              <button
                onClick={handleStartTrial}
                disabled={loading}
                className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                 Start 7-Day Free Trial
              </button>
              
              <p className="text-center text-xs text-slate-400 mt-4">
                You won't be charged until your trial ends. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;
