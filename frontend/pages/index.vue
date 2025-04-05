<script setup lang="ts">
import { useTransactionsStore } from '~/stores/transactions';
import { onMounted, ref } from 'vue';
import type { Transaction } from '~/types/transaction';

definePageMeta({
  name: 'Dashboard',
  layout: 'default',
});

const transactionsStore = useTransactionsStore();
const isLoading = ref(false);
const error = ref<string | null>(null);

// Load transactions when component mounts
onMounted(async () => {
  await loadTransactions();
});

// Load transactions with error handling
async function loadTransactions() {
  isLoading.value = true;
  error.value = null;
  
  try {
    await transactionsStore.fetchTransactions();
  } catch (err) {
    console.error('Error loading transactions:', err);
    error.value = 'Failed to load transactions. Please try again.';
  } finally {
    isLoading.value = false;
  }
}

// Handle view transaction
const handleViewTransaction = (transaction: Transaction) => {
  navigateTo(`/transactions/${transaction.id}`);
};

// Handle edit transaction 
const handleEditTransaction = (transaction: Transaction) => {
  navigateTo(`/transactions/edit/${transaction.id}`);
};

// Handle delete transaction
const handleDeleteTransaction = async (id: string) => {
  isLoading.value = true;
  error.value = null;
  
  try {
    // Call the store action to delete the transaction
    await transactionsStore.deleteTransaction(id);
    
    // No need to refresh transactions after deletion
    // since the store already updates the local state
  } catch (err) {
    console.error('Failed to delete transaction:', err);
    error.value = 'Failed to delete transaction. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Dashboard</h1>
    
    <!-- Error display -->
    <div v-if="error" class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">
      {{ error }}
      <button 
        @click="loadTransactions" 
        class="ml-2 underline hover:text-red-800 dark:hover:text-red-200"
      >
        Try again
      </button>
    </div>
    
    <DashboardSummary />
    
    <!-- Recent Transactions -->
    <div class="mt-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Transactions</h2>
        <div class="flex items-center space-x-3">
          <button 
            v-if="isLoading" 
            class="text-sm font-medium text-gray-500 dark:text-gray-400 cursor-not-allowed"
            disabled
          >
            <span class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Refreshing...
            </span>
          </button>
          <button 
            v-else
            @click="loadTransactions" 
            class="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <span class="flex items-center">
              <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </span>
          </button>
          <NuxtLink 
            to="/transactions" 
            class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            View All
          </NuxtLink>
        </div>
      </div>
      
      <TransactionList 
        :transactions="transactionsStore.sortedTransactions.slice(0, 5)" 
        :loading="isLoading"
        @view="handleViewTransaction"
        @edit="handleEditTransaction"
        @delete="handleDeleteTransaction"
      />
    </div>
  </div>
</template> 