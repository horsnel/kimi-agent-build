import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const sizeMap: Record<NonNullable<LoadingSpinnerProps['size']>, number> = {
  sm: 16,
  md: 32,
  lg: 48,
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text }) => {
  const px = sizeMap[size];

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className="rounded-full border-2 border-subtleborder border-t-emerald animate-spin"
        style={{ width: px, height: px }}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="text-sm text-slategray">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
