import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Receipt, Scale, Landmark, PieChart, Home } from 'lucide-react';
import './Calculators.css';

type CalcTab = 'income-tax' | 'gst' | 'emi' | 'tds' | 'hra';

const tabs: { id: CalcTab; name: string; icon: any }[] = [
  { id: 'income-tax', name: 'Income Tax', icon: Receipt },
  { id: 'gst', name: 'GST', icon: Scale },
  { id: 'emi', name: 'EMI / Loan', icon: Landmark },
  { id: 'tds', name: 'TDS Rates', icon: PieChart },
  { id: 'hra', name: 'HRA', icon: Home },
];

// Income Tax Slabs FY 2025-26
const newRegimeSlabs = [
  { min: 0, max: 400000, rate: 0 },
  { min: 400000, max: 800000, rate: 5 },
  { min: 800000, max: 1200000, rate: 10 },
  { min: 1200000, max: 1600000, rate: 15 },
  { min: 1600000, max: 2000000, rate: 20 },
  { min: 2000000, max: 2400000, rate: 25 },
  { min: 2400000, max: Infinity, rate: 30 },
];
const oldRegimeSlabs = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 5 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Infinity, rate: 30 },
];

function calcTax(income: number, slabs: typeof newRegimeSlabs) {
  let tax = 0;
  for (const slab of slabs) {
    if (income <= slab.min) break;
    const taxable = Math.min(income, slab.max) - slab.min;
    tax += (taxable * slab.rate) / 100;
  }
  return tax;
}

function IncomeTaxCalc() {
  const [income, setIncome] = useState(1200000);
  const [deductions, setDeductions] = useState(150000);

  const taxableOld = Math.max(0, income - deductions);
  const taxableNew = income;
  const taxOld = calcTax(taxableOld, oldRegimeSlabs);
  const taxNew = calcTax(taxableNew, newRegimeSlabs);
  const cessOld = taxOld * 0.04;
  const cessNew = taxNew * 0.04;

  return (
    <div className="calc-form">
      <h3><Receipt size={20}/> Income Tax Calculator (FY 2025-26)</h3>
      <div className="calc-inputs">
        <div className="form-group">
          <label>Annual Gross Income (₹)</label>
          <input type="number" value={income} onChange={e => setIncome(+e.target.value)} />
        </div>
        <div className="form-group">
          <label>Total Deductions — Old Regime (₹)</label>
          <input type="number" value={deductions} onChange={e => setDeductions(+e.target.value)} />
          <small className="text-muted">80C, 80D, HRA, etc.</small>
        </div>
      </div>
      <div className="comparison-grid">
        <motion.div className="regime-card old" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}}>
          <h4>Old Regime</h4>
          <div className="regime-row"><span>Gross Income</span><strong>₹{income.toLocaleString('en-IN')}</strong></div>
          <div className="regime-row"><span>Deductions</span><strong>- ₹{deductions.toLocaleString('en-IN')}</strong></div>
          <div className="regime-row"><span>Taxable Income</span><strong>₹{taxableOld.toLocaleString('en-IN')}</strong></div>
          <div className="regime-row"><span>Tax</span><strong>₹{Math.round(taxOld).toLocaleString('en-IN')}</strong></div>
          <div className="regime-row"><span>Cess (4%)</span><strong>₹{Math.round(cessOld).toLocaleString('en-IN')}</strong></div>
          <div className="regime-total"><span>Total Tax</span><strong>₹{Math.round(taxOld + cessOld).toLocaleString('en-IN')}</strong></div>
        </motion.div>
        <motion.div className="regime-card new" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}}>
          <h4>New Regime</h4>
          <div className="regime-row"><span>Gross Income</span><strong>₹{income.toLocaleString('en-IN')}</strong></div>
          <div className="regime-row"><span>Deductions</span><strong>N/A</strong></div>
          <div className="regime-row"><span>Taxable Income</span><strong>₹{taxableNew.toLocaleString('en-IN')}</strong></div>
          <div className="regime-row"><span>Tax</span><strong>₹{Math.round(taxNew).toLocaleString('en-IN')}</strong></div>
          <div className="regime-row"><span>Cess (4%)</span><strong>₹{Math.round(cessNew).toLocaleString('en-IN')}</strong></div>
          <div className="regime-total"><span>Total Tax</span><strong>₹{Math.round(taxNew + cessNew).toLocaleString('en-IN')}</strong></div>
        </motion.div>
      </div>
      <div className={`regime-verdict ${(taxOld + cessOld) < (taxNew + cessNew) ? 'old-wins' : 'new-wins'}`}>
        💡 <strong>{(taxOld + cessOld) < (taxNew + cessNew) ? 'Old Regime' : 'New Regime'}</strong> saves you{' '}
        <strong>₹{Math.abs(Math.round((taxOld + cessOld) - (taxNew + cessNew))).toLocaleString('en-IN')}</strong> more!
      </div>
    </div>
  );
}

function GSTCalc() {
  const [amount, setAmount] = useState(10000);
  const [rate, setRate] = useState(18);
  const [isInclusive, setIsInclusive] = useState(false);

  const baseAmount = isInclusive ? amount / (1 + rate / 100) : amount;
  const gstAmount = baseAmount * (rate / 100);
  const totalAmount = baseAmount + gstAmount;
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;

  return (
    <div className="calc-form">
      <h3><Scale size={20}/> GST Calculator</h3>
      <div className="calc-inputs">
        <div className="form-group">
          <label>Amount (₹)</label>
          <input type="number" value={amount} onChange={e => setAmount(+e.target.value)} />
        </div>
        <div className="form-group">
          <label>GST Rate (%)</label>
          <div className="rate-buttons">
            {[5, 12, 18, 28].map(r => (
              <button key={r} className={`rate-btn ${rate === r ? 'active' : ''}`} onClick={() => setRate(r)}>{r}%</button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="toggle-label">
            <input type="checkbox" checked={isInclusive} onChange={e => setIsInclusive(e.target.checked)} />
            <span>GST Inclusive</span>
          </label>
        </div>
      </div>
      <motion.div className="result-card" initial={{opacity:0}} animate={{opacity:1}}>
        <div className="result-row"><span>Base Amount</span><strong>₹{Math.round(baseAmount).toLocaleString('en-IN')}</strong></div>
        <div className="result-row"><span>CGST ({rate/2}%)</span><strong>₹{Math.round(cgst).toLocaleString('en-IN')}</strong></div>
        <div className="result-row"><span>SGST ({rate/2}%)</span><strong>₹{Math.round(sgst).toLocaleString('en-IN')}</strong></div>
        <div className="result-row"><span>IGST ({rate}%)</span><strong>₹{Math.round(gstAmount).toLocaleString('en-IN')}</strong></div>
        <div className="result-total"><span>Total Amount</span><strong>₹{Math.round(totalAmount).toLocaleString('en-IN')}</strong></div>
      </motion.div>
    </div>
  );
}

function EMICalc() {
  const [principal, setPrincipal] = useState(2000000);
  const [rateVal, setRateVal] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const monthlyRate = rateVal / 12 / 100;
  const months = tenure * 12;
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;

  return (
    <div className="calc-form">
      <h3><Landmark size={20}/> EMI / Loan Calculator</h3>
      <div className="calc-inputs">
        <div className="form-group">
          <label>Loan Amount (₹)</label>
          <input type="number" value={principal} onChange={e => setPrincipal(+e.target.value)} />
          <input type="range" min="100000" max="50000000" step="100000" value={principal} onChange={e => setPrincipal(+e.target.value)} className="range-slider" />
        </div>
        <div className="form-group">
          <label>Interest Rate (% p.a.)</label>
          <input type="number" step="0.1" value={rateVal} onChange={e => setRateVal(+e.target.value)} />
          <input type="range" min="1" max="20" step="0.1" value={rateVal} onChange={e => setRateVal(+e.target.value)} className="range-slider" />
        </div>
        <div className="form-group">
          <label>Tenure (Years)</label>
          <input type="number" value={tenure} onChange={e => setTenure(+e.target.value)} />
          <input type="range" min="1" max="30" value={tenure} onChange={e => setTenure(+e.target.value)} className="range-slider" />
        </div>
      </div>
      <motion.div className="result-card" initial={{opacity:0}} animate={{opacity:1}}>
        <div className="emi-highlight">
          <small>Monthly EMI</small>
          <h2>₹{Math.round(emi).toLocaleString('en-IN')}</h2>
        </div>
        <div className="result-row"><span>Principal Amount</span><strong>₹{principal.toLocaleString('en-IN')}</strong></div>
        <div className="result-row"><span>Total Interest</span><strong>₹{Math.round(totalInterest).toLocaleString('en-IN')}</strong></div>
        <div className="result-total"><span>Total Payment</span><strong>₹{Math.round(totalPayment).toLocaleString('en-IN')}</strong></div>
        <div className="emi-bar">
          <div className="emi-bar-principal" style={{width: `${(principal / totalPayment) * 100}%`}} />
        </div>
        <div className="emi-bar-legend">
          <span><span className="dot principal" />Principal ({((principal/totalPayment)*100).toFixed(0)}%)</span>
          <span><span className="dot interest" />Interest ({((totalInterest/totalPayment)*100).toFixed(0)}%)</span>
        </div>
      </motion.div>
    </div>
  );
}

function TDSRates() {
  const tdsData = [
    { section: '192', nature: 'Salary', rate: 'As per slab', threshold: 'Basic exemption' },
    { section: '194A', nature: 'Interest (other than securities)', rate: '10%', threshold: '₹40,000' },
    { section: '194B', nature: 'Lottery / Crossword Puzzle', rate: '30%', threshold: '₹10,000' },
    { section: '194C', nature: 'Contractor — Individual/HUF', rate: '1%', threshold: '₹30,000' },
    { section: '194C', nature: 'Contractor — Others', rate: '2%', threshold: '₹30,000' },
    { section: '194H', nature: 'Commission / Brokerage', rate: '5%', threshold: '₹15,000' },
    { section: '194I', nature: 'Rent — Land/Building', rate: '10%', threshold: '₹2,40,000' },
    { section: '194I', nature: 'Rent — Plant/Machinery', rate: '2%', threshold: '₹2,40,000' },
    { section: '194J', nature: 'Professional / Technical Fees', rate: '10%', threshold: '₹30,000' },
    { section: '194N', nature: 'Cash Withdrawal', rate: '2%', threshold: '₹1 Cr' },
    { section: '194Q', nature: 'Purchase of Goods', rate: '0.1%', threshold: '₹50 Lakh' },
    { section: '194S', nature: 'Crypto / Virtual Digital Assets', rate: '1%', threshold: '₹10,000' },
  ];

  const [search, setSearch] = useState('');
  const filtered = tdsData.filter(d => d.nature.toLowerCase().includes(search.toLowerCase()) || d.section.includes(search));

  return (
    <div className="calc-form">
      <h3><PieChart size={20}/> TDS Rate Explorer (FY 2025-26)</h3>
      <div className="form-group" style={{marginBottom: '1.5rem'}}>
        <input type="text" placeholder="Search by nature or section (e.g. 194J, Rent)..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="tds-table-wrap">
        <table className="tds-table">
          <thead>
            <tr><th>Section</th><th>Nature of Payment</th><th>TDS Rate</th><th>Threshold</th></tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <motion.tr key={i} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay: i*0.03}}>
                <td><span className="section-chip">{row.section}</span></td>
                <td>{row.nature}</td>
                <td><strong>{row.rate}</strong></td>
                <td>{row.threshold}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HRACalc() {
  const [basicSalary, setBasicSalary] = useState(50000);
  const [da, setDa] = useState(5000);
  const [hraReceived, setHraReceived] = useState(20000);
  const [rentPaid, setRentPaid] = useState(15000);
  const [isMetro, setIsMetro] = useState(true);

  const basicDa = basicSalary + da;
  const a = hraReceived;
  const b = rentPaid - 0.1 * basicDa;
  const c = (isMetro ? 0.5 : 0.4) * basicDa;
  const exempt = Math.max(0, Math.min(a, b, c));
  const taxable = hraReceived - exempt;

  return (
    <div className="calc-form">
      <h3><Home size={20}/> HRA Exemption Calculator</h3>
      <div className="calc-inputs">
        <div className="form-group"><label>Basic Salary (₹/month)</label><input type="number" value={basicSalary} onChange={e => setBasicSalary(+e.target.value)} /></div>
        <div className="form-group"><label>Dearness Allowance (₹/month)</label><input type="number" value={da} onChange={e => setDa(+e.target.value)} /></div>
        <div className="form-group"><label>HRA Received (₹/month)</label><input type="number" value={hraReceived} onChange={e => setHraReceived(+e.target.value)} /></div>
        <div className="form-group"><label>Rent Paid (₹/month)</label><input type="number" value={rentPaid} onChange={e => setRentPaid(+e.target.value)} /></div>
        <div className="form-group">
          <label className="toggle-label"><input type="checkbox" checked={isMetro} onChange={e => setIsMetro(e.target.checked)} /><span>Metro City (50% of Basic+DA)</span></label>
        </div>
      </div>
      <motion.div className="result-card" initial={{opacity:0}} animate={{opacity:1}}>
        <div className="result-row"><span>Actual HRA Received</span><strong>₹{a.toLocaleString('en-IN')}</strong></div>
        <div className="result-row"><span>Rent - 10% of Basic+DA</span><strong>₹{Math.max(0,b).toLocaleString('en-IN')}</strong></div>
        <div className="result-row"><span>{isMetro ? '50%' : '40%'} of Basic+DA</span><strong>₹{c.toLocaleString('en-IN')}</strong></div>
        <div className="result-total success"><span>HRA Exempt (per month)</span><strong>₹{Math.round(exempt).toLocaleString('en-IN')}</strong></div>
        <div className="result-row"><span>Taxable HRA</span><strong>₹{Math.round(taxable).toLocaleString('en-IN')}</strong></div>
        <div className="result-row"><span>Annual Exemption</span><strong>₹{Math.round(exempt * 12).toLocaleString('en-IN')}</strong></div>
      </motion.div>
    </div>
  );
}

export default function Calculators() {
  const [activeTab, setActiveTab] = useState<CalcTab>('income-tax');

  return (
    <div className="calculators-page">
      <header className="dashboard-header">
        <h1><Calculator size={28} /> Knowledge Bank & Calculators</h1>
        <p className="text-muted">Accurate, real-time financial tools powered by latest tax slabs and rates.</p>
      </header>
      <div className="calc-tabs">
        {tabs.map(tab => (
          <button key={tab.id} className={`calc-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            <tab.icon size={18} />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.25}}>
          {activeTab === 'income-tax' && <IncomeTaxCalc />}
          {activeTab === 'gst' && <GSTCalc />}
          {activeTab === 'emi' && <EMICalc />}
          {activeTab === 'tds' && <TDSRates />}
          {activeTab === 'hra' && <HRACalc />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
