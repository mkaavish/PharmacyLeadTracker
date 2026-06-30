"use client";
import { useState } from "react";
import { DollarSign, TrendingUp, Package, Percent, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const CAPTURE_RATE = 0.20; // charge 20% of value delivered by default

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

interface Inputs {
  wasteSavings: string;
  orderingTimeSavings: string;
  stockoutReduction: string;
  overorderReduction: string;
  captureRate: string;
}

const DEFAULTS: Inputs = {
  wasteSavings: "",
  orderingTimeSavings: "",
  stockoutReduction: "",
  overorderReduction: "",
  captureRate: "20",
};

export default function PricingCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState<{ label: string; price: number; total: number }[]>([]);
  const [scenarioLabel, setScenarioLabel] = useState("");

  const n = (v: string) => parseFloat(v) || 0;

  const totalSavings =
    n(inputs.wasteSavings) +
    n(inputs.orderingTimeSavings) +
    n(inputs.stockoutReduction) +
    n(inputs.overorderReduction);

  const captureRate = Math.min(100, Math.max(0, n(inputs.captureRate))) / 100;
  const suggestedPrice = totalSavings * captureRate;

  const annualValue = totalSavings * 12;
  const annualPrice = suggestedPrice * 12;
  const roi = suggestedPrice > 0 ? ((totalSavings - suggestedPrice) / suggestedPrice) * 100 : 0;

  const tiers = [
    { label: "Conservative (10%)", price: totalSavings * 0.10 },
    { label: "Standard (20%)", price: totalSavings * 0.20 },
    { label: "Premium (30%)", price: totalSavings * 0.30 },
  ];

  const set = (field: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setInputs((prev) => ({ ...prev, [field]: e.target.value }));

  const saveScenario = () => {
    if (!scenarioLabel || suggestedPrice === 0) return;
    setSavedScenarios((prev) => [...prev, { label: scenarioLabel, price: suggestedPrice, total: totalSavings }]);
    setScenarioLabel("");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Pricing Calculator</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Enter how much RxPredict saves a pharmacy each month to calculate what you should charge.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Inputs */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold text-foreground mb-4">Monthly Savings for This Pharmacy</h2>

            <div className="space-y-4">
              <Field
                label="Inventory waste reduction"
                hint="Expired or unsold drugs they no longer lose money on"
                value={inputs.wasteSavings}
                onChange={set("wasteSavings")}
              />
              <Field
                label="Ordering time saved"
                hint="Hours saved × hourly rate of the person doing ordering"
                value={inputs.orderingTimeSavings}
                onChange={set("orderingTimeSavings")}
              />
              <Field
                label="Stockout revenue recovered"
                hint="Sales they were losing because items ran out"
                value={inputs.stockoutReduction}
                onChange={set("stockoutReduction")}
              />
              <Field
                label="Over-ordering reduction"
                hint="Excess capital they were tying up in slow-moving stock"
                value={inputs.overorderReduction}
                onChange={set("overorderReduction")}
              />
            </div>

            <div className="mt-5 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Total monthly savings</span>
                <span className="text-2xl font-bold text-green-600">{fmt(totalSavings)}/mo</span>
              </div>
            </div>
          </div>

          {/* Capture Rate */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold text-foreground mb-1">Your value capture rate</h2>
            <p className="text-xs text-muted-foreground mb-3">
              What % of the value you create do you charge? 20% is standard for SaaS — leaves the customer with 80% of the upside.
            </p>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="range" min="5" max="50" step="1"
                  value={inputs.captureRate}
                  onChange={set("captureRate")}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5%</span><span>50%</span>
                </div>
              </div>
              <div className="flex items-center gap-1 w-20 border border-border rounded-lg px-2 py-1.5 bg-background">
                <input
                  type="number" min="5" max="50"
                  value={inputs.captureRate}
                  onChange={set("captureRate")}
                  className="w-full bg-transparent text-sm font-semibold text-foreground outline-none"
                />
                <Percent className="w-3 h-3 text-muted-foreground shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Output */}
        <div className="space-y-4">
          {/* Main price card */}
          <div className={cn("rounded-xl p-6 border-2 transition-colors", suggestedPrice > 0 ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border")}>
            <p className={cn("text-sm font-medium mb-1", suggestedPrice > 0 ? "text-primary-foreground/80" : "text-muted-foreground")}>
              Suggested monthly price
            </p>
            <p className={cn("text-5xl font-bold", suggestedPrice > 0 ? "text-primary-foreground" : "text-foreground")}>
              {fmt(suggestedPrice)}
              <span className={cn("text-lg font-normal ml-1", suggestedPrice > 0 ? "text-primary-foreground/70" : "text-muted-foreground")}>/mo</span>
            </p>
            {suggestedPrice > 0 && (
              <p className="text-primary-foreground/70 text-sm mt-1">{fmt(annualPrice)}/year</p>
            )}
          </div>

          {/* Metrics */}
          {totalSavings > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <Metric icon={TrendingUp} label="Customer ROI" value={`${roi.toFixed(0)}%`} sub="return on their spend" color="text-green-600" />
              <Metric icon={DollarSign} label="Annual value created" value={fmt(annualValue)} sub="for the pharmacy" color="text-blue-600" />
              <Metric icon={Package} label="You capture" value={`${inputs.captureRate}%`} sub={`${fmt(annualPrice)}/yr`} color="text-indigo-600" />
              <Metric icon={DollarSign} label="Customer keeps" value={fmt((totalSavings - suggestedPrice) * 12)} sub="net gain per year" color="text-emerald-600" />
            </div>
          )}

          {/* Tier comparison */}
          {totalSavings > 0 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <button
                className="w-full flex items-center justify-between text-sm font-semibold text-foreground"
                onClick={() => setShowBreakdown(!showBreakdown)}
              >
                Pricing tiers
                {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showBreakdown && (
                <div className="mt-3 space-y-2">
                  {tiers.map((t) => (
                    <div key={t.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t.label}</span>
                      <div className="text-right">
                        <span className="font-semibold text-foreground">{fmt(t.price)}/mo</span>
                        <span className="text-xs text-muted-foreground ml-2">{fmt(t.price * 12)}/yr</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Save scenario */}
          {suggestedPrice > 0 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-sm font-semibold text-foreground mb-2">Save this scenario</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Highland Park Pharmacy"
                  value={scenarioLabel}
                  onChange={(e) => setScenarioLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveScenario()}
                  className="flex-1 border border-border rounded-lg px-3 py-1.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={saveScenario}
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Saved scenarios */}
      {savedScenarios.length > 0 && (
        <div className="mt-6 bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-3">Saved scenarios</h2>
          <div className="space-y-2">
            {savedScenarios.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm font-medium text-foreground">{s.label}</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-foreground">{fmt(s.price)}/mo</span>
                  <span className="text-xs text-muted-foreground ml-3">saves them {fmt(s.total)}/mo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guide */}
      <div className="mt-6 bg-muted/30 border border-border rounded-xl p-5">
        <h2 className="font-semibold text-foreground mb-3">How to estimate savings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground mb-1">Inventory waste</p>
            <p>Ask: "How much do you write off in expired or unsold inventory per month?" Average independent pharmacy loses $1,000–$5,000/mo.</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">Ordering time</p>
            <p>Ask: "How many hours a week does ordering take?" Multiply by $25–$35/hr. RxPredict typically cuts this by 50–70%.</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">Stockouts</p>
            <p>Ask: "How often do you run out of a product a customer needs?" Each stockout = lost sale + lost patient trust.</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">Over-ordering</p>
            <p>Ask: "Do you ever buy too much of something and it just sits there?" Capital tied up in slow stock = hidden cost.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, value, onChange }: { label: string; hint: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <p className="text-xs text-muted-foreground mb-1.5">{hint}</p>
      <div className="relative">
        <span className="absolute left-3 top-2 text-muted-foreground text-sm">$</span>
        <input
          type="number" min="0" placeholder="0"
          value={value}
          onChange={onChange}
          className="w-full border border-border rounded-lg pl-7 pr-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
        />
        <span className="absolute right-3 top-2 text-xs text-muted-foreground">/mo</span>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn("w-4 h-4", color)} />
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
