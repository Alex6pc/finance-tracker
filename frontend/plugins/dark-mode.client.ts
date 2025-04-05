import { watch, ref, onMounted } from 'vue';
import { defaultSettings } from '~/stores/settings';

export default defineNuxtPlugin({
  name: 'dark-mode-plugin',
  enforce: 'post',
  async setup() {
    // Create a local reactive reference for dark mode - default to true
    const isDarkMode = ref(true);
    
    // Function to apply theme
    const applyTheme = () => {
      if (isDarkMode.value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    // Use a safe way to access localStorage
    const loadThemePreference = () => {
      try {
        if (typeof window !== 'undefined') {
          const savedSettings = localStorage.getItem('user-settings');
          if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            isDarkMode.value = settings.darkMode ?? true; // Default to true if not specified
          } else {
            // Default to dark mode even without saved settings
            isDarkMode.value = true;
            
            // Also check OS preference as a secondary factor
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            // If OS explicitly prefers light, we can honor that
            if (prefersDark === false) {
              isDarkMode.value = false;
            }
          }
        }
      } catch (err) {
        console.error('Failed to load theme preference:', err);
        // Fallback to dark mode
        isDarkMode.value = true;
      }
      
      // Apply the theme
      applyTheme();
    };
    
    // Load theme preference when plugin is initialized (client-side only)
    if (typeof window !== 'undefined') {
      loadThemePreference();
      
      // Watch for OS theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only update if there are no saved settings
        if (!localStorage.getItem('user-settings')) {
          isDarkMode.value = e.matches;
          applyTheme();
        }
      });
      
      // Watch for storage changes (in case settings are updated in another tab)
      window.addEventListener('storage', (e) => {
        if (e.key === 'user-settings') {
          loadThemePreference();
        }
      });
    }
    
    return {
      provide: {
        // Provide useful functions to components
        updateDarkMode: (value: boolean) => {
          isDarkMode.value = value;
          applyTheme();
        },
        isDarkMode: () => isDarkMode.value
      }
    };
  }
}); 