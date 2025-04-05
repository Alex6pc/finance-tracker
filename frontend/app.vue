<script>
// Immediately apply dark mode to avoid flash of light mode
if (typeof document !== 'undefined') {
  // Check localStorage first
  let isDarkMode = true; // Default to dark mode
  
  try {
    const savedSettings = localStorage.getItem('user-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      isDarkMode = settings.darkMode ?? true;
    }
  } catch (e) {
    // If error, keep the default dark mode
  }
  
  // Apply dark mode if needed
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  }
}
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
