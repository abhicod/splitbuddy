<template>
  <div class="transaction-manager bg-white rounded-lg shadow">
    <!-- Header -->
    <div class="header px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-gray-900">All Transactions</h2>
          <p class="text-sm text-gray-500 mt-1">View and manage all your transactions</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters px-6 py-4 border-b border-gray-200">
      <div class="flex flex-col sm:flex-row gap-4 items-center">
        <!-- Time Period Filter -->
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="period in timePeriods"
            :key="period.id"
            @click="selectedPeriod = period.id"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors text-sm',
              selectedPeriod === period.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ period.label }}
          </button>
        </div>

        <!-- Search -->
        <div class="flex-1 min-w-xs">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search transactions..."
              class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
            />
            <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <!-- Clear Filters -->
        <button
          v-if="searchQuery || selectedPeriod !== 'month'"
          @click="clearFilters"
          class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium underline"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats px-6 py-4 border-b border-gray-200 grid grid-cols-3 gap-4">
      <div class="stat-item">
        <p class="text-xs text-gray-600 uppercase">Total Transactions</p>
        <p class="text-xl font-bold text-gray-900 mt-1">{{ filteredTransactions.length }}</p>
      </div>
      <div class="stat-item">
        <p class="text-xs text-gray-600 uppercase">Total Expenses</p>
        <p class="text-xl font-bold text-red-600 mt-1">{{ formatCurrency(totalExpenses) }}</p>
      </div>
      <div class="stat-item">
        <p class="text-xs text-gray-600 uppercase">Total Income</p>
        <p class="text-xl font-bold text-green-600 mt-1">{{ formatCurrency(totalIncome) }}</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredTransactions.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
      <p class="mt-1 text-sm text-gray-500">Try adjusting your filters or add a new transaction</p>
    </div>

    <!-- Transactions List -->
    <div v-else class="divide-y divide-gray-200">
      <!-- Group by Date -->
      <div v-for="(group, date) in groupedTransactions" :key="date">
        <!-- Date Header -->
        <div class="sticky top-0 bg-gray-50 px-6 py-3 border-b border-gray-200">
          <h3 class="text-sm font-semibold text-gray-900">{{ formatDateHeader(date) }}</h3>
        </div>

        <!-- Transactions for this date -->
        <div v-for="transaction in group" :key="transaction._id" class="transaction-row px-6 py-4 hover:bg-gray-50 transition-colors">
          <div class="flex items-start justify-between gap-4">
            <!-- Transaction Details -->
            <div class="flex-1 flex items-start gap-4">
              <!-- Category Icon -->
              <div :class="['transaction-icon p-3 rounded-lg flex-shrink-0', getTransactionColor(transaction).bg]">
                <span class="text-lg">{{ getTransactionIcon(transaction) }}</span>
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <h4 class="font-medium text-gray-900 truncate">{{ transaction.title }}</h4>
                <div class="flex flex-wrap gap-2 mt-1">
                  <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded capitalize">
                    {{ transaction.category }}
                  </span>
                  <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {{ formatPaymentMethod(transaction.paymentMethod) }}
                  </span>
                  <span v-if="transaction.transactionType === 'income'" class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Income
                  </span>
                  <span v-else-if="transaction.transactionType === 'investment'" class="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                    Investment
                  </span>
                  <span v-else class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                    Expense
                  </span>
                </div>
                <p v-if="transaction.description" class="text-sm text-gray-600 mt-2">{{ transaction.description }}</p>
              </div>
            </div>

            <!-- Amount and Actions -->
            <div class="flex flex-col items-end gap-3 flex-shrink-0">
              <!-- Amount -->
              <p :class="[
                'text-lg font-bold',
                transaction.transactionType === 'income' ? 'text-green-600' :
                transaction.transactionType === 'investment' ? 'text-indigo-600' : 'text-red-600'
              ]">
                {{ transaction.transactionType === 'income' ? '+' : transaction.transactionType === 'investment' ? '' : '-' }}
                {{ formatCurrency(transaction.amount) }}
              </p>

              <!-- Actions -->
              <div class="flex gap-2">
                <button
                  @click="deleteTransaction(transaction._id)"
                  class="text-sm bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="filteredTransactions.length > pageSize" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
      <div class="text-sm text-gray-600">
        Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredTransactions.length) }} of {{ filteredTransactions.length }}
      </div>
      <div class="flex gap-2">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          @click="currentPage++"
          :disabled="currentPage >= Math.ceil(filteredTransactions.length / pageSize)"
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useExpenseStore } from '@/store/ExpenseStore';
import { useAuthStore } from '@/store/AuthStore';
import { expensesAPI } from '@/services/api';

const expenseStore = useExpenseStore();
const authStore = useAuthStore();

const selectedPeriod = ref('month');
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);

const timePeriods = [
  { id: 'day', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'all', label: 'All' }
];

const transactions = computed(() => expenseStore.userExpenses || []);

const filteredTransactions = computed(() => {
  let filtered = transactions.value;

  // Filter by time period
  const now = new Date();
  if (selectedPeriod.value !== 'all') {
    const transactionDate = new Date();
    let startDate = new Date();

    if (selectedPeriod.value === 'day') {
      startDate.setDate(now.getDate());
    } else if (selectedPeriod.value === 'week') {
      startDate.setDate(now.getDate() - now.getDay());
    } else if (selectedPeriod.value === 'month') {
      startDate.setDate(1);
    }

    startDate.setHours(0, 0, 0, 0);

    filtered = filtered.filter(t => {
      const txDate = new Date(t.date);
      return txDate >= startDate && txDate <= now;
    });
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query)
    );
  }

  // Sort by date descending (newest first)
  return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
});

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredTransactions.value.slice(start, end);
});

const groupedTransactions = computed(() => {
  const groups = {};
  paginatedTransactions.value.forEach(transaction => {
    const date = new Date(transaction.date).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
  });
  return groups;
});

const totalExpenses = computed(() => {
  return filteredTransactions.value
    .filter(t => t.transactionType === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
});

const totalIncome = computed(() => {
  return filteredTransactions.value
    .filter(t => t.transactionType === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
});

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: authStore.user?.currency || 'USD'
  }).format(amount || 0);
};

const formatPaymentMethod = (method) => {
  return method.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const getTransactionIcon = (transaction) => {
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
  return emojis[transaction.category] || '📂';
};

const getTransactionColor = (transaction) => {
  if (transaction.transactionType === 'income') {
    return { bg: 'bg-green-100' };
  } else if (transaction.transactionType === 'investment') {
    return { bg: 'bg-indigo-100' };
  } else {
    return { bg: 'bg-red-100' };
  }
};

const formatDateHeader = (dateString) => {
  // Parse as DD/MM/YYYY
  const [day, month, year] = dateString.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  }
};

const deleteTransaction = async (transactionId) => {
  if (!confirm('Are you sure you want to delete this transaction?')) return;

  try {
    loading.value = true;
    const response = await expensesAPI.deleteExpense(transactionId);

    if (response.success || response.status === 200) {
      // Refresh the expense data
      await expenseStore.fetchAllMonthlyData();
      alert('Transaction deleted successfully');
    } else if (response.message) {
      alert(`Error: ${response.message}`);
    } else {
      alert('Failed to delete transaction. Please try again.');
    }
  } catch (error) {
    console.error('Delete failed:', error);
    // More user-friendly error messages
    if (error.response?.status === 404) {
      alert('Transaction not found. It may have already been deleted.');
    } else if (error.response?.status === 403) {
      alert('You do not have permission to delete this transaction.');
    } else if (error.response?.status === 500) {
      alert('Server error. Please try again later or contact support.');
    } else if (error.message === 'Network Error') {
      alert('Network error. Please check your connection.');
    } else {
      alert('Error deleting transaction: ' + (error.message || 'Unknown error'));
    }
  } finally {
    loading.value = false;
  }
};

const editTransaction = (transaction) => {
  // Emit event or trigger edit modal
  console.log('Edit transaction:', transaction);
  // This would open an edit modal
};

const clearFilters = () => {
  selectedPeriod.value = 'month';
  searchQuery.value = '';
  currentPage.value = 1;
};
</script>

<style scoped>
.transaction-manager {
  background: white;
}

.transaction-row {
  transition: all 0.2s;
}

.transaction-row:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    gap: 1rem;
  }

  .transaction-row {
    flex-direction: column;
  }

  .stats {
    grid-template-columns: 1fr;
  }
}
</style>
