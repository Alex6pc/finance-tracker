<script setup lang="ts">
// Mobile menu state
const isMobileMenuOpen = ref(false);

// Toggle mobile menu
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

// Dark mode
const { $isDarkMode } = useNuxtApp();
const isDarkMode = ref(false);

onMounted(() => {
  // Get the dark mode state when component mounts
  if ($isDarkMode) {
    isDarkMode.value = $isDarkMode();
  }
});

// Navigation items
const navItems = [
  { name: 'Dashboard', path: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: 'Transactions', path: '/transactions', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { name: 'Import', path: '/import', icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' },
  { name: 'Settings', path: '/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
];
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Mobile menu overlay -->
    <div 
      v-if="isMobileMenuOpen" 
      class="fixed inset-0 bg-gray-800 bg-opacity-75 z-20 lg:hidden"
      @click="toggleMobileMenu"
    ></div>
    
    <!-- Sidebar -->
    <aside 
      class="fixed top-0 left-0 z-30 h-screen transition-transform bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 lg:translate-x-0"
      :class="[isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full', 'w-64']"
    >
      <!-- Logo -->
      <div class="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd" />
          </svg>
          <span class="ml-2 text-xl font-bold text-gray-900 dark:text-white">FinanceTracker</span>
        </div>
        <!-- Close button for mobile -->
        <button 
          @click="toggleMobileMenu"
          class="p-1 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Navigation -->
      <nav class="px-2 py-4 space-y-1 dark:bg-gray-600">
        <NuxtLink 
          v-for="item in navItems" 
          :key="item.name"
          :to="item.path"
          class="flex items-center px-4 py-2 text-sm font-medium rounded-md group"
          :class="$route.path === item.path ? 
            'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 
            'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
          </svg>
          {{ item.name }}
        </NuxtLink>
      </nav>
    </aside>
    
    <!-- Main content -->
    <div class="lg:pl-64">
      <!-- Top navigation -->
      <header class="flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 lg:px-6">
        <!-- Mobile menu button -->
        <button 
          @click="toggleMobileMenu"
          class="p-1 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <!-- Page title (on mobile) -->
        <div class="lg:hidden">
          <h1 class="text-lg font-semibold text-gray-900 dark:text-white">{{ $route.name }}</h1>
        </div>
        
        <!-- User menu -->
        <div class="flex items-center">
          <button class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 rounded-full hover:text-gray-900 dark:hover:text-white focus:outline-none">
            <span class="sr-only">Open user menu</span>
            <div class="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white">
              U
            </div>
            <span class="ml-2 hidden md:block">User</span>
          </button>
        </div>
      </header>
      
      <!-- Page content -->
      <main class="container px-4 py-6 mx-auto lg:px-8">
        <slot />
      </main>
    </div>
  </div>
</template> 