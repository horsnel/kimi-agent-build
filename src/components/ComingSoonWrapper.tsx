import React, { type ReactNode } from 'react';
import PremiumGate from './PremiumGate';

interface ComingSoonWrapperProps {
  featureName: string;
  description: string;
  children: ReactNode;
}

const ComingSoonWrapper: React.FC<ComingSoonWrapperProps> = ({ featureName, description, children }) => {
  return (
    <div className="relative min-h-screen">
      {/* Blurred content behind */}
      <div className="filter blur-md select-none pointer-events-none" aria-hidden="true">
        {children}
      </div>

      {/* Coming Soon Overlay — fixed to viewport so it centers in the screen, not the content */}
      <div className="fixed inset-0 z-10 flex items-center justify-center bg-obsidian/80 backdrop-blur-sm">
        <div className="w-full max-w-lg px-6">
          <PremiumGate featureName={featureName} description={description} />
        </div>
      </div>
    </div>
  );
};

export default ComingSoonWrapper;
