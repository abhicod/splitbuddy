<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-700">{{ error }}</p>
        <button @click="fetchGroupData" class="mt-2 text-red-600 hover:text-red-800 underline">
          Try Again
        </button>
      </div>
    </div>

    <!-- Group Content -->
    <div v-else-if="group" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow mb-6">
        <div class="p-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div class="flex items-start sm:items-center gap-4">
              <button
                @click="$router.go(-1)"
                class="text-gray-500 hover:text-gray-700 shrink-0"
                aria-label="Go back"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <div>
                <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">{{ group.name }}</h1>
                <p v-if="group.description" class="text-gray-600 mt-1">{{ group.description }}</p>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <span class="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full capitalize">
                {{ group.category }}
              </span>
              <button
                @click="showAddExpense = true"
                class="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add Expense
              </button>
              <!-- Delete Group Button (Admin Only) -->
              <button
                v-if="isGroupAdmin"
                @click="confirmDeleteGroup"
                class="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                :disabled="deletingGroup"
              >
                <svg v-if="!deletingGroup" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                <svg v-else class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ deletingGroup ? 'Deleting...' : 'Delete Group' }}
              </button>
            </div>
          </div>

          <!-- Group Stats -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <p class="text-2xl font-bold text-gray-900">{{ group.members?.length || 0 }}</p>
              <p class="text-sm text-gray-600">Members</p>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <p class="text-2xl font-bold text-green-600">
                {{ formatCurrency(group.totalExpenses || 0, group.currency) }}
              </p>
              <p class="text-sm text-gray-600">Total Spent</p>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <p class="text-2xl font-bold text-blue-600">{{ expenses.length }}</p>
              <p class="text-sm text-gray-600">Expenses</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="bg-white rounded-lg shadow mb-6">
        <div class="border-b border-gray-200 overflow-x-auto">
          <nav class="flex space-x-6 px-6 whitespace-nowrap">
            <button
              @click="activeTab = 'expenses'"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'expenses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Expenses
            </button>
            <button
              @click="activeTab = 'balances'"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'balances'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Balances
            </button>
            <button
              @click="activeTab = 'members'"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'members'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Members
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- Expenses Tab -->
          <div v-if="activeTab === 'expenses'" class="space-y-4">
            <div v-if="!expenses.length" class="text-center py-8">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"></path>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No expenses yet</h3>
              <p class="mt-1 text-sm text-gray-500">Add your first expense to start tracking.</p>
              <button
                @click="showAddExpense = true"
                class="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Add Expense
              </button>
            </div>
            <div v-else>
              <ExpenseItem
                v-for="expense in expenses"
                :key="expense._id"
                :expense="expense"
                :current-user-id="authStore.user._id"
                @edit="editExpense"
                @delete="deleteExpense"
              />
            </div>
          </div>

          <!-- Balances Tab -->
          <div v-if="activeTab === 'balances'">
            <BalancesView
              :group-id="groupId"
              :currency="group.currency"
            />
          </div>

          <!-- Members Tab -->
          <div v-if="activeTab === 'members'" class="space-y-4">
            <!-- Admin-only Add Member -->
            <div v-if="isGroupAdmin" class="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <p class="text-sm text-blue-800 mb-3 font-medium">Add members by searching their name or email. Only admins can add new members.</p>
              <div class="relative max-w-xl">
                <input
                  v-model="memberSearchQuery"
                  type="text"
                  placeholder="Search users by name or email"
                  class="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                  @input="searchPotentialMembers"
                />
                <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <div v-if="memberSearchResults.length" class="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow max-h-60 overflow-y-auto">
                  <div
                    v-for="user in memberSearchResults"
                    :key="user._id"
                    class="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <div class="flex items-center space-x-2">
                      <UserAvatar :src="user.avatar" :name="user.name" size="w-7 h-7" className="bg-blue-100" />
                      <div>
                        <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                      </div>
                    </div>
                    <button
                      class="text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 rounded"
                      :disabled="addingMemberId === user._id"
                      @click="addMemberToGroup(user)"
                    >
                      <span v-if="addingMemberId === user._id">Adding...</span>
                      <span v-else>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p class="text-sm text-gray-700">Only admins can add new members to the group.</p>
            </div>

            <!-- Members List -->
            <div
              v-for="member in group.members"
              :key="member.user._id"
              class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-gray-200 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <UserAvatar :src="member.user.avatar" :name="member.user.name" size="w-10 h-10" className="bg-blue-100" />
                <div>
                  <p class="font-medium text-gray-900">{{ member.user.name }}</p>
                  <!-- Email hidden for privacy -->
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {{ member.role }}
                </span>
                <span class="text-sm text-gray-500">
                  Joined {{ formatDate(member.joinedAt) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Expense Modal -->
    <AddExpenseModal
      v-if="showAddExpense"
      :group="group"
      @close="showAddExpense = false"
      @created="handleExpenseCreated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/AuthStore';
import { groupsAPI, expensesAPI, usersAPI } from '@/services/api';
import ExpenseItem from '@/components/ExpenseItem.vue';
import BalancesView from '@/components/BalancesView.vue';
import AddExpenseModal from '@/components/AddExpenseModal.vue';
import UserAvatar from '@/components/UserAvatar.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const groupId = computed(() => route.params.groupId);
const loading = ref(false);
const error = ref(null);
const group = ref(null);
const expenses = ref([]);
const activeTab = ref('expenses');
const showAddExpense = ref(false);
const deletingGroup = ref(false);

// Add member state
const memberSearchQuery = ref('');
const memberSearchResults = ref([]);
const searchTimeout = ref(null);
const addingMemberId = ref(null);

const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

// Check if current user is admin of the group
const isGroupAdmin = computed(() => {
  if (!group.value || !authStore.user) return false;
  const currentUserMember = group.value.members?.find(
    member => member.user._id === authStore.user._id
  );
  return currentUserMember?.role === 'admin';
});

const fetchGroupData = async () => {
  try {
    loading.value = true;
    error.value = null;

    const [groupResponse, expensesResponse] = await Promise.all([
      groupsAPI.getGroup(groupId.value),
      expensesAPI.getGroupExpenses(groupId.value)
    ]);

    if (groupResponse.success) {
      group.value = groupResponse.data.group;
    }

    if (expensesResponse.success) {
      expenses.value = expensesResponse.data.expenses.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
  } catch (err) {
    console.error('Failed to fetch group data:', err);
    error.value = err.message || 'Failed to load group data';
  } finally {
    loading.value = false;
  }
};

const handleExpenseCreated = (newExpense) => {
  expenses.value.unshift(newExpense);
  showAddExpense.value = false;
  if (group.value) {
    group.value.totalExpenses = (group.value.totalExpenses || 0) + newExpense.amount;
  }
};

const editExpense = (expenseId) => {
  // open edit expense modal or navigate to edit screen
};

const deleteExpense = async (expenseId) => {
  if (!confirm('Are you sure you want to delete this expense?')) return;

  try {
    await expensesAPI.deleteExpense(expenseId);
    expenses.value = expenses.value.filter(e => e._id !== expenseId);
  } catch (err) {
    console.error('Failed to delete expense:', err);
    alert('Failed to delete expense');
  }
};

const confirmDeleteGroup = () => {
  const hasExpenses = expenses.value.length > 0;
  let message = 'Are you sure you want to delete this group?';

  if (hasExpenses) {
    message += ' This group has expenses and cannot be deleted until all expenses are settled.';
    alert(message);
    return;
  }

  message += ' This action cannot be undone.';

  if (confirm(message)) {
    deleteGroup();
  }
};

const deleteGroup = async () => {
  try {
    deletingGroup.value = true;
    const response = await groupsAPI.deleteGroup(groupId.value);

    if (response.success) {
      alert('Group deleted successfully');
      await router.push('/groups');
    }
  } catch (err) {
    console.error('Failed to delete group:', err);
    alert(err.message || 'Failed to delete group');
  } finally {
    deletingGroup.value = false;
  }
};

// Search and add members (admin only)
const searchPotentialMembers = () => {
  if (searchTimeout.value) clearTimeout(searchTimeout.value);

  searchTimeout.value = setTimeout(async () => {
    if (!memberSearchQuery.value || memberSearchQuery.value.trim().length < 2) {
      memberSearchResults.value = [];
      return;
    }

    try {
      const response = await usersAPI.searchUsers(memberSearchQuery.value.trim());
      if (response.success) {
        const existingIds = new Set(group.value.members.map(m => m.user._id));
        memberSearchResults.value = response.data.users.filter(u => !existingIds.has(u._id));
      }
    } catch (err) {
      console.error('User search failed:', err);
    }
  }, 300);
};

const addMemberToGroup = async (user) => {
  try {
    addingMemberId.value = user._id;
    const response = await groupsAPI.addMember(groupId.value, user._id);
    if (response.success) {
      group.value = response.data.group;
      memberSearchQuery.value = '';
      memberSearchResults.value = [];
    } else {
      alert(response.message || 'Failed to add member');
    }
  } catch (err) {
    alert(err.message || 'Failed to add member');
  } finally {
    addingMemberId.value = null;
  }
};

onMounted(() => {
  fetchGroupData();
});
</script>
