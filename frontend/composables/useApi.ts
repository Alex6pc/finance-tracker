import { ref, computed } from 'vue';
import type { Transaction, CreateTransactionDto, UpdateTransactionDto, FilterTransactionDto } from '~/types/transaction';

const API_URL = 'http://localhost:3001/api';

export const useApi = () => {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const apiCall = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      // Check if there's content to parse
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      // If the response is empty or not JSON, return null for DELETE operations
      if (!contentType || !contentType.includes('application/json') || contentLength === '0') {
        if (options.method === 'DELETE') {
          return null as T;
        }
      }
      
      return await response.json() as T;
    } catch (err) {
      console.error('API Error:', err);
      error.value = err instanceof Error ? err.message : 'Unknown error occurred';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Transactions API
  const getTransactions = async (filter?: FilterTransactionDto): Promise<Transaction[]> => {
    let queryParams = '';
    if (filter) {
      const params = new URLSearchParams();
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
      queryParams = `?${params.toString()}`;
    }
    return await apiCall<Transaction[]>(`/transactions${queryParams}`);
  };

  const getTransaction = async (id: string): Promise<Transaction> => {
    return await apiCall<Transaction>(`/transactions/${id}`);
  };

  const createTransaction = async (transaction: CreateTransactionDto): Promise<Transaction> => {
    return await apiCall<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  };

  const updateTransaction = async (id: string, transaction: CreateTransactionDto): Promise<Transaction> => {
    // Clean the transaction data before sending to server
    const { id: _, isDeleted, createdAt, updatedAt, ...cleanData } = transaction as any;
    
    return await apiCall<Transaction>(`/transactions/${id}`, {
      method: 'PATCH',
       body: JSON.stringify(cleanData),
    });
  };

  const deleteTransaction = async (id: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      // Check if there's actually content before trying to parse JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json') && response.headers.get('content-length') !== '0') {
        await response.json(); // Only try to parse if there's JSON content
      }
      // No need to return anything for a delete operation
      return;
    } catch (err) {
      console.error('Delete Error:', err);
      error.value = err instanceof Error ? err.message : 'Unknown error occurred';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // File Import API
  const importTransactions = async (file: File): Promise<{ count: number }> => {
    isLoading.value = true;
    error.value = null;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/imports/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      console.error('Import Error:', err);
      error.value = err instanceof Error ? err.message : 'Unknown error occurred';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    getTransactions,
    getTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    importTransactions,
  };
}; 