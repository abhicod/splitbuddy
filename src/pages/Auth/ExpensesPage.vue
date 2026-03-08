<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">All Expenses</h1>
          <p class="text-gray-600 mt-1">View and manage your expenses across all groups</p>
        </div>
        <div class="hidden sm:flex items-center space-x-4">
          <!-- Filters (visible on sm and up) -->
          <select
            v-model="selectedGroup"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            @change="fetchExpenses"
          >
            <option value="">All Groups</option>
            <option
              v-for="group in userGroups"
              :key="group._id"
              :value="group._id"
            >
              {{ group.name }}
            </option>
          </select>
          
          <select
            v-model="selectedCategory"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            @change="fetchExpenses"
          >
            <option value="">All Categories</option>
            <option value="food">🍽️ Food & Dining</option>
            <option value="transport">🚗 Transportation</option>
            <option value="accommodation">🏨 Accommodation</option>
            <option value="entertainment">🎬 Entertainment</option>
            <option value="shopping">🛍️ Shopping</option>
            <option value="utilities">⚡ Utilities</option>
            <option value="other">📂 Other</option>
          </select>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Expenses</p>
              <p class="text-2xl font-semibold text-gray-900">{{ expenses.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Amount</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ formatCurrency(totalAmount, authStore.user?.currency) }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-red-100 rounded-lg">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Pending</p>
              <p class="text-2xl font-semibold text-red-600">{{ pendingExpenses }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Your Share</p>
              <p class="text-2xl font-semibold text-purple-600">
                {{ formatCurrency(yourTotalShare, authStore.user?.currency) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Expenses List -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Recent Expenses</h2>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="p-6">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-red-700">{{ error }}</p>
            <button @click="fetchExpenses" class="mt-2 text-red-600 hover:text-red-800 underline">
              Try Again
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!expenses.length" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No expenses found</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ selectedGroup || selectedCategory ? 'Try adjusting your filters' : 'Start by joining a group and adding expenses' }}
          </p>
        </div>

        <!-- Expenses -->
        <div v-else class="divide-y divide-gray-200">
          <div
            v-for="expense in paginatedExpenses"
            :key="expense._id"
            class="p-6 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start justify-between">
              <!-- Expense Info -->
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="getCategoryStyle(expense.category).bg">
                    <svg class="w-4 h-4" :class="getCategoryStyle(expense.category).text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-medium text-gray-900">{{ expense.title }}</h3>
                    <p v-if="expense.description" class="text-sm text-gray-600">{{ expense.description }}</p>
                  </div>
                </div>

                <div class="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                  <span>{{ formatDate(expense.date) }}</span>
                  <span>•</span>
                  <span>{{ expense.group?.name || 'Unknown Group' }}</span>
                  <span>•</span>
                  <span>Paid by {{ expense.paidBy?.name || 'Unknown' }}</span>
                </div>

                <div class="flex items-center space-x-4">
                  <div class="flex -space-x-2">
                    <UserAvatar
                      v-for="split in expense.splits?.slice(0, 4)"
                      :key="split.user?._id"
                      :src="split.user?.avatar"
                      :name="split.user?.name"
                      size="w-6 h-6"
                      className="bg-blue-100 border-2 border-white"
                    />
                  </div>
                  <span class="text-sm text-gray-600">
                    {{ expense.splits?.length || 0 }} {{ (expense.splits?.length || 0) === 1 ? 'person' : 'people' }}
                  </span>
                </div>
              </div>

              <!-- Amount and Status -->
              <div class="text-right">
                <p class="text-lg font-semibold text-gray-900 mb-1">
                  {{ formatCurrency(expense.amount, expense.currency) }}
                </p>
                <p class="text-sm text-gray-600 mb-2">
                  Your share: {{ formatCurrency(getUserShare(expense), expense.currency) }}
                </p>
                <span
                  :class="[
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    expense.isSettled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  ]"
                >
                  {{ expense.isSettled ? 'Settled' : 'Pending' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="expenses.length > itemsPerPage" class="px-6 py-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-700">
                Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to 
                {{ Math.min(currentPage * itemsPerPage, expenses.length) }} of 
                {{ expenses.length }} expenses
              </span>
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span class="px-3 py-1 text-sm">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              <button
                @click="currentPage++"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/store/AuthStore';
import { groupsAPI, expensesAPI } from '@/services/api';
import UserAvatar from '@/components/UserAvatar.vue';

const authStore = useAuthStore();

const loading = ref(false);
const error = ref(null);
const expenses = ref([]);
const userGroups = ref([]);
const selectedGroup = ref('');
const selectedCategory = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount || 0);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
};

const getCategoryStyle = (category) => {
  const styles = {
    food: { bg: 'bg-orange-100', text: 'text-orange-600' },
    transport: { bg: 'bg-blue-100', text: 'text-blue-600' },
    accommodation: { bg: 'bg-purple-100', text: 'text-purple-600' },
    entertainment: { bg: 'bg-pink-100', text: 'text-pink-600' },
    shopping: { bg: 'bg-green-100', text: 'text-green-600' },
    utilities: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    other: { bg: 'bg-gray-100', text: 'text-gray-600' }
  };
  return styles[category] || styles.other;
};

const getUserShare = (expense) => {
  const userSplit = expense.splits?.find(split => split.user?._id === authStore.user._id);
  return userSplit?.amount || 0;
};

const totalAmount = computed(() => {
  return expenses.value.reduce((sum, expense) => sum + (expense.amount || 0), 0);
});

const yourTotalShare = computed(() => {
  return expenses.value.reduce((sum, expense) => sum + getUserShare(expense), 0);
});

const pendingExpenses = computed(() => {
  return expenses.value.filter(expense => !expense.isSettled).length;
});

const totalPages = computed(() => {
  return Math.ceil(expenses.value.length / itemsPerPage);
});

const paginatedExpenses = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return expenses.value.slice(start, end);
});

const fetchUserGroups = async () => {
  try {
    const response = await groupsAPI.getGroups();
    if (response.success) {
      userGroups.value = response.data.groups;
    }
  } catch (err) {
    console.error('Failed to fetch groups:', err);
  }
};

const fetchExpenses = async () => {
  try {
    loading.value = true;
    error.value = null;
    expenses.value = [];

    // If specific group selected, get expenses for that group
    if (selectedGroup.value) {
      const response = await expensesAPI.getGroupExpenses(selectedGroup.value, 1, 100);
      if (response.success) {
        expenses.value = response.data.expenses;
      }
    } else {
      // Get expenses from all user groups
      const groupExpensePromises = userGroups.value.map(group =>
        expensesAPI.getGroupExpenses(group._id, 1, 100)
      );
      
      const responses = await Promise.all(groupExpensePromises);
      const allExpenses = responses
        .filter(response => response.success)
        .flatMap(response => response.data.expenses);
      
      expenses.value = allExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Apply category filter
    if (selectedCategory.value) {
      expenses.value = expenses.value.filter(expense => expense.category === selectedCategory.value);
    }

    currentPage.value = 1;
  } catch (err) {
    console.error('Failed to fetch expenses:', err);
    error.value = err.message || 'Failed to load expenses';
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchUserGroups();
  await fetchExpenses();
});
</script>
