import { calculateDepreciation } from './calculations';
import { FinancialEntry, EntryType } from '../types';

// Add declarations for test runner globals
declare var describe: any;
declare var test: any;
declare var expect: any;

// Factory function to create mock entries for testing
const createEntry = (method: string, rate: number, originalValue: number, ageYears: number): FinancialEntry => {
    // calculate purchase date based on age
    const purchaseDate = Date.now() - (ageYears * 365.25 * 24 * 60 * 60 * 1000);
    return {
        id: '1',
        type: EntryType.ASSET,
        category: 'Test',
        name: 'Test Asset',
        value: originalValue, // Current value is output, not input for calculation usually
        originalValue: originalValue,
        updatedAt: Date.now(),
        isDepreciating: true,
        purchaseDate: purchaseDate,
        depreciationRate: rate,
        depreciationMethod: method as any
    };
};

describe('Depreciation Calculations', () => {
    
    // Test Straight Line Depreciation
    // Formula: Value = Original - (Original * Rate * Years)
    test('Straight Line: 50% depreciated', () => {
        // 1000 value, 10% rate (10 years life), 5 years elapsed.
        // Expected: 1000 - (1000 * 0.10 * 5) = 500
        const entry = createEntry('STRAIGHT_LINE', 10, 1000, 5);
        expect(calculateDepreciation(entry)).toBeCloseTo(500, 0); // Precision 0 for rounded integers
    });

    test('Straight Line: Fully depreciated', () => {
        // 1000 value, 20% rate (5 years life), 6 years elapsed.
        // Expected: 0 (cannot go negative)
        const entry = createEntry('STRAIGHT_LINE', 20, 1000, 6);
        expect(calculateDepreciation(entry)).toBe(0);
    });

    // Test Declining Balance Depreciation
    // Formula: Value = Original * (1 - Rate)^Years
    test('Declining Balance: 2 years', () => {
        // 1000 value, 20% rate, 2 years.
        // Year 1: 1000 * (1 - 0.2) = 800
        // Year 2: 800 * (1 - 0.2) = 640
        const entry = createEntry('DECLINING_BALANCE', 20, 1000, 2);
        expect(calculateDepreciation(entry)).toBeCloseTo(640, 0);
    });

    // Test Sum-of-the-Years' Digits (SYD) Depreciation
    // Formula: AccDep = (Cost - Salvage) * (Remaining Life / Sum of Digits)
    // N (Life) = 100 / Rate
    // S (Sum) = N(N+1)/2
    test('Sum of Years Digits: 2 years elapsed', () => {
        // 1000 value, 20% rate implies 5 year useful life (N=5).
        // Sum of digits S = 1+2+3+4+5 = 15.
        
        // Year 1 Dep: (5/15) * 1000 = 333.33
        // Year 2 Dep: (4/15) * 1000 = 266.67
        // Total Dep after 2 years: 600.
        // Remaining Value: 400.
        
        const entry = createEntry('SUM_OF_YEARS_DIGITS', 20, 1000, 2);
        // Calculation logic uses rounding, so we expect exactly 400
        expect(calculateDepreciation(entry)).toBe(400);
    });

    test('Sum of Years Digits: Fully depreciated', () => {
        // 1000 value, 20% rate (5 years), 6 years elapsed.
        const entry = createEntry('SUM_OF_YEARS_DIGITS', 20, 1000, 6);
        expect(calculateDepreciation(entry)).toBe(0);
    });

    test('Sum of Years Digits: Mid-year check', () => {
        // 1000 value, 50% rate implies 2 year useful life (N=2).
        // S = 3.
        // Elapsed = 1.
        // Year 1 fraction: 2/3.
        // Value = 1000 * (1 - 2/3) = 333.33
        const entry = createEntry('SUM_OF_YEARS_DIGITS', 50, 1000, 1);
        expect(calculateDepreciation(entry)).toBeCloseTo(333, 0);
    });
});