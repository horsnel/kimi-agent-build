import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { SigmaIcon, ArrowLeftIcon } from '../components/CustomIcons';
import { useAuth } from '../hooks/useAuth';

export default function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const validate = (): string | null => {
    if (!firstName.trim()) return 'First name is required.';
    if (!lastName.trim()) return 'Last name is required.';
    if (!email.trim()) return 'Email is required.';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address.';

    if (!password) return 'Password is required.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';

    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    // Small delay to feel more natural
    await new Promise((r) => setTimeout(r, 500));

    const result = signUp(email, password, firstName, lastName);

    if (result.success) {
      navigate('/onboarding');
    } else {
      setError(result.error || 'Sign up failed. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 text-offwhite hover:text-emerald transition-colors mb-10">
        <SigmaIcon size={28} />
        <span className="font-display font-medium text-xl tracking-tight">Sigma Capital</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md">
        <div className="bg-charcoal border border-subtleborder rounded-2xl p-8">
          <h1 className="text-2xl font-display font-medium text-offwhite mb-2 text-center">
            Create Account
          </h1>
          <p className="text-sm text-slategray text-center mb-8">
            Join Sigma Capital and start your investing journey
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-xs font-mono text-slategray uppercase tracking-wider mb-2"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  autoComplete="given-name"
                  className="w-full bg-deepblack border border-subtleborder rounded-lg px-4 py-3 text-sm text-offwhite placeholder:text-slategray/50 focus:outline-none focus:border-emerald/50 transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-xs font-mono text-slategray uppercase tracking-wider mb-2"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  autoComplete="family-name"
                  className="w-full bg-deepblack border border-subtleborder rounded-lg px-4 py-3 text-sm text-offwhite placeholder:text-slategray/50 focus:outline-none focus:border-emerald/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-mono text-slategray uppercase tracking-wider mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoComplete="email"
                className="w-full bg-deepblack border border-subtleborder rounded-lg px-4 py-3 text-sm text-offwhite placeholder:text-slategray/50 focus:outline-none focus:border-emerald/50 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-mono text-slategray uppercase tracking-wider mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                className="w-full bg-deepblack border border-subtleborder rounded-lg px-4 py-3 text-sm text-offwhite placeholder:text-slategray/50 focus:outline-none focus:border-emerald/50 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-mono text-slategray uppercase tracking-wider mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                className="w-full bg-deepblack border border-subtleborder rounded-lg px-4 py-3 text-sm text-offwhite placeholder:text-slategray/50 focus:outline-none focus:border-emerald/50 transition-colors"
              />
              {confirmPassword && password && confirmPassword !== password && (
                <p className="text-xs text-red-400 mt-1.5">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-emerald text-obsidian font-medium text-sm rounded-lg hover:bg-emerald/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-obsidian" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-xs text-slategray text-center mt-5">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-emerald hover:text-emerald/80 transition-colors">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-emerald hover:text-emerald/80 transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* Sign in link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slategray">
            Already have an account?{' '}
            <Link to="/signin" className="text-emerald hover:text-emerald/80 transition-colors font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* Back to home */}
      <Link
        to="/"
        className="mt-8 flex items-center gap-2 text-sm text-slategray hover:text-offwhite transition-colors"
      >
        <ArrowLeftIcon size={16} />
        Back to Home
      </Link>
    </div>
  );
}
