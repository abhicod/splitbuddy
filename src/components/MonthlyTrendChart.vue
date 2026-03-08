<template>
  <div class="monthly-trend-chart bg-white rounded-lg shadow p-6">
    <div class="header mb-6">
      <h2 class="text-lg font-bold text-gray-900">Monthly Trend Analysis</h2>
      <p class="text-sm text-gray-500 mt-1">Income, expenses, and net balance throughout the year</p>
    </div>

    <!-- Chart Container -->
    <div class="chart-container overflow-x-auto">
      <div class="min-w-full h-96 bg-gray-50 rounded-lg p-4 flex flex-col justify-between">
        <!-- Simple Bar Chart -->
        <div class="chart-bars flex items-end justify-around gap-1 h-80">
          <div
            v-for="month in monthlyData"
            :key="month.month"
            class="month-bar-group flex flex-col items-center gap-1 flex-1"
          >
            <!-- Bar Container -->
            <div class="bars-container flex items-end gap-0.5 h-64 relative">
              <!-- Income Bar -->
              <div
                v-if="month.income > 0"
                class="income-bar bg-green-500 rounded-t transition-all hover:opacity-80 cursor-pointer group relative"
                :style="{ height: getBarHeight(month.income, 'income') + '%' }"
                :title="`Income: ${formatCurrency(month.income)}`"
              >
                <div class="tooltip-income absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  {{ formatCurrency(month.income) }}
                </div>
              </div>

              <!-- Expense Bar -->
              <div
                v-if="month.expense > 0"
                class="expense-bar bg-red-500 rounded-t transition-all hover:opacity-80 cursor-pointer group relative"
                :style="{ height: getBarHeight(month.expense, 'expense') + '%' }"
                :title="`Expense: ${formatCurrency(month.expense)}`"
              >
                <div class="tooltip-expense absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  {{ formatCurrency(month.expense) }}
                </div>
              </div>

              <!-- Investment Bar -->
              <div
                v-if="month.investment > 0"
                class="investment-bar bg-blue-500 rounded-t transition-all hover:opacity-80 cursor-pointer group relative"
                :style="{ height: getBarHeight(month.investment, 'investment') + '%' }"
                :title="`Investment: ${formatCurrency(month.investment)}`"
              >
                <div class="tooltip-investment absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  {{ formatCurrency(month.investment) }}
                </div>
              </div>

              <!-- Net Balance Bar -->
              <div
                v-if="month.netBalance !== 0"
                :class="[
                  'net-bar rounded-t transition-all hover:opacity-80 cursor-pointer group relative',
                  month.netBalance >= 0 ? 'bg-emerald-500' : 'bg-orange-500'
                ]"
                :style="{ height: getBarHeight(Math.abs(month.netBalance), 'net') + '%' }"
                :title="`Balance: ${formatCurrency(month.netBalance)}`"
              >
                <div :class="[
                  'absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap'
                ]">
                  {{ formatCurrency(month.netBalance) }}
                </div>
              </div>
            </div>

            <!-- Month Label -->
            <span class="month-label text-xs font-medium text-gray-600 mt-2">{{ getMonthShort(month.month) }}</span>
          </div>
        </div>

        <!-- X-axis -->
        <div class="x-axis border-t border-gray-300 mt-4"></div>
      </div>
    </div>

    <!-- Legend -->
    <div class="legend mt-6 flex flex-wrap gap-6 justify-center">
      <div class="legend-item flex items-center gap-2">
        <div class="w-3 h-3 rounded bg-green-500"></div>
        <span class="text-sm text-gray-600">Income</span>
      </div>
      <div class="legend-item flex items-center gap-2">
        <div class="w-3 h-3 rounded bg-red-500"></div>
        <span class="text-sm text-gray-600">Expenses</span>
      </div>
      <div class="legend-item flex items-center gap-2">
        <div class="w-3 h-3 rounded bg-blue-500"></div>
        <span class="text-sm text-gray-600">Investment</span>
      </div>
      <div class="legend-item flex items-center gap-2">
        <div class="w-3 h-3 rounded bg-emerald-500"></div>
        <span class="text-sm text-gray-600">Balance (Positive)</span>
      </div>
    </div>

    <!-- Stats Below Chart -->
    <div class="chart-stats mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="stat">
        <p class="text-xs text-gray-500 uppercase">Highest Income Month</p>
        <p class="text-sm font-bold text-green-600 mt-1">{{ getMonthName(highestIncomeMonth) }}</p>
      </div>
      <div class="stat">
        <p class="text-xs text-gray-500 uppercase">Highest Expense Month</p>
        <p class="text-sm font-bold text-red-600 mt-1">{{ getMonthName(highestExpenseMonth) }}</p>
      </div>
      <div class="stat">
        <p class="text-xs text-gray-500 uppercase">Best Net Balance Month</p>
        <p class="text-sm font-bold text-emerald-600 mt-1">{{ getMonthName(bestBalanceMonth) }}</p>
      </div>
      <div class="stat">
        <p class="text-xs text-gray-500 uppercase">Months with Positive Balance</p>
        <p class="text-sm font-bold text-gray-900 mt-1">{{ positiveBalanceMonths }} / 12</p>
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

const monthlyData = computed(() => expenseStore.yearlyReport?.monthlyData || []);

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: authStore.user?.currency || 'USD'
  }).format(amount || 0);
};

const getMonthShort = (month) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month - 1];
};

const getMonthName = (month) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1];
};

const getBarHeight = (amount, type) => {
  let maxAmount = 0;

  monthlyData.value.forEach(month => {
    if (type === 'income') maxAmount = Math.max(maxAmount, month.income);
    else if (type === 'expense') maxAmount = Math.max(maxAmount, month.expense);
    else if (type === 'investment') maxAmount = Math.max(maxAmount, month.investment);
    else if (type === 'net') maxAmount = Math.max(maxAmount, Math.abs(month.netBalance));
  });

  if (maxAmount === 0) return 0;
  return (amount / maxAmount) * 100;
};

const highestIncomeMonth = computed(() => {
  const maxMonth = monthlyData.value.reduce((max, month) =>
    month.income > max.income ? month : max, monthlyData.value[0]);
  return maxMonth?.month || 0;
});

const highestExpenseMonth = computed(() => {
  const maxMonth = monthlyData.value.reduce((max, month) =>
    month.expense > max.expense ? month : max, monthlyData.value[0]);
  return maxMonth?.month || 0;
});

const bestBalanceMonth = computed(() => {
  const maxMonth = monthlyData.value.reduce((max, month) =>
    month.netBalance > max.netBalance ? month : max, monthlyData.value[0]);
  return maxMonth?.month || 0;
});

const positiveBalanceMonths = computed(() => {
  return monthlyData.value.filter(month => month.netBalance > 0).length;
});
</script>

<style scoped>
.monthly-trend-chart {
  background: white;
}

.month-bar-group {
  min-width: 40px;
}

.bars-container {
  min-height: 200px;
}

.income-bar,
.expense-bar,
.investment-bar,
.net-bar {
  min-width: 8px;
  min-height: 4px;
}

@media (max-width: 640px) {
  .month-bar-group {
    min-width: 30px;
  }

  .month-label {
    font-size: 10px;
  }
}
</style>
