<template>
  <div class="category-breakdown bg-white rounded-lg shadow p-6">
    <div class="header mb-6">
      <h2 class="text-lg font-bold text-gray-900">Spending by Category</h2>
      <p class="text-sm text-gray-500 mt-1">Breakdown of your expenses this month</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!categories || categories.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No data available</h3>
      <p class="mt-1 text-sm text-gray-500">Start adding expenses to see category breakdown</p>
    </div>

    <!-- Category List -->
    <div v-else class="categories-list space-y-4">
      <div
        v-for="category in categories"
        :key="category.category"
        class="category-item"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <div :class="['category-icon p-2 rounded', getCategoryColor(category.category).bg]">
              <span>{{ getCategoryEmoji(category.category) }}</span>
            </div>
            <div>
              <p class="font-medium text-gray-900 capitalize">{{ category.category }}</p>
              <p class="text-xs text-gray-500">{{ getSpendingLabel(category) }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-semibold text-gray-900">{{ formatCurrency(category.expense) }}</p>
            <p :class="['text-xs', getCategoryColor(category.category).text]">
              {{ getPercentage(category.expense) }}%
            </p>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="progress-bar bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            :class="['h-full transition-all', getCategoryColor(category.category).barColor]"
            :style="{ width: getPercentage(category.expense) + '%' }"
          ></div>
        </div>
      </div>

      <!-- Income and Investment Summary -->
      <div v-if="totalIncome > 0 || totalInvestment > 0" class="income-investment-summary mt-6 pt-4 border-t border-gray-200">
        <div v-if="totalIncome > 0" class="flex items-center justify-between py-2">
          <span class="text-gray-600">Total Income:</span>
          <span class="font-semibold text-green-600">{{ formatCurrency(totalIncome) }}</span>
        </div>
        <div v-if="totalInvestment > 0" class="flex items-center justify-between py-2">
          <span class="text-gray-600">Total Investment:</span>
          <span class="font-semibold text-blue-600">{{ formatCurrency(totalInvestment) }}</span>
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

const categories = computed(() => expenseStore.monthlyAnalytics?.categoryBreakdown || []);
const loading = computed(() => expenseStore.loading);

const totalExpense = computed(() => {
  return categories.value.reduce((sum, cat) => sum + (cat.expense || 0), 0);
});

const totalIncome = computed(() => {
  return categories.value.reduce((sum, cat) => sum + (cat.income || 0), 0);
});

const totalInvestment = computed(() => {
  return categories.value.reduce((sum, cat) => sum + (cat.investment || 0), 0);
});

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: authStore.user?.currency || 'USD'
  }).format(amount || 0);
};

const getPercentage = (amount) => {
  if (totalExpense.value === 0) return 0;
  return Math.round((amount / totalExpense.value) * 100);
};

const getCategoryEmoji = (category) => {
  const emojis = {
    food: '🍽️',
    transport: '🚗',
    accommodation: '🏨',
    entertainment: '🎬',
    shopping: '🛍️',
    utilities: '⚡',
    salary: '💼',
    investment: '📈',
    other: '📂'
  };
  return emojis[category] || '📂';
};

const getCategoryColor = (category) => {
  const colors = {
    food: { bg: 'bg-orange-100', text: 'text-orange-600', barColor: 'bg-orange-500' },
    transport: { bg: 'bg-blue-100', text: 'text-blue-600', barColor: 'bg-blue-500' },
    accommodation: { bg: 'bg-purple-100', text: 'text-purple-600', barColor: 'bg-purple-500' },
    entertainment: { bg: 'bg-pink-100', text: 'text-pink-600', barColor: 'bg-pink-500' },
    shopping: { bg: 'bg-green-100', text: 'text-green-600', barColor: 'bg-green-500' },
    utilities: { bg: 'bg-yellow-100', text: 'text-yellow-600', barColor: 'bg-yellow-500' },
    salary: { bg: 'bg-emerald-100', text: 'text-emerald-600', barColor: 'bg-emerald-500' },
    investment: { bg: 'bg-indigo-100', text: 'text-indigo-600', barColor: 'bg-indigo-500' },
    other: { bg: 'bg-gray-100', text: 'text-gray-600', barColor: 'bg-gray-500' }
  };
  return colors[category] || colors.other;
};

const getSpendingLabel = (category) => {
  if (category.income > 0 && category.expense === 0) return 'Income';
  if (category.investment > 0 && category.expense === 0) return 'Investment';
  if (category.income > 0 && category.expense > 0) return 'Income & Expense';
  if (category.investment > 0 && category.expense > 0) return 'Investment & Expense';
  return 'Expenses';
};
</script>

<style scoped>
.category-breakdown {
  background: white;
  height: 100%;
}

.category-item {
  transition: background-color 0.2s;
}

.category-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 0.5rem;
  padding: 0.5rem;
  margin: -0.5rem;
}
</style>
