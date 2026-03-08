<template>
  <div class="annual-insights bg-white rounded-lg shadow p-6">
    <h2 class="text-lg font-bold text-gray-900 mb-6">Annual Insights & Recommendations</h2>

    <div class="insights-grid space-y-4">
      <!-- Savings Analysis -->
      <div class="insight-card border-l-4 border-green-500 p-4 bg-green-50 rounded">
        <div class="flex items-start gap-3">
          <div class="savings-icon p-2 bg-green-100 rounded-lg">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">Annual Savings</h3>
            <p class="text-sm text-gray-700 mt-1">
              You saved <strong>{{ formatCurrency(yearlyTotals.totalNetBalance) }}</strong> this year, with a savings rate of <strong>{{ savingsRate }}%</strong>.
            </p>
            <p class="text-xs text-gray-600 mt-2">{{ savingsMessage }}</p>
          </div>
        </div>
      </div>

      <!-- Spending Pattern -->
      <div class="insight-card border-l-4 border-blue-500 p-4 bg-blue-50 rounded">
        <div class="flex items-start gap-3">
          <div class="spending-icon p-2 bg-blue-100 rounded-lg">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7a1 1 0 11-2 0 1 1 0 012 0zM9 12a1 1 0 11-2 0 1 1 0 012 0zm6 0a1 1 0 11-2 0 1 1 0 012 0zm6 0a1 1 0 11-2 0 1 1 0 012 0zm-11 5a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">Spending Pattern</h3>
            <p class="text-sm text-gray-700 mt-1">
              Your average monthly expense is <strong>{{ formatCurrency(averageMonthlyExpense) }}</strong>.
            </p>
            <p class="text-xs text-gray-600 mt-2">{{ spendingMessage }}</p>
          </div>
        </div>
      </div>

      <!-- Best Month -->
      <div class="insight-card border-l-4 border-emerald-500 p-4 bg-emerald-50 rounded">
        <div class="flex items-start gap-3">
          <div class="best-icon p-2 bg-emerald-100 rounded-lg">
            <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">Best Financial Month</h3>
            <p class="text-sm text-gray-700 mt-1">
              {{ getMonthName(bestMonth) }} was your best month with a balance of <strong>{{ formatCurrency(bestBalance) }}</strong>.
            </p>
            <p class="text-xs text-gray-600 mt-2">Try to replicate this month's spending habits.</p>
          </div>
        </div>
      </div>

      <!-- Income vs Expense -->
      <div class="insight-card border-l-4 border-purple-500 p-4 bg-purple-50 rounded">
        <div class="flex items-start gap-3">
          <div class="ratio-icon p-2 bg-purple-100 rounded-lg">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">Income to Expense Ratio</h3>
            <p class="text-sm text-gray-700 mt-1">
              Your income to expense ratio is <strong>1:{{ expenseRatio }}</strong>.
            </p>
            <p class="text-xs text-gray-600 mt-2">{{ incomeExpenseMessage }}</p>
          </div>
        </div>
      </div>

      <!-- Recommendations -->
      <div class="recommendations-section mt-6 pt-6 border-t border-gray-200">
        <h3 class="font-semibold text-gray-900 mb-4">Recommendations</h3>
        <ul class="space-y-2">
          <li v-for="(rec, index) in recommendations" :key="index" class="flex items-start gap-2">
            <svg class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            <span class="text-sm text-gray-700">{{ rec }}</span>
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

const yearlyTotals = computed(() => expenseStore.yearlyReport?.yearlyTotals || {
  totalIncome: 0,
  totalExpense: 0,
  totalInvestment: 0,
  totalNetBalance: 0
});

const monthlyData = computed(() => expenseStore.yearlyReport?.monthlyData || []);

const savingsRate = computed(() => {
  if (yearlyTotals.value.totalIncome === 0) return 0;
  const savings = yearlyTotals.value.totalNetBalance;
  return Math.round((savings / yearlyTotals.value.totalIncome) * 100);
});

const savingsMessage = computed(() => {
  if (savingsRate.value >= 30) {
    return 'Excellent savings rate! You\'re doing great financially.';
  } else if (savingsRate.value >= 20) {
    return 'Good savings rate. Keep maintaining this discipline.';
  } else if (savingsRate.value >= 10) {
    return 'Moderate savings rate. Try to increase it by cutting unnecessary expenses.';
  } else if (savingsRate.value > 0) {
    return 'You\'re saving, but could improve. Focus on reducing expenses.';
  } else {
    return 'You\'re spending more than earning. Time to review your budget.';
  }
});

const averageMonthlyExpense = computed(() => yearlyTotals.value.totalExpense / 12);

const spendingMessage = computed(() => {
  const avgMonthlyIncome = yearlyTotals.value.totalIncome / 12;
  const ratio = averageMonthlyExpense.value / avgMonthlyIncome;
  if (ratio < 0.5) {
    return 'Your spending is well-controlled. Keep up the great work!';
  } else if (ratio < 0.7) {
    return 'Your spending is reasonable. You have room for improvement.';
  } else if (ratio < 0.9) {
    return 'Your spending is getting high. Consider reducing expenses.';
  } else {
    return 'Your spending is very high relative to income. Urgent action needed.';
  }
});

const bestMonth = computed(() => {
  if (!monthlyData.value || monthlyData.value.length === 0) return 0;
  const maxMonth = monthlyData.value.reduce((max, month) =>
    month.netBalance > max.netBalance ? month : max);
  return maxMonth?.month || 0;
});

const bestBalance = computed(() => {
  if (!monthlyData.value || monthlyData.value.length === 0) return 0;
  const maxMonth = monthlyData.value.reduce((max, month) =>
    month.netBalance > max.netBalance ? month : max);
  return maxMonth?.netBalance || 0;
});

const expenseRatio = computed(() => {
  if (yearlyTotals.value.totalIncome === 0) return 0;
  return (yearlyTotals.value.totalExpense / yearlyTotals.value.totalIncome).toFixed(2);
});

const incomeExpenseMessage = computed(() => {
  const ratio = parseFloat(expenseRatio.value);
  if (ratio <= 0.5) {
    return 'Excellent ratio! You\'re saving at least half your income.';
  } else if (ratio <= 0.7) {
    return 'Good ratio. You\'re maintaining a healthy balance.';
  } else if (ratio < 1) {
    return 'Acceptable ratio, but there\'s room for improvement.';
  } else {
    return 'Critical: You\'re spending more than you earn!';
  }
});

const recommendations = computed(() => {
  const recs = [];

  if (savingsRate.value < 20) {
    recs.push('Increase your savings rate by setting a monthly savings goal');
  }

  if (expenseRatio.value > 0.8) {
    recs.push('Review and reduce your monthly expenses');
  }

  if (monthlyData.value && monthlyData.value.length > 0) {
    const maxExpenseMonth = monthlyData.value.reduce((max, m) => m.expense > max.expense ? m : max);
    const minExpenseMonth = monthlyData.value.reduce((min, m) => m.expense < min.expense && m.expense > 0 ? m : min);

    if (maxExpenseMonth && minExpenseMonth && (maxExpenseMonth.expense - minExpenseMonth.expense) / minExpenseMonth.expense > 0.5) {
      recs.push('Stabilize your monthly spending to avoid unexpected budget gaps');
    }
  }

  if (yearlyTotals.value.totalInvestment === 0) {
    recs.push('Consider allocating funds toward investments for long-term growth');
  }

  if (recs.length === 0) {
    recs.push('Your financial health looks great! Continue maintaining these habits');
  }

  return recs;
});

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: authStore.user?.currency || 'USD'
  }).format(amount || 0);
};

const getMonthName = (month) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1];
};
</script>

<style scoped>
.annual-insights {
  background: white;
}

.insight-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.insight-card:hover {
  transform: translateX(4px);
}
</style>
