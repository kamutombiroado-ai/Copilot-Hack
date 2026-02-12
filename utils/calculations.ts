
import { AmortizationRow, FinancialEntry } from "../types";

export const calculateAmortizationSchedule = (
  principal: number,
  annualRate: number,
  years: number,
  type: 'SIMPLE' | 'COMPOUND_MONTHLY' | 'COMPOUND_ANNUALLY' | string
): AmortizationRow[] => {
  const schedule: AmortizationRow[] = [];
  const numMonths = years * 12;
  
  if (type === 'SIMPLE') {
    // Simple Interest Interpretation (Flat Add-on Interest)
    // Total Interest = P * r * t
    // Monthly Payment = (P + Total Interest) / Months
    const totalInterest = principal * (annualRate / 100) * years;
    const totalAmount = principal + totalInterest;
    const monthlyPayment = totalAmount / numMonths;
    const monthlyPrincipal = principal / numMonths;
    const monthlyInterest = totalInterest / numMonths;
    
    let balance = principal;

    for (let i = 1; i <= numMonths; i++) {
      balance -= monthlyPrincipal;
      if (balance < 0) balance = 0;

      schedule.push({
        month: i,
        payment: monthlyPayment,
        principal: monthlyPrincipal,
        interest: monthlyInterest,
        balance: balance
      });
    }
  } else {
    // Compound Interest (Monthly or Annual)
    let monthlyRate = 0;

    if (type === 'COMPOUND_ANNUALLY') {
      // For Annual Compounding, we need the effective monthly rate that results in the annual rate
      // (1 + r_month)^12 = 1 + r_annual
      // r_month = (1 + r_annual)^(1/12) - 1
      monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
    } else {
      // Default: Monthly Compounding (nominal rate / 12)
      // Matches 'COMPOUND_MONTHLY' and legacy 'COMPOUND'
      monthlyRate = annualRate / 100 / 12;
    }
    
    // Handle 0% interest edge case
    let monthlyPayment = 0;
    if (monthlyRate === 0) {
      monthlyPayment = principal / numMonths;
    } else {
      // Standard Amortization Formula using the calculated monthly rate
      monthlyPayment = principal * (
        (monthlyRate * Math.pow(1 + monthlyRate, numMonths)) / 
        (Math.pow(1 + monthlyRate, numMonths) - 1)
      );
    }

    let balance = principal;

    for (let i = 1; i <= numMonths; i++) {
      const interestPayment = balance * monthlyRate;
      let principalPayment = monthlyPayment - interestPayment;
      
      // Handle last month rounding differences
      if (balance - principalPayment < 0.1) {
        principalPayment = balance;
        balance = 0;
      } else {
        balance -= principalPayment;
      }
      
      // Ensure balance doesn't go negative
      if (balance < 0) balance = 0;

      schedule.push({
        month: i,
        payment: principalPayment + interestPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: balance
      });

      if (balance === 0) break;
    }
  }

  return schedule;
};

export const calculateDepreciation = (entry: FinancialEntry): number => {
  // Return current value if depreciation is not enabled or missing data
  if (!entry.isDepreciating || !entry.originalValue || !entry.purchaseDate || !entry.depreciationRate) {
    return entry.value;
  }

  const now = Date.now();
  // Calculate years elapsed (can be fractional)
  const yearsElapsed = (now - entry.purchaseDate) / (1000 * 60 * 60 * 24 * 365.25);
  
  // If purchase date is in the future, value is original value
  if (yearsElapsed <= 0) return entry.originalValue;

  let currentValue = entry.originalValue;

  if (entry.depreciationMethod === 'SUM_OF_YEARS_DIGITS') {
    // Sum-of-the-Years' Digits (SYD)
    // Useful Life (N) is approximated from depreciation rate (e.g., 20% -> 5 years)
    if (entry.depreciationRate <= 0) return entry.originalValue;
    const N = 100 / entry.depreciationRate;

    if (yearsElapsed >= N) {
      currentValue = 0;
    } else {
      const S = (N * (N + 1)) / 2;
      
      // Formula for Accumulated Depreciation Ratio at time t:
      // Ratio = (t * (N + 0.5) - 0.5 * t^2) / S
      // This continuous approximation matches the discrete sum for integer years.
      const accumulatedFraction = (yearsElapsed * (N + 0.5) - 0.5 * Math.pow(yearsElapsed, 2)) / S;
      
      currentValue = entry.originalValue * (1 - accumulatedFraction);
    }

  } else if (entry.depreciationMethod === 'STRAIGHT_LINE') {
    // Annual Depreciation = Original Value * Rate
    const annualDepreciationAmount = entry.originalValue * (entry.depreciationRate / 100);
    currentValue = entry.originalValue - (annualDepreciationAmount * yearsElapsed);
  } else {
    // Declining Balance: Value = Original * (1 - Rate)^Years
    // Default method
    currentValue = entry.originalValue * Math.pow(1 - (entry.depreciationRate / 100), yearsElapsed);
  }

  // Ensure value doesn't drop below 0
  return Math.max(0, Math.round(currentValue));
};

export const generateMockHistory = (currentValue: number, returnRate: number, points: number = 24): number[] => {
  const history: number[] = [];
  
  // Calculate implied start value based on return rate
  // This is a rough approximation assuming linear growth over the period for the sparkline context
  const startValue = currentValue / (1 + (returnRate / 100));
  
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1);
    
    // Base linear trend
    let value = startValue + (currentValue - startValue) * progress;
    
    // Add volatility/noise
    // We want the noise to be proportional to the value, but ensuring the final point lands exactly on currentValue
    if (i < points - 1) {
      const volatility = (currentValue - startValue) * 0.3; // 30% volatility relative to growth
      const randomFactor = (Math.random() - 0.5) * volatility;
      value += randomFactor;
    } else {
      value = currentValue;
    }
    
    history.push(Math.max(0, value));
  }
  
  return history;
};
