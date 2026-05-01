import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center bg-charcoal border border-crimson/30 rounded-xl p-8 text-center">
      {/* Error icon — circle with exclamation */}
      <svg
        width={48}
        height={48}
        viewBox="0 0 48 48"
        fill="none"
        className="mb-4"
        aria-hidden="true"
      >
        <circle cx="24" cy="24" r="22" stroke="#EF4444" strokeWidth="2" />
        <path
          d="M24 14v14"
          stroke="#EF4444"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="24" cy="34" r="1.5" fill="#EF4444" />
      </svg>

      <p className="text-crimson text-sm font-medium mb-4">{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2 text-sm font-medium text-crimson border border-crimson/40 rounded-lg hover:bg-crimson/10 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
