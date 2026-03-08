<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20">
    <!-- Header -->
    <div class="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center py-6 space-y-4 sm:space-y-0">
          <div>
            <h1 class="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
            <p class="text-gray-600 text-base sm:text-lg mt-1">Welcome back, <span class="font-semibold text-gray-800">{{ authStore.user?.name }}</span>!</p>
          </div>
          <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 rounded-xl border border-blue-200/50 shadow-sm">
              <p class="text-sm font-medium text-gray-600">Total Balance</p>
              <p class="text-xl font-bold" :class="[
                balanceData?.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'
              ]">
                {{ formatCurrency(balanceData?.totalBalance || 0, authStore.user?.currency) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-700">{{ error }}</p>
        <button @click="fetchDashboardData" class="mt-2 text-red-600 hover:text-red-800 underline">
          Try Again
        </button>
      </div>

      <!-- Dashboard Content -->
      <div v-else class="space-y-6">
        <!-- Quick Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <router-link to="/groups" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Groups</p>
                <p class="text-3xl font-bold text-gray-900 mt-2">{{ dashboardData?.totalGroups || 0 }}</p>
                <p class="text-xs text-gray-500 mt-1">Active groups</p>
              </div>
              <div class="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl shadow-sm">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
            </div>
          </router-link>

          <router-link to="/friends" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Friends</p>
                <p class="text-3xl font-bold text-gray-900 mt-2">{{ dashboardData?.totalFriends || 0 }}</p>
                <p class="text-xs text-gray-500 mt-1">Connected friends</p>
              </div>
              <div class="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl shadow-sm">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </router-link>

          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] sm:col-span-2 lg:col-span-1">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Your Balance</p>
                <p class="text-3xl font-bold mt-2" :class="[
                  balanceData?.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'
                ]">
                  {{ formatCurrency(balanceData?.totalBalance || 0, authStore.user?.currency) }}
                </p>
                <p class="text-xs mt-1" :class="[
                  balanceData?.totalBalance >= 0 ? 'text-green-500' : 'text-red-500'
                ]">
                  {{ balanceData?.totalBalance >= 0 ? 'You are owed' : 'You owe' }}
                </p>
              </div>
              <div class="p-4 bg-gradient-to-br rounded-2xl shadow-sm" :class="[
                balanceData?.totalBalance >= 0 ? 'from-green-100 to-green-200' : 'from-red-100 to-red-200'
              ]">
                <svg class="w-8 h-8" :class="[
                  balanceData?.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'
                ]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
          <div class="px-6 py-5 border-b border-gray-200/50">
            <h2 class="text-xl font-bold text-gray-900">Quick Actions</h2>
            <p class="text-sm text-gray-600 mt-1">Get started with these common tasks</p>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <router-link
                to="/groups"
                class="group flex items-center p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-blue-200/50"
              >
                <div class="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </div>
                <div class="ml-4 text-left">
                  <p class="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Create Group</p>
                  <p class="text-sm text-gray-600 mt-1">Start tracking expenses with friends</p>
                </div>
              </router-link>

              <router-link
                to="/groups"
                class="group flex items-center p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl hover:from-green-100 hover:to-green-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-green-200/50"
              >
                <div class="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <div class="ml-4 text-left">
                  <p class="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">View Groups</p>
                  <p class="text-sm text-gray-600 mt-1">Manage your expense groups</p>
                </div>
              </router-link>

              <router-link
                to="/friends"
                class="group flex items-center p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-purple-200/50"
              >
                <div class="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="ml-4 text-left">
                  <p class="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">Manage Friends</p>
                  <p class="text-sm text-gray-600 mt-1">Add and connect with friends</p>
                </div>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Recent Activity and Settlements -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Recent Expenses -->
          <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">Recent Expenses</h2>
              <router-link
                to="/expenses"
                class="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All
              </router-link>
            </div>
            <div class="p-6">
              <div v-if="!recentExpenses?.length" class="text-center py-8">
                <svg class="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"></path>
                </svg>
                <p class="mt-2 text-sm text-gray-500">No recent expenses</p>
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="expense in recentExpenses.slice(0, 5)"
                  :key="expense._id"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="getCategoryStyle(expense.category).bg">
                      <svg class="w-4 h-4" :class="getCategoryStyle(expense.category).text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900 text-sm">{{ expense.title }}</p>
                      <p class="text-xs text-gray-500">{{ expense.group?.name || 'Unknown Group' }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-medium text-gray-900 text-sm">
                      {{ formatCurrency(expense.amount, expense.currency) }}
                    </p>
                    <p class="text-xs text-gray-500">
                      Your share: {{ formatCurrency(getUserShare(expense), expense.currency) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pending Settlements -->
          <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Pending Settlements</h2>
            </div>
            <div class="p-6">
              <div v-if="!pendingSettlements?.length" class="text-center py-8">
                <svg class="mx-auto h-8 w-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="mt-2 text-sm text-gray-500">All settled up!</p>
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="settlement in pendingSettlements.slice(0, 4)"
                  :key="`${settlement.from._id}-${settlement.to._id}`"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div class="flex items-center space-x-3">
                    <div class="flex items-center space-x-2">
                      <UserAvatar :src="settlement.from.avatar" :name="settlement.from.name" size="w-6 h-6" className="bg-red-100" />
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                      </svg>
                      <UserAvatar :src="settlement.to.avatar" :name="settlement.to.name" size="w-6 h-6" className="bg-green-100" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">
                        {{ settlement.from.name }} → {{ settlement.to.name }}
                      </p>
                      <p class="text-xs text-gray-500">{{ settlement.groupName }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-medium text-gray-900 text-sm">
                      {{ formatCurrency(settlement.amount, settlement.currency) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Your Groups -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">Your Groups</h2>
            <router-link
              to="/groups"
              class="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View All
            </router-link>
          </div>
          <div class="p-6">
            <div v-if="!dashboardData?.groups?.length" class="text-center py-8">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No groups yet</h3>
              <p class="mt-1 text-sm text-gray-500">Get started by creating your first group.</p>
              <button
                @click="showCreateGroup = true"
                class="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Group
              </button>
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="group in dashboardData.groups.slice(0, 6)"
                :key="group._id"
                class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                @click="$router.push(`/groups/${group._id}`)"
              >
                <div class="flex items-center justify-between mb-2">
                  <h3 class="font-medium text-gray-900 truncate">{{ group.name }}</h3>
                  <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {{ group.category }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 mb-2">{{ group.members?.length || 0 }} members</p>
                <p class="text-sm font-medium text-gray-900">
                  Total: {{ formatCurrency(group.totalExpenses || 0, group.currency || 'USD') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Group Modal (placeholder) -->
    <div v-if="showCreateGroup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">Create New Group</h3>
        <p class="text-gray-600 mb-4">Group creation feature will be implemented in the next step.</p>
        <div class="flex justify-end space-x-3">
          <button
            @click="showCreateGroup = false"
            class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/AuthStore';
import { usersAPI, groupsAPI, expensesAPI } from '@/services/api';
import UserAvatar from '@/components/UserAvatar.vue';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const error = ref(null);
const dashboardData = ref(null);
const balanceData = ref(null);
const recentExpenses = ref([]);
const pendingSettlements = ref([]);
const showCreateGroup = ref(false);

const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
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

const logout = () => {
  authStore.logout();
  router.push('/auth');
};

const fetchDashboardData = async () => {
  try {
    loading.value = true;
    error.value = null;

    const [dashboardResponse, balanceResponse] = await Promise.all([
      usersAPI.getDashboard(),
      usersAPI.getBalance()
    ]);

    if (dashboardResponse.success) {
      dashboardData.value = dashboardResponse.data;

      // Fetch recent expenses from user's groups
      if (dashboardResponse.data.groups?.length) {
        await fetchRecentExpenses(dashboardResponse.data.groups);
        await fetchPendingSettlements(dashboardResponse.data.groups);
      }
    }

    if (balanceResponse.success) {
      balanceData.value = balanceResponse.data;
    }

  } catch (err) {
    console.error('Failed to fetch dashboard data:', err);
    error.value = err.message || 'Failed to load dashboard data';
  } finally {
    loading.value = false;
  }
};

const fetchRecentExpenses = async (groups) => {
  try {
    const expensePromises = groups.slice(0, 5).map(group =>
      expensesAPI.getGroupExpenses(group._id, 1, 10)
    );

    const responses = await Promise.all(expensePromises);
    const allExpenses = responses
      .filter(response => response.success)
      .flatMap(response => response.data.expenses);

    // Sort by date and take the most recent
    recentExpenses.value = allExpenses
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

  } catch (err) {
    console.error('Failed to fetch recent expenses:', err);
  }
};

const fetchPendingSettlements = async (groups) => {
  try {
    const settlementPromises = groups.slice(0, 5).map(async (group) => {
      try {
        const response = await expensesAPI.getGroupBalances(group._id);
        if (response.success && response.data.settlements?.length) {
          return response.data.settlements.map(settlement => ({
            ...settlement,
            groupName: group.name,
            currency: group.currency || 'USD'
          }));
        }
        return [];
      } catch (err) {
        console.error(`Failed to fetch balances for group ${group._id}:`, err);
        return [];
      }
    });

    const responses = await Promise.all(settlementPromises);
    pendingSettlements.value = responses.flat().slice(0, 10);

  } catch (err) {
    console.error('Failed to fetch pending settlements:', err);
  }
};

onMounted(() => {
  fetchDashboardData();
  window.addEventListener('app:refresh', fetchDashboardData);
});

onBeforeUnmount(() => {
  window.removeEventListener('app:refresh', fetchDashboardData);
});
</script>

<style scoped>
/* Custom animations */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Stagger animation for cards */
.grid > div:nth-child(1) {
  animation: slideUp 0.6s ease-out;
}

.grid > div:nth-child(2) {
  animation: slideUp 0.6s ease-out 0.1s both;
}

.grid > div:nth-child(3) {
  animation: slideUp 0.6s ease-out 0.2s both;
}

/* Hover effects */
.hover\:scale-\[1\.02\]:hover {
  transform: scale(1.02);
}

.hover\:scale-105:hover {
  transform: scale(1.05);
}

/* Loading spinner enhancement */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .backdrop-blur-lg {
    backdrop-filter: blur(8px);
  }

  .backdrop-blur-sm {
    backdrop-filter: blur(4px);
  }
}
</style>
