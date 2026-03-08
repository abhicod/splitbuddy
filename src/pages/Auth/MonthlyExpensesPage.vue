<template>
  <div class="monthly-expenses-page min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="header-section mb-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-4xl font-bold text-gray-900">💰 Monthly Expenses Tracker</h1>
            <p class="text-gray-600 mt-2">Track, analyze, and manage your monthly finances with ease</p>
          </div>
          <div class="header-actions flex gap-3">
            <button
              @click="openAddModal"
              class="add-btn px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition font-medium flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Transaction
            </button>
            <button
              @click="exportReport"
              class="export-btn px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition font-medium text-gray-700"
            >
              <svg class="inline-block w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
            <button
              @click="navigateToAnalytics"
              class="analytics-btn px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
            >
              <svg class="inline-block w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </button>
          </div>
        </div>

        <!-- Month/Year Picker -->
        <MonthYearPicker />
      </div>

      <!-- Error State -->
      <div v-if="expenseStore.error" class="error-banner mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 5v1m0-16v1m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p class="font-medium text-red-800">{{ expenseStore.error }}</p>
            <button @click="retryFetch" class="text-red-600 hover:text-red-800 underline text-sm mt-1">
              Try Again
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="expenseStore.loading" class="flex justify-center items-center py-16">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600">Loading your monthly data...</p>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else class="space-y-8">
        <!-- Overview Cards -->
        <section class="overview-section">
          <MonthlyOverview />
        </section>

        <!-- Analytics Grid -->
        <section class="analytics-grid grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <CategoryBreakdown />
          </div>
          <div>
            <ExpenseCategoryPie />
          </div>
        </section>

        <!-- Payment Method Grid -->
        <section class="payment-grid">
          <PaymentMethodBreakdown />
        </section>

        <!-- Insights -->
        <section class="insights-section">
          <SpendingInsights />
        </section>

        <!-- All Transactions Manager -->
        <section class="transactions-manager-section">
          <TransactionManager />
        </section>
      </div>
    </div>

    <!-- Add Transaction Modal -->
    <AddTransactionModal
      :isOpen="showAddModal"
      @close="closeAddModal"
      @success="handleTransactionAdded"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useExpenseStore } from '@/store/ExpenseStore';
import MonthYearPicker from '@/components/MonthYearPicker.vue';
import MonthlyOverview from '@/components/MonthlyOverview.vue';
import CategoryBreakdown from '@/components/CategoryBreakdown.vue';
import PaymentMethodBreakdown from '@/components/PaymentMethodBreakdown.vue';
import SpendingInsights from '@/components/SpendingInsights.vue';
import RecentTransactions from '@/components/RecentTransactions.vue';
import AddTransactionModal from '@/components/AddTransactionModal.vue';
import ExpenseCategoryPie from '@/components/ExpenseCategoryPie.vue';
import TransactionManager from '@/components/TransactionManager.vue';

const expenseStore = useExpenseStore();
const router = useRouter();

const showAddModal = ref(false);

const retryFetch = () => {
  expenseStore.fetchAllMonthlyData();
};

const exportReport = () => {
  // TODO: Implement PDF export functionality
  alert('Export functionality coming soon!');
};

const navigateToAnalytics = () => {
  router.push('/expenses/analytics');
};

const openAddModal = () => {
  showAddModal.value = true;
  document.body.style.overflow = 'hidden';
};

const closeAddModal = () => {
  showAddModal.value = false;
  document.body.style.overflow = '';
};

const handleTransactionAdded = async () => {
  showAddModal.value = false;
  document.body.style.overflow = '';
  // Refresh the monthly data after adding a transaction
  await expenseStore.fetchAllMonthlyData();
};

onUnmounted(() => {
  document.body.style.overflow = '';
});

onMounted(async () => {
  await expenseStore.fetchAllMonthlyData();
});
</script>

<style scoped>
.monthly-expenses-page {
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

.header-actions {
  flex-wrap: wrap;
  gap: 0.75rem;
}

.overview-section,
.analytics-grid,
.payment-grid,
.insights-section,
.transactions-manager-section {
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
  .header-actions {
    flex-direction: column;
  }

  .header-actions button {
    width: 100%;
  }

  .analytics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
