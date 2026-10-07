import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Mail, Lock, User, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-purple-300 blur-3xl" />
        </div>
        <div className="relative flex flex-col justify-center px-12 xl:px-16 text-white">
          <Link to="/" className="flex items-center gap-2.5 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <MessageSquare size={22} className="text-white" />
            </div>
            <span className="text-lg font-bold">Message Tracker</span>
          </Link>
          <h2 className="text-3xl xl:text-4xl font-bold leading-tight mb-4">
            Never miss a message that matters
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed mb-8">
            Organize, track, and respond to important messages across all your platforms from one unified dashboard.
          </p>
          <div className="space-y-3">
            {[
              'Track messages from 5+ platforms',
              'Smart reminders and due dates',
              'Analytics and message trends',
              'Search and filter everything',
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Check size={12} className="text-white" />
                </div>
                <span className="text-blue-50">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 bg-gray-50">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <MessageSquare size={20} className="text-white" />
            </div>
            <span className="text-base font-bold text-gray-900">Message Tracker</span>
          </Link>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
            <p className="text-sm text-gray-500 mb-6">{subtitle}</p>
            {children}
            {footer && <div className="mt-6 text-center text-sm text-gray-500">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { signIn, resendConfirmation } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendEligible, setResendEligible] = useState(false);
  const [confirmationFeedback, setConfirmationFeedback] = useState('');
  const [confirmationFeedbackError, setConfirmationFeedbackError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResendEligible(false);
    setConfirmationFeedback('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
      setResendEligible(error.startsWith('Please confirm your email'));
      return;
    }
    navigate('/dashboard', { replace: true });
  };

  const handleResendConfirmation = async () => {
    setConfirmationFeedback('');
    setResending(true);
    const { error } = await resendConfirmation(email);
    setResending(false);
    setConfirmationFeedbackError(Boolean(error));
    setConfirmationFeedback(
      error ?? 'If this email belongs to an unconfirmed account, a confirmation link has been sent. Check your inbox and spam folder.'
    );
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      footer={<>Don't have an account? <Link to="/signup" className="text-blue-600 font-medium hover:underline">Sign up</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm" role="alert">
            {error}
          </div>
        )}
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={<Mail size={18} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock size={18} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Sign In <ArrowRight size={18} />
        </Button>
        {resendEligible && email.trim() && (
          <div className="space-y-2 text-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={resending}
              disabled={loading}
              className="w-full"
              onClick={handleResendConfirmation}
            >
              Resend confirmation email
            </Button>
            {confirmationFeedback && (
              <p className="text-xs text-gray-500" role={confirmationFeedbackError ? 'alert' : 'status'}>
                {confirmationFeedback}
              </p>
            )}
          </div>
        )}
      </form>
    </AuthLayout>
  );
}

export function SignUpPage() {
  const { signUp, resendConfirmation } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationPending, setConfirmationPending] = useState(false);
  const [resending, setResending] = useState(false);
  const [confirmationFeedback, setConfirmationFeedback] = useState('');
  const [confirmationFeedbackError, setConfirmationFeedbackError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    // Check password strength
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    if (!hasNumber || !hasLetter) {
      setError('Password must include both letters and numbers');
      return;
    }
    setLoading(true);
    const result = await signUp(email, password, name);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else if (result.confirmationRequired) {
      setConfirmationPending(true);
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleResendConfirmation = async () => {
    setConfirmationFeedback('');
    setResending(true);
    const { error } = await resendConfirmation(email);
    setResending(false);
    setConfirmationFeedbackError(Boolean(error));
    setConfirmationFeedback(
      error ?? 'If this email belongs to an unconfirmed account, a confirmation link has been sent. Check your inbox and spam folder.'
    );
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking your messages for free"
      footer={<>Already have an account? <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link></>}
    >
      {confirmationPending ? (
        <div className="space-y-4 text-center">
          <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700" role="status">
            If this email can be registered, you will receive a confirmation link. Confirm your email before signing in.
          </div>
          <p className="text-sm text-gray-500">Check your inbox and spam folder for {email.trim()}.</p>
          <Button type="button" variant="outline" loading={resending} className="w-full" onClick={handleResendConfirmation}>
            Resend confirmation email
          </Button>
          {confirmationFeedback && (
            <p className="text-xs text-gray-500" role={confirmationFeedbackError ? 'alert' : 'status'}>
              {confirmationFeedback}
            </p>
          )}
          <Link to="/login" className="inline-block text-sm text-blue-600 font-medium hover:underline">
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm" role="alert">{error}</div>}
          <Input
            label="Full Name"
            placeholder="John Doe"
            icon={<User size={18} />}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            icon={<Mail size={18} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            placeholder="At least 8 characters with letters & numbers"
            icon={<Lock size={18} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            icon={<Lock size={18} />}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <p className="text-xs text-gray-400 -mt-2">
            Use at least 8 characters with a mix of letters and numbers. Avoid common passwords.
          </p>
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Create Account <ArrowRight size={18} />
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) setError(error);
    else setSent(true);
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll send you a link to reset your password"
      footer={<><Link to="/login" className="text-blue-600 font-medium hover:underline">Back to login</Link></>}
    >
      {sent ? (
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-green-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Check your email</h3>
          <p className="text-sm text-gray-500">We've sent a password reset link to {email}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            icon={<Mail size={18} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Send Reset Link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
