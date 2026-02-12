
import React from 'react';
import { Icons } from '../constants';

interface TrialNotificationProps {
  daysRemaining: number;
  onSubscribe: () => void;
  onDismiss: () => void;
}

const TrialNotification: React.FC<TrialNotificationProps> = ({ daysRemaining, onSubscribe, onDismiss }) => {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 shadow-sm relative z-40 animate-in slide-in-from-top-full duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-full shrink-0">
              <Icons.Bell />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Your premium trial ends in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
              </p>
              <p className="text-xs text-slate-500">
                Subscribe now to keep accessing AI Insights and unlimited features.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onSubscribe}
              className="flex-1 sm:flex-none px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-full transition-colors shadow-sm shadow-amber-200"
            >
              Subscribe Now
            </button>
            <button
              onClick={onDismiss}
              className="p-1.5 text-slate-400 hover:bg-amber-100 hover:text-amber-700 rounded-full transition-colors"
              aria-label="Dismiss notification"
            >
              <Icons.X />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialNotification;
