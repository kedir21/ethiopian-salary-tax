
import { SalaryInputs, TaxBreakdown, SalaryFrequency } from '../types';

/**
 * Ethiopian Tax Brackets (Monthly) - Proclamation No. 979/2016
 * 0 - 600: 0%
 * 601 - 1,650: 10% (Deduction 60)
 * 1,651 - 3,200: 15% (Deduction 142.5)
 * 3,201 - 5,250: 20% (Deduction 302.5)
 * 5,251 - 7,800: 25% (Deduction 565)
 * 7,801 - 10,900: 30% (Deduction 955)
 * Over 10,900: 35% (Deduction 1,500)
 */

const calculateTaxForAmount = (taxableAmount: number): number => {
  if (taxableAmount <= 600) return 0;
  if (taxableAmount <= 1650) return (taxableAmount * 0.1) - 60;
  if (taxableAmount <= 3200) return (taxableAmount * 0.15) - 142.5;
  if (taxableAmount <= 5250) return (taxableAmount * 0.2) - 302.5;
  if (taxableAmount <= 7800) return (taxableAmount * 0.25) - 565;
  if (taxableAmount <= 10900) return (taxableAmount * 0.3) - 955;
  return (taxableAmount * 0.35) - 1500;
};

export const calculateEthiopianTax = (inputs: SalaryInputs): TaxBreakdown => {
  const { grossSalary, frequency, leaveDays, yearsWorked, monthsWorked } = inputs;
  
  // Normalize to monthly
  const grossMonthly = frequency === SalaryFrequency.ANNUAL ? grossSalary / 12 : grossSalary;
  
  // 1. Social Security (Pension) - 7% of Gross
  const pensionContribution = grossMonthly * 0.07;
  
  // 2. Taxable Income (Gross - Pension)
  const taxableIncome = grossMonthly - pensionContribution;
  
  const incomeTax = Math.max(0, calculateTaxForAmount(taxableIncome));
  
  // Find current bracket percentage for display
  let taxBracketPercentage = 0;
  if (taxableIncome > 10900) taxBracketPercentage = 35;
  else if (taxableIncome > 7800) taxBracketPercentage = 30;
  else if (taxableIncome > 5250) taxBracketPercentage = 25;
  else if (taxableIncome > 3200) taxBracketPercentage = 20;
  else if (taxableIncome > 1650) taxBracketPercentage = 15;
  else if (taxableIncome > 600) taxBracketPercentage = 10;

  const netMonthly = taxableIncome - incomeTax;
  
  // Leave Impact Calculations
  const leaveDailyRate = grossMonthly / 30; 
  const totalLeaveValue = leaveDailyRate * leaveDays;
  const dailyNetRate = netMonthly / 30;
  const leaveNetImpact = dailyNetRate * leaveDays;

  /**
   * Severance Pay Calculation (Labor Proclamation 1156/2019)
   * - 30 days salary for first year.
   * - +10 days for each additional year.
   * - Total capped at 12 months salary.
   */
  const serviceYearsTotal = yearsWorked + (monthsWorked / 12);
  let severanceDays = 0;

  if (serviceYearsTotal > 0) {
    if (serviceYearsTotal <= 1) {
      severanceDays = 30 * serviceYearsTotal;
    } else {
      severanceDays = 30 + (serviceYearsTotal - 1) * 10;
    }
  }

  // Cap at 360 days (12 months)
  severanceDays = Math.min(severanceDays, 360);
  const severancePay = severanceDays * leaveDailyRate;

  /**
   * Severance Taxation
   * Severance pay is typically taxed as regular income. 
   * We apply the progressive schedule to the severance lump sum.
   */
  const severanceTax = calculateTaxForAmount(severancePay);
  const netSeverancePay = Math.max(0, severancePay - severanceTax);

  return {
    grossMonthly,
    pensionContribution,
    taxableIncome,
    incomeTax,
    netMonthly,
    annualNet: netMonthly * 12,
    leaveDailyRate,
    totalLeaveValue,
    leaveNetImpact,
    taxBracketPercentage,
    severancePay,
    severanceTax,
    netSeverancePay,
    serviceYearsTotal
  };
};
