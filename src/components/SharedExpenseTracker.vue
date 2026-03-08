<template>
  <div class="shared-expense-tracker bg-white rounded-lg shadow p-6">
    <div class="header mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-gray-900">Shared Expense Tracker</h2>
          <p class="text-sm text-gray-500 mt-1">Track expenses with another person</p>
        </div>
        <button
          @click="showPartnerModal = true"
          class="add-partner-btn px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Partner
        </button>
      </div>
    </div>

    <!-- No Partner State -->
    <div v-if="!selectedPartner" class="empty-state text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3.001A2 2 0 013 19.001V7A6 6 0 0121 7v12.001A2 2 0 0121 21H9" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No partner selected</h3>
      <p class="mt-1 text-sm text-gray-500">Add a partner to start tracking shared expenses</p>
    </div>

    <!-- Partner Selected -->
    <div v-else class="space-y-6">
      <!-- Partner Info Card -->
      <div class="partner-card bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="partner-avatar w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {{ selectedPartner.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="font-semibold text-gray-900">{{ selectedPartner.name }}</p>
              <p class="text-sm text-gray-600">{{ selectedPartner.email }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              @click="viewPartnerDetails"
              class="detail-btn px-3 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition text-sm font-medium"
            >
              Details
            </button>
            <button
              @click="removePartner"
              class="remove-btn px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition text-sm font-medium"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-grid grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="summary-card bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p class="text-sm text-gray-600">You Paid</p>
          <p class="text-2xl font-bold text-gray-900 mt-2">{{ formatCurrency(youPaid) }}</p>
          <p class="text-xs text-gray-500 mt-1">{{ sharedExpenses.length }} shared expenses</p>
        </div>

        <div class="summary-card bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p class="text-sm text-gray-600">Partner Paid</p>
          <p class="text-2xl font-bold text-gray-900 mt-2">{{ formatCurrency(partnerPaid) }}</p>
          <p class="text-xs text-gray-500 mt-1">{{ sharedExpenses.length }} shared expenses</p>
        </div>

        <div :class="['summary-card rounded-lg p-4 border', balance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200']">
          <p :class="['text-sm', balance >= 0 ? 'text-green-700' : 'text-red-700']">
            {{ balance >= 0 ? 'Partner Owes You' : 'You Owe Partner' }}
          </p>
          <p :class="['text-2xl font-bold mt-2', balance >= 0 ? 'text-green-600' : 'text-red-600']">
            {{ formatCurrency(Math.abs(balance)) }}
          </p>
          <p :class="['text-xs mt-1', balance >= 0 ? 'text-green-600' : 'text-red-600']">
            Settlement pending
          </p>
        </div>
      </div>

      <!-- Add Shared Expense Form -->
      <div class="add-expense-section bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 class="font-semibold text-gray-900 mb-4">Add Shared Expense</h3>
        <form @submit.prevent="addSharedExpense" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                v-model="newExpense.description"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Dinner at restaurant"
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                v-model.number="newExpense.amount"
                type="number"
                step="0.01"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700 mb-1">Who Paid?</label>
              <select v-model="newExpense.paidBy" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black">
                <option value="me">You</option>
                <option value="partner">{{ selectedPartner.name }}</option>
              </select>
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select v-model="newExpense.category" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black">
                <option value="food">🍽️ Food & Dining</option>
                <option value="entertainment">🎬 Entertainment</option>
                <option value="transport">🚗 Transportation</option>
                <option value="accommodation">🏨 Accommodation</option>
                <option value="shopping">🛍️ Shopping</option>
                <option value="utilities">⚡ Utilities</option>
                <option value="other">📂 Other</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            :disabled="!newExpense.description || !newExpense.amount"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Expense
          </button>
        </form>
      </div>

      <!-- Shared Expenses List -->
      <div class="expenses-list">
        <h3 class="font-semibold text-gray-900 mb-4">Shared Expenses</h3>
        <div v-if="sharedExpenses.length === 0" class="text-center py-8 text-gray-500">
          <p>No shared expenses yet. Add one to get started!</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="(expense, index) in sharedExpenses"
            :key="index"
            class="expense-item flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <div class="flex items-center gap-4">
              <div :class="['category-icon p-2 rounded', getCategoryColor(expense.category).bg]">
                {{ getCategoryEmoji(expense.category) }}
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ expense.description }}</p>
                <p class="text-xs text-gray-500">
                  {{ expense.paidBy === 'me' ? 'You paid' : selectedPartner.name + ' paid' }} • {{ expense.date }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-semibold text-gray-900">{{ formatCurrency(expense.amount) }}</p>
              <button
                @click="removeExpense(index)"
                class="text-red-600 hover:text-red-800 text-xs mt-1 underline"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Settlement Actions -->
      <div v-if="balance !== 0" class="settlement-section bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p class="text-sm text-blue-800 mb-3">
          <span v-if="balance > 0">{{ selectedPartner.name }} owes you {{ formatCurrency(balance) }}</span>
          <span v-else>You owe {{ selectedPartner.name }} {{ formatCurrency(Math.abs(balance)) }}</span>
        </p>
        <div class="flex gap-2">
          <button
            @click="settleUp"
            class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
          >
            Mark as Settled
          </button>
          <button
            @click="recordSettlement"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
          >
            Record Payment
          </button>
        </div>
      </div>
    </div>

    <!-- Partner Selection Modal -->
    <AddPartnerModal
      v-if="showPartnerModal"
      @close="showPartnerModal = false"
      @partner-selected="selectPartner"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/store/AuthStore';
import AddPartnerModal from '@/components/AddPartnerModal.vue';

const authStore = useAuthStore();

const showPartnerModal = ref(false);
const selectedPartner = ref(null);
const sharedExpenses = ref([]);
const newExpense = ref({
  description: '',
  amount: null,
  paidBy: 'me',
  category: 'other'
});

const youPaid = computed(() => {
  return sharedExpenses.value
    .filter(e => e.paidBy === 'me')
    .reduce((sum, e) => sum + e.amount, 0);
});

const partnerPaid = computed(() => {
  return sharedExpenses.value
    .filter(e => e.paidBy === 'partner')
    .reduce((sum, e) => sum + e.amount, 0);
});

const balance = computed(() => {
  const totalExpense = sharedExpenses.value.reduce((sum, e) => sum + e.amount, 0);
  const eachOwes = totalExpense / 2;
  return eachOwes - youPaid.value;
});

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: authStore.user?.currency || 'USD'
  }).format(amount || 0);
};

const getCategoryEmoji = (category) => {
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
  return emojis[category] || '📂';
};

const getCategoryColor = (category) => {
  const colors = {
    food: { bg: 'bg-orange-100', text: 'text-orange-600' },
    transport: { bg: 'bg-blue-100', text: 'text-blue-600' },
    accommodation: { bg: 'bg-purple-100', text: 'text-purple-600' },
    entertainment: { bg: 'bg-pink-100', text: 'text-pink-600' },
    shopping: { bg: 'bg-green-100', text: 'text-green-600' },
    utilities: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    other: { bg: 'bg-gray-100', text: 'text-gray-600' }
  };
  return colors[category] || colors.other;
};

const selectPartner = (partner) => {
  selectedPartner.value = partner;
  showPartnerModal.value = false;
  // Save selected partner to localStorage
  localStorage.setItem('selected_partner', JSON.stringify(partner));
  // Load shared expenses for this partner
  loadSharedExpenses();
};

const loadSharedExpenses = () => {
  // Load from localStorage if available
  const saved = localStorage.getItem(`shared_expenses_${selectedPartner.value?.id}`);
  if (saved) {
    sharedExpenses.value = JSON.parse(saved);
  } else {
    sharedExpenses.value = [];
  }
};

const saveSharedExpenses = () => {
  if (selectedPartner.value) {
    localStorage.setItem(`shared_expenses_${selectedPartner.value.id}`, JSON.stringify(sharedExpenses.value));
  }
};

const addSharedExpense = () => {
  if (!newExpense.value.description || !newExpense.value.amount) {
    return;
  }

  sharedExpenses.value.push({
    ...newExpense.value,
    date: new Date().toLocaleDateString()
  });

  saveSharedExpenses();

  newExpense.value = {
    description: '',
    amount: null,
    paidBy: 'me',
    category: 'other'
  };
};

const removeExpense = (index) => {
  sharedExpenses.value.splice(index, 1);
  saveSharedExpenses();
};

const viewPartnerDetails = () => {
  // Open partner details modal
  console.log('View partner details:', selectedPartner.value);
};

const removePartner = () => {
  if (confirm(`Remove ${selectedPartner.value.name} as a partner?`)) {
    selectedPartner.value = null;
    sharedExpenses.value = [];
  }
};

const settleUp = () => {
  if (confirm(`Mark ${selectedPartner.value.name} as settled?`)) {
    sharedExpenses.value = [];
  }
};

const recordSettlement = () => {
  // Open settlement recording modal
  console.log('Record settlement for:', selectedPartner.value.name);
};
</script>

<style scoped>
.shared-expense-tracker {
  background: white;
}

.partner-card {
  transition: all 0.3s ease;
}

.partner-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.expense-item {
  transition: all 0.2s ease;
}

.expense-item:hover {
  border-color: #3b82f6;
}
</style>
