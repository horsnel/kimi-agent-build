import { useState, type FormEvent } from 'react';
import React from 'react';
import { useWaitlist } from '../hooks/useWaitlist';

interface PremiumGateProps {
  featureName: string;
  description: string;
}

const PremiumGate: React.FC<PremiumGateProps> = ({ featureName, description }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { submitEmail } = useWaitlist();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    const ok = submitEmail(email.trim());
    if (ok) {
      setSubmitted(true);
    }
  };

  return (
    <div className="bg-charcoal border border-emerald/20 rounded-xl p-6 sm:p-8 text-center">
      {/* Blurred preview area */}
      <div className="relative filter blur-sm select-none pointer-events-none h-[160px] bg-deepblack border border-subtleborder rounded-lg p-6 mb-6 overflow-hidden">
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

      {/* Coming Soon Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald/10 border border-emerald/30 rounded-full mb-4">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="text-emerald">
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 6v4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="text-sm font-mono font-medium text-emerald tracking-wider">COMING SOON</span>
      </div>

      {/* Feature Name */}
      <h3 className="text-xl font-display font-medium text-offwhite mb-2">
        {featureName}
      </h3>

      {/* Description */}
      <p className="text-sm text-slategray mb-6 max-w-md mx-auto">
        {description}
      </p>

      {/* Waitlist Form */}
      {submitted ? (
        <div className="bg-emerald/10 border border-emerald/30 rounded-lg p-4">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none" className="mx-auto mb-2">
            <circle cx="24" cy="24" r="22" stroke="#10B981" strokeWidth="2" />
            <path d="M16 24l5 5 11-11" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-sm text-emerald font-medium">You're on the waitlist!</p>
          <p className="text-xs text-slategray mt-1">We'll notify you when {featureName} launches.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
          <p className="text-sm text-offwhite mb-3">Join the waitlist for early access</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-2.5 bg-deepblack border border-subtleborder rounded-lg text-sm text-offwhite placeholder:text-slategray focus:outline-none focus:border-emerald/50 transition-colors"
              aria-label="Email address for waitlist"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald text-obsidian font-medium text-sm rounded-lg hover:bg-emerald/90 transition-colors whitespace-nowrap"
            >
              Join Waitlist
            </button>
          </div>
          <p className="text-xs text-slategray mt-2">We respect your privacy. No spam, ever.</p>
        </form>
      )}
    </div>
  );
};

export default PremiumGate;
