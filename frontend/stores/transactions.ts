import { defineStore } from 'pinia';
import { useApi } from '~/composables/useApi';
import type { Transaction, CreateTransactionDto, UpdateTransactionDto, FilterTransactionDto } from '~/types/transaction';
import { TransactionType } from '~/types/transaction';
import dayjs from 'dayjs';

export const useTransactionsStore = defineStore('transactions', () => {
  const api = useApi();
  
  // State
  const transactions = ref<Transaction[]>([]);
  const selectedTransaction = ref<Transaction | null>(null);
  const filter = ref<FilterTransactionDto>({
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
  });
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const sortedTransactions = computed(() => {
    return [...transactions.value].sort((a, b) => {
      return dayjs(b.date).valueOf() - dayjs(a.date).valueOf();
    });
  });

  const totalIncome = computed(() => {
    return transactions.value
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => {
        const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount;
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
  });

  const totalExpense = computed(() => {
    return transactions.value
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => {
        const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount;
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
  });

  const balance = computed(() => {
    const income = totalIncome.value || 0;
    const expense = totalExpense.value || 0;
    return income - expense;
  });

  const categoryTotals = computed(() => {
    const totals: Record<string, number> = {};
    
    transactions.value.forEach(transaction => {
      const category = transaction.category || 'Uncategorized';
      if (!totals[category]) {
        totals[category] = 0;
      }
      if (transaction.type === TransactionType.EXPENSE) {
        const amount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount;
        totals[category] += isNaN(amount) ? 0 : amount;
      }
    });

    // Convert to array and calculate percentages
    const totalExpenseAmount = totalExpense.value;
    return Object.entries(totals).map(([category, total]) => ({
      category,
      total,
      percentage: totalExpenseAmount ? (total / totalExpenseAmount * 100) : 0
    })).sort((a, b) => b.total - a.total);
  });

  // Actions
  async function fetchTransactions(filterParams?: FilterTransactionDto) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const params = filterParams || filter.value;
      transactions.value = await api.getTransactions(params);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch transactions';
      console.error(error.value);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchTransaction(id: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      selectedTransaction.value = await api.getTransaction(id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch transaction';
      console.error(error.value);
    } finally {
      isLoading.value = false;
    }
  }

  async function createTransaction(transactionData: CreateTransactionDto) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const newTransaction = await api.createTransaction(transactionData);
      transactions.value.push(newTransaction);
      return newTransaction;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create transaction';
      console.error(error.value);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateTransaction(id: string, transactionData: UpdateTransactionDto) {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Call the API to update transaction in the database
      const updatedTransaction = await api.updateTransaction(id, transactionData as any);
      
      // Update local state
      const index = transactions.value.findIndex(t => t.id === id);
      if (index !== -1) {
        transactions.value[index] = updatedTransaction;
      } else {
        // If transaction wasn't in the local list, add it
        transactions.value.push(updatedTransaction);
      }
      
      // Update selected transaction if currently selected
      if (selectedTransaction.value?.id === id) {
        selectedTransaction.value = updatedTransaction;
      }
      
      return updatedTransaction;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update transaction';
      console.error('Transaction update error:', error.value);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteTransaction(id: string) {
    isLoading.value = true;
    error.value = null;
    let previousLength = 0;
    
    try {
      // First check if the transaction exists
      const transactionExists = transactions.value.some(t => t.id === id);
      if (!transactionExists) {
        console.warn(`Transaction with ID ${id} not found in local state`);
      }
      
      // Store original length for comparison
      previousLength = transactions.value.length;
      
      // Remove from local state immediately for responsive UI
      transactions.value = transactions.value.filter(t => t.id !== id);
      
      // Clear selected transaction if it was deleted
      if (selectedTransaction.value?.id === id) {
        selectedTransaction.value = null;
      }
      
      // Call API to delete from backend
      await api.deleteTransaction(id);
      
      // Return success
      return { success: true, id };
    } catch (err) {
      // If API call fails, revert the local deletion
      if (transactions.value.length !== previousLength) {
        console.warn('API Error - transaction delete failed, need to refresh');
        // We could revert the transaction removal here, but it might be confusing
        // for users to see a transaction reappear. Instead, we'll log an error
        // and let them refresh.
      }
      
      error.value = err instanceof Error ? err.message : 'Failed to delete transaction';
      console.error('Delete transaction error:', error.value);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function importTransactions(file: File) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await api.importTransactions(file);
      // Refresh the transactions list after import
      await fetchTransactions();
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to import transactions';
      console.error(error.value);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function setFilter(newFilter: FilterTransactionDto) {
    filter.value = { ...filter.value, ...newFilter };
  }

  return {
    // State
    transactions,
    selectedTransaction,
    filter,
    isLoading,
    error,
    
    // Getters
    sortedTransactions,
    totalIncome,
    totalExpense,
    balance,
    categoryTotals,
    
    // Actions
    fetchTransactions,
    fetchTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    importTransactions,
    setFilter,
  };
}); 