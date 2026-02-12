
import React, { useState } from 'react';
import { analyzeFinancials } from '../services/geminiService';
import { FinancialEntry, AIAnalysisResult } from '../types';
import { Icons } from '../constants';

interface AIInsightsProps {
  entries: FinancialEntry[];
  isPremium: boolean;
  onUpgrade: () => void;
}

const AIInsights: React.FC<AIInsightsProps> = ({ entries, isPremium, onUpgrade }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (entries.length === 0) return;
    setLoading(true);
    const result = await analyzeFinancials(entries);
    setAnalysis(result);
    setLoading(false);
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'text-emerald-500 bg-emerald-50';
      case 'high': return 'text-red-500 bg-red-50';
      default: return 'text-amber-500 bg-amber-50';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8 relative">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Icons.Brain />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                AI Financial Insights
                {!isPremium && <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide flex items-center gap-1"><Icons.Lock /> Premium</span>}
              </h3>
              <p className="text-xs text-slate-500">Powered by Gemini 3</p>
            </div>
          </div>
          
          {isPremium && (
            <button
              onClick={handleAnalyze}
              disabled={loading || entries.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all shadow-sm ${
                loading || entries.length === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Icons.Sparkles />
              )}
              {loading ? 'Analyzing...' : 'Analyze My Portfolio'}
            </button>
          )}
        </div>

        {!isPremium ? (
          <div className="relative py-12 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 overflow-hidden">
            {/* Blurred Content Background */}
            <div className="absolute inset-0 filter blur-sm opacity-50 bg-white pointer-events-none p-6 space-y-4">
               <div className="h-4 bg-slate-200 rounded w-3/4"></div>
               <div className="h-4 bg-slate-200 rounded w-full"></div>
               <div className="h-4 bg-slate-200 rounded w-5/6"></div>
               <div className="h-20 bg-slate-100 rounded w-full mt-4"></div>
            </div>

            {/* Lock Overlay */}
            <div className="relative z-10 text-center">
              <div className="mx-auto w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-blue-600 mb-4">
                <Icons.Lock />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Unlock Advanced Insights</h4>
              <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                Upgrade to Premium to get personalized AI analysis, risk assessments, and strategic recommendations for your portfolio.
              </p>
              <button
                onClick={onUpgrade}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
              >
                <Icons.Crown />
                Start 7-Day Free Trial
              </button>
            </div>
          </div>
        ) : (
          <>
            {!analysis && !loading && (
              <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <div className="mx-auto w-12 h-12 text-slate-300 mb-3">
                  <Icons.Brain />
                </div>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  Ready for a professional analysis? Click the button above and I'll review your asset allocation and liabilities.
                </p>
              </div>
            )}

            {loading && (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                <div className="h-4 bg-slate-100 rounded w-full"></div>
                <div className="h-4 bg-slate-100 rounded w-5/6"></div>
              </div>
            )}

            {analysis && !loading && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk Profile:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getRiskColor(analysis.riskAssessment)}`}>
                    {analysis.riskAssessment}
                  </span>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Portfolio Summary</h4>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {analysis.summary}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Strategic Suggestions</h4>
                  <ul className="space-y-3">
                    {analysis.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-slate-600 items-start">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span className="pt-0.5">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
