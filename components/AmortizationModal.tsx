
import React, { useMemo } from 'react';
import { FinancialEntry } from '../types';
import { calculateAmortizationSchedule } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { Icons } from '../constants';

interface AmortizationModalProps {
  entry: FinancialEntry | null;
  onClose: () => void;
  currency: string;
}

const AmortizationModal: React.FC<AmortizationModalProps> = ({ entry, onClose, currency }) => {
  if (!entry) return null;

  const schedule = useMemo(() => {
    if (entry.interestRate && entry.termYears) {
      return calculateAmortizationSchedule(
        entry.value,
        entry.interestRate,
        entry.termYears,
        entry.interestType || 'COMPOUND_MONTHLY'
      );
    }
    return [];
  }, [entry]);

  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
  const totalPayment = schedule.reduce((sum, row) => sum + row.payment, 0);

  const getInterestTypeLabel = (type?: string) => {
    switch(type) {
      case 'SIMPLE': return 'Simple Interest';
      case 'COMPOUND_ANNUALLY': return 'Compound Interest (Annually)';
      case 'COMPOUND_MONTHLY': return 'Compound Interest (Monthly)';
      default: return 'Compound Interest';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Background backdrop */}
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl border border-slate-100">
          
          {/* Header */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Icons.Calendar />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900" id="modal-title">Amortization Schedule</h3>
                <p className="text-sm text-slate-500">{entry.name} - {getInterestTypeLabel(entry.interestType)}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-500 transition-colors"
            >
              <Icons.X />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
            
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-semibold uppercase">Principal</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(entry.value, currency)}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-semibold uppercase">Interest Rate</p>
                <p className="text-lg font-bold text-blue-600">{entry.interestRate}%</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-semibold uppercase">Total Interest</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(totalInterest, currency)}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-semibold uppercase">Total Cost</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(totalPayment, currency)}</p>
              </div>
            </div>

            {schedule.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Month</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Principal</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Interest</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {schedule.map((row) => (
                      <tr key={row.month} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">{row.month}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900 text-right font-medium">{formatCurrency(row.payment, currency)}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-emerald-600 text-right">{formatCurrency(row.principal, currency)}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-red-500 text-right">{formatCurrency(row.interest, currency)}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 text-right">{formatCurrency(row.balance, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400">
                <p>No schedule available. Ensure you have set an interest rate and term.</p>
              </div>
            )}
          </div>
          
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
             <button
                type="button"
                className="inline-flex justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                onClick={onClose}
              >
                Close
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmortizationModal;
