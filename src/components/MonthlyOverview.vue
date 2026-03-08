<template>
  <div class="monthly-overview-cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <!-- Total Income Card -->
    <div class="income-card bg-white rounded-lg shadow p-6 border-t-4 border-green-500">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Total Income</p>
          <p class="text-2xl font-bold text-gray-900 mt-2">
            {{ formatCurrency(summary?.totalIncome || 0) }}
          </p>
          <p class="text-xs text-green-600 mt-1">{{ incomeChange }}%</p>
        </div>
        <div class="income-icon p-3 bg-green-100 rounded-lg">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Total Expenses Card -->
    <div class="expense-card bg-white rounded-lg shadow p-6 border-t-4 border-red-500">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Total Expenses</p>
          <p class="text-2xl font-bold text-gray-900 mt-2">
            {{ formatCurrency(summary?.totalExpense || 0) }}
          </p>
          <p class="text-xs text-red-600 mt-1">{{ expenseChange }}%</p>
        </div>
        <div class="expense-icon p-3 bg-red-100 rounded-lg">
          <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Investments Card -->
    <div class="investment-card bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Investments</p>
          <p class="text-2xl font-bold text-gray-900 mt-2">
            {{ formatCurrency(summary?.totalInvestment || 0) }}
          </p>
          <p class="text-xs text-blue-600 mt-1">Allocated</p>
        </div>
        <div class="investment-icon p-3 bg-blue-100 rounded-lg">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Net Balance Card -->
    <div
      :class="[
        'net-balance-card bg-white rounded-lg shadow p-6 border-t-4',
        summary?.netBalance >= 0 ? 'border-green-500' : 'border-orange-500'
      ]"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Net Balance</p>
          <p :class="[
            'text-2xl font-bold mt-2',
            summary?.netBalance >= 0 ? 'text-green-600' : 'text-orange-600'
          ]">
            {{ formatCurrency(summary?.netBalance || 0) }}
          </p>
          <p class="text-xs text-gray-500 mt-1">
            {{ summary?.netBalance >= 0 ? 'Surplus' : 'Deficit' }}
          </p>
        </div>
        <div :class="[
          'balance-icon p-3 rounded-lg',
          summary?.netBalance >= 0 ? 'bg-green-100' : 'bg-orange-100'
        ]">
          <svg :class="[
            'w-6 h-6',
            summary?.netBalance >= 0 ? 'text-green-600' : 'text-orange-600'
          ]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Owed Amount Card (Optional - for group expenses) -->
    <div v-if="summary?.userOwedAmount > 0" class="owed-card bg-white rounded-lg shadow p-6 border-t-4 border-purple-500">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Amount Owed to You</p>
          <p class="text-2xl font-bold text-gray-900 mt-2">
            {{ formatCurrency(summary?.userOwedAmount || 0) }}
          </p>
          <p class="text-xs text-purple-600 mt-1">From group expenses</p>
        </div>
        <div class="owed-icon p-3 bg-purple-100 rounded-lg">
          <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
      </div>
    </div>

    <!-- You Owe Card (Optional - for group expenses) -->
    <div v-if="summary?.userOwesAmount > 0" class="owes-card bg-white rounded-lg shadow p-6 border-t-4 border-yellow-500">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Amount You Owe</p>
          <p class="text-2xl font-bold text-gray-900 mt-2">
            {{ formatCurrency(summary?.userOwesAmount || 0) }}
          </p>
          <p class="text-xs text-yellow-600 mt-1">From group expenses</p>
        </div>
        <div class="owes-icon p-3 bg-yellow-100 rounded-lg">
          <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 5v1m0-16v1m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
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

const summary = computed(() => expenseStore.monthlySummary?.summary);

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: authStore.user?.currency || 'USD'
  }).format(amount || 0);
};

// Default percentage changes (can be updated with historical data)
const incomeChange = computed(() => {
  // Placeholder: +5% growth. In production, compare with previous month
  return '+5';
});

const expenseChange = computed(() => {
  // Placeholder: -3% decrease. In production, compare with previous month
  return '-3';
});
</script>

<style scoped>
.monthly-overview-cards {
  margin: 0;
  padding: 0;
}
</style>
