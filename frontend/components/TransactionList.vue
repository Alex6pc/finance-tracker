<script setup lang="ts">
import { TransactionType } from '~/types/transaction';
import type { Transaction } from '~/types/transaction';
import dayjs from 'dayjs';
import { useSettings } from '~/composables/useSettings';
import { ref } from 'vue';

const props = defineProps<{
  transactions: Transaction[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  edit: [transaction: Transaction];
  delete: [id: string];
  view: [transaction: Transaction];
}>();

// Track loading states for individual actions
const actionLoading = ref<{[id: string]: {delete?: boolean; edit?: boolean; view?: boolean}}>({});

// Use the settings composable for currency formatting
const { formatAmount } = useSettings();

const formatDate = (date: Date | string): string => {
  return dayjs(date).format('MMM D, YYYY');
};

// Use the formatAmount from the settings composable or fallback to Intl.NumberFormat
const formatCurrency = (amount: number): string => {
  try {
    // Try to use the formatAmount function from settings
    return formatAmount(amount);
  } catch (error) {
    // Fallback to default formatting
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }
};

const getAmountClass = (type: TransactionType): string => {
  return type === TransactionType.INCOME 
    ? 'text-green-600 dark:text-green-400' 
    : type === TransactionType.EXPENSE 
      ? 'text-red-600 dark:text-red-400' 
      : 'text-blue-600 dark:text-blue-400';
};

// Handle view transaction
const handleView = (transaction: Transaction) => {
  if (actionLoading.value[transaction.id]?.view) return;
  
  // Set loading state
  actionLoading.value[transaction.id] = {
    ...actionLoading.value[transaction.id],
    view: true
  };
  
  // Emit the view event
  emit('view', transaction);
  
  // Reset loading state after a short delay
  setTimeout(() => {
    if (actionLoading.value[transaction.id]) {
      actionLoading.value[transaction.id].view = false;
    }
  }, 500);
};

// Handle edit transaction
const handleEdit = (transaction: Transaction) => {
  if (actionLoading.value[transaction.id]?.edit) return;
  
  // Set loading state
  actionLoading.value[transaction.id] = {
    ...actionLoading.value[transaction.id],
    edit: true
  };
  
  // Emit the edit event
  emit('edit', transaction);
  
  // Reset loading state after a short delay
  setTimeout(() => {
    if (actionLoading.value[transaction.id]) {
      actionLoading.value[transaction.id].edit = false;
    }
  }, 500);
};

// Handle delete transaction with confirmation
const handleDelete = async (transaction: Transaction) => {
  if (actionLoading.value[transaction.id]?.delete) return;
  
  // Ask for confirmation
  const confirmDelete = window.confirm(
    `Are you sure you want to delete transaction "${transaction.description}" from ${formatDate(transaction.date)}?`
  );
  
  if (!confirmDelete) return;
  
  // Set loading state immediately for responsiveness
  actionLoading.value[transaction.id] = {
    ...actionLoading.value[transaction.id],
    delete: true
  };
  
  try {
    // Emit the delete event with the transaction ID
    emit('delete', transaction.id);
    
    // Keep the loading indicator on for 500ms at minimum to provide visual feedback
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (error) {
    console.error('Failed to delete transaction:', error);
    alert('Failed to delete transaction. Please try again.');
  } finally {
    // Clean up our loading state object to prevent memory leaks
    setTimeout(() => {
      if (actionLoading.value[transaction.id]) {
        // Don't reset if the row is already gone
        if (props.transactions.some(t => t.id === transaction.id)) {
          actionLoading.value[transaction.id].delete = false;
        } else {
          delete actionLoading.value[transaction.id];
        }
      }
    }, 500);
  }
};
</script>

<template>
  <div class="transaction-list">
    <div v-if="loading" class="flex justify-center my-10">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
    </div>
    
    <div v-else-if="transactions.length === 0" class="text-center my-10 text-gray-500 dark:text-gray-400">
      <p class="text-lg">No transactions found</p>
      <p class="text-sm">Try adjusting your filters or add new transactions</p>
    </div>
    
    <div v-else class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-100 dark:bg-gray-700 text-left">
            <th class="p-3 font-medium text-gray-700 dark:text-gray-300">Date</th>
            <th class="p-3 font-medium text-gray-700 dark:text-gray-300">Description</th>
            <th class="p-3 font-medium text-gray-700 dark:text-gray-300">Category</th>
            <th class="p-3 font-medium text-gray-700 dark:text-gray-300 text-right">Amount</th>
            <th class="p-3 font-medium text-gray-700 dark:text-gray-300 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="transaction in transactions" 
            :key="transaction.id"
            class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors transaction-row"
            :class="{ 'deleting': actionLoading[transaction.id]?.delete }"
          >
            <td class="p-3 text-sm text-gray-700 dark:text-gray-300">{{ formatDate(transaction.date) }}</td>
            <td class="p-3">
              <div class="font-medium text-gray-800 dark:text-gray-200">{{ transaction.description }}</div>
              <div v-if="transaction.note" class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{{ transaction.note }}</div>
            </td>
            <td class="p-3">
              <span class="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                {{ transaction.category || 'Uncategorized' }}
              </span>
            </td>
            <td class="p-3 text-right font-medium" :class="getAmountClass(transaction.type)">
              {{ transaction.type === TransactionType.EXPENSE ? '-' : '+' }} {{ formatCurrency(transaction.amount) }}
            </td>
            <td class="p-3 text-center">
              <div class="flex justify-center space-x-2">
                <!-- View button -->
                <button 
                  @click="handleView(transaction)"
                  class="p-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                  title="View details"
                  :disabled="actionLoading[transaction.id]?.view"
                >
                  <svg v-if="actionLoading[transaction.id]?.view" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                
                <!-- Edit button -->
                <button 
                  @click="handleEdit(transaction)"
                  class="p-1.5 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-full transition-colors"
                  title="Edit transaction"
                  :disabled="actionLoading[transaction.id]?.edit"
                >
                  <svg v-if="actionLoading[transaction.id]?.edit" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                
                <!-- Delete button -->
                <button 
                  @click="handleDelete(transaction)"
                  class="p-1.5 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                  title="Delete transaction"
                  :disabled="actionLoading[transaction.id]?.delete"
                >
                  <svg v-if="actionLoading[transaction.id]?.delete" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.transaction-list {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden;
}

.transaction-row {
  transition: all 0.3s ease;
}

.transaction-row.deleting {
  opacity: 0.5;
  background-color: rgba(239, 68, 68, 0.1);
  transform: translateX(10px);
}
</style> 