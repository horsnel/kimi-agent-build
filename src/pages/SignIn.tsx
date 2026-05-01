import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { SigmaIcon, ArrowLeftIcon } from '../components/CustomIcons';
import { useAuth } from '../hooks/useAuth';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    // Small delay to feel more natural
    await new Promise((r) => setTimeout(r, 400));

    const result = signIn(email, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Sign in failed. Please try again.');
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
            Welcome Back
          </h1>
          <p className="text-sm text-slategray text-center mb-8">
            Sign in to your Sigma Capital account
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-mono text-slategray uppercase tracking-wider"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset is coming soon. For this MVP, please create a new account if you forgot your password.')}
                  className="text-xs text-emerald hover:text-emerald/80 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-deepblack border border-subtleborder rounded-lg px-4 py-3 text-sm text-offwhite placeholder:text-slategray/50 focus:outline-none focus:border-emerald/50 transition-colors"
              />
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
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Sign up link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slategray">
            Don't have an account?{' '}
            <Link to="/signup" className="text-emerald hover:text-emerald/80 transition-colors font-medium">
              Sign Up
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
