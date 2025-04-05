<script setup lang="ts">
import { useTransactionsStore } from '~/stores/transactions';
import { onMounted } from 'vue';

definePageMeta({
  name: 'Dashboard',
  layout: 'default',
});

const transactionsStore = useTransactionsStore();

// Load transactions when component mounts
onMounted(async () => {
  await transactionsStore.fetchTransactions();
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Dashboard</h1>
    
    <DashboardSummary />
    
    <!-- Recent Transactions -->
    <div class="mt-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Transactions</h2>
        <NuxtLink 
          to="/transactions" 
          class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
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