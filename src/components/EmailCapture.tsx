import { useState, type FormEvent } from 'react';
import React from 'react';

interface EmailCaptureProps {
  headline: string;
  description: string;
  magnetType: string;
}

const EmailCapture: React.FC<EmailCaptureProps> = ({ headline, description, magnetType }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-charcoal border border-subtleborder rounded-xl p-8 text-center">
        <svg
          width={48}
          height={48}
          viewBox="0 0 48 48"
          fill="none"
          className="mx-auto mb-4"
          aria-hidden="true"
        >
          <circle cx="24" cy="24" r="22" stroke="#10B981" strokeWidth="2" />
          <path
            d="M16 24l5 5 11-11"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h3 className="text-lg font-display font-medium text-offwhite mb-2">
          Check your inbox!
        </h3>
        <p className="text-sm text-slategray">
          Your free {magnetType} is on its way to <span className="text-emerald">{email}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-charcoal border border-subtleborder rounded-xl p-8">
      <h3 className="text-lg font-display font-medium text-offwhite mb-2">
        {headline}
      </h3>
      <p className="text-sm text-slategray mb-6">
        {description}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="flex-1 px-4 py-2.5 bg-deepblack border border-subtleborder rounded-lg text-sm text-offwhite placeholder:text-slategray focus:outline-none focus:border-emerald/50 transition-colors"
          aria-label="Email address"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-emerald text-obsidian font-medium text-sm rounded-lg hover:bg-emerald/90 transition-colors whitespace-nowrap"
        >
          Get Free Access
        </button>
      </form>

      <p className="text-xs text-slategray">
        We respect your privacy. Unsubscribe anytime.
      </p>
    </div>
  );
};

export default EmailCapture;
