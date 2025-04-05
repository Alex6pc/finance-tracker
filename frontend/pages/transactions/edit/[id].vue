<script setup lang="ts">
import { useTransactionsStore } from '~/stores/transactions';
import type { CreateTransactionDto, UpdateTransactionDto } from '~/types/transaction';

// Get transaction ID from route params
const route = useRoute();
const transactionId = route.params.id as string;

definePageMeta({
  name: 'EditTransaction',
  layout: 'default',
});

const transactionsStore = useTransactionsStore();
const isLoading = ref(true);
const error = ref<string | null>(null);
const isFormChanged = ref(false);

// Load transaction by ID
onMounted(async () => {
  await loadTransaction();
});

// Load transaction data
async function loadTransaction() {
  isLoading.value = true;
  error.value = null;
  
  try {
    await transactionsStore.fetchTransaction(transactionId);
  } catch (err) {
    console.error('Error loading transaction:', err);
    error.value = 'Failed to load transaction details. Please try again.';
  } finally {
    isLoading.value = false;
  }
}

// Track form changes
const handleFormChange = () => {
  isFormChanged.value = true;
};

// Handle form submission
const handleSubmit = async (formData: UpdateTransactionDto) => {
  // Ensure valid data
  if (!formData || Object.keys(formData).length === 0) {
    error.value = "No form data to submit";
    return;
  }
  
  isLoading.value = true;
  error.value = null;
  
  try {
    // Prepare the data for submission
    const dataToSubmit = {
      ...formData,
      // Ensure amount is a number
      amount: Number(formData.amount)
    };
    
    // Update the transaction in the database
    await transactionsStore.updateTransaction(transactionId, dataToSubmit);
    
    // Refresh transactions list in the store
    await transactionsStore.fetchTransactions();
    
    // Navigate to transaction details page after successful update
    navigateTo(`/transactions/${transactionId}`);
  } catch (err) {
    console.error('Failed to update transaction:', err);
    error.value = err instanceof Error ? err.message : 'Failed to update transaction. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Handle cancel
const handleCancel = () => {
  if (isFormChanged.value) {
    if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
      navigateTo(`/transactions/${transactionId}`);
    }
  } else {
    navigateTo(`/transactions/${transactionId}`);
  }
};
</script>

<template>
  <div>
    <div class="flex items-center mb-6">
      <button 
        @click="handleCancel"
        class="mr-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Transaction</h1>
    </div>
    
    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center my-10">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">
      {{ error }}
      <button 
        @click="loadTransaction" 
        class="ml-2 underline hover:text-red-800 dark:hover:text-red-200"
      >
        Try again
      </button>
    </div>
    
    <!-- Edit form -->
    <div v-else-if="transactionsStore.selectedTransaction" class="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <TransactionForm 
        :initial-values="transactionsStore.selectedTransaction" 
        :is-editing="true"
        @submit="handleSubmit"
        @cancel="handleCancel"
        @change="handleFormChange"
      />
    </div>
    
    <!-- Transaction not found -->
    <div v-else class="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 p-4 rounded-lg">
      Transaction not found or has been deleted. 
      <button 
        @click="() => navigateTo('/transactions')"
        class="ml-2 underline hover:text-yellow-800 dark:hover:text-yellow-200"
      >
        Return to transactions
      </button>
    </div>
  </div>
</template> 