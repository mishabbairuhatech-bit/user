import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Switch } from '@components/ui';

const SecuritySettings = () => {
  const [authenticatorApp, setAuthenticatorApp] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);

  return (
    <div className="space-y-2">
      {/* Title */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Security</h2>

      <div className="h-px bg-gray-100 dark:bg-[#2a2a2a]" />

      {/* Password */}
      <div className="flex items-center justify-between py-2">
        <h3 className="text-sm font-normal text-gray-900 dark:text-white">Password</h3>
        <button className="flex items-center gap-1 text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300">
          <span>Change</span>
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="h-px bg-gray-100 dark:bg-[#2a2a2a]" />

      {/* Passkeys */}
      <div className="py-1">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-normal text-gray-900 dark:text-white mb-1">Passkeys</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Passkeys are secure and protect your account with multi-factor authentication. They don't require any extra steps.
            </p>
          </div>
          <button className="flex items-center gap-1 text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 ml-1">
            <span>Add</span>
            <ChevronRight size={18} />
          </button>
        </div>
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
            checked={authenticatorApp}
            onChange={setAuthenticatorApp}
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
            checked={emailNotifications}
            onChange={setEmailNotifications}
          />
        </div>
      </div>

      <div className="h-px bg-gray-100 dark:bg-[#2a2a2a]" />

      {/* Trusted Devices */}
      <div className="flex items-center justify-between py-2">
        <h3 className="text-sm font-normal text-gray-900 dark:text-white">Trusted Devices</h3>
        <button className="flex items-center gap-1 text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300">
          <span>1</span>
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="h-px bg-gray-100 dark:bg-[#2a2a2a]" />

      {/* Log out of this device */}
      <div className="flex items-center justify-between py-2">
        <h3 className="text-sm font-normal text-gray-900 dark:text-white">
          Log out of this device
        </h3>
        <button className="px-6 py-2 bg-transparent border border-gray-300 dark:border-[#424242] text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors">
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
          <button className="px-6 py-2 bg-transparent border border-red-500 dark:border-red-600 text-red-600 dark:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-2">
            Log out all
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
