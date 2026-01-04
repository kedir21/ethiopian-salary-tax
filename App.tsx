
import React, { useState, useMemo, useRef } from 'react';
import { 
  SalaryInputs, SalaryFrequency 
} from './types.ts';
import { calculateEthiopianTax } from './services/taxService.ts';

const App: React.FC = () => {
  const [inputState, setInputState] = useState({
    grossSalary: '25000',
    leaveDays: '20',
    yearsWorked: '3',
    monthsWorked: '0',
  });
  
  const [frequency, setFrequency] = useState<SalaryFrequency>(SalaryFrequency.MONTHLY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasCalculated, setHasCalculated] = useState(false);
  const [showTaxInfo, setShowTaxInfo] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const calculatedInputs = useMemo((): SalaryInputs => ({
    grossSalary: Number(inputState.grossSalary) || 0,
    frequency: frequency,
    leaveDays: Number(inputState.leaveDays) || 0,
    yearsWorked: Number(inputState.yearsWorked) || 0,
    monthsWorked: Number(inputState.monthsWorked) || 0,
  }), [inputState, frequency]);

  const results = useMemo(() => calculateEthiopianTax(calculatedInputs), [calculatedInputs]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!inputState.grossSalary || Number(inputState.grossSalary) <= 0) {
      newErrors.grossSalary = "Salary must be greater than 0";
    }
    if (Number(inputState.leaveDays) < 0) {
      newErrors.leaveDays = "Leave days cannot be negative";
    }
    if (Number(inputState.yearsWorked) < 0) {
      newErrors.yearsWorked = "Cannot be negative";
    }
    if (Number(inputState.monthsWorked) < 0 || Number(inputState.monthsWorked) > 11) {
      newErrors.monthsWorked = "Must be between 0-11";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const cleanedValue = value === '' ? '' : (value.startsWith('0') && value.length > 1 ? value.replace(/^0+/, '') : value);
    setInputState(prev => ({ ...prev, [name]: cleanedValue }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const onCalculate = () => {
    if (validate()) {
      setHasCalculated(true);
      if (window.navigator.vibrate) window.navigator.vibrate(10);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const inputContainerClasses = (name: string) => `
    relative transition-all duration-300 rounded-2xl border-2 
    ${errors[name] ? 'border-red-200 bg-red-50/30' : 'border-slate-100 bg-slate-50/50'} 
    focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10 
    hover:border-slate-200 group
  `;

  const TaxBracketTooltip = () => (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 md:w-80 bg-slate-900 text-white p-6 rounded-3xl shadow-2xl z-50 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-4 border-b border-slate-700 pb-2">Proclamation 979/2016</h4>
      <div className="space-y-2.5">
        {[
          { range: "0 - 600", rate: "0%", desc: "Tax Free" },
          { range: "601 - 1,650", rate: "10%", desc: "Deduct 60" },
          { range: "1,651 - 3,200", rate: "15%", desc: "Deduct 142.5" },
          { range: "3,201 - 5,250", rate: "20%", desc: "Deduct 302.5" },
          { range: "5,251 - 7,800", rate: "25%", desc: "Deduct 565" },
          { range: "7,801 - 10,900", rate: "30%", desc: "Deduct 955" },
          { range: "Over 10,900", rate: "35%", desc: "Deduct 1,560" },
        ].map((item, idx) => (
          <div key={idx} className={`flex justify-between items-center text-[10px] font-bold ${results.taxableIncome > (idx === 6 ? 10900 : [0, 601, 1651, 3201, 5251, 7801, 10901][idx]) ? 'text-white' : 'text-slate-500'}`}>
            <span className="opacity-80">{item.range}</span>
            <span className={results.taxableIncome > (idx === 6 ? 10900 : [0, 601, 1651, 3201, 5251, 7801, 10901][idx]) ? 'text-emerald-400' : ''}>{item.rate}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-slate-700 text-[9px] leading-relaxed text-slate-400 italic">
        Applied on Taxable Income (Gross - 7% Pension).
      </div>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 rotate-45 border-b border-r border-slate-700"></div>
    </div>
  );

  return (
    <div className="min-h-screen pb-12 transition-all duration-700 font-sans text-slate-900 bg-slate-50">
      {/* Header */}
      <header className="bg-emerald-900 text-white pt-10 pb-20 md:py-16 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800/40 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-700/30 rounded-full blur-3xl -ml-24 -mb-24"></div>
        
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">Ethiopia Tax Portal</h1>
            <p className="text-emerald-200 text-sm md:text-lg font-medium opacity-90 max-w-lg mx-auto md:mx-0">
              Precise net pay & severance analytics according to 2024 regulations.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-2xl shadow-xl">
             <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 block mb-1">Calculation standard</span>
             <div className="font-mono text-xl font-bold">{frequency} Mode</div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 -mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* Input Column */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 sticky top-8 transition-all">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              Income Details
            </h2>
            
            <div className="space-y-6">
              <div className="p-1.5 bg-slate-100 rounded-2xl flex gap-1 shadow-inner">
                <button 
                  onClick={() => { setFrequency(SalaryFrequency.MONTHLY); setHasCalculated(false); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${frequency === SalaryFrequency.MONTHLY ? 'bg-white text-emerald-700 shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Monthly
                </button>
                <button 
                  onClick={() => { setFrequency(SalaryFrequency.ANNUAL); setHasCalculated(false); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${frequency === SalaryFrequency.ANNUAL ? 'bg-white text-emerald-700 shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Annual
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">
                  Gross {frequency === SalaryFrequency.MONTHLY ? 'Monthly' : 'Annual'} Salary
                </label>
                <div className={inputContainerClasses('grossSalary')}>
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-black text-sm group-focus-within:text-emerald-500 transition-colors">ETB</span>
                  <input 
                    type="number" 
                    name="grossSalary"
                    inputMode="decimal"
                    value={inputState.grossSalary}
                    onChange={handleInputChange}
                    className="w-full pl-14 pr-5 py-4 bg-transparent outline-none font-black text-xl text-slate-700"
                    placeholder="0.00"
                  />
                </div>
                {errors.grossSalary && <p className="mt-1.5 px-1 text-[10px] font-bold text-red-500 flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full"></span>{errors.grossSalary}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">
                  Annual Leave Days
                </label>
                <div className={inputContainerClasses('leaveDays')}>
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <input 
                    type="number" 
                    name="leaveDays"
                    inputMode="numeric"
                    value={inputState.leaveDays}
                    onChange={handleInputChange}
                    className="w-full pl-14 pr-5 py-4 bg-transparent outline-none font-black text-xl text-slate-700"
                    placeholder="0"
                  />
                </div>
                {errors.leaveDays && <p className="mt-1.5 px-1 text-[10px] font-bold text-red-500 flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full"></span>{errors.leaveDays}</p>}
              </div>

              <div className="pt-6 border-t border-slate-50">
                <label className="block text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4 text-center">Service Tenure</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 text-center">Years</label>
                    <div className={inputContainerClasses('yearsWorked')}>
                      <input 
                        type="number" 
                        name="yearsWorked"
                        inputMode="numeric"
                        value={inputState.yearsWorked}
                        onChange={handleInputChange}
                        className="w-full py-4 bg-transparent outline-none font-black text-xl text-center text-slate-700"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 text-center">Months</label>
                    <div className={inputContainerClasses('monthsWorked')}>
                      <input 
                        type="number" 
                        name="monthsWorked"
                        inputMode="numeric"
                        value={inputState.monthsWorked}
                        onChange={handleInputChange}
                        className="w-full py-4 bg-transparent outline-none font-black text-xl text-center text-slate-700"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={onCalculate}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-900/10 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group mt-4 overflow-hidden relative"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Analyze Earnings
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
            </div>
          </section>
        </div>

        {/* Results Column */}
        <div className={`lg:col-span-8 flex flex-col gap-6 md:gap-8 transition-all duration-1000 ${hasCalculated ? 'opacity-100 translate-y-0 scale-100' : 'opacity-20 blur-xl pointer-events-none scale-95'}`} ref={resultsRef}>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-emerald-700 p-10 md:p-12 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-white/10 pointer-events-none">
                <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.82v-1.91c-1.84-.42-3.32-1.57-3.32-3.32h1.91c0 .92.71 1.41 1.41 1.41 1.05 0 1.41-.71 1.41-1.05 0-.71-.42-1.05-1.84-1.41-1.84-.42-3.32-1.05-3.32-2.82 0-1.41 1.05-2.82 2.82-3.32V6h2.82v1.91c1.84.42 3.32 1.57 3.32 3.32h-1.91c0-.92-.71-1.41-1.41-1.41-1.05 0-1.41.71-1.41 1.05 0 .71.42 1.05 1.84 1.41 1.84.42 3.32 1.05 3.32 2.82 0 1.41-1.05 2.82-2.82 3.32z"></path></svg>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-300 block mb-6 opacity-80">Net Take-home pay</span>
              <div className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
                {results.netMonthly.toLocaleString()} 
                <span className="text-xl font-bold opacity-40 ml-2">ETB</span>
              </div>
              <div className="inline-flex items-center gap-3 bg-white/10 px-5 py-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
                <span className="text-xs font-black uppercase">Post-Tax Monthly</span>
              </div>
            </div>

            <div className="bg-slate-900 p-10 md:p-12 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 text-slate-800 pointer-events-none opacity-40">
                <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16.5C21 16.88 20.79 17.21 20.47 17.38L12.57 21.82C12.41 21.94 12.21 22 12 22C11.79 22 11.59 21.94 11.43 21.82L3.53 17.38C3.21 17.21 3 16.88 3 16.5V7.5C3 7.12 3.21 6.79 3.53 6.62L11.43 2.18C11.59 2.06 11.79 2 12 2C12.21 2 12.41 2.06 12.57 2.18L20.47 6.62C20.79 6.79 21 7.12 21 7.5V16.5Z"></path></svg>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block mb-6 opacity-80">Liquidated Severance</span>
              <div className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-indigo-400">
                {results.netSeverancePay.toLocaleString()}
                <span className="text-xl font-bold opacity-40 ml-2 text-white">ETB</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 shadow-inner">
                  <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Total Gross</span>
                  <div className="font-bold text-sm">{results.severancePay.toLocaleString()}</div>
                </div>
                <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/10">
                  <span className="text-[9px] font-black text-red-300 uppercase block mb-1">Tax Deduct</span>
                  <div className="font-bold text-sm text-red-400">-{results.severanceTax.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Expanded Severance Explanation */}
          <section className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 bg-emerald-50 px-8 py-4 rounded-bl-[2.5rem] font-black text-emerald-700 text-[10px] tracking-widest uppercase">Statutory Protocol</div>
            <h3 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 pr-20">Severance Analytics</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-10">Proclamation No. 1156/2019 Implementation</p>
            
            <div className="relative space-y-8 before:absolute before:left-7 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              <div className="relative pl-16 group">
                <div className="absolute left-4 top-0 w-6 h-6 rounded-full bg-emerald-100 border-4 border-white shadow-sm ring-1 ring-emerald-500 group-hover:scale-125 transition-transform"></div>
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight mb-1">Step 1: Tenure Valuation (Art. 39)</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Your length of service determines payable days. You have served <strong>{results.serviceYearsTotal.toFixed(2)} years</strong>.
                </p>
              </div>

              <div className="relative pl-16 group">
                <div className="absolute left-4 top-0 w-6 h-6 rounded-full bg-indigo-100 border-4 border-white shadow-sm ring-1 ring-indigo-500 group-hover:scale-125 transition-transform"></div>
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight mb-1">Step 2: Accrual Formula</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  30 days for the first year + 10 days for each additional year. 
                  Total Accrued: <span className="text-indigo-600 font-black">{(results.severancePay / (results.grossMonthly/30)).toFixed(1)} Days</span>.
                </p>
              </div>

              <div className="relative pl-16 group">
                <div className="absolute left-4 top-0 w-6 h-6 rounded-full bg-orange-100 border-4 border-white shadow-sm ring-1 ring-orange-500 group-hover:scale-125 transition-transform"></div>
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight mb-1">Step 3: Daily Wage Base</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Monthly Gross Salary / 30. Your rate: <span className="text-orange-600 font-black">{(results.grossMonthly/30).toFixed(2)} ETB/Day</span>.
                </p>
              </div>

              <div className="relative pl-16 group">
                <div className="absolute left-4 top-0 w-6 h-6 rounded-full bg-red-100 border-4 border-white shadow-sm ring-1 ring-red-500 group-hover:scale-125 transition-transform"></div>
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight mb-1">Step 4: Statutory Deductions (979/2016)</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  The gross amount <span className="font-black text-slate-700">({results.severancePay.toLocaleString()} ETB)</span> is subject to progressive income tax before payout.
                </p>
              </div>
            </div>
            
            <div className="mt-12 p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all duration-700"></div>
               <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                 <div className="text-center md:text-left">
                   <h5 className="font-black text-white text-xl mb-1">Final Settlement</h5>
                   <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.3em]">Total Net Severance Payable</p>
                 </div>
                 <div className="text-center md:text-right">
                    <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">{results.netSeverancePay.toLocaleString()}</span>
                    <span className="text-lg font-bold text-emerald-500 ml-3 uppercase">ETB</span>
                 </div>
               </div>
            </div>
          </section>

          {/* Secondary Financial Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Pension (7%)</span>
              <div className="text-2xl md:text-3xl font-black text-blue-600 tracking-tighter">-{results.pensionContribution.toLocaleString()}</div>
            </div>
            
            <div className="relative bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Income Tax</span>
                <button 
                  onMouseEnter={() => setShowTaxInfo(true)} 
                  onMouseLeave={() => setShowTaxInfo(false)}
                  onClick={() => setShowTaxInfo(!showTaxInfo)}
                  className="bg-slate-100 hover:bg-emerald-100 text-slate-400 hover:text-emerald-600 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg>
                </button>
              </div>
              <div className="text-2xl md:text-3xl font-black text-red-600 tracking-tighter">-{results.incomeTax.toLocaleString()}</div>
              {showTaxInfo && <TaxBracketTooltip />}
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Leave Value</span>
              <div className="text-2xl md:text-3xl font-black text-emerald-600 tracking-tighter">+{results.leaveNetImpact.toLocaleString()}</div>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Net Per Day</span>
              <div className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter">{(results.netMonthly/30).toFixed(0)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <section className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-slate-100">
              <h3 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-tight">Monthly Ledger</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center py-4 border-b border-slate-50">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Base Gross</span>
                  <span className="font-black text-slate-800 text-xl">{results.grossMonthly.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Pension Deduct</span>
                    <span className="text-[9px] text-blue-500 font-black uppercase tracking-tighter">Statutory 7%</span>
                  </div>
                  <span className="font-black text-blue-600">-{results.pensionContribution.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-slate-50">
                   <div className="flex flex-col">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Income Tax</span>
                    <span className="text-[9px] text-red-500 font-black uppercase tracking-tighter">Bracket: {results.taxBracketPercentage}%</span>
                  </div>
                  <span className="font-black text-red-600">-{results.incomeTax.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between items-center py-8 mt-6 bg-slate-900 text-white px-8 md:px-10 rounded-[2.5rem] shadow-2xl transition-all hover:scale-[1.01]">
                  <span className="font-black text-sm md:text-lg uppercase tracking-widest">Net Final</span>
                  <span className="font-black text-3xl md:text-4xl tracking-tight">{results.netMonthly.toLocaleString()} <span className="text-sm opacity-40 font-bold">ETB</span></span>
                </div>
              </div>
            </section>
          </div>

          <footer className="text-center text-slate-400 text-[10px] py-10 px-6 border-t border-slate-100 leading-relaxed max-w-2xl mx-auto space-y-4 font-bold tracking-widest uppercase opacity-50">
            <p>Calculated using Ethiopian Proclamation No. 979/2016 and Labor Proclamation No. 1156/2019.</p>
            <p>Built for Accuracy. Consult legal counsel for critical HR decisions.</p>
          </footer>
        </div>
      </main>
      
      {!hasCalculated && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-white px-10 py-5 rounded-full border-4 border-emerald-600 shadow-2xl text-[10px] font-black uppercase tracking-widest animate-bounce pointer-events-none z-50 text-emerald-800 shadow-emerald-200 ring-8 ring-emerald-500/10">
          Ready to Calculate?
        </div>
      )}
    </div>
  );
};

export default App;
