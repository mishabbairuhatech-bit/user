import { Check, RotateCcw } from 'lucide-react';
import { Drawer } from '@components/ui';
import { useSettings, primaryColors, fontFamilies } from '@/context/SettingsContext';

const SettingsDrawer = () => {
  const { settings, updateSetting, resetSettings, isSettingsOpen, closeSettings } = useSettings();

  const themeModes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];

  const borderRadiusOptions = [
    { value: 'none', label: 'None' },
    { value: 'small', label: 'Small' },
    { value: 'rounded', label: 'Rounded' },
    { value: 'full', label: 'Full' },
  ];

  const fontSizeOptions = [
    { value: 'small', label: 'S' },
    { value: 'medium', label: 'M' },
    { value: 'large', label: 'L' },
  ];

  const Toggle = ({ enabled, onChange }) => (
    <button
      onClick={onChange}
      className={`relative w-10 h-[22px] rounded-full transition-colors ${
        enabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full transition-transform ${
          enabled ? 'translate-x-[18px]' : 'translate-x-0'
        }`}
      />
    </button>
  );

  const SegmentedControl = ({ options, value, onChange }) => (
    <div className="flex bg-gray-100 dark:bg-[#2a2a2a] rounded-lg p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            value === option.value
              ? 'bg-white dark:bg-[#3a3a3a] text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  const SettingRow = ({ label, description, children, noBorder }) => (
    <div className={`flex items-center justify-between py-3.5 ${!noBorder ? 'border-b border-gray-100 dark:border-[#2a2a2a]' : ''}`}>
      <div className="min-w-0 mr-4">
        <p className="text-sm text-gray-900 dark:text-gray-100">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );

  const footerContent = (
    <button
      onClick={resetSettings}
      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
    >
      <RotateCcw size={14} />
      Reset to defaults
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
        {/* Appearance */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
            Appearance
          </h3>

          <SettingRow label="Theme">
            <SegmentedControl
              options={themeModes}
              value={settings.themeMode}
              onChange={(val) => updateSetting('themeMode', val)}
            />
          </SettingRow>

          <SettingRow label="Primary color">
            <div className="flex gap-1.5">
              {primaryColors.map((color) => {
                const isActive = settings.primaryColor === color.value;
                return (
                  <button
                    key={color.value}
                    onClick={() => updateSetting('primaryColor', color.value)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                      isActive ? 'ring-2 ring-offset-1 dark:ring-offset-[#1f1f1f]' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color.color, ringColor: color.color }}
                    title={color.name}
                  >
                    {isActive && <Check size={12} className="text-white" />}
                  </button>
                );
              })}
            </div>
          </SettingRow>

          <SettingRow label="Border radius">
            <SegmentedControl
              options={borderRadiusOptions}
              value={settings.borderRadius}
              onChange={(val) => updateSetting('borderRadius', val)}
            />
          </SettingRow>

          <SettingRow label="Animations" noBorder>
            <Toggle
              enabled={settings.animations}
              onChange={() => updateSetting('animations', !settings.animations)}
            />
          </SettingRow>
        </div>

        {/* Typography */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
            Typography
          </h3>

          <SettingRow label="Font size">
            <SegmentedControl
              options={fontSizeOptions}
              value={settings.fontSize}
              onChange={(val) => updateSetting('fontSize', val)}
            />
          </SettingRow>

          <div className="py-2">
            <p className="text-sm text-gray-900 dark:text-gray-100 mb-2.5">Font family</p>
            <div className="grid grid-cols-2 gap-1.5">
              {fontFamilies.map((font) => {
                const isActive = settings.fontFamily === font.value;
                return (
                  <button
                    key={font.value}
                    onClick={() => updateSetting('fontFamily', font.value)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-all text-left ${
                      isActive
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                        : 'border-gray-200 dark:border-[#333] text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-[#444]'
                    }`}
                    style={{ fontFamily: font.value }}
                  >
                    {font.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Layout */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
            Layout
          </h3>

          <SettingRow label="Sidebar position" description="Choose which side the sidebar appears" noBorder>
            <SegmentedControl
              options={[
                { value: 'left', label: 'Left' },
                { value: 'right', label: 'Right' },
              ]}
              value={settings.sidebarPosition}
              onChange={(val) => updateSetting('sidebarPosition', val)}
            />
          </SettingRow>
        </div>
      </div>
    </Drawer>
  );
};

export default SettingsDrawer;
