<script setup lang="ts">
import { computed } from 'vue';
import { useTransactionsStore } from '~/stores/transactions';
import { Bar, Doughnut } from 'vue-chartjs';
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

// Format currency for display
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

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
  
  return {
    labels: chartCategories.map(cat => cat.category),
    datasets: [
      {
        data: chartCategories.map(cat => cat.total),
        backgroundColor: [
          '#10B981', // green
          '#3B82F6', // blue
          '#8B5CF6', // purple
          '#EC4899', // pink
          '#F59E0B', // amber
          '#6B7280', // gray
        ],
        hoverBackgroundColor: [
          '#059669', // darker green
          '#2563EB', // darker blue
          '#7C3AED', // darker purple
          '#DB2777', // darker pink
          '#D97706', // darker amber
          '#4B5563', // darker gray
        ]
      }
    ]
  };
});

// Income vs Expense chart data
const incomeVsExpenseData = computed(() => {
  return {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        data: [transactionsStore.totalIncome, transactionsStore.totalExpense],
        backgroundColor: ['#10B981', '#EF4444'],
        hoverBackgroundColor: ['#059669', '#DC2626']
      }
    ]
  };
});

// Chart options
const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        boxWidth: 15,
        padding: 15
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
      }
    }
  }
};
</script>

<template>
  <div class="dashboard-summary">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Income Card -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-gray-500 text-sm font-medium mb-1">Total Income</h3>
        <div class="text-2xl font-bold text-green-600">
          {{ formatCurrency(transactionsStore.totalIncome) }}
        </div>
      </div>
      
      <!-- Expenses Card -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-gray-500 text-sm font-medium mb-1">Total Expenses</h3>
        <div class="text-2xl font-bold text-red-600">
          {{ formatCurrency(transactionsStore.totalExpense) }}
        </div>
      </div>
      
      <!-- Balance Card -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-gray-500 text-sm font-medium mb-1">Balance</h3>
        <div 
          class="text-2xl font-bold"
          :class="transactionsStore.balance >= 0 ? 'text-green-600' : 'text-red-600'"
        >
          {{ formatCurrency(transactionsStore.balance) }}
        </div>
      </div>
    </div>
    
    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Expense by Category Chart -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold mb-4">Expenses by Category</h3>
        <div v-if="transactionsStore.categoryTotals.length === 0" class="text-center text-gray-500 py-10">
          No expense data available
        </div>
        <div v-else class="h-64">
          <Doughnut :data="categoryChartData" :options="doughnutOptions" />
        </div>
      </div>
      
      <!-- Income vs Expense Chart -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold mb-4">Income vs Expenses</h3>
        <div v-if="transactionsStore.totalIncome === 0 && transactionsStore.totalExpense === 0" class="text-center text-gray-500 py-10">
          No transaction data available
        </div>
        <div v-else class="h-64">
          <Doughnut :data="incomeVsExpenseData" :options="doughnutOptions" />
        </div>
      </div>
    </div>
    
    <!-- Top Expenses -->
    <div class="bg-white rounded-lg shadow-md p-6 mt-6">
      <h3 class="text-lg font-semibold mb-4">Top Expense Categories</h3>
      <div v-if="transactionsStore.categoryTotals.length === 0" class="text-center text-gray-500 py-4">
        No expense data available
      </div>
      <div v-else>
        <ul class="space-y-3">
          <li v-for="(category, index) in transactionsStore.categoryTotals.slice(0, 5)" :key="index" class="flex items-center">
            <div class="w-1/2">
              <div class="font-medium">{{ category.category }}</div>
            </div>
            <div class="w-1/4 text-right font-medium text-red-600">
              {{ formatCurrency(category.total) }}
            </div>
            <div class="w-1/4 pl-4">
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  class="bg-red-600 h-2.5 rounded-full"
                  :style="{ width: `${Math.min(category.percentage, 100)}%` }"
                ></div>
              </div>
              <div class="text-xs text-gray-500 text-right mt-1">
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