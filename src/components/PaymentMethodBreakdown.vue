<template>
  <div class="payment-method-breakdown bg-white rounded-lg shadow p-6">
    <div class="header mb-6">
      <h2 class="text-lg font-bold text-gray-900">Payment Methods</h2>
      <p class="text-sm text-gray-500 mt-1">Distribution of your transactions</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!paymentMethods || paymentMethods.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10a1 1 0 011-1h16a1 1 0 011 1v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8z M3 10V7a2 2 0 012-2h14a2 2 0 012 2v3" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No payment data</h3>
      <p class="mt-1 text-sm text-gray-500">Add expenses to see payment method breakdown</p>
    </div>

    <!-- Payment Methods List -->
    <div v-else class="payment-methods-list space-y-4">
      <div
        v-for="method in paymentMethods"
        :key="method.method"
        class="method-item"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-3">
            <div :class="['method-icon p-2 rounded-lg', getMethodColor(method.method).bg]">
              <span class="text-lg">{{ getMethodIcon(method.method) }}</span>
            </div>
            <div>
              <p class="font-medium text-gray-900 capitalize">{{ formatMethodName(method.method) }}</p>
              <p class="text-xs text-gray-500">{{ getPercentage(method.amount) }}% of total</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-semibold text-gray-900">{{ formatCurrency(method.amount) }}</p>
          </div>
        </div>

        <!-- Mini Progress Bar -->
        <div class="progress-bar bg-gray-200 rounded-full h-1 overflow-hidden">
          <div
            :class="['h-full transition-all', getMethodColor(method.method).barColor]"
            :style="{ width: getPercentage(method.amount) + '%' }"
          ></div>
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

const paymentMethods = computed(() => expenseStore.monthlyAnalytics?.paymentMethodBreakdown || []);
const loading = computed(() => expenseStore.loading);

const totalAmount = computed(() => {
  return paymentMethods.value.reduce((sum, method) => sum + (method.amount || 0), 0);
});

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: authStore.user?.currency || 'USD'
  }).format(amount || 0);
};

const getPercentage = (amount) => {
  if (totalAmount.value === 0) return 0;
  return Math.round((amount / totalAmount.value) * 100);
};

const getMethodIcon = (method) => {
  const icons = {
    cash: '💵',
    credit_card: '💳',
    debit_card: '🏧',
    bank_transfer: '🏦',
    upi: '📱',
    wallet: '👝',
    other: '💸'
  };
  return icons[method] || '💸';
};

const formatMethodName = (method) => {
  return method.replace(/_/g, ' ');
};

const getMethodColor = (method) => {
  const colors = {
    cash: { bg: 'bg-green-100', barColor: 'bg-green-500' },
    credit_card: { bg: 'bg-blue-100', barColor: 'bg-blue-500' },
    debit_card: { bg: 'bg-purple-100', barColor: 'bg-purple-500' },
    bank_transfer: { bg: 'bg-indigo-100', barColor: 'bg-indigo-500' },
    upi: { bg: 'bg-orange-100', barColor: 'bg-orange-500' },
    wallet: { bg: 'bg-pink-100', barColor: 'bg-pink-500' },
    other: { bg: 'bg-gray-100', barColor: 'bg-gray-500' }
  };
  return colors[method] || colors.other;
};
</script>

<style scoped>
.payment-method-breakdown {
  background: white;
}

.method-item {
  transition: background-color 0.2s;
  padding: 0.5rem;
  border-radius: 0.5rem;
}

.method-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}
</style>
