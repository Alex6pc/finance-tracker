<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { TransactionType } from '~/types/transaction';
import type { Transaction, CreateTransactionDto } from '~/types/transaction';
import dayjs from 'dayjs';

const props = defineProps<{
  initialValues?: Partial<Transaction>;
  isEditing?: boolean;
}>();

const emit = defineEmits<{
  submit: [transaction: CreateTransactionDto];
  cancel: [];
}>();

// Predefined categories
const categories = [
  'Income',
  'Housing',
  'Transportation',
  'Food & Dining',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Health',
  'Education',
  'Personal',
  'Travel',
  'Subscriptions',
  'Investments',
  'Gifts & Donations',
  'Bills & Fees',
  'Miscellaneous'
];

// Payment methods
const paymentMethods = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'PayPal',
  'Mobile Payment',
  'Check',
  'Crypto',
  'Other'
];

// Form state with default values
const form = ref<CreateTransactionDto>({
  description: '',
  amount: 0,
  type: TransactionType.EXPENSE,
  category: categories[0],
  date: dayjs().format('YYYY-MM-DD'),
  note: '',
  isRecurring: false,
  paymentMethod: paymentMethods[0]
});

// Form validation
const errors = ref<Partial<Record<keyof CreateTransactionDto, string>>>({});

// Initialize form with provided values if any
watch(() => props.initialValues, () => {
  if (props.initialValues) {
    form.value = {
      ...form.value,
      ...props.initialValues,
      // Format date for input
      date: props.initialValues.date ? dayjs(props.initialValues.date).format('YYYY-MM-DD') : form.value.date
    };
  }
}, { immediate: true });

// Computed title based on mode
const formTitle = computed(() => props.isEditing ? 'Edit Transaction' : 'Add New Transaction');

// Form validation
const validateForm = (): boolean => {
  errors.value = {};
  
  if (!form.value.description.trim()) {
    errors.value.description = 'Description is required';
  }
  
  if (form.value.amount <= 0) {
    errors.value.amount = 'Amount must be greater than zero';
  }
  
  if (!form.value.date) {
    errors.value.date = 'Date is required';
  }
  
  return Object.keys(errors.value).length === 0;
};

// Handle form submission
const handleSubmit = () => {
  if (validateForm()) {
    emit('submit', {
      ...form.value,
      // Ensure the date is in the correct format
      date: dayjs(form.value.date).toDate()
    });
  }
};
</script>

<template>
  <div class="transaction-form bg-white rounded-lg shadow-md p-6 dark:bg-gray-800 dark:text-white">
    <h2 class="text-xl font-bold mb-6">{{ formTitle }}</h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Transaction Type -->
      <div class="grid grid-cols-3 gap-4 mb-4">
        <div 
          v-for="type in Object.values(TransactionType)" 
          :key="type"
          class="relative"
        >
          <input 
            type="radio" 
            :id="type" 
            :value="type" 
            v-model="form.type"
            class="sr-only"
          />
          <label 
            :for="type" 
            class="block w-full py-2 px-4 text-center rounded-md cursor-pointer capitalize transition-colors"
            :class="{
              'bg-green-100 border-2 border-green-500 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-400': form.type === type && type === TransactionType.INCOME,
              'bg-red-100 border-2 border-red-500 text-red-700 dark:bg-red-900/30 dark:border-red-600 dark:text-red-400': form.type === type && type === TransactionType.EXPENSE,
              'bg-blue-100 border-2 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-400': form.type === type && type === TransactionType.TRANSFER,
              'bg-gray-100 border-2 border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300': form.type !== type
            }"
          >
            {{ type }}
          </label>
        </div>
      </div>

      <!-- Description -->
      <div class="form-group">
        <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
        <input 
          type="text" 
          id="description" 
          v-model="form.description"
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          :class="{ 'border-red-500 dark:border-red-500': errors.description }"
          placeholder="e.g. Grocery shopping, Rent payment"
        />
        <p v-if="errors.description" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.description }}</p>
      </div>

      <!-- Amount -->
      <div class="form-group">
        <label for="amount" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount *</label>
        <div class="relative">
          <span class="absolute left-3 top-2 text-gray-500 dark:text-gray-400">€</span>
          <input 
            type="number" 
            id="amount" 
            v-model="form.amount"
            min="0"
            step="0.01"
            class="w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            :class="{ 'border-red-500 dark:border-red-500': errors.amount }"
            placeholder="0.00"
          />
        </div>
        <p v-if="errors.amount" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.amount }}</p>
      </div>

      <!-- Date -->
      <div class="form-group">
        <label for="date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
        <input 
          type="date" 
          id="date" 
          v-model="form.date"
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          :class="{ 'border-red-500 dark:border-red-500': errors.date }"
        />
        <p v-if="errors.date" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.date }}</p>
      </div>

      <!-- Category -->
      <div class="form-group">
        <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
        <select 
          id="category" 
          v-model="form.category"
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>

      <!-- Payment Method -->
      <div class="form-group">
        <label for="paymentMethod" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
        <select 
          id="paymentMethod" 
          v-model="form.paymentMethod"
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option v-for="method in paymentMethods" :key="method" :value="method">
            {{ method }}
          </option>
        </select>
      </div>

      <!-- Note -->
      <div class="form-group">
        <label for="note" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note</label>
        <textarea 
          id="note" 
          v-model="form.note"
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Additional details about this transaction"
          rows="3"
        ></textarea>
      </div>

      <!-- Is Recurring -->
      <div class="form-group">
        <div class="flex items-center">
          <input 
            type="checkbox" 
            id="isRecurring" 
            v-model="form.isRecurring"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
          />
          <label for="isRecurring" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            This is a recurring transaction
          </label>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end space-x-3 pt-4">
        <button 
          type="button" 
          @click="emit('cancel')"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          {{ props.isEditing ? 'Update' : 'Save' }} Transaction
        </button>
      </div>
    </form>
  </div>
</template>

<style lang="scss" scoped>
.transaction-form {
  @apply max-w-2xl mx-auto;
}
</style> 