<template>
  <div class="recent-transactions bg-white rounded-lg shadow">
    <div class="header px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-gray-900">Recent Transactions</h2>
          <p class="text-sm text-gray-500 mt-1">Your latest income and expense entries</p>
        </div>
        <button
          @click="showAllTransactions"
          class="view-all-btn text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          View All →
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!transactions || transactions.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
      <p class="mt-1 text-sm text-gray-500">Start by adding your first expense or income</p>
    </div>

    <!-- Transactions List -->
    <div v-else class="divide-y divide-gray-200">
      <div
        v-for="transaction in displayedTransactions"
        :key="transaction._id"
        class="transaction-item px-6 py-4 hover:bg-gray-50 transition"
      >
        <div class="flex items-start justify-between">
          <!-- Transaction Info -->
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <div :class="['transaction-icon p-2 rounded-lg', getTransactionColor(transaction).bg]">
                <span class="text-lg">{{ getTransactionIcon(transaction) }}</span>
              </div>
              <div class="flex-1">
                <h3 class="font-medium text-gray-900">{{ transaction.title }}</h3>
                <p class="text-sm text-gray-500">{{ formatDate(transaction.date) }}</p>
              </div>
            </div>
          </div>

          <!-- Amount and Type -->
          <div class="text-right ml-4">
            <p :class="[
              'text-lg font-bold',
              transaction.transactionType === 'income' ? 'text-green-600' :
              transaction.transactionType === 'investment' ? 'text-blue-600' : 'text-red-600'
            ]">
              {{ transaction.transactionType === 'income' ? '+' : transaction.transactionType === 'investment' ? '' : '-' }}
              {{ formatCurrency(transaction.amount) }}
            </p>
            <p class="text-xs text-gray-500 mt-1">{{ formatPaymentMethod(transaction.paymentMethod) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- View All Button -->
    <div v-if="transactions && transactions.length > displayLimit" class="px-6 py-4 border-t border-gray-200">
      <button
        @click="showAllTransactions"
        class="w-full py-2 text-blue-600 hover:text-blue-700 font-medium transition"
      >
        View All {{ transactions.length }} Transactions
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useExpenseStore } from '@/store/ExpenseStore';
import { useAuthStore } from '@/store/AuthStore';

const expenseStore = useExpenseStore();
const authStore = useAuthStore();
const router = useRouter();

const displayLimit = ref(5);

const transactions = computed(() => expenseStore.userExpenses || []);
const loading = computed(() => expenseStore.loading);

const displayedTransactions = computed(() => {
  return transactions.value.slice(0, displayLimit.value);
});

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: authStore.user?.currency || 'USD'
  }).format(amount || 0);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getTransactionIcon = (transaction) => {
  const categoryEmojis = {
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
  return categoryEmojis[transaction.category] || '📂';
};

const getTransactionColor = (transaction) => {
  if (transaction.transactionType === 'income') {
    return { bg: 'bg-green-100' };
  } else if (transaction.transactionType === 'investment') {
    return { bg: 'bg-blue-100' };
  } else {
    return { bg: 'bg-red-100' };
  }
};

const formatPaymentMethod = (method) => {
  return method.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const showAllTransactions = () => {
  router.push('/expenses/all');
};
</script>

<style scoped>
.recent-transactions {
  background: white;
}

.transaction-item {
  transition: background-color 0.2s;
}
</style>
