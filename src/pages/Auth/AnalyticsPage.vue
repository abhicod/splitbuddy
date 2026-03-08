<template>
  <div class="analytics-page min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="header-section mb-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-4xl font-bold text-gray-900">📊 Analytics & Reports</h1>
            <p class="text-gray-600 mt-2">Comprehensive financial analysis and insights</p>
          </div>
          <button
            @click="goBack"
            class="back-btn px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition font-medium text-gray-700 flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        <!-- Year Selector -->
        <div class="year-selector-container bg-white rounded-lg p-4 border border-gray-200">
          <div class="flex items-center gap-4">
            <label class="text-sm font-medium text-gray-700">Select Year:</label>
            <select
              v-model.number="selectedYear"
              @change="fetchYearlyData"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option v-for="year in availableYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
            <button
              @click="goToCurrentYear"
              class="ml-auto px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
            >
              Current Year
            </button>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="expenseStore.error" class="error-banner mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-700">{{ expenseStore.error }}</p>
        <button @click="fetchYearlyData" class="text-red-600 hover:text-red-800 underline text-sm mt-2">
          Try Again
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="expenseStore.loading" class="flex justify-center items-center py-16">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600">Loading yearly analytics...</p>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else class="space-y-8">
        <!-- Yearly Summary -->
        <section class="yearly-summary-section">
          <YearlySummary />
        </section>

        <!-- Monthly Trend Chart -->
        <section class="trend-chart-section">
          <MonthlyTrendChart />
        </section>

        <!-- Expense Trend Analysis -->
        <section class="expense-trend-section">
          <ExpenseTrendAnalysis />
        </section>

        <!-- Year-over-Year Comparison -->
        <section class="comparison-section">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="comparison-card bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4">Total Income</h3>
              <p class="text-3xl font-bold text-green-600">{{ formatCurrency(yearlyTotals.totalIncome) }}</p>
              <p class="text-sm text-gray-500 mt-2">Across all months</p>
            </div>

            <div class="comparison-card bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4">Total Expenses</h3>
              <p class="text-3xl font-bold text-red-600">{{ formatCurrency(yearlyTotals.totalExpense) }}</p>
              <p class="text-sm text-gray-500 mt-2">Across all months</p>
            </div>

            <div class="comparison-card bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4">Net Balance</h3>
              <p :class="[
                'text-3xl font-bold',
                yearlyTotals.totalNetBalance >= 0 ? 'text-green-600' : 'text-red-600'
              ]">
                {{ formatCurrency(yearlyTotals.totalNetBalance) }}
              </p>
              <p class="text-sm text-gray-500 mt-2">{{ yearlyTotals.totalNetBalance >= 0 ? 'Surplus' : 'Deficit' }}</p>
            </div>
          </div>
        </section>

        <!-- Expense Category Distribution -->
        <section class="category-pie-section">
          <ExpenseCategoryPie />
        </section>

        <!-- Monthly Breakdown -->
        <section class="monthly-breakdown-section">
          <MonthlyBreakdownTable />
        </section>

        <!-- Insights and Recommendations -->
        <section class="insights-section">
          <AnnualInsights />
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useExpenseStore } from '@/store/ExpenseStore';
import { useAuthStore } from '@/store/AuthStore';
import YearlySummary from '@/components/YearlySummary.vue';
import MonthlyTrendChart from '@/components/MonthlyTrendChart.vue';
import MonthlyBreakdownTable from '@/components/MonthlyBreakdownTable.vue';
import AnnualInsights from '@/components/AnnualInsights.vue';
import ExpenseCategoryPie from '@/components/ExpenseCategoryPie.vue';
import ExpenseTrendAnalysis from '@/components/ExpenseTrendAnalysis.vue';

const expenseStore = useExpenseStore();
const authStore = useAuthStore();
const router = useRouter();

const selectedYear = ref(new Date().getFullYear());
const currentYear = new Date().getFullYear();

const availableYears = computed(() => {
  const years = [];
  for (let year = 2020; year <= currentYear; year++) {
    years.push(year);
  }
  return years;
});

const yearlyData = computed(() => expenseStore.yearlyReport?.monthlyData || []);
const yearlyTotals = computed(() => expenseStore.yearlyReport?.yearlyTotals || {
  totalIncome: 0,
  totalExpense: 0,
  totalInvestment: 0,
  totalNetBalance: 0
});

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: authStore.user?.currency || 'USD'
  }).format(amount || 0);
};

const fetchYearlyData = async () => {
  // Create a temporary store instance with the selected year
  const tempYear = selectedYear.value;
  expenseStore.currentYear = tempYear;
  await expenseStore.fetchYearlyReport();
};

const goToCurrentYear = () => {
  selectedYear.value = currentYear;
  fetchYearlyData();
};

const goBack = () => {
  router.push('/expenses/monthly');
};

onMounted(async () => {
  await expenseStore.fetchYearlyReport();
});
</script>

<style scoped>
.analytics-page {
  background: linear-gradient(135deg, rgb(249, 250, 251) 0%, rgb(243, 244, 246) 100%);
  min-height: 100vh;
}

.header-section {
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border-top: 4px solid #3b82f6;
}

.year-selector-container {
  background: white;
  border: 1px solid rgb(229, 231, 235);
  border-radius: 0.5rem;
}

.yearly-summary-section,
.trend-chart-section,
.expense-trend-section,
.comparison-section,
.category-pie-section,
.monthly-breakdown-section,
.insights-section {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .header-section {
    padding: 1.5rem;
  }

  .comparison-section {
    grid-template-columns: 1fr;
  }
}
</style>
