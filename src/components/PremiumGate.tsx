import { useState } from 'react';
import React from 'react';

interface PremiumGateProps {
  featureName: string;
  description: string;
}

const PremiumGate: React.FC<PremiumGateProps> = ({ description }) => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [premiumAlert, setPremiumAlert] = useState<string | null>(null);

  const features = [
    'Unlimited access to all premium tools & analytics',
    'Real-time alerts with AI-powered signal detection',
    'Priority support & early access to new features',
  ];

  const monthlyPrice = 29;
  const annualPrice = 23;

  return (
    <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
      {/* Blurred preview area */}
      <div className="relative filter blur-sm select-none pointer-events-none h-[200px] bg-deepblack border border-subtleborder rounded-lg p-6 mb-6 overflow-hidden">
        {/* Placeholder chart-like content */}
        <div className="flex items-end gap-2 h-full">
          <div className="w-full h-1/3 bg-emerald/20 rounded-sm" />
          <div className="w-full h-1/2 bg-emerald/15 rounded-sm" />
          <div className="w-full h-2/3 bg-emerald/25 rounded-sm" />
          <div className="w-full h-3/4 bg-emerald/20 rounded-sm" />
          <div className="w-full h-1/2 bg-emerald/15 rounded-sm" />
          <div className="w-full h-5/6 bg-emerald/25 rounded-sm" />
          <div className="w-full h-2/3 bg-emerald/20 rounded-sm" />
          <div className="w-full h-1/3 bg-emerald/15 rounded-sm" />
          <div className="w-full h-1/2 bg-emerald/20 rounded-sm" />
          <div className="w-full h-3/4 bg-emerald/25 rounded-sm" />
        </div>
      </div>

      {/* Unlock banner */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <svg
          width={20}
          height={20}
          viewBox="0 0 20 20"
          fill="none"
          className="text-emerald"
          aria-hidden="true"
        >
          <path
            d="M10 2L3 5v4.5a9 9 0 007 8.5 9 9 0 007-8.5V5l-7-3z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M7 10l2 2 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-offwhite font-display font-medium text-lg">
          Unlock with Sigma Premium
        </span>
      </div>

      {/* Feature description */}
      <p className="text-slategray text-sm text-center mb-6">
        {description}
      </p>

      {/* Feature bullet points */}
      <ul className="space-y-3 mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <svg
              width={18}
              height={18}
              viewBox="0 0 18 18"
              fill="none"
              className="text-emerald mt-0.5 shrink-0"
              aria-hidden="true"
            >
              <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M6 9l2 2 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm text-offwhite">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Pricing toggle */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <span
          className={`text-sm font-medium transition-colors ${
            !isAnnual ? 'text-offwhite' : 'text-slategray'
          }`}
        >
          Monthly
        </span>
        <button
          onClick={() => setIsAnnual(!isAnnual)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            isAnnual ? 'bg-emerald' : 'bg-subtleborder'
          }`}
          role="switch"
          aria-checked={isAnnual}
          aria-label="Toggle annual pricing"
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-offwhite rounded-full transition-transform ${
              isAnnual ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <span
          className={`text-sm font-medium transition-colors ${
            isAnnual ? 'text-offwhite' : 'text-slategray'
          }`}
        >
          Annual
          <span className="ml-1.5 text-xs text-emerald font-mono">-21%</span>
        </span>
      </div>

      {/* Price display */}
      <div className="text-center mb-8">
        <span className="text-4xl font-display font-semibold text-offwhite">
          ${isAnnual ? annualPrice : monthlyPrice}
        </span>
        <span className="text-slategray text-sm">/mo</span>
        {isAnnual && (
          <p className="text-xs text-slategray mt-1">
            Billed annually at ${annualPrice * 12}/year
          </p>
        )}
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => {
            setPremiumAlert('Premium features coming soon!');
            setTimeout(() => setPremiumAlert(null), 3000);
          }}
          className="w-full sm:w-auto px-6 py-3 bg-emerald text-obsidian font-medium text-sm rounded-lg hover:bg-emerald/90 transition-colors"
        >
          Upgrade Now
        </button>
        <button
          onClick={() => {
            setPremiumAlert('Sign in functionality coming soon!');
            setTimeout(() => setPremiumAlert(null), 3000);
          }}
          className="w-full sm:w-auto px-6 py-3 border border-subtleborder text-offwhite font-medium text-sm rounded-lg hover:bg-deepblack transition-colors"
        >
          Sign In to Access
        </button>
      </div>

      {/* Alert toast */}
      {premiumAlert && (
        <div className="mt-4 text-center text-sm text-emerald">
          {premiumAlert}
        </div>
      )}
    </div>
  );
};

export default PremiumGate;
