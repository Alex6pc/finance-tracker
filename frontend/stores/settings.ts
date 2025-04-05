import { defineStore } from 'pinia';
import { ref } from 'vue';

// Define types for our settings
export interface UserSettings {
  currency: string;
  darkMode: boolean;
  // Keep these fields for future compatibility but they're not used in the UI for now
  dateFormat: string;
  language: string;
}

// Default settings
export const defaultSettings: UserSettings = {
  currency: 'EUR',
  dateFormat: 'DD/MM/YYYY',
  darkMode: true,
  language: 'en',
};

// Create a store that requires setup
export const useSettingsStore = defineStore('settings', () => {
  // State
  const settings = ref<UserSettings>({ ...defaultSettings });
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isInitialized = ref(false);

  // Initialize settings from localStorage
  function initializeSettings() {
    if (isInitialized.value) return;
    
    if (typeof window !== 'undefined') {
      try {
        const savedSettings = localStorage.getItem('user-settings');
        if (savedSettings) {
          settings.value = JSON.parse(savedSettings);
        }
      } catch (err) {
        console.error('Failed to parse saved settings', err);
        // Fallback to defaults if parse fails
        settings.value = { ...defaultSettings };
      }
      isInitialized.value = true;
    }
  }

  // Save settings
  function saveSettings(newSettings: UserSettings) {
    settings.value = { ...newSettings };
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('user-settings', JSON.stringify(settings.value));
      } catch (err) {
        console.error('Failed to save settings', err);
      }
    }
    
    return settings.value;
  }

  // Reset settings to defaults
  function resetSettings() {
    settings.value = { ...defaultSettings };
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('user-settings', JSON.stringify(settings.value));
      } catch (err) {
        console.error('Failed to save reset settings', err);
      }
    }
    
    return settings.value;
  }

  return {
    // State
    settings,
    isLoading,
    error,
    isInitialized,
    
    // Actions
    initializeSettings,
    saveSettings,
    resetSettings,
  };
}); 