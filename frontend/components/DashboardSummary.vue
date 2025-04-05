<script setup lang="ts">
import { computed } from 'vue';
import { useTransactionsStore } from '~/stores/transactions';
import { useSettings } from '~/composables/useSettings';
import { Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
} from 'chart.js';
import type { CategoryTotal } from '~/types/transaction';

// Register Chart.js components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
);

const transactionsStore = useTransactionsStore();
const { formatAmount, isDarkMode } = useSettings();

// Format currency for display
const formatCurrency = (amount: number): string => {
  // Handle NaN or undefined values
  if (amount === undefined || isNaN(amount)) {
    amount = 0;
  }
  
  try {
    return formatAmount(amount);
  } catch (err) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }
};

// Chart colors - adjust for dark mode
const chartColors = computed(() => {
  return {
    green: isDarkMode.value ? '#10B981' : '#10B981', // unchanged
    blue: isDarkMode.value ? '#3B82F6' : '#3B82F6', // unchanged
    purple: isDarkMode.value ? '#8B5CF6' : '#8B5CF6', // unchanged
    pink: isDarkMode.value ? '#EC4899' : '#EC4899', // unchanged
    amber: isDarkMode.value ? '#F59E0B' : '#F59E0B', // unchanged
    gray: isDarkMode.value ? '#9CA3AF' : '#6B7280', // lighter in dark mode
    
    darkGreen: isDarkMode.value ? '#059669' : '#059669',
    darkBlue: isDarkMode.value ? '#2563EB' : '#2563EB',
    darkPurple: isDarkMode.value ? '#7C3AED' : '#7C3AED',
    darkPink: isDarkMode.value ? '#DB2777' : '#DB2777',
    darkAmber: isDarkMode.value ? '#D97706' : '#D97706',
    darkGray: isDarkMode.value ? '#6B7280' : '#4B5563',
  };
});

// Category chart data
const categoryChartData = computed(() => {
  const categories = transactionsStore.categoryTotals;
  
  // Take top 5 categories and group the rest as "Other"
  const top5 = categories.slice(0, 5);
  const others = categories.slice(5).reduce(
    (acc, curr) => ({
      category: 'Other',
      total: acc.total + curr.total,
      percentage: 0 // Will be calculated below
    }),
    { category: 'Other', total: 0, percentage: 0 }
  );
  
  // Only add "Other" if it exists
  const chartCategories = others.total > 0 
    ? [...top5, others]
    : top5;
  
  // Calculate proper percentages based on the total
  const totalAmount = chartCategories.reduce((sum, cat) => sum + cat.total, 0);
  chartCategories.forEach(cat => {
    cat.percentage = totalAmount ? (cat.total / totalAmount * 100) : 0;
  });
  
  const colors = chartColors.value;
  
  return {
    labels: chartCategories.map(cat => cat.category),
    datasets: [
      {
        data: chartCategories.map(cat => cat.total),
        backgroundColor: [
          colors.green,
          colors.blue,
          colors.purple,
          colors.pink,
          colors.amber,
          colors.gray,
        ],
        hoverBackgroundColor: [
          colors.darkGreen,
          colors.darkBlue,
          colors.darkPurple,
          colors.darkPink,
          colors.darkAmber,
          colors.darkGray,
        ]
      }
    ]
  };
});

// Income vs Expense chart data
const incomeVsExpenseData = computed(() => {
  const colors = chartColors.value;
  
  return {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        data: [transactionsStore.totalIncome, transactionsStore.totalExpense],
        backgroundColor: [colors.green, '#EF4444'],
        hoverBackgroundColor: [colors.darkGreen, '#DC2626']
      }
    ]
  };
});

// Chart options with dark mode support
const doughnutOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 15,
          padding: 15,
          color: isDarkMode.value ? '#e2e2e2' : '#374151',
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.raw;
            const percentage = Math.round(context.parsed);
            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
          }
        },
        backgroundColor: isDarkMode.value ? 'rgba(45, 45, 58, 0.9)' : 'rgba(0, 0, 0, 0.7)',
        titleColor: isDarkMode.value ? '#ffffff' : '#ffffff',
        bodyColor: isDarkMode.value ? '#e2e2e2' : '#ffffff',
      }
    }
  };
});
</script>

<template>
  <div class="dashboard-summary">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Income Card -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Income</h3>
        <div class="text-2xl font-bold text-green-600 dark:text-green-400">
          {{ formatCurrency(transactionsStore.totalIncome) }}
        </div>
      </div>
      
      <!-- Expenses Card -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Expenses</h3>
        <div class="text-2xl font-bold text-red-600 dark:text-red-400">
          {{ formatCurrency(transactionsStore.totalExpense) }}
        </div>
      </div>
      
      <!-- Balance Card -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Balance</h3>
        <div 
          class="text-2xl font-bold"
          :class="transactionsStore.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
        >
          {{ formatCurrency(transactionsStore.balance) }}
        </div>
      </div>
    </div>
    
    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Expense by Category Chart -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Expenses by Category</h3>
        <div v-if="transactionsStore.categoryTotals.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-10">
          No expense data available
        </div>
        <div v-else class="h-64">
          <Doughnut :data="categoryChartData" :options="doughnutOptions" />
        </div>
      </div>
      
      <!-- Income vs Expense Chart -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Income vs Expenses</h3>
        <div v-if="transactionsStore.totalIncome === 0 && transactionsStore.totalExpense === 0" class="text-center text-gray-500 dark:text-gray-400 py-10">
          No transaction data available
        </div>
        <div v-else class="h-64">
          <Doughnut :data="incomeVsExpenseData" :options="doughnutOptions" />
        </div>
      </div>
    </div>
    
    <!-- Top Expenses -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
      <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Top Expense Categories</h3>
      <div v-if="transactionsStore.categoryTotals.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-4">
        No expense data available
      </div>
      <div v-else>
        <ul class="space-y-3">
          <li v-for="(category, index) in transactionsStore.categoryTotals.slice(0, 5)" :key="index" class="flex items-center">
            <div class="w-1/2">
              <div class="font-medium text-gray-800 dark:text-gray-200">{{ category.category }}</div>
            </div>
            <div class="w-1/4 text-right font-medium text-red-600 dark:text-red-400">
              {{ formatCurrency(category.total) }}
            </div>
            <div class="w-1/4 pl-4">
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  class="bg-red-600 dark:bg-red-500 h-2.5 rounded-full"
                  :style="{ width: `${Math.min(category.percentage, 100)}%` }"
                ></div>
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">
                {{ Math.round(category.percentage) }}%
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-summary {
  @apply space-y-6;
}
</style> 