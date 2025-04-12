<script setup lang="ts">
import { useTransactionsStore } from '~/stores/transactions';
import { ref, onMounted } from 'vue';
import type { Transaction } from '~/types/transaction';
import dayjs from 'dayjs';

definePageMeta({
  name: 'Import',
  layout: 'default',
});

// Get current year and month for sample data
const currentYear = new Date().getFullYear();
const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
const formatDate = (day: string | number): string => `${currentYear}-${currentMonth}-${day.toString().padStart(2, '0')}`;

const transactionsStore = useTransactionsStore();
const isLoading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);

// Sample CSV data for demo purposes with dynamic dates
const sampleCsvData = ref(`date,description,amount,category,notes
${formatDate('01')},Salary Deposit,2500.00,Income,Monthly salary
${formatDate('02')},Rent Payment,-1200.00,Housing,Monthly rent
${formatDate('03')},Grocery Shopping,-150.25,Food & Dining,Weekly grocery shopping
${formatDate('05')},Electricity Bill,-85.50,Utilities,Monthly bill
${formatDate('10')},Restaurant,-65.30,Food & Dining,Dinner with friends
${formatDate('15')},Gas Station,-45.00,Transportation,Car fuel
${formatDate('20')},Freelance Project,350.00,Income,Website development
${formatDate('25')},Gift Received,100.00,Income,Birthday gift`);

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

// Handle successful import
const handleImportSuccess = async () => {
  // Refresh transactions after successful import
  await loadTransactions();
  successMessage.value = 'Transactions imported successfully!';
  setTimeout(() => {
    successMessage.value = null;
  }, 3000);
};

// Function to use sample data
const useSampleData = () => {
  // Create a blob from the sample CSV data
  const blob = new Blob([sampleCsvData.value], { type: 'text/csv' });
  
  // Create a File object from the blob
  const file = new File([blob], 'sample_transactions.csv', { type: 'text/csv' });
  
  // Import the sample data
  importSampleData(file);
};

// Import sample data
const importSampleData = async (file: File) => {
  isLoading.value = true;
  error.value = null;
  successMessage.value = null;
  
  try {
    console.log('Importing sample data...', file.name, file.size);
    
    if (!file || file.size === 0) {
      throw new Error('Invalid file or empty file');
    }
    
    // Show processing message
    successMessage.value = 'Processing sample data...';
    
    // Import the transactions
    const result = await transactionsStore.importTransactions(file);
    console.log('Import result:', result);
    
    // Refresh the transactions list and show success message
    await loadTransactions();
    successMessage.value = `Successfully imported ${result?.count || 'multiple'} sample transactions!`;
    
    setTimeout(() => {
      successMessage.value = null;
    }, 3000);
  } catch (err) {
    console.error('Failed to import sample data:', err);
    error.value = err instanceof Error 
      ? `Failed to import sample data: ${err.message}` 
      : 'Failed to import sample data. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Export current transactions as CSV
const exportTransactionsAsCsv = () => {
  // Get transactions from the store
  const transactions = transactionsStore.transactions;
  
  if (transactions.length === 0) {
    error.value = 'No transactions to export.';
    return;
  }
  
  // CSV header - use lowercase like in the working file
  let csvContent = 'date,description,amount,category,notes\n';
  
  // Add transaction data
  transactions.forEach(transaction => {
    const row = [
      transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : '',
      transaction.description ? `"${transaction.description.replace(/"/g, '""')}"` : '',
      transaction.amount.toFixed(2), // Format amount with 2 decimal places
      transaction.category ? `"${transaction.category.replace(/"/g, '""')}"` : '',
      transaction.note ? `"${transaction.note.replace(/"/g, '""')}"` : ''
    ];
    csvContent += row.join(',') + '\n';
  });
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `transactions_${currentYear}_${currentMonth}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  successMessage.value = 'Transactions exported successfully!';
  setTimeout(() => {
    successMessage.value = null;
  }, 3000);
};
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Import Transactions</h1>
    
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
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Import form -->
      <div class="lg:col-span-2">
        <ImportTransactions @import-success="handleImportSuccess" />
        
        <!-- Demo options -->
        <div class="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 class="text-lg font-semibold mb-4 dark:text-gray-100">Demo Options</h2>
          
          <div class="space-y-4">
            <div>
              <h3 class="font-medium text-gray-800 dark:text-gray-200 mb-3">Sample CSV Data</h3>
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-md overflow-auto mb-4 max-h-48">
                <pre class="text-xs text-gray-700 dark:text-gray-300">{{ sampleCsvData }}</pre>
              </div>
              <div class="flex space-x-3">
                <button 
                  @click="useSampleData" 
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="isLoading"
                >
                  <span v-if="isLoading">Processing...</span>
                  <span v-else>Import Sample Data</span>
                </button>
                <button 
                  @click="exportTransactionsAsCsv" 
                  class="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Export Current Transactions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Help section -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 class="text-lg font-semibold mb-4 dark:text-gray-100">How to Import Transactions</h2>
        
        <div class="space-y-4 text-gray-600 dark:text-gray-400">
          <div>
            <h3 class="font-medium text-gray-800 dark:text-gray-200 mb-1">1. Export from your bank</h3>
            <p>Log into your online banking portal and download your transactions as a CSV file.</p>
          </div>
          
          <div>
            <h3 class="font-medium text-gray-800 dark:text-gray-200 mb-1">2. Upload the CSV file</h3>
            <p>Drag and drop the CSV file into the upload area or click to browse your files.</p>
          </div>
          
          <div>
            <h3 class="font-medium text-gray-800 dark:text-gray-200 mb-1">3. Review and confirm</h3>
            <p>The system will process the file and import your transactions automatically.</p>
          </div>
          
          <div class="border-t dark:border-gray-700 pt-4 mt-4">
            <h3 class="font-medium text-gray-800 dark:text-gray-200 mb-1">Supported CSV Format</h3>
            <p class="mb-2">Your CSV file should contain the following columns:</p>
            <ul class="list-disc pl-5">
              <li>date (required): The transaction date (YYYY-MM-DD)</li>
              <li>description (required): Transaction description</li>
              <li>amount (required): Transaction amount (positive for income, negative for expenses)</li>
              <li>category (optional): Transaction category</li>
              <li>notes (optional): Additional information</li>
            </ul>
          </div>
          
          <div class="border-t dark:border-gray-700 pt-4 mt-4">
            <h3 class="font-medium text-gray-800 dark:text-gray-200 mb-1">Portfolio Demo</h3>
            <p>For demonstration purposes, you can use the sample data provided or export your current transactions.</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Recently imported transactions -->
    <div class="mt-10" v-if="transactionsStore.transactions.length > 0">
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