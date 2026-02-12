
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../constants';

interface Step {
  targetId?: string;
  title: string;
  content: string;
}

const STEPS: Step[] = [
  {
    title: "Welcome to WealthTrack AI",
    content: "Your journey to financial clarity starts here. Let's take a quick tour to help you get the most out of your new dashboard."
  },
  {
    targetId: 'tour-entry-form',
    title: "Add Assets & Liabilities",
    content: "Start here. Add your assets (like savings, investments, or property) and liabilities (like loans or credit cards) to calculate your net worth. You can even track depreciation or loan amortization details."
  },
  {
    targetId: 'tour-income-panel',
    title: "Track Income Sources",
    content: "Log your monthly income streams here. You can assign specific income to cover budget categories for better planning."
  },
  {
    targetId: 'tour-budget-panel',
    title: "Manage Budgets",
    content: "Set monthly spending limits for categories like Groceries or Entertainment. Track your spending against your income to stay on target."
  },
  {
    title: "Unlock Premium Insights",
    content: "As you add data, you'll unlock AI-powered analysis and advanced Cashflow management tools. These premium features help you optimize your portfolio and reduce financial risk."
  }
];

interface OnboardingTourProps {
  onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = STEPS[currentStepIndex];

  useEffect(() => {
    if (currentStep.targetId) {
      const element = document.getElementById(currentStep.targetId);
      if (element) {
        // Scroll into view with some padding
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Wait for scroll to potentially finish or just update rect immediately
        const updateRect = () => {
          const rect = element.getBoundingClientRect();
          setTargetRect(rect);
        };
        
        updateRect();
        // Update on resize/scroll just in case
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect);
        
        return () => {
          window.removeEventListener('resize', updateRect);
          window.removeEventListener('scroll', updateRect);
        };
      } else {
        // Fallback if element not found
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [currentStepIndex]);

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-slate-900/75 transition-colors duration-500"></div>

      {/* Spotlight Hole (if target exists) */}
      {targetRect && (
        <div 
          className="absolute rounded-2xl shadow-[0_0_0_9999px_rgba(15,23,42,0.75)] border-2 border-blue-500 transition-all duration-300 ease-in-out pointer-events-none"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        ></div>
      )}

      {/* Modal/Tooltip Content */}
      <div 
        className={`absolute w-full max-w-md p-4 transition-all duration-500 ease-in-out ${
          targetRect 
            ? 'left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0' // Centered on mobile, positioned on desktop
            : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
        }`}
        style={targetRect ? {
           // Basic logic to position near the target, simplified for reliability
           // Default to bottom-center of screen if targeting, or center if not
           top: targetRect.bottom + 20 > window.innerHeight - 200 ? 'auto' : targetRect.bottom + 20,
           bottom: targetRect.bottom + 20 > window.innerHeight - 200 ? 20 : 'auto',
           left: window.innerWidth > 768 ? Math.max(20, Math.min(window.innerWidth - 420, targetRect.left)) : '50%',
        } : {}}
      >
        <div className="bg-white rounded-2xl shadow-2xl p-6 border border-slate-100 relative animate-in zoom-in-95 duration-300">
           {/* Close Button */}
           <button 
             onClick={handleSkip}
             className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
           >
             <Icons.X />
           </button>

           <div className="mb-4">
             <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
               {targetRect ? <Icons.Target /> : <Icons.Sparkles />}
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">
               {currentStep.title}
             </h3>
             <p className="text-slate-600 text-sm leading-relaxed">
               {currentStep.content}
             </p>
           </div>

           <div className="flex items-center justify-between mt-6">
              <div className="flex gap-1">
                {STEPS.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentStepIndex ? 'w-6 bg-blue-600' : 'w-1.5 bg-slate-200'
                    }`}
                  ></div>
                ))}
              </div>
              
              <div className="flex gap-3">
                 <button
                   onClick={handleSkip}
                   className="text-sm font-semibold text-slate-500 hover:text-slate-800 px-3 py-2"
                 >
                   Skip
                 </button>
                 <button
                   onClick={handleNext}
                   className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md shadow-blue-200 transition-transform active:scale-95"
                 >
                   {currentStepIndex === STEPS.length - 1 ? 'Finish' : 'Next'}
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
