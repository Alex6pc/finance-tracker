<script setup lang="ts">
definePageMeta({
  name: 'Settings',
  layout: 'default',
});

// Get direct access to dark mode functions from our plugin
const { $updateDarkMode } = useNuxtApp();

// Currency options - keep only Euro as requested
const currencies = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
];

// Initialize settings from localStorage
const settings = ref({
  currency: 'EUR',
  darkMode: true,
  dateFormat: 'DD/MM/YYYY',
  language: 'en',
});

// Load settings from localStorage on mount
onMounted(() => {
  try {
    const savedSettings = localStorage.getItem('user-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      settings.value = {
        ...settings.value,
        ...parsed
      };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
});

// Theme options
const themeOptions = [
  { value: false, label: 'Light Mode' },
  { value: true, label: 'Dark Mode' },
];

// Save settings
const saveSettings = () => {
  try {
    localStorage.setItem('user-settings', JSON.stringify(settings.value));
    
    // Update dark mode immediately
    if ($updateDarkMode) {
      $updateDarkMode(settings.value.darkMode);
    }
    
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

// Reset settings
const resetSettings = () => {
  settings.value = {
    currency: 'EUR',
    darkMode: true,
    dateFormat: 'DD/MM/YYYY',
    language: 'en',
  };
  
  try {
    localStorage.setItem('user-settings', JSON.stringify(settings.value));
    
    // Update dark mode immediately
    if ($updateDarkMode) {
      $updateDarkMode(settings.value.darkMode);
    }
  } catch (error) {
    console.error('Failed to reset settings:', error);
  }
};

// Clear transactions confirmation
const clearTransactions = () => {
  if (window.confirm('Are you sure? This action cannot be undone.')) {
  }
};
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Settings</h1>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div class="p-6">
        <form @submit.prevent="saveSettings">
          <!-- Appearance Settings -->
          <div class="mb-8">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Appearance</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Currency -->
              <div>
                <label for="currency" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                <select 
                  id="currency" 
                  v-model="settings.currency"
                  class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <option v-for="currency in currencies" :key="currency.code" :value="currency.code">
                    {{ currency.symbol }} - {{ currency.name }}
                  </option>
                </select>
              </div>
              
              <!-- Theme -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Theme</label>
                <div class="mt-1 space-y-2">
                  <div 
                    v-for="option in themeOptions" 
                    :key="String(option.value)"
                    class="flex items-center"
                  >
                    <input 
                      type="radio" 
                      :id="'theme-' + option.value" 
                      :value="option.value" 
                      v-model="settings.darkMode"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label :for="'theme-' + option.value" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      {{ option.label }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Data Management -->
          <!-- <div class="mb-8">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Data Management</h2>
            
            <div class="space-y-4">
              <button 
                type="button" 
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Export All Transactions
              </button>
              
              <button 
                type="button" 
                class="px-4 py-2 border border-red-300 rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-red-700 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-gray-600"
                @click="clearTransactions"
              >
                Clear All Transactions
              </button>
            </div>
          </div> -->
          
          <!-- Actions -->
          <div class="flex justify-end space-x-3 border-t dark:border-gray-700 pt-6">
            <button 
              type="button" 
              @click="resetSettings"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Reset to Defaults
            </button>
            <button 
              type="submit" 
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- App Information -->
    <div class="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
      <p>FinanceTracker v1.0.0</p>
      <p class="mt-1">Built with Nuxt 3 and NestJS</p>
    </div>
  </div>
</template> 