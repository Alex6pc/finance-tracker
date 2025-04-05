<script setup lang="ts">
import { useTransactionsStore } from '~/stores/transactions';
import { ref, onMounted } from 'vue';
import type { FilterTransactionDto, Transaction } from '~/types/transaction';

definePageMeta({
  name: 'Transactions',
  layout: 'default',
});

const transactionsStore = useTransactionsStore();
const showFilters = ref(false);
const showAddModal = ref(false);
const successMessage = ref<string | null>(null);

// Modal
const selectedTransaction = ref<Transaction | null>(null);
const isEditing = ref(false);

// Clear success message after delay
const clearSuccessMessage = () => {
  setTimeout(() => {
    successMessage.value = null;
  }, 3000);
};

// Load transactions when component mounts
onMounted(async () => {
  await transactionsStore.fetchTransactions();
});

// Handle filter submission
const handleFilter = (filters: FilterTransactionDto) => {
  transactionsStore.setFilter(filters);
  transactionsStore.fetchTransactions();
  showFilters.value = false;
};

// Toggle filter visibility
const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

// Open add transaction modal
const openAddModal = () => {
  selectedTransaction.value = null;
  isEditing.value = false;
  showAddModal.value = true;
};

// Open edit transaction modal
const editTransaction = (transaction: Transaction) => {
  navigateTo(`/transactions/edit/${transaction.id}`);
};

// Close modal
const closeModal = () => {
  showAddModal.value = false;
  selectedTransaction.value = null;
};

// Handle transaction deletion
const deleteTransaction = async (id: string) => {
  try {
    if (confirm('Are you sure you want to delete this transaction?')) {
      // Show loading indicator
      transactionsStore.isLoading = true;
      
      // Delete from backend
      await transactionsStore.deleteTransaction(id);
      
      // Show success message
      successMessage.value = 'Transaction deleted successfully';
      clearSuccessMessage();
    }
  } catch (error) {
    console.error('Failed to delete transaction:', error);
    alert('Failed to delete the transaction. Please try again.');
  } finally {
    // Ensure loading indicator is removed
    transactionsStore.isLoading = false;
  }
};

// Handle transaction form submission
const handleTransactionSubmit = async (formData: any) => {
  try {
    if (isEditing.value && selectedTransaction.value) {
      await transactionsStore.updateTransaction(selectedTransaction.value.id, formData);
    } else {
      await transactionsStore.createTransaction(formData);
    }
    showAddModal.value = false;
  } catch (error) {
    console.error('Failed to save transaction:', error);
  }
};

// Refresh transactions
const refreshTransactions = async () => {
  await transactionsStore.fetchTransactions();
};
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-0">Transactions</h1>
      
      <div class="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
        <button 
          @click="refreshTransactions" 
          class="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
          :disabled="transactionsStore.isLoading"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
        
        <button 
          @click="toggleFilters" 
          class="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {{ showFilters ? 'Hide Filters' : 'Show Filters' }}
        </button>
        
        <button 
          @click="openAddModal" 
          class="flex items-center justify-center px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Transaction
        </button>
      </div>
    </div>
    
    <!-- Success message -->
    <div v-if="successMessage" class="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-4 rounded-lg mb-6 flex items-center justify-between">
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        {{ successMessage }}
      </div>
      <button @click="successMessage = null" class="text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
    
    <!-- Filters -->
    <div v-if="showFilters" class="mb-6">
      <TransactionFilter 
        :initial-filters="transactionsStore.filter" 
        @filter="handleFilter"
        @reset="transactionsStore.fetchTransactions()"
      />
    </div>
    <!-- Transaction list -->
    <TransactionList 
      :transactions="transactionsStore.sortedTransactions" 
      :loading="transactionsStore.isLoading"
      @view="transaction => navigateTo(`/transactions/${transaction.id}`)"
      @edit="editTransaction"
      @delete="deleteTransaction"
    />
    
    <!-- Add/Edit Transaction Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">
              {{ isEditing ? 'Edit Transaction' : 'Add New Transaction' }}
            </h2>
            <button 
              @click="closeModal" 
              class="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <TransactionForm 
            :initial-values="selectedTransaction || undefined" 
            :is-editing="isEditing"
            @submit="handleTransactionSubmit"
            @cancel="closeModal"
          />
        </div>
      </div>
    </div>
  </div>
</template> 