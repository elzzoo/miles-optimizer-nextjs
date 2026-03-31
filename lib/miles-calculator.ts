/**
 * Miles Value Calculator
 * Core algorithm for comparing cash prices vs miles redemption value
 *
 * Formula: value_per_mile = (cash_price - taxes) / miles_required
 * Result displayed in cents
 */

export type Recommendation = 'BAD' | 'OK' | 'GOOD' | 'GREAT';

export interface MilesCalculation {
  valuePerMile: number;
  recommendation: Recommendation;
  recommendationColor: string;
  badge: string;
  savings: number;
  savingsPercent: number;
  breakEvenMiles: number;
  totalMilesCost: number;
}

export interface MilesInput {
  cashPrice: number;
  taxes: number;
  milesRequired: number;
  currency?: string;
  marketMileValue?: number;
}

/**
 * Calculate the value of using miles vs paying cash
 *
 * Example:
 *   cashPrice: 520 EUR
 *   taxes: 120 EUR
 *   milesRequired: 35,000
 *   valuePerMile = (520 - 120) / 35000 * 100 = 1.14 cents
 */
export function calculateMilesValue(input: MilesInput): MilesCalculation {
  const { cashPrice, taxes, milesRequired, marketMileValue = 1.0 } = input;

  const valuePerMile = milesRequired > 0
    ? ((cashPrice - taxes) / milesRequired) * 100
    : 0;

  let recommendation: Recommendation;
  let recommendationColor: string;
  let badge: string;

  if (valuePerMile < 1.0) {
    recommendation = 'BAD';
    recommendationColor = '#ef4444';
    badge = 'BAD';
  } else if (valuePerMile <= 1.5) {
    recommendation = 'OK';
    recommendationColor = '#f59e0b';
    badge = 'OK';
  } else if (valuePerMile <= 2.0) {
    recommendation = 'GOOD';
    recommendationColor = '#10b981';
    badge = 'GOOD';
  } else {
    recommendation = 'GREAT';
    recommendationColor = '#0ea5e9';
    badge = 'GREAT';
  }

  const totalMilesCost = (milesRequired * marketMileValue) / 100;
  const savings = cashPrice - (totalMilesCost + taxes);
  const savingsPercent = cashPrice > 0 ? (savings / cashPrice) * 100 : 0;
  const breakEvenMiles = taxes < cashPrice ? Math.round((cashPrice - taxes) / 0.015) : 0;

  return {
    valuePerMile: Math.round(valuePerMile * 100) / 100,
    recommendation,
    recommendationColor,
    badge,
    savings: Math.round(savings * 100) / 100,
    savingsPercent: Math.round(savingsPercent * 10) / 10,
    breakEvenMiles,
    totalMilesCost: Math.round(totalMilesCost * 100) / 100,
  };
}

export function getMeterPosition(valuePerMile: number): number {
  if (valuePerMile <= 0) return 0;
  if (valuePerMile >= 3) return 100;
  return Math.round((valuePerMile / 3) * 100);
}

export function formatValuePerMile(valuePerMile: number): string {
  return `${valuePerMile.toFixed(2)} c/mile`;
}

export const AIRLINE_MILES_RATES: Record<string, {
  programName: string;
  baseValue: number;
  promoValue?: number;
}> = {
  'Air France': { programName: 'Flying Blue', baseValue: 1.2, promoValue: 1.8 },
  'Turkish Airlines': { programName: 'Miles&Smiles', baseValue: 1.4, promoValue: 2.1 },
  'Emirates': { programName: 'Skywards', baseValue: 1.1, promoValue: 1.6 },
  'Qatar Airways': { programName: 'Privilege Club', baseValue: 1.5, promoValue: 2.2 },
  'British Airways': { programName: 'Executive Club', baseValue: 1.3 },
  'Lufthansa': { programName: 'Miles & More', baseValue: 1.1 },
};
