<script setup lang="ts">
import { useTransactionsStore } from '~/stores/transactions';
import dayjs from 'dayjs';
import { useSettings } from '~/composables/useSettings';
import { TransactionType } from '~/types/transaction';

// Get transaction ID from route params
const route = useRoute();
const transactionId = route.params.id as string;

definePageMeta({
  name: 'TransactionDetails',
  layout: 'default',
});

const transactionsStore = useTransactionsStore();
const isLoading = ref(true);
const error = ref<string | null>(null);
const { formatAmount } = useSettings();

// Load transaction by ID
onMounted(async () => {
  await loadTransaction();
});

// Also refresh transactions list to ensure consistency
onMounted(async () => {
  await transactionsStore.fetchTransactions();
});

// Format date
const formatDate = (date: Date | string): string => {
  return dayjs(date).format('MMMM D, YYYY');
};

// Format currency
const formatCurrency = (amount: number): string => {
  try {
    return formatAmount(amount);
  } catch (error) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
};

// Get CSS class for transaction type
const getTransactionTypeClass = (type: TransactionType): string => {
  switch (type) {
    case TransactionType.INCOME:
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case TransactionType.EXPENSE:
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case TransactionType.TRANSFER:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
};

// Get CSS class for amount
const getAmountClass = (type: TransactionType): string => {
  return type === TransactionType.INCOME 
    ? 'text-green-600 dark:text-green-400' 
    : type === TransactionType.EXPENSE 
      ? 'text-red-600 dark:text-red-400' 
      : 'text-blue-600 dark:text-blue-400';
};

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

// Handle edit transaction
const handleEdit = () => {
  navigateTo(`/transactions/edit/${transactionId}`);
};

// Handle delete transaction
const handleDelete = async () => {
  if (!confirm('Are you sure you want to delete this transaction?')) return;
  
  isLoading.value = true;
  error.value = null;
  
  try {
    console.log('Deleting transaction:', transactionId);
    await transactionsStore.deleteTransaction(transactionId);
    // Navigate back to transactions list after successful deletion
    navigateTo('/transactions');
  } catch (err) {
    console.error('Failed to delete transaction:', err);
    error.value = 'Failed to delete transaction. Please try again.';
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex items-center mb-6">
      <button 
        @click="() => navigateTo('/transactions')"
        class="mr-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Transaction Details</h1>
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
    
    <!-- Transaction details -->
    <div v-else-if="transactionsStore.selectedTransaction" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div class="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {{ transactionsStore.selectedTransaction.description }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{ formatDate(transactionsStore.selectedTransaction.date) }}
          </p>
        </div>
        
        <div class="mt-4 md:mt-0 md:text-right">
          <span 
            class="inline-block px-3 py-1 rounded-full text-sm font-medium capitalize"
            :class="getTransactionTypeClass(transactionsStore.selectedTransaction.type)"
          >
            {{ transactionsStore.selectedTransaction.type }}
          </span>
          <p 
            class="text-2xl font-bold mt-2"
            :class="getAmountClass(transactionsStore.selectedTransaction.type)"
          >
            {{ transactionsStore.selectedTransaction.type === TransactionType.EXPENSE ? '-' : '+' }} 
            {{ formatCurrency(transactionsStore.selectedTransaction.amount) }}
          </p>
        </div>
      </div>
      
      <div class="border-t border-gray-200 dark:border-gray-700 py-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase mb-2">Category</h3>
            <p class="text-gray-900 dark:text-gray-100">
              {{ transactionsStore.selectedTransaction.category || 'Uncategorized' }}
            </p>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase mb-2">Payment Method</h3>
            <p class="text-gray-900 dark:text-gray-100">
              {{ transactionsStore.selectedTransaction.paymentMethod || 'Not specified' }}
            </p>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase mb-2">Recurring</h3>
            <p class="text-gray-900 dark:text-gray-100">
              {{ transactionsStore.selectedTransaction.isRecurring ? 'Yes' : 'No' }}
            </p>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase mb-2">Created At</h3>
            <p class="text-gray-900 dark:text-gray-100">
              {{ formatDate(transactionsStore.selectedTransaction.createdAt || new Date()) }}
            </p>
          </div>
        </div>
        
        <div v-if="transactionsStore.selectedTransaction.note" class="mt-6">
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase mb-2">Notes</h3>
          <p class="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
            {{ transactionsStore.selectedTransaction.note }}
          </p>
        </div>
      </div>
      
      <!-- Action buttons -->
      <div class="flex justify-end mt-6 space-x-3">
        <button 
          @click="handleEdit"
          class="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          :disabled="isLoading"
        >
          Edit
        </button>
        <button 
          @click="handleDelete"
          class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          :disabled="isLoading"
        >
          Delete
        </button>
      </div>
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