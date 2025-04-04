<script setup lang="ts">
import { TransactionType } from '~/types/transaction';
import type { Transaction } from '~/types/transaction';
import dayjs from 'dayjs';

const props = defineProps<{
  transactions: Transaction[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  edit: [transaction: Transaction];
  delete: [id: string];
  view: [transaction: Transaction];
}>();

const formatDate = (date: Date | string): string => {
  return dayjs(date).format('MMM D, YYYY');
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const getAmountClass = (type: TransactionType): string => {
  return type === TransactionType.INCOME 
    ? 'text-green-600' 
    : type === TransactionType.EXPENSE 
      ? 'text-red-600' 
      : 'text-blue-600';
};
</script>

<template>
  <div class="transaction-list">
    <div v-if="loading" class="flex justify-center my-10">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
    
    <div v-else-if="transactions.length === 0" class="text-center my-10 text-gray-500">
      <p class="text-lg">No transactions found</p>
      <p class="text-sm">Try adjusting your filters or add new transactions</p>
    </div>
    
    <div v-else class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-100 text-left">
            <th class="p-3 font-medium">Date</th>
            <th class="p-3 font-medium">Description</th>
            <th class="p-3 font-medium">Category</th>
            <th class="p-3 font-medium text-right">Amount</th>
            <th class="p-3 font-medium text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="transaction in transactions" 
            :key="transaction.id"
            class="border-b border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <td class="p-3 text-sm">{{ formatDate(transaction.date) }}</td>
            <td class="p-3">
              <div class="font-medium">{{ transaction.description }}</div>
              <div v-if="transaction.note" class="text-xs text-gray-500 truncate max-w-xs">{{ transaction.note }}</div>
            </td>
            <td class="p-3">
              <span class="px-2 py-1 rounded-full text-xs font-medium bg-gray-100">
                {{ transaction.category || 'Uncategorized' }}
              </span>
            </td>
            <td class="p-3 text-right font-medium" :class="getAmountClass(transaction.type)">
              {{ transaction.type === TransactionType.EXPENSE ? '-' : '+' }} {{ formatCurrency(transaction.amount) }}
            </td>
            <td class="p-3 text-center">
              <div class="flex justify-center space-x-2">
                <button 
                  @click="emit('view', transaction)"
                  class="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                  title="View details"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button 
                  @click="emit('edit', transaction)"
                  class="p-1 text-yellow-600 hover:text-yellow-800 transition-colors"
                  title="Edit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button 
                  @click="emit('delete', transaction.id)"
                  class="p-1 text-red-600 hover:text-red-800 transition-colors"
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
  @apply bg-white rounded-lg shadow-md overflow-hidden;
}
</style> 