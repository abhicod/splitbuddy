<template>
  <div class="expense-trend-analysis bg-white rounded-lg shadow p-6">
    <div class="header mb-6">
      <h2 class="text-lg font-bold text-gray-900">Expense Trends</h2>
      <p class="text-sm text-gray-500 mt-1">Analyze spending patterns throughout the year</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!monthlyData || monthlyData.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No data available</h3>
      <p class="mt-1 text-sm text-gray-500">Data will appear once you have multiple months of expenses</p>
    </div>

    <!-- Content -->
    <div v-else class="space-y-8">
      <!-- Line Chart using SVG -->
      <div class="chart-section">
        <h3 class="text-md font-semibold text-gray-900 mb-4">Monthly Spending Trend</h3>
        <div class="overflow-x-auto">
          <svg
            :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
            class="trend-chart min-w-full"
            style="height: 300px"
          >
            <!-- Grid Lines -->
            <g class="grid-lines" stroke="#e5e7eb" stroke-width="1">
              <line
                v-for="i in 5"
                :key="`grid-${i}`"
                :x1="0"
                :y1="(i * chartHeight) / 5"
                :x2="chartWidth"
                :y2="(i * chartHeight) / 5"
              />
            </g>

            <!-- Axes -->
            <line x1="40" :y1="chartHeight - 40" :x2="chartWidth" :y2="chartHeight - 40" stroke="#000" stroke-width="2" />
            <line x1="40" y1="0" x2="40" :y2="chartHeight - 40" stroke="#000" stroke-width="2" />

            <!-- Expense Line -->
            <polyline
              :points="expenseLinePoints"
              fill="none"
              stroke="#ef4444"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <!-- Income Line -->
            <polyline
              :points="incomeLinePoints"
              fill="none"
              stroke="#22c55e"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <!-- Data Points for Expenses -->
            <circle
              v-for="(point, index) in expensePoints"
              :key="`expense-point-${index}`"
              :cx="point.x"
              :cy="point.y"
              r="4"
              fill="#ef4444"
              class="cursor-pointer hover:r-6 transition"
              :title="`${getMonthName(index + 1)}: ${formatCurrency(monthlyData[index].expense)}`"
            />

            <!-- Data Points for Income -->
            <circle
              v-for="(point, index) in incomePoints"
              :key="`income-point-${index}`"
              :cx="point.x"
              :cy="point.y"
              r="4"
              fill="#22c55e"
              class="cursor-pointer hover:r-6 transition"
              :title="`${getMonthName(index + 1)}: ${formatCurrency(monthlyData[index].income)}`"
            />

            <!-- Month Labels -->
            <text
              v-for="(month, index) in monthlyData"
              :key="`label-${index}`"
              :x="40 + ((index + 1) * xStep) - xStep / 2"
              :y="chartHeight - 10"
              text-anchor="middle"
              font-size="12"
              fill="#666"
            >
              {{ getMonthShort(index + 1) }}
            </text>

            <!-- Y-axis Labels -->
            <text
              v-for="i in 5"
              :key="`y-label-${i}`"
              x="35"
              :y="(5 - i + 1) * (chartHeight / 5) + 5"
              text-anchor="end"
              font-size="11"
              fill="#666"
            >
              {{ formatCurrency((i * maxAmount) / 5) }}
            </text>
          </svg>
        </div>
      </div>

      <!-- Statistics Grid -->
      <div class="statistics-grid grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Average Expense -->
        <div class="stat-card border border-gray-200 rounded-lg p-4">
          <p class="text-sm text-gray-600 mb-2">Average Monthly Expense</p>
          <p class="text-2xl font-bold text-red-600">{{ formatCurrency(averageExpense) }}</p>
          <div class="mt-2 flex items-center gap-2">
            <svg v-if="expenseTrend >= 0" class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            <svg v-else class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 0l-7 7 7 7" />
            </svg>
            <span :class="expenseTrend >= 0 ? 'text-red-600' : 'text-green-600'" class="text-sm font-medium">
              {{ Math.abs(expenseTrend).toFixed(1) }}%
            </span>
          </div>
        </div>

        <!-- Average Income -->
        <div class="stat-card border border-gray-200 rounded-lg p-4">
          <p class="text-sm text-gray-600 mb-2">Average Monthly Income</p>
          <p class="text-2xl font-bold text-green-600">{{ formatCurrency(averageIncome) }}</p>
          <div class="mt-2 flex items-center gap-2">
            <svg v-if="incomeTrend >= 0" class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            <svg v-else class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 0l-7 7 7 7" />
            </svg>
            <span :class="incomeTrend >= 0 ? 'text-green-600' : 'text-red-600'" class="text-sm font-medium">
              {{ Math.abs(incomeTrend).toFixed(1) }}%
            </span>
          </div>
        </div>

        <!-- Average Balance -->
        <div class="stat-card border border-gray-200 rounded-lg p-4">
          <p class="text-sm text-gray-600 mb-2">Average Monthly Balance</p>
          <p :class="['text-2xl font-bold', averageBalance >= 0 ? 'text-green-600' : 'text-red-600']">
            {{ formatCurrency(averageBalance) }}
          </p>
          <div class="mt-2 flex items-center gap-2">
            <svg v-if="balanceTrend >= 0" class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            <svg v-else class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 0l-7 7 7 7" />
            </svg>
            <span :class="balanceTrend >= 0 ? 'text-green-600' : 'text-red-600'" class="text-sm font-medium">
              {{ Math.abs(balanceTrend).toFixed(1) }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Insights -->
      <div class="insights-section bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 class="font-semibold text-blue-900 mb-2">📊 Insights</h3>
        <ul class="space-y-2 text-sm text-blue-800">
          <li v-if="highestExpenseMonth">
            • Highest expense month: <span class="font-semibold">{{ getMonthName(highestExpenseMonth) }}</span> with {{ formatCurrency(monthlyData[highestExpenseMonth - 1].expense) }}
          </li>
          <li v-if="lowestExpenseMonth">
            • Lowest expense month: <span class="font-semibold">{{ getMonthName(lowestExpenseMonth) }}</span> with {{ formatCurrency(monthlyData[lowestExpenseMonth - 1].expense) }}
          </li>
          <li v-if="expenseTrend > 0">
            • Your spending is <span class="font-semibold">increasing</span> by {{ expenseTrend.toFixed(1) }}% month over month
          </li>
          <li v-if="expenseTrend < 0">
            • Your spending is <span class="font-semibold">decreasing</span> by {{ Math.abs(expenseTrend).toFixed(1) }}% month over month
          </li>
        </ul>
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

const chartWidth = 1000;
const chartHeight = 300;
const padding = 40;

const monthlyData = computed(() => expenseStore.yearlyReport?.monthlyData || []);
const loading = computed(() => expenseStore.loading);

const maxAmount = computed(() => {
  if (monthlyData.value.length === 0) return 1;
  return Math.max(
    ...monthlyData.value.map(m => Math.max(m.expense || 0, m.income || 0))
  ) * 1.1;
});

const xStep = computed(() => {
  if (monthlyData.value.length === 0) return 0;
  return (chartWidth - padding - 20) / monthlyData.value.length;
});

const yScale = computed(() => {
  return (chartHeight - padding) / maxAmount.value;
});

const expensePoints = computed(() => {
  return monthlyData.value.map((month, index) => ({
    x: padding + (index + 1) * xStep.value - xStep.value / 2,
    y: chartHeight - padding - (month.expense || 0) * yScale.value
  }));
});

const incomePoints = computed(() => {
  return monthlyData.value.map((month, index) => ({
    x: padding + (index + 1) * xStep.value - xStep.value / 2,
    y: chartHeight - padding - (month.income || 0) * yScale.value
  }));
});

const expenseLinePoints = computed(() => {
  return expensePoints.value.map(p => `${p.x},${p.y}`).join(' ');
});

const incomeLinePoints = computed(() => {
  return incomePoints.value.map(p => `${p.x},${p.y}`).join(' ');
});

const averageExpense = computed(() => {
  if (monthlyData.value.length === 0) return 0;
  return monthlyData.value.reduce((sum, m) => sum + (m.expense || 0), 0) / monthlyData.value.length;
});

const averageIncome = computed(() => {
  if (monthlyData.value.length === 0) return 0;
  return monthlyData.value.reduce((sum, m) => sum + (m.income || 0), 0) / monthlyData.value.length;
});

const averageBalance = computed(() => {
  return averageIncome.value - averageExpense.value;
});

const expenseTrend = computed(() => {
  if (monthlyData.value.length < 2) return 0;
  const firstHalf = monthlyData.value.slice(0, 6).reduce((sum, m) => sum + (m.expense || 0), 0) / 6;
  const secondHalf = monthlyData.value.slice(6).reduce((sum, m) => sum + (m.expense || 0), 0) / 6;
  return ((secondHalf - firstHalf) / firstHalf) * 100;
});

const incomeTrend = computed(() => {
  if (monthlyData.value.length < 2) return 0;
  const firstHalf = monthlyData.value.slice(0, 6).reduce((sum, m) => sum + (m.income || 0), 0) / 6;
  const secondHalf = monthlyData.value.slice(6).reduce((sum, m) => sum + (m.income || 0), 0) / 6;
  if (firstHalf === 0) return 0;
  return ((secondHalf - firstHalf) / firstHalf) * 100;
});

const balanceTrend = computed(() => {
  return incomeTrend.value - expenseTrend.value;
});

const highestExpenseMonth = computed(() => {
  if (monthlyData.value.length === 0) return 0;
  let max = 0;
  let monthIndex = 0;
  monthlyData.value.forEach((month, index) => {
    if ((month.expense || 0) > max) {
      max = month.expense || 0;
      monthIndex = index;
    }
  });
  return monthIndex + 1;
});

const lowestExpenseMonth = computed(() => {
  if (monthlyData.value.length === 0) return 0;
  let min = Infinity;
  let monthIndex = 0;
  monthlyData.value.forEach((month, index) => {
    if ((month.expense || 0) < min) {
      min = month.expense || 0;
      monthIndex = index;
    }
  });
  return monthIndex + 1;
});

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: authStore.user?.currency || 'USD'
  }).format(amount || 0);
};

const getMonthName = (month) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1];
};

const getMonthShort = (month) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month - 1];
};
</script>

<style scoped>
.expense-trend-analysis {
  background: white;
}

.trend-chart {
  display: block;
}

@media (max-width: 768px) {
  .chart-section {
    overflow-x: auto;
  }

  .statistics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
