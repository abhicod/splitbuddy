<template>
  <div class="yearly-summary bg-white rounded-lg shadow p-6">
    <h2 class="text-lg font-bold text-gray-900 mb-6">Yearly Summary</h2>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <!-- Total Income -->
      <div class="summary-card border-l-4 border-green-500 p-4 bg-green-50 rounded">
        <p class="text-sm font-medium text-gray-600">Total Income</p>
        <p class="text-2xl font-bold text-green-600 mt-2">{{ formatCurrency(yearlyTotals.totalIncome) }}</p>
        <p class="text-xs text-gray-500 mt-2">Annual income</p>
      </div>

      <!-- Total Expenses -->
      <div class="summary-card border-l-4 border-red-500 p-4 bg-red-50 rounded">
        <p class="text-sm font-medium text-gray-600">Total Expenses</p>
        <p class="text-2xl font-bold text-red-600 mt-2">{{ formatCurrency(yearlyTotals.totalExpense) }}</p>
        <p class="text-xs text-gray-500 mt-2">Annual expenses</p>
      </div>

      <!-- Total Investment -->
      <div class="summary-card border-l-4 border-blue-500 p-4 bg-blue-50 rounded">
        <p class="text-sm font-medium text-gray-600">Total Investment</p>
        <p class="text-2xl font-bold text-blue-600 mt-2">{{ formatCurrency(yearlyTotals.totalInvestment) }}</p>
        <p class="text-xs text-gray-500 mt-2">Annual investments</p>
      </div>

      <!-- Net Balance -->
      <div :class="['summary-card border-l-4 p-4 rounded', yearlyTotals.totalNetBalance >= 0 ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50']">
        <p class="text-sm font-medium text-gray-600">Net Balance</p>
        <p :class="['text-2xl font-bold mt-2', yearlyTotals.totalNetBalance >= 0 ? 'text-green-600' : 'text-orange-600']">
          {{ formatCurrency(yearlyTotals.totalNetBalance) }}
        </p>
        <p class="text-xs text-gray-500 mt-2">{{ yearlyTotals.totalNetBalance >= 0 ? 'Annual surplus' : 'Annual deficit' }}</p>
      </div>
    </div>

    <!-- Additional Stats -->
    <div class="additional-stats mt-6 pt-6 border-t border-gray-200">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="stat-item">
          <p class="text-xs text-gray-500 uppercase tracking-wider">Average Monthly Income</p>
          <p class="text-lg font-bold text-gray-900 mt-1">{{ formatCurrency(yearlyTotals.totalIncome / 12) }}</p>
        </div>
        <div class="stat-item">
          <p class="text-xs text-gray-500 uppercase tracking-wider">Average Monthly Expenses</p>
          <p class="text-lg font-bold text-gray-900 mt-1">{{ formatCurrency(yearlyTotals.totalExpense / 12) }}</p>
        </div>
        <div class="stat-item">
          <p class="text-xs text-gray-500 uppercase tracking-wider">Savings Rate</p>
          <p class="text-lg font-bold text-green-600 mt-1">{{ savingsRate }}%</p>
        </div>
        <div class="stat-item">
          <p class="text-xs text-gray-500 uppercase tracking-wider">Expense Ratio</p>
          <p class="text-lg font-bold text-orange-600 mt-1">{{ expenseRatio }}%</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useExpenseStore } from '@/store/ExpenseStore';
import { useAuthStore } from '@/store/AuthStore';

const expenseStore = useExpenseStore();
const authStore = useAuthStore();

const yearlyTotals = computed(() => expenseStore.yearlyReport?.yearlyTotals || {
  totalIncome: 0,
  totalExpense: 0,
  totalInvestment: 0,
  totalNetBalance: 0
});

const savingsRate = computed(() => {
  if (yearlyTotals.value.totalIncome === 0) return 0;
  const savings = yearlyTotals.value.totalIncome - yearlyTotals.value.totalExpense;
  return Math.round((savings / yearlyTotals.value.totalIncome) * 100);
});

const expenseRatio = computed(() => {
  if (yearlyTotals.value.totalIncome === 0) return 0;
  return Math.round((yearlyTotals.value.totalExpense / yearlyTotals.value.totalIncome) * 100);
});

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: authStore.user?.currency || 'USD'
  }).format(amount || 0);
};
</script>

<style scoped>
.yearly-summary {
  background: white;
}

.summary-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.summary-card:hover {
  transform: translateY(-2px);
}
</style>
