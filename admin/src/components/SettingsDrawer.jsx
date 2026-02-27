import {
  Sun,
  Moon,
  Monitor,
  Check,
  RotateCcw,
  Palette,
  Type,
  Layout,
  Zap,
  CircleDot,
} from 'lucide-react';
import { Drawer } from '@components/ui';
import { useSettings, primaryColors, fontFamilies } from '@/context/SettingsContext';

const SettingsDrawer = () => {
  const { settings, updateSetting, resetSettings, isSettingsOpen, closeSettings } = useSettings();

  const themeModes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const borderRadiusOptions = [
    { value: 'none', label: 'None' },
    { value: 'small', label: 'Small' },
    { value: 'rounded', label: 'Rounded' },
    { value: 'full', label: 'Full' },
  ];

  const fontSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
  ];

  const footerContent = (
    <button
      onClick={resetSettings}
      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
    >
      <RotateCcw size={16} />
      Reset to Default
    </button>
  );

  return (
    <Drawer
      isOpen={isSettingsOpen}
      onClose={closeSettings}
      title="Settings"
      placement="right"
      size="md"
      footer={footerContent}
    >
      <div className="space-y-6">
        {/* Theme Mode */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sun size={18} className="text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Theme Mode</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {themeModes.map((mode) => {
              const Icon = mode.icon;
              const isActive = settings.themeMode === mode.value;
              return (
                <button
                  key={mode.value}
                  onClick={() => updateSetting('themeMode', mode.value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    isActive
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Color */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Palette size={18} className="text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Primary Color</h3>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {primaryColors.map((color) => {
              const isActive = settings.primaryColor === color.value;
              return (
                <button
                  key={color.value}
                  onClick={() => updateSetting('primaryColor', color.value)}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${
                      isActive ? 'scale-110 ring-2 ring-offset-2 dark:ring-offset-gray-800' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.color, ringColor: color.color }}
                  >
                    {isActive && <Check size={18} className="text-white" />}
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{color.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Family */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Type size={18} className="text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Font Family</h3>
          </div>
          <div className="space-y-2">
            {fontFamilies.map((font) => {
              const isActive = settings.fontFamily === font.value;
              return (
                <button
                  key={font.value}
                  onClick={() => updateSetting('fontFamily', font.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                    isActive
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  style={{ fontFamily: font.value }}
                >
                  <span className={`text-sm ${isActive ? 'text-primary-700 dark:text-primary-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                    {font.name}
                  </span>
                  {isActive && <Check size={18} className="text-primary-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Size */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Type size={18} className="text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Font Size</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {fontSizeOptions.map((size) => {
              const isActive = settings.fontSize === size.value;
              return (
                <button
                  key={size.value}
                  onClick={() => updateSetting('fontSize', size.value)}
                  className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {size.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Border Radius */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CircleDot size={18} className="text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Border Radius</h3>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {borderRadiusOptions.map((option) => {
              const isActive = settings.borderRadius === option.value;
              const radiusClasses = {
                none: 'rounded-none',
                small: 'rounded',
                rounded: 'rounded-lg',
                full: 'rounded-2xl',
              };
              return (
                <button
                  key={option.value}
                  onClick={() => updateSetting('borderRadius', option.value)}
                  className={`px-3 py-2.5 border-2 text-xs font-medium transition-all ${radiusClasses[option.value]} ${
                    isActive
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Layout Options */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Layout size={18} className="text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Layout</h3>
          </div>
          <div className="space-y-3">
            {/* Compact Mode */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Compact Mode</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Reduce spacing and padding</p>
              </div>
              <button
                onClick={() => updateSetting('compactMode', !settings.compactMode)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  settings.compactMode ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.compactMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Sidebar Position */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Sidebar Position</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Change sidebar location</p>
              </div>
              <div className="flex gap-1">
                {['left', 'right'].map((pos) => (
                  <button
                    key={pos}
                    onClick={() => updateSetting('sidebarPosition', pos)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      settings.sidebarPosition === pos
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {pos.charAt(0).toUpperCase() + pos.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Animations */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={18} className="text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Performance</h3>
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Animations</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Enable smooth transitions</p>
            </div>
            <button
              onClick={() => updateSetting('animations', !settings.animations)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                settings.animations ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.animations ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default SettingsDrawer;
