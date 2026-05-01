import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { SigmaIcon } from '../components/CustomIcons';
import { useAuth } from '../hooks/useAuth';

type Experience = 'beginner' | 'intermediate' | 'advanced';

interface InterestOption {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface GoalOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const TOTAL_STEPS = 3;

const experienceOptions: { id: Experience; label: string; description: string; icon: React.ReactNode }[] = [
  {
    id: 'beginner',
    label: 'Beginner',
    description: 'New to investing, learning the basics',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 10v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 22c1.5-3 3.5-4 6-4s4.5 1 6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    description: 'Some experience, looking to grow',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M4 24l8-8 4 4 12-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 8h8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: 'Experienced investor, optimizing strategy',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 12h24M12 12v16" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="20" cy="20" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M18 20l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const interestOptions: InterestOption[] = [
  {
    id: 'stocks',
    label: 'Stocks',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M2 14l5-5 3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 6h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'etfs',
    label: 'ETFs',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 10h16" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: 'crypto',
    label: 'Crypto',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 6v8M8 8h4a2 2 0 010 4H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'options',
    label: 'Options',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M7 2v2M7 16v2M13 4v2M13 14v2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        <rect x="5" y="4" width="4" height="12" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none" />
        <rect x="11" y="6" width="4" height="8" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none" />
      </svg>
    ),
  },
  {
    id: 'retirement',
    label: 'Retirement',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'real-estate',
    label: 'Real Estate',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 10l7-6 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 9v7h10V9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 16v-4h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'commodities',
    label: 'Commodities',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 1v3M10 16v3M1 10h3M16 10h3M3.5 3.5l2 2M14.5 14.5l2 2M3.5 16.5l2-2M14.5 5.5l2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'bonds',
    label: 'Bonds',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const goalOptions: GoalOption[] = [
  {
    id: 'build-wealth',
    label: 'Build Wealth',
    description: 'Grow your portfolio for long-term financial freedom',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M4 20l6-6 4 4 10-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 8h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'generate-income',
    label: 'Generate Income',
    description: 'Create steady cash flow from dividends and interest',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14 8v8M14 18v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'preserve-capital',
    label: 'Preserve Capital',
    description: 'Protect your savings with conservative strategies',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 2L4 7v6c0 6.5 4.3 12.3 10 14 5.7-1.7 10-7.5 10-14V7l-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 14l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'learn-investing',
    label: 'Learn Investing',
    description: 'Build knowledge and confidence as a new investor',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M3 6a4 4 0 014-4h6v16H7a4 4 0 01-4-4V6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M25 6a4 4 0 00-4-4h-6v16h6a4 4 0 004-4V6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M3 22h22M8 22v3M20 22v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [experience, setExperience] = useState<Experience | ''>('');
  const [interests, setInterests] = useState<string[]>([]);
  const [goal, setGoal] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const navigate = useNavigate();
  const { getUser, completeOnboarding } = useAuth();

  // Redirect if not logged in
  useEffect(() => {
    const user = getUser();
    if (!user) {
      navigate('/signin');
    }
  }, [getUser, navigate]);

  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const goNext = () => {
    if (step >= TOTAL_STEPS) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setStep((s) => s + 1);
      setIsTransitioning(false);
    }, 200);
  };

  const goBack = () => {
    if (step <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setStep((s) => s - 1);
      setIsTransitioning(false);
    }, 200);
  };

  const handleSkip = () => {
    if (step < TOTAL_STEPS) {
      goNext();
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    setIsCompleting(true);
    await new Promise((r) => setTimeout(r, 400));
    completeOnboarding(experience || 'beginner', interests);
    navigate('/dashboard');
  };

  const canProceed = () => {
    if (step === 1) return experience !== '';
    if (step === 2) return interests.length > 0;
    if (step === 3) return goal !== '';
    return false;
  };

  const stepTitles = [
    "What's your investing experience?",
    'What are you most interested in?',
    "What's your primary goal?",
  ];

  return (
    <div className="min-h-screen bg-obsidian flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-offwhite hover:text-emerald transition-colors">
          <SigmaIcon size={24} />
          <span className="font-display font-medium text-lg tracking-tight">Sigma Capital</span>
        </Link>
        <button
          onClick={handleSkip}
          className="text-sm text-slategray hover:text-offwhite transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-mono text-slategray">
            Step {step} of {TOTAL_STEPS}
          </span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                s <= step ? 'bg-emerald' : 'bg-charcoal border border-subtleborder'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-6">
        <div
          className={`w-full max-w-2xl transition-all duration-200 ${
            isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}
        >
          <h2 className="text-2xl md:text-3xl font-display font-medium text-offwhite mb-2 text-center">
            {stepTitles[step - 1]}
          </h2>
          <p className="text-sm text-slategray text-center mb-8">
            {step === 1 && 'This helps us tailor content to your level'}
            {step === 2 && 'Select all that apply — you can change this later'}
            {step === 3 && 'We will personalize your dashboard accordingly'}
          </p>

          {/* Step 1: Experience */}
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {experienceOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setExperience(opt.id)}
                  className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200 ${
                    experience === opt.id
                      ? 'bg-emerald/10 border-emerald text-emerald'
                      : 'bg-charcoal border-subtleborder text-slategray hover:border-slategray hover:text-offwhite'
                  }`}
                >
                  <div
                    className={`transition-colors ${
                      experience === opt.id ? 'text-emerald' : 'text-slategray'
                    }`}
                  >
                    {opt.icon}
                  </div>
                  <span className="text-base font-medium">{opt.label}</span>
                  <span
                    className={`text-xs text-center leading-relaxed ${
                      experience === opt.id ? 'text-emerald/70' : 'text-slategray/70'
                    }`}
                  >
                    {opt.description}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Interests */}
          {step === 2 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {interestOptions.map((opt) => {
                const isSelected = interests.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleInterest(opt.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'bg-emerald/10 border-emerald text-emerald'
                        : 'bg-charcoal border-subtleborder text-slategray hover:border-slategray hover:text-offwhite'
                    }`}
                  >
                    <div
                      className={`transition-colors ${
                        isSelected ? 'text-emerald' : 'text-slategray'
                      }`}
                    >
                      {opt.icon}
                    </div>
                    <span className="text-sm font-medium">{opt.label}</span>
                    {isSelected && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="text-emerald"
                      >
                        <circle cx="8" cy="8" r="6" fill="currentColor" fillOpacity="0.2" />
                        <path
                          d="M5.5 8l2 2 3-3"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 3: Goal */}
          {step === 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {goalOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setGoal(opt.id)}
                  className={`flex items-start gap-4 p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                    goal === opt.id
                      ? 'bg-emerald/10 border-emerald'
                      : 'bg-charcoal border-subtleborder hover:border-slategray'
                  }`}
                >
                  <div
                    className={`shrink-0 mt-0.5 transition-colors ${
                      goal === opt.id ? 'text-emerald' : 'text-slategray'
                    }`}
                  >
                    {opt.icon}
                  </div>
                  <div>
                    <span
                      className={`text-base font-medium block ${
                        goal === opt.id ? 'text-emerald' : 'text-offwhite'
                      }`}
                    >
                      {opt.label}
                    </span>
                    <span
                      className={`text-xs mt-1 block leading-relaxed ${
                        goal === opt.id ? 'text-emerald/70' : 'text-slategray'
                      }`}
                    >
                      {opt.description}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="px-6 py-6 mt-auto">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          {step > 1 ? (
            <button
              onClick={goBack}
              className="px-5 py-2.5 text-sm font-medium text-slategray border border-subtleborder rounded-lg hover:text-offwhite hover:border-slategray transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={step === TOTAL_STEPS ? finishOnboarding : goNext}
            disabled={step === TOTAL_STEPS ? isCompleting : !canProceed()}
            className={`px-8 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
              step === TOTAL_STEPS
                ? 'bg-emerald text-obsidian hover:bg-emerald/90 disabled:opacity-50 disabled:cursor-not-allowed'
                : canProceed()
                  ? 'bg-emerald text-obsidian hover:bg-emerald/90'
                  : 'bg-charcoal text-slategray border border-subtleborder cursor-not-allowed'
            }`}
          >
            {isCompleting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-obsidian"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Setting up…
              </>
            ) : step === TOTAL_STEPS ? (
              'Get Started'
            ) : (
              'Next'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
