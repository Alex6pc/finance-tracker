<script setup lang="ts">
import { useTransactionsStore } from '~/stores/transactions';

definePageMeta({
  name: 'Import',
  layout: 'default',
});

const transactionsStore = useTransactionsStore();
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Import Transactions</h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Import form -->
      <div class="lg:col-span-2">
        <ImportTransactions />
      </div>
      
      <!-- Help section -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-semibold mb-4">How to Import Transactions</h2>
        
        <div class="space-y-4 text-gray-600">
          <div>
            <h3 class="font-medium text-gray-800 mb-1">1. Export from your bank</h3>
            <p>Log into your online banking portal and download your transactions as a CSV file.</p>
          </div>
          
          <div>
            <h3 class="font-medium text-gray-800 mb-1">2. Upload the CSV file</h3>
            <p>Drag and drop the CSV file into the upload area or click to browse your files.</p>
          </div>
          
          <div>
            <h3 class="font-medium text-gray-800 mb-1">3. Review and confirm</h3>
            <p>The system will process the file and import your transactions automatically.</p>
          </div>
          
          <div class="border-t pt-4 mt-4">
            <h3 class="font-medium text-gray-800 mb-1">Supported CSV Format</h3>
            <p class="mb-2">Your CSV file should contain the following columns:</p>
            <ul class="list-disc pl-5">
              <li>Date (required): The transaction date</li>
              <li>Description (required): Transaction description</li>
              <li>Amount (required): Transaction amount</li>
              <li>Category (optional): Transaction category</li>
              <li>Notes (optional): Additional information</li>
            </ul>
          </div>
          
          <div class="border-t pt-4 mt-4">
            <h3 class="font-medium text-gray-800 mb-1">Supported Banks</h3>
            <p>The import function can handle statements from most major banks.</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Recently imported transactions -->
    <div class="mt-10" v-if="transactionsStore.transactions.length > 0">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Recent Transactions</h2>
        <NuxtLink 
          to="/transactions" 
          class="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View All
        </NuxtLink>
      </div>
      
      <TransactionList 
        :transactions="transactionsStore.sortedTransactions.slice(0, 5)" 
        :loading="transactionsStore.isLoading"
        @view="transaction => navigateTo(`/transactions/${transaction.id}`)"
        @edit="transaction => navigateTo(`/transactions/edit/${transaction.id}`)"
        @delete="id => transactionsStore.deleteTransaction(id)"
      />
    </div>
  </div>
</template> 