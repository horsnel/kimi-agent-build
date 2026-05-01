import React, { type ReactNode } from 'react';
import PremiumGate from './PremiumGate';

interface ComingSoonWrapperProps {
  featureName: string;
  description: string;
  children: ReactNode;
}

const ComingSoonWrapper: React.FC<ComingSoonWrapperProps> = ({ featureName, description, children }) => {
  return (
    <div className="relative">
      {/* Blurred content behind */}
      <div className="filter blur-md select-none pointer-events-none" aria-hidden="true">
        {children}
      </div>

      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-obsidian/60 backdrop-blur-sm pt-24">
        <div className="w-full max-w-lg px-6">
          <PremiumGate featureName={featureName} description={description} />
        </div>
      </div>
    </div>
  );
};

export default ComingSoonWrapper;
