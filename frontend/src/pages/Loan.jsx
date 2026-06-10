import { useState, useMemo } from "react";
import { Calculator, Banknote, Building2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

const banks = [
  { name: "SBI Home Loans", rate: "8.40%" },
  { name: "HDFC Bank", rate: "8.50%" },
  { name: "ICICI Bank", rate: "8.60%" },
  { name: "Axis Bank", rate: "8.75%" },
  { name: "LIC Housing", rate: "8.45%" },
  { name: "Bajaj Housing", rate: "8.55%" },
];

const Loan = () => {
  const [amount, setAmount] = useState(5000000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const emi = useMemo(() => {
    const P = Number(amount), R = Number(rate) / 12 / 100, N = Number(tenure) * 12;
    if (!P || !R || !N) return 0;
    const v = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    return Math.round(v);
  }, [amount, rate, tenure]);

  const total = emi * tenure * 12;
  const interest = total - amount;

  const [form, setForm] = useState({ name: "", mobile: "", email: "", occupation: "", monthly_income: "", property_value: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/leads", {
        ...form,
        lead_type: "loan",
        monthly_income: Number(form.monthly_income) || null,
        property_value: Number(form.property_value) || null,
      });
      toast.success("Application submitted! Our loan expert will call you within 24 hours.");
      setForm({ name: "", mobile: "", email: "", occupation: "", monthly_income: "", property_value: "" });
    } catch {
      toast.error("Submission failed. Try again.");
    }
    setBusy(false);
  };

  const eligibility = useMemo(() => {
    const inc = Number(form.monthly_income) || 0;
    return Math.round(inc * 60 * 0.5); // simple rough estimate
  }, [form.monthly_income]);

  return (
    <div className="bg-white">
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="eyebrow text-gold mb-3">Home Loans</div>
          <h1 className="font-serif text-4xl sm:text-5xl mb-4">Get your dream home financed</h1>
          <p className="text-white/70 max-w-2xl">Loans approved in 7 days. Partner with India's leading banks at best interest rates.</p>
        </div>
      </section>

      {/* EMI CALCULATOR */}
      <section className="py-16" data-testid="emi-calculator-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10">
          <div className="bg-surface p-8 border-l-2 border-gold">
            <div className="flex items-center gap-3 mb-6">
              <Calculator className="w-7 h-7 text-gold" />
              <h2 className="font-serif text-2xl text-navy">EMI Calculator</h2>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-xs uppercase tracking-widest text-ink-muted font-semibold">Loan Amount: ₹ {Number(amount).toLocaleString("en-IN")}</label>
                <input type="range" min="500000" max="50000000" step="100000" value={amount} onChange={(e) => setAmount(e.target.value)} data-testid="emi-amount" className="w-full accent-navy mt-2" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-ink-muted font-semibold">Interest Rate: {rate}%</label>
                <input type="range" min="6" max="14" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} data-testid="emi-rate" className="w-full accent-navy mt-2" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-ink-muted font-semibold">Tenure: {tenure} years</label>
                <input type="range" min="5" max="30" step="1" value={tenure} onChange={(e) => setTenure(e.target.value)} data-testid="emi-tenure" className="w-full accent-navy mt-2" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-line">
              <div><div className="text-xs uppercase text-ink-muted">EMI</div><div className="font-serif text-xl text-navy" data-testid="emi-result">₹ {emi.toLocaleString("en-IN")}</div></div>
              <div><div className="text-xs uppercase text-ink-muted">Interest</div><div className="font-serif text-xl text-navy">₹ {Math.round(interest / 100000)}L</div></div>
              <div><div className="text-xs uppercase text-ink-muted">Total</div><div className="font-serif text-xl text-navy">₹ {Math.round(total / 100000)}L</div></div>
            </div>
          </div>

          {/* APPLICATION */}
          <div className="bg-white border border-line p-8" data-testid="loan-app-section">
            <div className="flex items-center gap-3 mb-6">
              <Banknote className="w-7 h-7 text-gold" />
              <h2 className="font-serif text-2xl text-navy">Apply for Home Loan</h2>
            </div>
            <form onSubmit={submit} className="space-y-3">
              <input required placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="loan-name" className="w-full border border-line bg-surface px-4 py-3 text-sm" />
              <input required placeholder="Mobile Number" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} data-testid="loan-mobile" className="w-full border border-line bg-surface px-4 py-3 text-sm" />
              <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="loan-email" className="w-full border border-line bg-surface px-4 py-3 text-sm" />
              <input placeholder="Occupation" value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} data-testid="loan-occupation" className="w-full border border-line bg-surface px-4 py-3 text-sm" />
              <input type="number" placeholder="Monthly Income (₹)" value={form.monthly_income} onChange={(e) => setForm({ ...form, monthly_income: e.target.value })} data-testid="loan-income" className="w-full border border-line bg-surface px-4 py-3 text-sm" />
              <input type="number" placeholder="Property Value (₹)" value={form.property_value} onChange={(e) => setForm({ ...form, property_value: e.target.value })} data-testid="loan-pv" className="w-full border border-line bg-surface px-4 py-3 text-sm" />
              {eligibility > 0 && (
                <div className="bg-surface border-l-2 border-gold p-3 text-sm" data-testid="loan-eligibility">
                  <span className="text-ink-muted">Estimated eligibility: </span>
                  <strong className="text-navy">₹ {eligibility.toLocaleString("en-IN")}</strong>
                </div>
              )}
              <button disabled={busy} data-testid="loan-submit-btn" className="w-full bg-navy text-white py-3 hover:bg-navy-hover disabled:opacity-50">
                {busy ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* BANK PARTNERS */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="eyebrow mb-3">Bank Partners</div>
            <h2 className="font-serif text-3xl text-navy">Compare Interest Rates</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {banks.map((b, i) => (
              <div key={i} className="bg-white border border-line p-5 text-center hover:border-gold transition-colors" data-testid={`bank-card-${i}`}>
                <Building2 className="w-7 h-7 text-gold mx-auto mb-2" />
                <div className="font-serif text-sm text-navy mb-1">{b.name}</div>
                <div className="text-xs text-ink-muted">From {b.rate}*</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-center text-ink-muted mt-6">*Indicative rates. Actual rates may vary based on applicant profile.</div>
        </div>
      </section>
    </div>
  );
};

export default Loan;
