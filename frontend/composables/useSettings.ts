import { computed, ref } from 'vue';
import { useSettingsStore, defaultSettings, type UserSettings } from '~/stores/settings';

// Type for our settings store
type SettingsStoreType = ReturnType<typeof useSettingsStore>;

/**
 * Composable for accessing user settings throughout the application
 * Provides convenient access to settings and utility functions
 */
export const useSettings = () => {
  // Create safe references in case Pinia is not available
  const settingsRef = ref<UserSettings>({ ...defaultSettings });
  let settingsStore: SettingsStoreType | undefined;
  
  try {
    // Try to get the settings store
    settingsStore = useSettingsStore();
    
    // Initialize settings on first use
    settingsStore.initializeSettings();
    
    // Update our local reference
    settingsRef.value = settingsStore.settings;
  } catch (error) {
    console.error('Failed to initialize settings store in composable:', error);
    // Continue with default settings
  }
  
  // Use a safe getter for settings that works with or without Pinia
  const getSettings = (): UserSettings => {
    return settingsStore?.settings || settingsRef.value;
  };
  
  // Currency symbol helper
  const getCurrencySymbol = () => {
    if (getSettings().currency === 'EUR') {
      return '€';
    }
    return getSettings().currency;
  };
  
  // Format amount with currency symbol
  const formatAmount = (amount: number) => {
    // Handle NaN or undefined values
    if (amount === undefined || isNaN(amount)) {
      amount = 0;
    }
    
    const settings = getSettings();
    const locale = settings.language === 'en' ? 'en-US' : 'de-DE'; // Adjust based on supported languages
    
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: settings.currency || 'EUR'
      }).format(amount);
    } catch (error) {
      // Fallback to basic formatting if Intl.NumberFormat fails
      const symbol = getCurrencySymbol();
      return `${symbol}${amount.toFixed(2)}`;
    }
  };
  
  // Safe save function
  const saveSettings = (newSettings: UserSettings) => {
    if (settingsStore) {
      return settingsStore.saveSettings(newSettings);
    } else {
      settingsRef.value = { ...newSettings };
      return settingsRef.value;
    }
  };
  
  // Safe reset function
  const resetSettings = () => {
    if (settingsStore) {
      return settingsStore.resetSettings();
    } else {
      settingsRef.value = { ...defaultSettings };
      return settingsRef.value;
    }
  };
  
  return {
    // Safe access to settings
    settings: computed(() => getSettings()),
    
    // Utility functions
    getCurrencySymbol,
    formatAmount,
    saveSettings,
    resetSettings,
    
    // Convenience getters
    isDarkMode: computed(() => getSettings().darkMode),
    currentCurrency: computed(() => getSettings().currency),
  };
}; 