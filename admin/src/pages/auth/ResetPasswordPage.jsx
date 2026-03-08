import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { AuthLayout } from '@layouts';
import { Button, Input } from '@components/ui';
import api from '@services/api';
import API from '@services/endpoints';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Password validation
  const passwordRequirements = [
    { label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
    { label: 'One uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
    { label: 'One lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
    { label: 'One number', test: (pwd) => /\d/.test(pwd) },
    { label: 'One special character', test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pwd) },
  ];

  const isPasswordValid = passwordRequirements.every((req) => req.test(newPassword));
  const doPasswordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  // Check for token on mount
  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [token]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }
    if (!isPasswordValid) {
      setError('Please ensure your password meets all requirements');
      return;
    }
    if (!doPasswordsMatch) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.post(API.RESET_PASSWORD, {
        token,
        new_password: newPassword,
      });

      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to reset password';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Invalid token state
  if (!token) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
            <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Invalid Reset Link
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link to="/forgot-password">
            <Button className="w-full" size="md">
              Request New Reset Link
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // Success state
  if (success) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Password Reset Successfully
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Your password has been updated. You can now log in with your new password.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            <span>Redirecting to login...</span>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/20">
          <Lock className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enter your new password below
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleResetPassword} className="space-y-5">
        {/* New Password */}
        <div>
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            variant="floating"
            disabled={loading}
            autoFocus
          />

          {/* Password Requirements */}
          {newPassword.length > 0 && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                Password Requirements:
              </p>
              <div className="grid grid-cols-2 gap-1">
                {passwordRequirements.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {req.test(newPassword) ? (
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    )}
                    <span className={`text-xs ${req.test(newPassword) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            variant="floating"
            disabled={loading}
          />
          {confirmPassword.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              {doPasswordsMatch ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-600 dark:text-green-400">Passwords match</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-red-600 dark:text-red-400">Passwords do not match</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          size="md"
          loading={loading}
          disabled={!isPasswordValid || !doPasswordsMatch}
        >
          Reset Password
        </Button>

        {/* Back to Login */}
        <Link to="/login">
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            size="md"
            disabled={loading}
          >
            Back to Login
          </Button>
        </Link>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
