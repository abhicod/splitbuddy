<template>
  <div class="spending-insights bg-white rounded-lg shadow p-6">
    <div class="header mb-6">
      <h2 class="text-lg font-bold text-gray-900">Spending Insights</h2>
      <p class="text-sm text-gray-500 mt-1">AI-powered recommendations for your finances</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Insights Cards -->
    <div v-else class="insights-container space-y-4">
      <!-- Spending Trend -->
      <div class="trend-card bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <div :class="['trend-icon p-2 rounded-lg', getTrendIcon().bgColor]">
            <svg :class="['w-5 h-5', getTrendIcon().textColor]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                :d="getTrendIcon().path"
              />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">Spending Trend</h3>
            <p class="text-sm text-gray-700 mt-1">
              {{ spendingTrendMessage }}
            </p>
            <div class="mt-2 flex items-center gap-2">
              <span :class="['text-xs font-medium px-2 py-1 rounded', getTrendBadgeColor()]">
                {{ Math.abs(trendPercentage) }}% {{ spendingTrend }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Insights -->
      <div v-if="insights && insights.length > 0" class="main-insights space-y-3">
        <div
          v-for="(insight, index) in insights"
          :key="index"
          :class="['insight-item border-l-4 rounded-r p-4', getInsightStyle(insight.type)]"
        >
          <div class="flex items-start gap-3">
            <div :class="['insight-icon p-2 rounded', getInsightColor(insight.type).bgColor]">
              <svg :class="['w-4 h-4', getInsightColor(insight.type).textColor]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getInsightIcon(insight.type)" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="font-medium text-gray-900">{{ insight.message }}</p>
              <p class="text-sm text-gray-600 mt-1">{{ insight.suggestion }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- No Insights -->
      <div v-else class="text-center py-8">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No insights yet</h3>
        <p class="mt-1 text-sm text-gray-500">Keep tracking your expenses to get personalized insights</p>
      </div>

      <!-- Comparison Stats -->
      <div v-if="insights && insights.length > 0" class="comparison-stats mt-6 pt-6 border-t border-gray-200 space-y-3">
        <div class="stat-row flex justify-between items-center">
          <span class="text-gray-600">This Month:</span>
          <span class="font-semibold text-gray-900">{{ formatCurrency(currentMonthTotal) }}</span>
        </div>
        <div class="stat-row flex justify-between items-center">
          <span class="text-gray-600">Average (Previous 3 Months):</span>
          <span class="font-semibold text-gray-900">{{ formatCurrency(averagePreviousMonths) }}</span>
        </div>
        <div class="stat-row flex justify-between items-center pt-3 border-t border-gray-100">
          <span class="text-gray-700 font-medium">Difference:</span>
          <span :class="[
            'font-bold text-lg',
            currentMonthTotal > averagePreviousMonths ? 'text-red-600' : 'text-green-600'
          ]">
            {{ formatCurrency(Math.abs(currentMonthTotal - averagePreviousMonths)) }}
          </span>
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

const insightsData = computed(() => expenseStore.insights?.data);
const loading = computed(() => expenseStore.loading);

const insights = computed(() => insightsData.value?.insights || []);
const spendingTrend = computed(() => insightsData.value?.spendingTrend || 'stable');
const trendPercentage = computed(() => insightsData.value?.trendPercentage || 0);
const currentMonthTotal = computed(() => insightsData.value?.currentMonthTotal || 0);
const averagePreviousMonths = computed(() => insightsData.value?.averagePreviousMonths || 0);

const spendingTrendMessage = computed(() => {
  switch (spendingTrend.value) {
    case 'increasing':
      return `Your spending has increased by ${trendPercentage.value}% compared to your average. Consider optimizing your expenses.`;
    case 'decreasing':
      return `Great! Your spending has decreased by ${trendPercentage.value}% compared to your average. Keep it up!`;
    default:
      return 'Your spending is stable compared to your average. Keep up the good habits!';
  }
});

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: authStore.user?.currency || 'USD'
  }).format(amount || 0);
};

const getTrendIcon = () => {
  switch (spendingTrend.value) {
    case 'increasing':
      return {
        path: 'M13 10V3L4 14h7v7l9-11h-7z',
        bgColor: 'bg-red-100',
        textColor: 'text-red-600'
      };
    case 'decreasing':
      return {
        path: 'M9 13h6m0 0V7m0 6l-6-6',
        bgColor: 'bg-green-100',
        textColor: 'text-green-600'
      };
    default:
      return {
        path: 'M13 7a1 1 0 11-2 0 1 1 0 012 0zM9 12a1 1 0 11-2 0 1 1 0 012 0zm6 0a1 1 0 11-2 0 1 1 0 012 0zm6 0a1 1 0 11-2 0 1 1 0 012 0z',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-600'
      };
  }
};

const getTrendBadgeColor = () => {
  switch (spendingTrend.value) {
    case 'increasing':
      return 'bg-red-100 text-red-700';
    case 'decreasing':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-blue-100 text-blue-700';
  }
};

const getInsightStyle = (type) => {
  const styles = {
    warning: 'bg-yellow-50 border-yellow-400',
    success: 'bg-green-50 border-green-400',
    info: 'bg-blue-50 border-blue-400',
    alert: 'bg-red-50 border-red-400'
  };
  return styles[type] || styles.info;
};

const getInsightColor = (type) => {
  const colors = {
    warning: { bgColor: 'bg-yellow-100', textColor: 'text-yellow-600' },
    success: { bgColor: 'bg-green-100', textColor: 'text-green-600' },
    info: { bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
    alert: { bgColor: 'bg-red-100', textColor: 'text-red-600' }
  };
  return colors[type] || colors.info;
};

const getInsightIcon = (type) => {
  switch (type) {
    case 'warning':
      return 'M12 9v2m0 4v2m0 5v1m0-16v1m7 0a9 9 0 11-18 0 9 9 0 0118 0z';
    case 'success':
      return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
    case 'info':
      return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    case 'alert':
      return 'M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    default:
      return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
  }
};
</script>

<style scoped>
.spending-insights {
  background: white;
}

.insight-item {
  transition: background-color 0.2s, transform 0.2s;
}

.insight-item:hover {
  transform: translateX(2px);
}
</style>
