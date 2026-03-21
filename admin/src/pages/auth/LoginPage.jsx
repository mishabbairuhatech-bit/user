import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowUpRight, Shield, Key, Fingerprint, ScanFace } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '@layouts';
import { Button, Input, Checkbox } from '@components/ui';
import { useAuth } from '@hooks';
import api from '@services/api';
import API from '@services/endpoints';
import { startAuthentication } from '@simplewebauthn/browser';
import FaceCamera from '@components/FaceCamera';

// Google Icon Component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [apiError, setApiError] = useState('');

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [mfaMethod, setMfaMethod] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  // Passkey state
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  // Face ID state
  const [showFaceLogin, setShowFaceLogin] = useState(false);
  const [faceEmail, setFaceEmail] = useState('');
  const [showFaceCamera, setShowFaceCamera] = useState(false);

  // Geolocation state
  const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });

  const { login, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Read error from URL query params (e.g., from Google OAuth redirect)
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setApiError(errorParam);
      // Clear the error from URL
      searchParams.delete('error');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Get user's geolocation on page load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          console.log('Geolocation captured:', coords);
          setUserLocation(coords);
        },
        (error) => {
          console.log('Geolocation error:', error.code, error.message);
          // Continue without location - it's optional
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      console.log('Geolocation not supported');
    }
  }, []);

  // Google One Tap callback handler
  const handleGoogleOneTapCallback = useCallback(async (response) => {
    setIsLoading(true);
    setApiError('');
    try {
      const result = await api.post(API.GOOGLE_ONE_TAP, {
        credential: response.credential,
        device_name: 'Web Browser',
        device_type: 'web',
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });

      const data = result.data?.data || result.data;

      // Check if MFA is required
      if (data?.mfa_required) {
        setMfaRequired(true);
        setMfaToken(data.mfa_token);
        setMfaMethod(data.mfa_method);
        setApiError('');
      } else {
        // Fetch user data to update auth state
        await fetchUser();
        navigate('/admin/dashboard');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Google login failed. Please try again.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [navigate, fetchUser, userLocation]);

  // Initialize Google One Tap
  useEffect(() => {
    // Skip if MFA screen is shown
    if (mfaRequired) return;

    const initializeGoogleOneTap = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleOneTapCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Display the One Tap prompt
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.log('One Tap not displayed:', notification.getNotDisplayedReason());
          }
          if (notification.isSkippedMoment()) {
            console.log('One Tap skipped:', notification.getSkippedReason());
          }
        });
      }
    };

    // Wait for Google script to load
    if (window.google?.accounts?.id) {
      initializeGoogleOneTap();
    } else {
      const checkGoogle = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkGoogle);
          initializeGoogleOneTap();
        }
      }, 100);

      // Cleanup
      return () => clearInterval(checkGoogle);
    }
  }, [handleGoogleOneTapCallback, mfaRequired]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError('');
    console.log('Login with location:', userLocation);
    try {
      const result = await login(data.email, data.password, {
        device_name: 'Web Browser',
        device_type: 'web',
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });

      // Check if MFA is required
      if (result?.mfa_required) {
        setMfaRequired(true);
        setMfaToken(result.mfa_token);
        setMfaMethod(result.mfa_method);
        setApiError('');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please try again.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const onMfaSubmit = async (e) => {
    e.preventDefault();
    if (!mfaCode || mfaCode.length < 6) {
      setApiError('Please enter a valid code');
      return;
    }

    setIsLoading(true);
    setApiError('');
    try {
      await api.post(API.MFA_VERIFY, {
        mfa_token: mfaToken,
        code: mfaCode,
        device_name: 'Web Browser',
        device_type: 'web',
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });

      // Fetch user after MFA verification
      const meRes = await api.get(API.GET_ME);
      navigate('/admin/dashboard');
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid code. Please try again.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setMfaRequired(false);
    setMfaToken('');
    setMfaMethod('');
    setMfaCode('');
    setApiError('');
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/google`;
  };

  const handlePasskeyLogin = async () => {
    setPasskeyLoading(true);
    setApiError('');

    try {
      // Get authentication options (no email — discoverable credentials)
      const optionsRes = await api.post(API.PASSKEY_AUTH_OPTIONS, {});
      const { options, challenge_id } = optionsRes.data.data || optionsRes.data;

      // Start WebAuthn authentication — browser shows passkey picker
      const authResp = await startAuthentication({ optionsJSON: options });

      // Verify authentication with server (server sets auth cookies)
      await api.post(API.PASSKEY_AUTH_VERIFY, {
        challenge_id,
        response: authResp,
        device_name: 'Web Browser',
        device_type: 'web',
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });

      // Fetch user data to update auth context
      await fetchUser();

      // Login successful - navigate to dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setApiError('Passkey authentication was cancelled. Please try again.');
      } else if (err.name === 'NotSupportedError') {
        setApiError('Passkeys are not supported on this device or browser.');
      } else if (err.name === 'SecurityError') {
        setApiError('Security error. Make sure you are using HTTPS or localhost.');
      } else if (err.name === 'AbortError') {
        setApiError('Authentication was aborted. Please try again.');
      } else {
        const msg = err.response?.data?.message || err.message || 'Passkey login failed. Please try again.';
        setApiError(msg);
      }
    } finally {
      setPasskeyLoading(false);
    }
  };

  // Face ID authentication handler
  const handleFaceDescriptorForLogin = async (descriptor) => {
    if (!faceEmail || !faceEmail.includes('@')) {
      setApiError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const result = await api.post(API.FACE_AUTH_AUTHENTICATE, {
        email: faceEmail,
        descriptor,
        device_name: 'Web Browser',
        device_type: 'web',
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });

      // Fetch user data to update auth context
      await fetchUser();
      navigate('/admin/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Face ID login failed. Please try again.';
      setApiError(msg);
      setShowFaceCamera(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Show Face ID Login screen
  if (showFaceLogin) {
    return (
      <AuthLayout>
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/20">
            <ScanFace className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Face ID Login</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter your email and scan your face to sign in.
          </p>
        </div>

        {apiError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            {apiError}
          </div>
        )}

        {!showFaceCamera ? (
          <div className="space-y-5">
            <Input
              label="Email address"
              type="email"
              value={faceEmail}
              onChange={(e) => setFaceEmail(e.target.value)}
              placeholder="Enter your email"
              variant="floating"
              autoFocus
            />

            <Button
              className="w-full"
              size="md"
              loading={isLoading}
              onClick={() => {
                if (!faceEmail || !faceEmail.includes('@')) {
                  setApiError('Please enter a valid email address');
                  return;
                }
                setApiError('');
                setShowFaceCamera(true);
              }}
            >
              Continue
            </Button>

            <button
              type="button"
              className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 py-2"
              onClick={() => {
                setShowFaceLogin(false);
                setFaceEmail('');
                setShowFaceCamera(false);
                setApiError('');
              }}
            >
              Back to login
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <FaceCamera
              onDescriptorCaptured={handleFaceDescriptorForLogin}
              onError={(msg) => setApiError(msg)}
            />

            <button
              type="button"
              className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 py-2"
              onClick={() => {
                setShowFaceCamera(false);
                setApiError('');
              }}
            >
              Back
            </button>
          </div>
        )}
      </AuthLayout>
    );
  }

  // Show Passkey Login screen
  if (showPasskeyLogin) {
    const handlePasskeySubmit = (e) => {
      e.preventDefault();
      handlePasskeyLogin();
    };

    return (
      <AuthLayout>
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/20">
            <Fingerprint className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Use your passkey</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter your email to sign in with your device's biometrics, PIN, or security key.
          </p>
        </div>

        {apiError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            {apiError}
          </div>
        )}

        <form onSubmit={handlePasskeySubmit} className="space-y-5">
          <Input
            label="Email address"
            type="email"
            value={passkeyEmail}
            onChange={(e) => setPasskeyEmail(e.target.value)}
            placeholder="Enter your email"
            variant="floating"
            autoFocus
          />

          <Button
            type="submit"
            className="w-full"
            size="md"
            loading={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Continue with Passkey'}
          </Button>

          <button
            type="button"
            className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 py-2"
            onClick={() => {
              setShowPasskeyLogin(false);
              setPasskeyEmail('');
              setApiError('');
            }}
          >
            Back to login
          </button>
        </form>
      </AuthLayout>
    );
  }

  // Show MFA verification screen
  if (mfaRequired) {
    return (
      <AuthLayout>
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Verify Your Identity</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {mfaMethod === 'EMAIL'
              ? 'Enter the 6-digit code sent to your email'
              : mfaMethod === 'TOTP'
                ? 'Enter the 6-digit code from your authenticator app'
                : 'Enter your verification code'}
          </p>
        </div>

        {apiError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            {apiError}
          </div>
        )}

        <form onSubmit={onMfaSubmit} className="space-y-5">
          <Input
            label="Verification Code"
            type="text"
            maxLength={8}
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value.replace(/\s/g, ''))}
            placeholder="000000"
            variant="floating"
            className="text-center text-2xl tracking-widest"
            autoFocus
          />

          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Use a recovery code if you can't access your {mfaMethod === 'EMAIL' ? 'email' : 'authenticator app'}
          </div>

          <Button
            type="submit"
            className="w-full"
            size="md"
            loading={isLoading}
          >
            Verify
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            size="md"
            onClick={handleBackToLogin}
          >
            Back to Login
          </Button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Login</h1>
        <p className="text-sm text-gray-900 dark:text-gray-300">Hi, Welcome back 👋</p>
      </div>

      {/* Google Login Button */}
      <Button
        variant="outline"
        size="md"
        className="w-full mb-3"
        onClick={handleGoogleLogin}
        prefixIcon={GoogleIcon}
      >
        Login with Google
      </Button>

      {/* Passkey Login Button */}
      <Button
        variant="outline"
        size="md"
        className="w-full mb-6"
        onClick={handlePasskeyLogin}
        loading={passkeyLoading}
        disabled={passkeyLoading}
        prefixIcon={() => <Fingerprint className="w-5 h-5" />}
      >
        {passkeyLoading ? 'Verifying...' : 'Login with Passkey'}
      </Button>

      {/* Face ID Login Button */}
      <Button
        variant="outline"
        size="md"
        className="w-full mb-6"
        onClick={() => setShowFaceLogin(true)}
        prefixIcon={() => <ScanFace className="w-5 h-5" />}
      >
        Login with Face ID
      </Button>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-[#424242]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white dark:bg-[#141414] text-gray-500 dark:text-gray-400">or Login with Email</span>
        </div>
      </div>

      {/* API Error */}
      {apiError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {apiError}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          variant="floating"
          error={errors.email?.message}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSubmit(onSubmit)();
            }
          }}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
        />

        <Input
          label="Password"
          type="password"
          variant="floating"
          error={errors.password?.message}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSubmit(onSubmit)();
            }
          }}
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          })}
        />

        <div className="flex items-center justify-between">
          <Checkbox
            label="Remember Me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <Link to="/forgot-password" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="md"
          loading={isLoading}
        >
          Login
        </Button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
