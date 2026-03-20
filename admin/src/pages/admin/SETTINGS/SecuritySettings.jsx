import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Smartphone, Mail, Key, Shield, QrCode, Copy, Check, Monitor, Laptop, TabletSmartphone, Globe, ArrowRight, MapPin, Clock, Trash2, Fingerprint } from 'lucide-react';
import { Switch, Modal, Button, Input, ConfirmModal } from '@components/ui';
import { useAuth } from '@hooks';
import api from '@services/api';
import API from '@services/endpoints';

const SecuritySettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [emailMfaEnabled, setEmailMfaEnabled] = useState(false);
  const [totpMfaEnabled, setTotpMfaEnabled] = useState(false);
  const [mfaMethod, setMfaMethod] = useState(null);
  const [passkeys, setPasskeys] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [mfaTypeToDisable, setMfaTypeToDisable] = useState(null); // 'email' or 'totp'

  // Modals
  const [showAuthenticatorModal, setShowAuthenticatorModal] = useState(false);
  const [showEmailMfaModal, setShowEmailMfaModal] = useState(false);
  const [showRecoveryCodesModal, setShowRecoveryCodesModal] = useState(false);
  const [showDisableMfaModal, setShowDisableMfaModal] = useState(false);
  const [showTrustedDevicesModal, setShowTrustedDevicesModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'danger',
    confirmText: 'Confirm',
    loading: false,
    onConfirm: () => { },
  });

  // Data
  const [qrCode, setQrCode] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [copiedCode, setCopiedCode] = useState(false);

  // Form data
  const [totpCode, setTotpCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (user) {
      setMfaEnabled(user.mfa_enabled || false);
      setEmailMfaEnabled(user.email_mfa_enabled || false);
      setTotpMfaEnabled(user.totp_mfa_enabled || false);
      setMfaMethod(user.mfa_method || null);
      loadPasskeys();
      loadSessions();
    }
  }, [user]);

  const loadPasskeys = async () => {
    try {
      const res = await api.get(API.PASSKEY_LIST);
      setPasskeys(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to load passkeys:', err);
    }
  };

  const loadSessions = async () => {
    try {
      const res = await api.get(API.SESSIONS_LIST);
      const sessionsData = res.data.data || res.data || [];
      setSessions(sessionsData);

      // Get current session ID from a cookie or local storage if available
      // For now, we'll mark the most recent one as current
      if (sessionsData.length > 0) {
        setCurrentSessionId(sessionsData[0].id);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  };

  // ─── Authenticator App (TOTP) ───────────────────────────────────────

  const handleSetupAuthenticator = async () => {
    // Open modal immediately
    setShowAuthenticatorModal(true);
    setQrCode(''); // Clear previous QR code
    setTotpSecret('');
    setError('');

    try {
      setLoading(true);
      const res = await api.post(API.MFA_TOTP_SETUP);
      const data = res.data.data || res.data;
      console.log('------->>> data.qr_code data', data);
      setQrCode(data.qr_code);
      setTotpSecret(data.secret);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to setup authenticator');
      setShowAuthenticatorModal(false); // Close modal on error
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAuthenticator = async () => {
    if (!totpCode || totpCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.post(API.MFA_TOTP_VERIFY, { code: totpCode });
      const data = res.data.data || res.data;

      setMfaEnabled(true);
      setTotpMfaEnabled(true);
      setMfaMethod(emailMfaEnabled ? 'BOTH' : 'TOTP');
      if (data.recovery_codes) {
        setRecoveryCodes(data.recovery_codes);
        setShowRecoveryCodesModal(true);
      }
      setShowAuthenticatorModal(false);
      setTotpCode('');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(totpSecret);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // ─── Email MFA ──────────────────────────────────────────────────────

  const handleEnableEmailMfa = async () => {
    // Open modal first, then send email
    setShowEmailMfaModal(true);
    setTotpCode('');
    setError('');
    setEmailSent(false);
    setLoading(true);

    try {
      await api.post(API.MFA_EMAIL_SETUP);
      // Email sent successfully
      setEmailSent(true);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification email');
      setLoading(false);
    }
  };

  const handleResendEmailCode = async () => {
    setError('');
    setLoading(true);

    try {
      await api.post(API.MFA_EMAIL_SETUP);
      setError(''); // Clear any previous errors
      // Show success message temporarily
      const successMsg = 'Code resent! Check your email.';
      setError(''); // We'll show this as a success, not error
      alert(successMsg); // Or use a toast notification if available
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const confirmEnableEmailMfa = async () => {
    if (!totpCode || totpCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.post(API.MFA_EMAIL_VERIFY, { code: totpCode });
      const data = res.data.data || res.data;

      setMfaEnabled(true);
      setEmailMfaEnabled(true);
      setMfaMethod(totpMfaEnabled ? 'BOTH' : 'EMAIL');
      if (data.recovery_codes) {
        setRecoveryCodes(data.recovery_codes);
        setShowRecoveryCodesModal(true);
      }
      setShowEmailMfaModal(false);
      setTotpCode('');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Passkey (WebAuthn) ─────────────────────────────────────────────

  const handleAddPasskey = () => {
    navigate('/create-passkey?returnTab=security');
  };

  const handleDeletePasskey = (passkeyId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Passkey',
      message: 'Are you sure you want to remove this passkey?',
      variant: 'danger',
      confirmText: 'Remove',
      onConfirm: async () => {
        try {
          await api.delete(`${API.PASSKEY_DELETE}/${passkeyId}`);
          await loadPasskeys();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          alert(err.response?.data?.message || 'Failed to delete passkey');
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // ─── Disable MFA ────────────────────────────────────────────────────

  const handleDisableMfa = (type) => {
    setMfaTypeToDisable(type); // 'email' or 'totp'
    setShowDisableMfaModal(true);
    setPassword('');
    setError('');
  };

  const confirmDisableMfa = async () => {
    if (!password) {
      setError('Please enter your password');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const endpoint = mfaTypeToDisable === 'email' ? API.MFA_EMAIL_DISABLE : API.MFA_TOTP_DISABLE;
      await api.post(endpoint, { password });

      if (mfaTypeToDisable === 'email') {
        setEmailMfaEnabled(false);
        if (!totpMfaEnabled) {
          setMfaEnabled(false);
          setMfaMethod(null);
        } else {
          setMfaMethod('TOTP');
        }
      } else {
        setTotpMfaEnabled(false);
        if (!emailMfaEnabled) {
          setMfaEnabled(false);
          setMfaMethod(null);
        } else {
          setMfaMethod('EMAIL');
        }
      }

      setShowDisableMfaModal(false);
      setPassword('');
      setMfaTypeToDisable(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disable MFA');
    } finally {
      setLoading(false);
    }
  };

  // ─── Recovery Codes ─────────────────────────────────────────────────

  const handleRegenerateRecoveryCodes = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Regenerate Recovery Codes',
      message: 'This will invalidate your existing recovery codes. Continue?',
      variant: 'warning',
      confirmText: 'Regenerate',
      onConfirm: async () => {
        try {
          const res = await api.post(API.MFA_RECOVERY_CODES);
          const data = res.data.data || res.data;
          setRecoveryCodes(data.recovery_codes || []);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          setShowRecoveryCodesModal(true);
        } catch (err) {
          alert(err.response?.data?.message || 'Failed to regenerate recovery codes');
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const copyRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const downloadRecoveryCodes = () => {
    const blob = new Blob([recoveryCodes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recovery-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Trusted Devices / Sessions ─────────────────────────────────────

  const handleRemoveSession = (sessionId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Device',
      message: 'Are you sure you want to remove this device?',
      variant: 'danger',
      confirmText: 'Remove',
      onConfirm: async () => {
        try {
          await api.delete(`${API.SESSION_DELETE}/${sessionId}`);
          await loadSessions();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));

          // If user removed current session, logout
          if (sessionId === currentSessionId) {
            window.location.href = '/login';
          }
        } catch (err) {
          alert(err.response?.data?.message || 'Failed to remove session');
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const formatLastActivity = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const lastActivity = new Date(date);
    const diffMs = now - lastActivity;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return lastActivity.toLocaleDateString();
  };

  const formatLocation = (session) => {
    const parts = [];
    if (session.city) parts.push(session.city);
    if (session.region) parts.push(session.region);
    if (session.country) parts.push(session.country);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  const formatCoordinates = (session) => {
    if (session.latitude && session.longitude) {
      return `${session.latitude.toFixed(4)}, ${session.longitude.toFixed(4)}`;
    }
    return null;
  };

  const formatLoginTime = (date) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-2">
      {/* Password */}
      <div className="flex items-center justify-between py-2">
        <h3 className="text-sm font-normal text-gray-900 dark:text-white">Password</h3>
        <button
          onClick={() => navigate('/change-password?returnTab=security')}
          className="flex items-center gap-1 text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
        >
          <span>Change</span>
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="h-px bg-gray-100 dark:bg-[#2a2a2a]" />

      {/* Passkeys */}
      <div className="py-1">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-sm font-normal text-gray-900 dark:text-white mb-1">Passkeys</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Use your device's biometric authentication for secure, passwordless login.
            </p>
          </div>
          <button
            onClick={handleAddPasskey}
            className="flex items-center gap-1 text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 ml-1"
          >
            <span>Add</span>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Passkey List */}
        {passkeys.length > 0 && (
          <div className="mt-3 space-y-2">
            {passkeys.map((pk) => (
              <div key={pk.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-transparent flex items-center justify-center flex-shrink-0">
                    <Fingerprint className="w-4 h-4 text-primary-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{pk.device_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Created {new Date(pk.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      {pk.last_used_at ? ` · Last used ${new Date(pk.last_used_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}` : ' · Never used'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeletePasskey(pk.id)}
                  className="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                  title="Remove passkey"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-px bg-gray-100 dark:bg-[#2a2a2a]" />

      {/* Multi-factor authentication (MFA) */}
      <div className="py-1">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
          Multi-factor authentication (MFA)
        </h3>

        {/* Authenticator app */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="text-sm font-normal text-gray-900 dark:text-white mb-1">
              Authenticator app
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Use one-time codes from an authenticator app.
            </p>
          </div>
          <Switch
            checked={totpMfaEnabled}
            onChange={(checked) => {
              if (checked) {
                handleSetupAuthenticator();
              } else {
                handleDisableMfa('totp');
              }
            }}
          />
        </div>

        {/* Email */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-sm font-normal text-gray-900 dark:text-white mb-1">
              Email
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Receive verification codes via email.
            </p>
          </div>
          <Switch
            checked={emailMfaEnabled}
            onChange={(checked) => {
              if (checked) {
                handleEnableEmailMfa();
              } else {
                handleDisableMfa('email');
              }
            }}
          />
        </div>

        {/* Recovery Codes */}
        {mfaEnabled && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">
                  Recovery codes are available in case you lose access to your authentication method.
                </p>
                <button
                  onClick={handleRegenerateRecoveryCodes}
                  className="mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  View/Regenerate recovery codes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="h-px bg-gray-100 dark:bg-[#2a2a2a]" />

      {/* Trusted Devices */}
      <div className="flex items-center justify-between py-2">
        <h3 className="text-sm font-normal text-gray-900 dark:text-white">Trusted Devices</h3>
        <button
          onClick={() => setShowTrustedDevicesModal(true)}
          className="flex items-center gap-1 text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
        >
          <span>{sessions.length}</span>
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="h-px bg-gray-100 dark:bg-[#2a2a2a]" />

      {/* Log out of this device */}
      <div className="flex items-center justify-between py-2">
        <h3 className="text-sm font-normal text-gray-900 dark:text-white">
          Log out of this device
        </h3>
        <button
          onClick={() => {
            setConfirmModal({
              isOpen: true,
              title: 'Log Out',
              message: 'Are you sure you want to log out?',
              variant: 'danger',
              confirmText: 'Log Out',
              loading: false,
              onConfirm: async () => {
                try {
                  setConfirmModal(prev => ({ ...prev, loading: true }));
                  await api.post(API.LOGOUT);
                  window.location.href = '/login';
                } catch (err) {
                  setConfirmModal(prev => ({ ...prev, loading: false }));
                  alert('Failed to logout');
                }
              },
            });
          }}
          className="px-6 py-2 bg-transparent border border-gray-300 dark:border-[#424242] text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors"
        >
          Log out
        </button>
      </div>

      <div className="h-px bg-gray-100 dark:bg-[#2a2a2a]" />

      {/* Log out of all devices */}
      <div className="py-1">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-normal text-gray-900 dark:text-white mb-1">
              Log out of all devices
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Log out of all active sessions across all devices
            </p>
          </div>
          <button
            onClick={() => {
              setConfirmModal({
                isOpen: true,
                title: 'Log Out All Devices',
                message: 'This will log you out of all devices including this one. Continue?',
                variant: 'danger',
                confirmText: 'Log Out All',
                loading: false,
                onConfirm: async () => {
                  try {
                    setConfirmModal(prev => ({ ...prev, loading: true }));
                    await api.post(API.LOGOUT_ALL);
                    window.location.href = '/login';
                  } catch (err) {
                    setConfirmModal(prev => ({ ...prev, loading: false }));
                    alert('Failed to logout all sessions');
                  }
                },
              });
            }}
            className="px-6 py-2 bg-transparent border border-red-500 dark:border-red-600 text-red-600 dark:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-2"
          >
            Log out all
          </button>
        </div>
      </div>

      {/* ─── MODALS ─────────────────────────────────────────────────── */}

      {/* Authenticator App Setup Modal */}
      <Modal
        isOpen={showAuthenticatorModal}
        onClose={() => {
          setShowAuthenticatorModal(false);
          setTotpCode('');
          setError('');
        }}
        title=""
        size="md"
      >
        {!qrCode ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading QR Code...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleVerifyAuthenticator(); }} className="space-y-6 py-4">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Turn on 2-Step Verification
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Open authenticator and choose <span className="font-medium">scan barcode</span>.
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <img
                src={qrCode}
                alt="QR Code"
                className="w-56 h-56 rounded-lg border-2 border-gray-200 dark:border-gray-700"
                style={{ filter: 'invert(1)', mixBlendMode: 'screen' }}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
              </div>
            )}

            {/* Verify Code Input */}
            <div className="transition-all duration-300">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
                Enter the 6-digit code from your app
              </label>
              <Input
                type="text"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="text-center text-2xl tracking-[0.5em] font-semibold"
                autoFocus
              />
            </div>

            {/* Continue Button */}
            <Button
              type="submit"
              loading={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 text-base font-medium flex items-center justify-center gap-2"
            >
              <span>Verify & Enable</span>
            </Button>

            {/* Manual Entry */}
            <div className="text-center border-t border-gray-200 dark:border-gray-700 pt-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                OR enter the code manually
              </p>
              <div className="flex items-center justify-center gap-2">
                <code className="px-4 py-3 bg-gray-900 dark:bg-gray-800 text-gray-100 rounded-lg text-sm font-mono tracking-wider border border-gray-700">
                  {totpSecret}
                </code>
                <button
                  type="button"
                  onClick={copySecret}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
                  title="Copy to clipboard"
                >
                  {copiedCode ? (
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* Email MFA Verification Modal */}
      <Modal
        isOpen={showEmailMfaModal}
        onClose={() => {
          setShowEmailMfaModal(false);
          setTotpCode('');
          setError('');
          setEmailSent(false);
        }}
        title=""
        size="md"
      >
        {!emailSent ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Sending verification code...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); confirmEnableEmailMfa(); }} className="space-y-6 py-4">
            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Code Sent!
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We've sent a 6-digit verification code to <strong>{user?.email}</strong>
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
              </div>
            )}

            {/* Verify Code Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
                Enter the 6-digit code from your email
              </label>
              <Input
                type="text"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="text-center text-2xl tracking-[0.5em] font-semibold"
                autoFocus
              />
            </div>

            {/* Continue Button */}
            <Button
              type="submit"
              loading={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 text-base font-medium"
            >
              Verify & Enable
            </Button>

            {/* Resend */}
            <div className="text-center border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Didn't receive the code? Check your spam folder
              </p>
              <button
                type="button"
                onClick={handleResendEmailCode}
                disabled={loading}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50"
              >
                Resend Code
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Recovery Codes Modal */}
      <Modal
        isOpen={showRecoveryCodesModal}
        onClose={() => setShowRecoveryCodesModal(false)}
        title="Recovery Codes"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Important:</strong> Save these recovery codes in a safe place. You can use them to access your account if you lose your authentication device.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg font-mono text-sm">
            {recoveryCodes.map((code, idx) => (
              <div key={idx} className="text-gray-900 dark:text-white">
                {code}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={copyRecoveryCodes} icon={copiedCode ? Check : Copy} className="flex-1">
              {copiedCode ? 'Copied!' : 'Copy Codes'}
            </Button>
            <Button variant="outline" onClick={downloadRecoveryCodes} className="flex-1">
              Download
            </Button>
          </div>

          <Button onClick={() => setShowRecoveryCodesModal(false)} className="w-full">
            I've Saved My Codes
          </Button>
        </div>
      </Modal>

      {/* Disable MFA Modal */}
      <Modal
        isOpen={showDisableMfaModal}
        onClose={() => setShowDisableMfaModal(false)}
        title="Disable Multi-Factor Authentication"
        size="md"
      >
        <form onSubmit={(e) => { e.preventDefault(); confirmDisableMfa(); }} className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Warning:</strong> Disabling {mfaTypeToDisable === 'email' ? 'email' : 'authenticator app'} MFA will make your account less secure. Please enter your password to confirm.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setShowDisableMfaModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="danger" loading={loading} className="flex-1">
              Disable MFA
            </Button>
          </div>
        </form>
      </Modal>

      {/* Trusted Devices Modal */}
      <Modal
        isOpen={showTrustedDevicesModal}
        onClose={() => setShowTrustedDevicesModal(false)}
        title="Trusted devices"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            After you sign in, a device becomes trusted. When you log in somewhere new, we'll send a prompt to your trusted devices for approval. You can remove a device from this list at any time.
          </p>

          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No trusted devices</p>
            </div>
          ) : (
            <div className="space-y-1 max-h-[400px] overflow-y-auto scrollbar-hide">
              {sessions.map((session) => {
                // Pick icon based on OS — detect phone/tablet vs desktop
                const osLower = (session.os || '').toLowerCase();
                const DeviceIcon =
                  /iphone|ios|android/i.test(osLower) ? Smartphone :
                    /ipad/i.test(osLower) ? TabletSmartphone :
                      /mac|windows|linux|chrome\s?os/i.test(osLower) ? Monitor :
                        session.device_type === 'mobile' ? Smartphone :
                          session.device_type === 'tablet' ? TabletSmartphone :
                            Monitor;

                // Format device name: "macOS · Chrome" or "iOS · Safari"
                const deviceName = session.os && session.browser
                  ? `${session.os} · ${session.browser}`
                  : session.device_name || `${session.os || 'Unknown'} ${session.browser || 'Device'}`;

                // Format location like "Kozhikode, IN"
                const locationParts = [];
                if (session.city) locationParts.push(session.city);
                if (session.country) locationParts.push(session.country);
                const location = locationParts.length > 0 ? locationParts.join(', ') : null;

                // Format login time
                const loginDate = session.login_at || session.created_at;
                const formattedLogin = loginDate ? new Date(loginDate).toLocaleString(undefined, {
                  month: 'numeric',
                  day: 'numeric',
                  year: '2-digit',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                }) : 'Unknown';

                const isCurrentSession = session.id === currentSessionId;

                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <DeviceIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {deviceName}
                          </p>
                          {isCurrentSession && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formattedLogin}{location ? ` · ${location}` : ''}{session.timezone ? ` · ${session.timezone}` : ''}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveSession(session.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors flex-shrink-0"
                      title="Remove device"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => { if (!confirmModal.loading) setConfirmModal(prev => ({ ...prev, isOpen: false })); }}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmText={confirmModal.confirmText}
        loading={confirmModal.loading}
      />
    </div>
  );
};

export default SecuritySettings;
