<template>
  <div class="expense-category-pie bg-white rounded-lg shadow p-6">
    <div class="header mb-6">
      <h2 class="text-lg font-bold text-gray-900">Expense Distribution by Category</h2>
      <p class="text-sm text-gray-500 mt-1">Breakdown of total expenses across categories</p>
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
      <p class="mt-1 text-sm text-gray-500">Start adding expenses to see category distribution</p>
    </div>

    <!-- Content -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Pie Chart -->
      <div class="pie-chart-container flex justify-center items-center md:col-span-1">
        <svg :viewBox="`0 0 ${size} ${size}`" :width="size" :height="size" class="pie-chart">
          <circle
            cx="50%"
            cy="50%"
            :r="radius"
            fill="none"
            v-for="(slice, index) in slices"
            :key="`slice-${index}`"
            :stroke="slice.color"
            :stroke-width="sliceWidth"
            :stroke-dasharray="slice.circumference"
            :stroke-dashoffset="slice.offset"
            stroke-linecap="round"
          />
        </svg>
      </div>

      <!-- Legend -->
      <div class="legend md:col-span-2 space-y-3 max-h-80 overflow-y-auto">
        <div
          v-for="category in categories"
          :key="category.category"
          class="legend-item flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
        >
          <div class="flex items-center gap-3">
            <div
              :class="['w-4 h-4 rounded', getCategoryColor(category.category).bg]"
            ></div>
            <div>
              <p class="font-medium text-gray-900 capitalize">{{ category.category }}</p>
              <p class="text-xs text-gray-500">{{ getCategoryEmoji(category.category) }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-semibold text-gray-900">{{ formatCurrency(category.expense) }}</p>
            <p :class="['text-xs', getCategoryColor(category.category).text]">
              {{ getPercentage(category.expense) }}%
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div v-if="totalExpense > 0" class="summary-stats mt-6 pt-6 border-t border-gray-200">
      <div class="grid grid-cols-3 gap-4">
        <div class="stat-item text-center">
          <p class="text-xs text-gray-500 uppercase">Total Expenses</p>
          <p class="text-lg font-bold text-red-600 mt-1">{{ formatCurrency(totalExpense) }}</p>
        </div>
        <div class="stat-item text-center">
          <p class="text-xs text-gray-500 uppercase">Categories</p>
          <p class="text-lg font-bold text-gray-900 mt-1">{{ categories.length }}</p>
        </div>
        <div class="stat-item text-center">
          <p class="text-xs text-gray-500 uppercase">Avg per Category</p>
          <p class="text-lg font-bold text-blue-600 mt-1">{{ formatCurrency(totalExpense / categories.length) }}</p>
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

const size = 300;
const radius = 80;
const sliceWidth = 30;

const categories = computed(() => expenseStore.monthlyAnalytics?.categoryBreakdown || []);
const loading = computed(() => expenseStore.loading);

const totalExpense = computed(() => {
  return categories.value.reduce((sum, cat) => sum + (cat.expense || 0), 0);
});

const getPercentage = (amount) => {
  if (totalExpense.value === 0) return 0;
  return Math.round((amount / totalExpense.value) * 100);
};

const slices = computed(() => {
  if (categories.value.length === 0) return [];

  const slices = [];
  let currentOffset = 0;
  const circumference = 2 * Math.PI * radius;

  categories.value.forEach((category) => {
    const percentage = getPercentage(category.expense);
    const sliceCircumference = (percentage / 100) * circumference;
    
    slices.push({
      color: getCategoryColor(category.category).strokeColor,
      circumference: sliceCircumference.toFixed(2),
      offset: currentOffset.toFixed(2)
    });

    currentOffset += sliceCircumference;
  });

  return slices;
});

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
    food: { bg: 'bg-orange-100', text: 'text-orange-600', strokeColor: '#f97316' },
    transport: { bg: 'bg-blue-100', text: 'text-blue-600', strokeColor: '#3b82f6' },
    accommodation: { bg: 'bg-purple-100', text: 'text-purple-600', strokeColor: '#a855f7' },
    entertainment: { bg: 'bg-pink-100', text: 'text-pink-600', strokeColor: '#ec4899' },
    shopping: { bg: 'bg-green-100', text: 'text-green-600', strokeColor: '#16a34a' },
    utilities: { bg: 'bg-yellow-100', text: 'text-yellow-600', strokeColor: '#eab308' },
    salary: { bg: 'bg-emerald-100', text: 'text-emerald-600', strokeColor: '#10b981' },
    investment: { bg: 'bg-indigo-100', text: 'text-indigo-600', strokeColor: '#6366f1' },
    other: { bg: 'bg-gray-100', text: 'text-gray-600', strokeColor: '#6b7280' }
  };
  return colors[category] || colors.other;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: authStore.user?.currency || 'USD'
  }).format(amount || 0);
};
</script>

<style scoped>
.pie-chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.pie-chart {
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1));
}

.legend {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
}

.legend::-webkit-scrollbar {
  width: 6px;
}

.legend::-webkit-scrollbar-track {
  background: transparent;
}

.legend::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.legend::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}
</style>
