import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@layouts';
import { Button, Input } from '@components/ui';
import api from '@services/api';
import API from '@services/endpoints';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }
    if (!isValidEmail) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.post(API.FORGOT_PASSWORD, { email });
      setSentEmail(email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success Screen - Show after email is sent
  if (success) {
    return (
      <AuthLayout>
        <div className="text-center">
          {/* Success Icon */}
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Check Your Email
          </h1>

          {/* Message */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            We've sent a password reset link to
          </p>
          <p className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            {sentEmail}
          </p>

          {/* Instructions */}
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please check your inbox and spam folder. Click the link in the email to reset your password.
            </p>
          </div>

          {/* Back to Login */}
          <Link to="/login">
            <Button
              type="button"
              className="w-full"
              size="md"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </Link>

          {/* Resend option */}
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Didn't receive the email?{' '}
            <button
              type="button"
              onClick={() => {
                setSuccess(false);
                setEmail(sentEmail);
              }}
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Try again
            </button>
          </p>
        </div>
      </AuthLayout>
    );
  }

  // Form Screen - Email input
  return (
    <AuthLayout>
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/20">
          <Mail className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Forgot Password?</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enter your email and we'll send you a link to reset your password
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          variant="floating"
          disabled={loading}
          autoFocus
        />

        <Button
          type="submit"
          className="w-full"
          size="md"
          loading={loading}
          disabled={!email || !isValidEmail}
        >
          Send Reset Link
        </Button>

        <Link to="/login">
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            size="md"
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
        </Link>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
