
export enum SalaryFrequency {
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL'
}

export interface SalaryInputs {
  grossSalary: number;
  frequency: SalaryFrequency;
  leaveDays: number;
  yearsWorked: number;
  monthsWorked: number;
}

export interface TaxBreakdown {
  grossMonthly: number;
  pensionContribution: number;
  taxableIncome: number;
  incomeTax: number;
  netMonthly: number;
  annualNet: number;
  leaveDailyRate: number;
  totalLeaveValue: number;
  leaveNetImpact: number;
  taxBracketPercentage: number;
  severancePay: number;
  severanceTax: number;
  netSeverancePay: number;
  serviceYearsTotal: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
