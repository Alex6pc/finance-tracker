<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { TransactionType } from '~/types/transaction';
import type { FilterTransactionDto } from '~/types/transaction';
import dayjs from 'dayjs';

const props = defineProps<{
  initialFilters?: FilterTransactionDto;
}>();

const emit = defineEmits<{
  filter: [filters: FilterTransactionDto];
  reset: [];
}>();

// Predefined date ranges
const dateRanges = [
  { label: 'Last 7 days', value: '7days' },
  { label: 'Last 30 days', value: '30days' },
  { label: 'This month', value: 'thisMonth' },
  { label: 'Last month', value: 'lastMonth' },
  { label: 'This year', value: 'thisYear' },
  { label: 'Custom range', value: 'custom' }
];

// Categories
const categories = [
  'All',
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

// Filter state
const filters = ref<FilterTransactionDto>({
  startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
  endDate: dayjs().format('YYYY-MM-DD'),
  type: undefined,
  category: undefined,
  minAmount: undefined,
  maxAmount: undefined,
  searchTerm: ''
});

// Selected range for date picker
const selectedRange = ref('30days');

// Watch for prop changes
watch(() => props.initialFilters, () => {
  if (props.initialFilters) {
    filters.value = { ...props.initialFilters };
    detectDateRange();
  }
}, { immediate: true });

// Set date range based on selection
const setDateRange = (range: string) => {
  selectedRange.value = range;
  
  switch (range) {
    case '7days':
      filters.value.startDate = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
      filters.value.endDate = dayjs().format('YYYY-MM-DD');
      break;
    case '30days':
      filters.value.startDate = dayjs().subtract(30, 'day').format('YYYY-MM-DD');
      filters.value.endDate = dayjs().format('YYYY-MM-DD');
      break;
    case 'thisMonth':
      filters.value.startDate = dayjs().startOf('month').format('YYYY-MM-DD');
      filters.value.endDate = dayjs().format('YYYY-MM-DD');
      break;
    case 'lastMonth':
      filters.value.startDate = dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
      filters.value.endDate = dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
      break;
    case 'thisYear':
      filters.value.startDate = dayjs().startOf('year').format('YYYY-MM-DD');
      filters.value.endDate = dayjs().format('YYYY-MM-DD');
      break;
    case 'custom':
      // Keep existing dates for custom range
      break;
  }
};

// Detect the date range from current start/end dates
const detectDateRange = () => {
  if (!filters.value.startDate || !filters.value.endDate) {
    selectedRange.value = '30days';
    return;
  }
  
  const start = dayjs(filters.value.startDate);
  const end = dayjs(filters.value.endDate);
  
  if (start.isSame(dayjs().subtract(7, 'day'), 'day') && end.isSame(dayjs(), 'day')) {
    selectedRange.value = '7days';
  } else if (start.isSame(dayjs().subtract(30, 'day'), 'day') && end.isSame(dayjs(), 'day')) {
    selectedRange.value = '30days';
  } else if (start.isSame(dayjs().startOf('month'), 'day') && end.isSame(dayjs(), 'day')) {
    selectedRange.value = 'thisMonth';
  } else if (
    start.isSame(dayjs().subtract(1, 'month').startOf('month'), 'day') && 
    end.isSame(dayjs().subtract(1, 'month').endOf('month'), 'day')
  ) {
    selectedRange.value = 'lastMonth';
  } else if (start.isSame(dayjs().startOf('year'), 'day') && end.isSame(dayjs(), 'day')) {
    selectedRange.value = 'thisYear';
  } else {
    selectedRange.value = 'custom';
  }
};

// Watch for date changes to handle manual input
watch([() => filters.value.startDate, () => filters.value.endDate], () => {
  detectDateRange();
});

// Handle form submission
const handleSubmit = () => {
  emit('filter', { ...filters.value });
};

// Reset filters
const resetFilters = () => {
  filters.value = {
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    type: undefined,
    category: undefined,
    minAmount: undefined,
    maxAmount: undefined,
    searchTerm: ''
  };
  selectedRange.value = '30days';
  emit('reset');
};

// Handle category selection
const handleCategoryChange = (category: string) => {
  filters.value.category = category === 'All' ? undefined : category;
};
</script>

<template>
  <div class="transaction-filter bg-white rounded-lg shadow-md p-6">
    <form @submit.prevent="handleSubmit">
      <!-- Search Term -->
      <div class="mb-4">
        <label for="searchTerm" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
        <input 
          type="text" 
          id="searchTerm" 
          v-model="filters.searchTerm"
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search descriptions, categories, etc."
        />
      </div>
      
      <!-- Date Range Selection -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
        <div class="flex flex-wrap gap-2 mb-3">
          <button 
            v-for="range in dateRanges" 
            :key="range.value"
            type="button"
            @click="setDateRange(range.value)"
            class="px-3 py-1 text-sm rounded-full transition-colors"
            :class="selectedRange === range.value 
              ? 'bg-blue-100 text-blue-800 border border-blue-300'
              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'"
          >
            {{ range.label }}
          </button>
        </div>
        
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="startDate" class="block text-sm text-gray-500 mb-1">Start Date</label>
            <input 
              type="date" 
              id="startDate" 
              v-model="filters.startDate"
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label for="endDate" class="block text-sm text-gray-500 mb-1">End Date</label>
            <input 
              type="date" 
              id="endDate" 
              v-model="filters.endDate"
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      
      <!-- Transaction Type -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
        <div class="flex space-x-3">
          <button 
            type="button"
            @click="filters.type = undefined"
            class="flex-1 py-2 px-3 text-center rounded-md transition-colors"
            :class="filters.type === undefined 
              ? 'bg-gray-800 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          >
            All
          </button>
          <button 
            type="button"
            @click="filters.type = TransactionType.INCOME"
            class="flex-1 py-2 px-3 text-center rounded-md transition-colors"
            :class="filters.type === TransactionType.INCOME 
              ? 'bg-green-600 text-white' 
              : 'bg-green-100 text-green-700 hover:bg-green-200'"
          >
            Income
          </button>
          <button 
            type="button"
            @click="filters.type = TransactionType.EXPENSE"
            class="flex-1 py-2 px-3 text-center rounded-md transition-colors"
            :class="filters.type === TransactionType.EXPENSE 
              ? 'bg-red-600 text-white' 
              : 'bg-red-100 text-red-700 hover:bg-red-200'"
          >
            Expense
          </button>
          <button 
            type="button"
            @click="filters.type = TransactionType.TRANSFER"
            class="flex-1 py-2 px-3 text-center rounded-md transition-colors"
            :class="filters.type === TransactionType.TRANSFER 
              ? 'bg-blue-600 text-white' 
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'"
          >
            Transfer
          </button>
        </div>
      </div>
      
      <!-- Amount Range -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Amount Range</label>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="minAmount" class="block text-sm text-gray-500 mb-1">Min</label>
            <div class="relative">
              <span class="absolute left-3 top-2 text-gray-500">$</span>
              <input 
                type="number" 
                id="minAmount" 
                v-model="filters.minAmount"
                min="0"
                step="0.01"
                class="w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label for="maxAmount" class="block text-sm text-gray-500 mb-1">Max</label>
            <div class="relative">
              <span class="absolute left-3 top-2 text-gray-500">$</span>
              <input 
                type="number" 
                id="maxAmount" 
                v-model="filters.maxAmount"
                min="0"
                step="0.01"
                class="w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Category -->
      <div class="mb-4">
        <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select 
          id="category" 
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          @change="handleCategoryChange($event.target.value)"
        >
          <option 
            v-for="category in categories" 
            :key="category" 
            :value="category"
            :selected="category === 'All' ? filters.category === undefined : filters.category === category"
          >
            {{ category }}
          </option>
        </select>
      </div>
      
      <!-- Actions -->
      <div class="flex space-x-3">
        <button 
          type="button" 
          @click="resetFilters"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Reset
        </button>
        <button 
          type="submit" 
          class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Apply Filters
        </button>
      </div>
    </form>
  </div>
</template>

<style lang="scss" scoped>
.transaction-filter {
  @apply mb-6;
}
</style> 