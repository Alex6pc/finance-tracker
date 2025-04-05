import { watch } from 'vue';
import { useSettingsStore, defaultSettings } from '~/stores/settings';

export default defineNuxtPlugin({
  name: 'dark-mode-plugin',
  enforce: 'post', // Run after other plugins, including Pinia setup
  async setup() {
    try {
      // Get the settings store
      const settingsStore = useSettingsStore();
      
      // Initialize settings
      settingsStore.initializeSettings();
      
      // Function to apply theme
      const applyTheme = () => {
        if (settingsStore.settings.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };
      
      // Apply theme when settings are initialized
      watch(() => settingsStore.isInitialized, (isInitialized) => {
        if (isInitialized) {
          applyTheme();
        }
      }, { immediate: true });
      
      // Also watch for changes to the dark mode setting
      watch(() => settingsStore.settings.darkMode, () => {
        applyTheme();
      });
    } catch (error) {
      console.error('Failed to initialize dark mode settings:', error);
      // Fallback to default (light mode)
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('dark');
      }
    }
  }
}); 