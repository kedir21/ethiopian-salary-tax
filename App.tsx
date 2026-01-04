import React, { useState, useMemo, useRef } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { 
  SalaryInputs, SalaryFrequency 
} from './types.ts';
import { calculateEthiopianTax } from './services/taxService.ts';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<SalaryInputs>({
    grossSalary: 25000,
    frequency: SalaryFrequency.MONTHLY,
    leaveDays: 20,
    yearsWorked: 3,
    monthsWorked: 0,
  });

  const [hasCalculated, setHasCalculated] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => calculateEthiopianTax(inputs), [inputs]);

  const chartData = [
    { name: 'Net Pay', value: results.netMonthly, color: '#10b981' },
    { name: 'Income Tax', value: results.incomeTax, color: '#ef4444' },
    { name: 'Pension (7%)', value: results.pensionContribution, color: '#3b82f6' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: Math.max(0, Number(value))
    }));
  };

  const onCalculate = () => {
    setHasCalculated(true);
    // Add haptic feedback if available
    if (window.navigator.vibrate) window.navigator.vibrate(10);
    
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

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
             <div className="font-mono text-xl font-bold">Monthly ETB</div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 -mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* Input Column */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 sticky top-8 transition-all hover:shadow-emerald-900/5">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-xl text-emerald-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              Income Details
            </h2>
            
            <div className="space-y-6">
              <div className="group">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-emerald-600 transition-colors">Gross Monthly Salary</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-lg">ETB</span>
                  <input 
                    type="number" 
                    name="grossSalary"
                    value={inputs.grossSalary}
                    onChange={handleInputChange}
                    className="w-full pl-14 pr-4 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-8 focus:ring-emerald-500/5 outline-none transition-all font-black text-xl shadow-sm"
                    placeholder="e.g. 35000"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-emerald-600 transition-colors">Annual Leave Days</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <input 
                    type="number" 
                    name="leaveDays"
                    value={inputs.leaveDays}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-8 focus:ring-emerald-500/5 outline-none transition-all font-black text-xl shadow-sm"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50">
                <label className="block text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4 text-center">Service History</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="group text-center">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Years</label>
                    <input 
                      type="number" 
                      name="yearsWorked"
                      value={inputs.yearsWorked}
                      onChange={handleInputChange}
                      className="w-full px-2 py-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-black text-xl text-center shadow-sm"
                    />
                  </div>
                  <div className="group text-center">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Months</label>
                    <input 
                      type="number" 
                      name="monthsWorked"
                      value={inputs.monthsWorked}
                      onChange={handleInputChange}
                      className="w-full px-2 py-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-black text-xl text-center shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={onCalculate}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-900/10 transition-all active:scale-[0.97] flex items-center justify-center gap-3 group"
              >
                Calculate Results
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
              </button>
            </div>
          </section>
        </div>

        {/* Results Column */}
        <div className={`lg:col-span-8 flex flex-col gap-6 md:gap-8 transition-all duration-1000 ${hasCalculated ? 'opacity-100 translate-y-0 scale-100' : 'opacity-20 blur-xl pointer-events-none scale-95'}`} ref={resultsRef}>
          
          {/* Summary Cards Grid */}
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
                <span className="text-xs font-black uppercase">Monthly Standard</span>
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

          {/* Logic Explanation Section */}
          <section className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 bg-emerald-50 px-8 py-4 rounded-bl-[2.5rem] font-black text-emerald-700 text-[10px] tracking-[0.2em] uppercase">Statutory Protocol</div>
            <h3 className="text-2xl md:text-3xl font-black text-slate-800 mb-8 pr-20">How Severance is Derived</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10">
              <div className="group">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-xl mb-6 shadow-inner transition-transform group-hover:scale-110">01</div>
                <h4 className="font-black text-slate-800 mb-3 text-lg uppercase tracking-tight">Tenure Accrual</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Per <strong>Art. 39 of Proclamation 1156/2019</strong>, you are entitled to 30 days for Year 1, plus 10 days for each subsequent year. Total: <strong>{results.serviceYearsTotal.toFixed(2)} years</strong>.
                </p>
              </div>

              <div className="group">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl mb-6 shadow-inner transition-transform group-hover:scale-110">02</div>
                <h4 className="font-black text-slate-800 mb-3 text-lg uppercase tracking-tight">Valuation</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Your daily rate is calculated as monthly gross / 30. Your total gross severance is this rate multiplied by the days accrued.
                </p>
              </div>

              <div className="group">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center font-black text-xl mb-6 shadow-inner transition-transform group-hover:scale-110">03</div>
                <h4 className="font-black text-slate-800 mb-3 text-lg uppercase tracking-tight">Tax Application</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Under <strong>Proclamation 979/2016</strong>, severance is taxable. The lump sum is passed through the 7-bracket progressive schedule.
                </p>
              </div>
            </div>
            
            <div className="mt-10 p-6 md:p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
               <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                 <div className="text-center md:text-left">
                   <h5 className="font-black text-slate-800 text-lg mb-1">Mathematical Formula</h5>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Net = (Daily Rate × Days) - PIT</p>
                 </div>
                 <div className="flex flex-wrap justify-center gap-3">
                   <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-200 text-center min-w-[100px]">
                     <span className="text-[9px] block opacity-40 font-bold mb-1">DAYS ACCRUED</span>
                     <span className="font-black text-slate-700">{(results.severancePay / (results.grossMonthly/30)).toFixed(1)} Days</span>
                   </div>
                   <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-200 text-center min-w-[100px]">
                     <span className="text-[9px] block opacity-40 font-bold mb-1">DAILY RATE</span>
                     <span className="font-black text-slate-700">{(results.grossMonthly/30).toFixed(0)} ETB</span>
                   </div>
                   <div className="bg-slate-900 text-white px-6 py-3 rounded-xl shadow-xl text-center">
                     <span className="text-[9px] block opacity-40 font-bold mb-1 text-slate-400 uppercase">Final Net</span>
                     <span className="font-black">{results.netSeverancePay.toLocaleString()} ETB</span>
                   </div>
                 </div>
               </div>
            </div>
          </section>

          {/* Secondary Financial Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Pension (7%)</span>
              <div className="text-2xl md:text-3xl font-black text-blue-600 tracking-tighter">-{results.pensionContribution.toLocaleString()}</div>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Income Tax</span>
              <div className="text-2xl md:text-3xl font-black text-red-600 tracking-tighter">-{results.incomeTax.toLocaleString()}</div>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Leave Impact</span>
              <div className="text-2xl md:text-3xl font-black text-emerald-600 tracking-tighter">+{results.leaveNetImpact.toLocaleString()}</div>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Net Per Day</span>
              <div className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter">{(results.netMonthly/30).toFixed(0)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <section className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-slate-100">
              <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center justify-between">
                Allocations
                <span className="text-[10px] bg-emerald-50 px-3 py-1.5 rounded-full text-emerald-600 font-black uppercase tracking-widest">Monthly Graph</span>
              </h3>
              <div className="h-[300px] md:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value">
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                    </Pie>
                    <Tooltip 
                      contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '20px', fontWeight: 'bold'}} 
                      formatter={(value: number) => [`${value.toFixed(2)} ETB`, '']} 
                    />
                    <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{paddingTop: '25px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase'}}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>

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
                  <span className="font-black text-sm md:text-lg uppercase tracking-[0.2em]">Net Final</span>
                  <span className="font-black text-3xl md:text-4xl tracking-tight">{results.netMonthly.toLocaleString()} <span className="text-sm opacity-40 font-bold">ETB</span></span>
                </div>
              </div>
            </section>
          </div>

          <footer className="text-center text-slate-400 text-[10px] py-10 px-6 border-t border-slate-100 leading-relaxed max-w-2xl mx-auto space-y-4 font-bold tracking-[0.2em] uppercase opacity-50">
            <p>Calculated using Ethiopian Proclamation No. 979/2016 and Labor Proclamation No. 1156/2019.</p>
            <p>Built for Accuracy. Consult legal counsel for critical HR decisions.</p>
          </footer>
        </div>
      </main>
      
      {!hasCalculated && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-white px-10 py-5 rounded-full border-4 border-emerald-600 shadow-2xl text-[10px] font-black uppercase tracking-[0.3em] animate-bounce pointer-events-none z-50 text-emerald-800 shadow-emerald-200 ring-8 ring-emerald-500/10">
          Ready to Calculate?
        </div>
      )}
    </div>
  );
};

export default App;