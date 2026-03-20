import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Fingerprint, Shield, Check, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@layouts';
import { Button, Input } from '@components/ui';
import api from '@services/api';
import API from '@services/endpoints';
import { startRegistration } from '@simplewebauthn/browser';

const getDeviceName = () => {
  const ua = navigator.userAgent;
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/Macintosh|Mac OS/i.test(ua)) return 'Mac';
  if (/Windows/i.test(ua)) return 'Windows PC';
  if (/Android/i.test(ua)) return 'Android';
  if (/CrOS/i.test(ua)) return 'Chromebook';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Device';
};

const CreatePasskeyPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTab = searchParams.get('returnTab') || 'security';

  const [step, setStep] = useState('create'); // 'create' | 'registering' | 'success'
  const [passkeyName, setPasskeyName] = useState(getDeviceName());
  const [createdName, setCreatedName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    navigate(`/admin/settings?tab=${returnTab}`);
  };

  const handleCreatePasskey = async () => {
    try {
      setStep('registering');
      setLoading(true);
      setError('');

      const optionsRes = await api.post(API.PASSKEY_REGISTER_OPTIONS);
      const { options } = optionsRes.data.data || optionsRes.data;

      const attResp = await startRegistration({ optionsJSON: options });

      const deviceName = passkeyName.trim() || getDeviceName();
      await api.post(API.PASSKEY_REGISTER_VERIFY, {
        response: attResp,
        device_name: deviceName,
      });

      setCreatedName(deviceName);
      setStep('success');
    } catch (err) {
      setStep('create');
      if (err.name === 'NotAllowedError') {
        setError('Registration was cancelled or timed out. Make sure your device supports passkeys and try again.');
      } else if (err.name === 'NotSupportedError') {
        setError('Passkeys are not supported on this device or browser.');
      } else if (err.name === 'SecurityError') {
        setError('Security error. Make sure you are using HTTPS or localhost.');
      } else if (err.name === 'InvalidStateError') {
        setError('This passkey is already registered on your account.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to create passkey. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Success state ─────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-transparent">
            <Check className="w-8 h-8 text-green-600 dark:text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Passkey created
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            You can now use this passkey to sign in to your account.
          </p>

          <div className="w-full p-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl flex items-center gap-3 mb-6 text-left">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-transparent flex items-center justify-center flex-shrink-0">
              <Fingerprint className="w-5 h-5 text-primary-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{createdName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Created just now</p>
            </div>
          </div>

          <Button onClick={handleBack} className="w-full" size="md">
            Back to Settings
          </Button>
        </div>
      </AuthLayout>
    );
  }

  // ─── Registering state ─────────────────────────────────────────────
  if (step === 'registering') {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 dark:bg-transparent animate-pulse">
            <Fingerprint className="w-10 h-10 text-primary-600 dark:text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Follow the steps on your device
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Use your fingerprint sensor, face recognition, screen lock, or security key when prompted.
          </p>
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent"></div>
        </div>
      </AuthLayout>
    );
  }

  // ─── Create state (default) ────────────────────────────────────────
  return (
    <AuthLayout>
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-transparent">
          <Fingerprint className="w-8 h-8 text-primary-600 dark:text-gray-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create a passkey</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Passkeys are a simpler and more secure alternative to passwords
        </p>
      </div>

      {/* Feature cards */}
      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#1a1a1a]">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-transparent flex items-center justify-center flex-shrink-0 mt-0.5">
            <Fingerprint className="w-4 h-4 text-blue-600 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Device-based security</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Uses your device's built-in biometrics, PIN, or security key</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#1a1a1a]">
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-transparent flex items-center justify-center flex-shrink-0 mt-0.5">
            <Shield className="w-4 h-4 text-green-600 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Phishing resistant</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Your private key never leaves your device and can't be stolen</p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Passkey name */}
      <div className="mb-6">
        <Input
          label="Passkey name (optional)"
          type="text"
          value={passkeyName}
          onChange={(e) => setPasskeyName(e.target.value)}
          placeholder="e.g., MacBook Pro, iPhone"
          variant="floating"
          disabled={loading}
        />
      </div>

      {/* Create button */}
      <Button
        onClick={handleCreatePasskey}
        className="w-full"
        size="md"
        loading={loading}
      >
        Create a passkey
      </Button>

      {/* Back */}
      <Button
        type="button"
        variant="ghost"
        className="w-full mt-3"
        size="md"
        onClick={handleBack}
        disabled={loading}
      >
        Back to Settings
      </Button>
    </AuthLayout>
  );
};

export default CreatePasskeyPage;
