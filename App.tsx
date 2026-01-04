
import React, { useState, useMemo, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { 
  SalaryInputs, SalaryFrequency, TaxBreakdown, ChatMessage 
} from './types';
import { calculateEthiopianTax } from './services/taxService';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const App: React.FC = () => {
  const [inputs, setInputs] = useState<SalaryInputs>({
    grossSalary: 25000,
    frequency: SalaryFrequency.MONTHLY,
    leaveDays: 20,
    yearsWorked: 3,
    monthsWorked: 0,
  });

  const [hasCalculated, setHasCalculated] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentChatInput, setCurrentChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const resultsRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => calculateEthiopianTax(inputs), [inputs]);

  const chartData = [
    { name: 'Net Pay', value: results.netMonthly, color: '#10b981' },
    { name: 'Income Tax', value: results.incomeTax, color: '#ef4444' },
    { name: 'Pension (7%)', value: results.pensionContribution, color: '#3b82f6' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: name === 'frequency' ? value : Math.max(0, Number(value))
    }));
  };

  const onCalculate = () => {
    setHasCalculated(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const askGemini = async () => {
    if (!currentChatInput.trim()) return;
    
    const userMsg = currentChatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setCurrentChatInput('');
    setIsAiLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `I am using an Ethiopian Tax Calculator. 
                  My Gross Salary is ${results.grossMonthly} ETB. 
                  Calculated Net Pay is ${results.netMonthly} ETB. 
                  Service Duration: ${inputs.yearsWorked} years and ${inputs.monthsWorked} months.
                  Calculated Gross Severance: ${results.severancePay} ETB.
                  Calculated Net Severance (After Tax): ${results.netSeverancePay} ETB.
                  User Question: ${userMsg}`,
        config: {
          systemInstruction: 'You are an expert on Ethiopian labor law (Proclamation 1156/2019) and tax regulations (Proclamation 979/2016). Provide specific, authoritative, yet concise answers about salary, severance pay, and employee rights.'
        }
      });
      
      setChatMessages(prev => [...prev, { role: 'model', text: response.text || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      console.error(error);
      setChatMessages(prev => [...prev, { role: 'model', text: "Error connecting to the tax assistant." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-12 transition-all duration-700 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-emerald-700 text-white py-8 shadow-lg">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Ethiopia Salary & Tax Calculator</h1>
            <p className="text-emerald-100 mt-1 uppercase text-xs tracking-widest font-semibold">Proclamation 979/2016 & 1156/2019</p>
          </div>
          <div className="bg-emerald-600/50 px-4 py-2 rounded-lg border border-emerald-500/30 backdrop-blur-sm">
            <span className="text-xs uppercase tracking-wider opacity-75">Current Tax Year</span>
            <div className="font-mono text-lg font-bold">2024 / 2025</div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Salary & Service
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Gross Salary (ETB)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">ETB</span>
                  <input 
                    type="number" 
                    name="grossSalary"
                    value={inputs.grossSalary}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Frequency</label>
                  <select 
                    name="frequency"
                    value={inputs.frequency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-white"
                  >
                    <option value={SalaryFrequency.MONTHLY}>Monthly</option>
                    <option value={SalaryFrequency.ANNUAL}>Annual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Leave Days</label>
                  <input 
                    type="number" 
                    name="leaveDays"
                    value={inputs.leaveDays}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <label className="block text-sm font-bold text-slate-700 mb-2">Duration of Service</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Years</label>
                    <input 
                      type="number" 
                      name="yearsWorked"
                      value={inputs.yearsWorked}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Months</label>
                    <input 
                      type="number" 
                      name="monthsWorked"
                      value={inputs.monthsWorked}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={onCalculate}
                className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                Calculate Results
              </button>
            </div>
          </section>

          {/* AI Assistance Card */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[350px]">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.464 15.05a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM15.05 6.464a1 1 0 010-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414 0z"></path></svg>
              Legal Assistant
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
              {chatMessages.length === 0 && (
                <div className="text-center py-8 text-slate-400 italic text-sm leading-relaxed">
                  Ask about severance taxes, leave rights, or Proclamation 1156/2019.
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-emerald-50 text-emerald-900 self-end ml-4' : 'bg-slate-100 text-slate-800 self-start mr-4'}`}>
                  {msg.text}
                </div>
              ))}
              {isAiLoading && (
                <div className="bg-slate-100 p-3 rounded-lg text-sm animate-pulse w-2/3">Thinking...</div>
              )}
            </div>
            <div className="flex gap-2">
              <input 
                value={currentChatInput}
                onChange={(e) => setCurrentChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askGemini()}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="How is severance taxed?"
              />
              <button onClick={askGemini} disabled={isAiLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Results */}
        <div className={`lg:col-span-8 flex flex-col gap-8 transition-all duration-1000 ${hasCalculated ? 'opacity-100 translate-y-0' : 'opacity-30 blur-[2px] pointer-events-none grayscale'}`} ref={resultsRef}>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-600 p-8 rounded-3xl shadow-xl border border-emerald-500 text-white transform transition-transform hover:scale-[1.02]">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-100 block mb-2 opacity-80">Monthly Net Take-Home</span>
              <div className="text-5xl font-black mb-2">{results.netMonthly.toLocaleString()} <span className="text-2xl font-normal opacity-70">ETB</span></div>
              <div className="flex items-center gap-2 mt-4 text-emerald-100 text-sm bg-emerald-700/40 p-3 rounded-xl border border-emerald-500/30">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path></svg>
                Effective Rate: {((results.incomeTax / results.grossMonthly) * 100).toFixed(1)}% Tax
              </div>
            </div>

            <div className="bg-indigo-700 p-8 rounded-3xl shadow-xl border border-indigo-600 text-white transform transition-transform hover:scale-[1.02] group">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-100 block opacity-80">Final Net Severance</span>
                <div className="relative">
                  <svg className="w-5 h-5 text-indigo-300 cursor-help" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                  <div className="absolute bottom-full right-0 mb-3 w-72 p-4 bg-slate-900 text-white text-[11px] rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all z-50 border border-slate-700 pointer-events-none">
                    <p className="font-bold text-indigo-400 mb-2">How Severance is Calculated & Taxed</p>
                    <ul className="list-disc pl-4 space-y-1.5 text-slate-300 leading-relaxed">
                      <li>30 days' salary for 1st year of service.</li>
                      <li>10 days for each additional year thereafter.</li>
                      <li>Severance is <span className="text-red-400 font-bold">taxable income</span> under Proc. 979/2016 and is subjected to standard monthly tax brackets.</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="text-5xl font-black mb-2">{results.netSeverancePay.toLocaleString()} <span className="text-2xl font-normal opacity-70">ETB</span></div>
              <div className="mt-4 flex flex-col gap-1">
                <div className="flex justify-between text-xs text-indigo-200 border-b border-indigo-500/30 pb-1">
                  <span>Gross Severance:</span>
                  <span className="font-mono">{results.severancePay.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between text-xs text-indigo-200 pt-1">
                  <span>Severance Tax:</span>
                  <span className="font-mono text-red-300">-{results.severanceTax.toLocaleString()} ETB</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Monthly Gross</span>
               <div className="text-xl font-bold text-slate-800">{results.grossMonthly.toLocaleString()} ETB</div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Pension (7%)</span>
               <div className="text-xl font-bold text-blue-600">{results.pensionContribution.toLocaleString()} ETB</div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Annual Leave Days</span>
               <div className="text-xl font-bold text-slate-800">{inputs.leaveDays} Days</div>
            </div>
          </div>

          {/* Leave Impact Section */}
          <section className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-6 rounded-2xl border border-emerald-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-200 p-3 rounded-full text-emerald-700">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-emerald-900">Annual Leave Value</h3>
                <p className="text-emerald-700 text-sm">Monetary take-home value of your leave entitlement.</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-emerald-600 uppercase tracking-widest">Net Value</div>
              <div className="text-3xl font-black text-emerald-800">+{results.leaveNetImpact.toLocaleString()} ETB</div>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">Net Daily Rate: { (results.netMonthly / 30).toFixed(2) } ETB</p>
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex justify-between items-center">
                Tax & Pension Allocation
                <span className="text-xs bg-slate-100 px-2 py-1 rounded-lg text-slate-500 font-medium">Monthly Breakdown</span>
              </h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value">
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} formatter={(value: number) => [`${value.toFixed(2)} ETB`, '']} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Payment Ledger</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between py-3 border-b border-slate-50">
                  <span className="text-slate-500">Gross Salary (Monthly Base)</span>
                  <span className="font-bold text-slate-800">{results.grossMonthly.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-slate-500">Pension Contribution</span>
                    <span className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter">7% Statutory Deduct</span>
                  </div>
                  <span className="font-bold text-blue-600">-{results.pensionContribution.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-50">
                   <div className="flex flex-col">
                    <span className="text-slate-500">Income Tax (PIT)</span>
                    <span className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">Bracket: {results.taxBracketPercentage}%</span>
                  </div>
                  <span className="font-bold text-red-600">-{results.incomeTax.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between py-4 mt-2 bg-emerald-50 px-4 rounded-xl">
                  <span className="text-emerald-900 font-black text-lg uppercase">Final Net Pay</span>
                  <span className="font-black text-emerald-600 text-2xl">{results.netMonthly.toLocaleString()} ETB</span>
                </div>
              </div>
            </section>
          </div>

          <footer className="text-center text-slate-400 text-[10px] py-6 px-6 border-t border-slate-100 leading-relaxed italic max-w-2xl mx-auto">
            Calculations are based on the Ethiopian Income Tax Proclamation No. 979/2016 and Labor Proclamation No. 1156/2019. This tool provides estimates for general guidance. Actual payroll may vary based on specific non-taxable allowances, regional variations, or unique employment contracts.
          </footer>
        </div>
      </main>
      
      {!hasCalculated && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-8 py-4 rounded-full border border-emerald-100 shadow-2xl text-emerald-800 text-sm font-bold animate-pulse pointer-events-none ring-4 ring-emerald-500/10">
          Enter details and click "Calculate Results" 🚀
        </div>
      )}
    </div>
  );
};

export default App;
