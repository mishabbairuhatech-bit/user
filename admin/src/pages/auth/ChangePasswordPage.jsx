import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, XCircle } from 'lucide-react';
import { AuthLayout } from '@layouts';
import { Button, Input } from '@components/ui';
import api from '@services/api';
import API from '@services/endpoints';

const ChangePasswordPage = () => {
  const navigate = useNavigate();

  // Form state
  const [oldPassword, setOldPassword] = useState('');
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

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Validation
    if (!oldPassword) {
      setError('Please enter your current password');
      return;
    }
    if (!isPasswordValid) {
      setError('Please ensure your new password meets all requirements');
      return;
    }
    if (!doPasswordsMatch) {
      setError('New passwords do not match');
      return;
    }
    if (oldPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.post(API.CHANGE_PASSWORD, {
        old_password: oldPassword,
        new_password: newPassword,
      });

      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Password Changed
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            All sessions have been terminated for security. You will be redirected to login.
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Change Password</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          For security, you'll be logged out of all devices after changing your password
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleChangePassword} className="space-y-5">
        {/* Current Password */}
        <Input
          label="Current Password"
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          variant="floating"
          disabled={loading}
          autoFocus
        />

        {/* New Password */}
        <div>
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            variant="floating"
            disabled={loading}
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
          disabled={!isPasswordValid || !doPasswordsMatch || !oldPassword}
        >
          Change Password
        </Button>

        {/* Back Button */}
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          size="md"
          onClick={() => navigate('/admin/settings')}
          disabled={loading}
        >
          Back to Settings
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ChangePasswordPage;
