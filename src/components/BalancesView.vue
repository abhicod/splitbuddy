<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-700">{{ error }}</p>
      <button @click="fetchBalances" class="mt-2 text-red-600 hover:text-red-800 underline">
        Try Again
      </button>
    </div>

    <!-- Balances Content -->
    <div v-else-if="balancesData">
      <!-- Individual Balances -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Individual Balances</h3>

        <div class="mb-4 p-4 bg-white border border-gray-100 rounded-lg text-sm text-gray-700">
          <p class="font-medium text-gray-900 mb-2">How to read these numbers</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <p class="text-xs text-gray-600">Paid</p>
              <p class="text-sm">Total amount this member paid for group expenses. If settlements have been recorded, this shows the remaining paid amount after settlements where applicable.</p>
            </div>
            <div>
              <p class="text-xs text-gray-600">Owes</p>
              <p class="text-sm">Total amount this member owes to other group members for their share of expenses. If settlements have been recorded, this shows the remaining owes amount after settlements where applicable.</p>
            </div>
            <div>
              <p class="text-xs text-gray-600">Balance</p>
              <p class="text-sm">Net position = Paid − Owes. A positive balance means others owe this member; a negative balance means this member owes others.</p>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <div
            v-for="balance in balancesData.balances"
            :key="balance.user._id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <UserAvatar :src="balance.user.avatar" :name="balance.user.name" size="w-10 h-10" className="bg-blue-100" />
              <div>
                <p class="font-medium text-gray-900">{{ balance.user.name }}</p>
                <!-- email hidden for privacy -->
              </div>
            </div>

            <div class="text-right">
              <div class="grid grid-cols-3 gap-4 text-sm">
                <div class="text-center">
                  <p class="text-gray-600">Paid</p>
                  <p class="font-medium text-green-600">
                    {{ formatCurrency(balance.remainingPaid ?? balance.totalPaid, currency) }}
                  </p>
                </div>
                <div class="text-center">
                  <p class="text-gray-600">Owes</p>
                  <p class="font-medium text-red-600">
                    {{ formatCurrency(balance.remainingOwes ?? balance.totalOwes, currency) }}
                  </p>
                </div>
                <div class="text-center">
                  <p class="text-gray-600">Balance</p>
                  <p class="font-semibold" :class="getBalanceColor(balance.netBalance)">
                    {{ formatCurrency(balance.netBalance, currency) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Settlements -->
      <div v-if="balancesData.settlements.length">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Suggested Settlements</h3>
          <p class="text-sm text-gray-500">Simplify your debts</p>
        </div>
        
        <div class="space-y-4">
          <div
            v-for="(settlement, index) in balancesData.settlements"
            :key="index"
            class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
          >
            <div class="flex items-center space-x-4">
              <!-- From User -->
              <div class="flex items-center space-x-2">
                <UserAvatar :src="settlement.from.avatar" :name="settlement.from.name" size="w-8 h-8" className="bg-red-100" />
                <span class="font-medium text-gray-900">{{ settlement.from.name }}</span>
              </div>

              <!-- Arrow -->
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
              </svg>

              <!-- To User -->
              <div class="flex items-center space-x-2">
                <UserAvatar :src="settlement.to.avatar" :name="settlement.to.name" size="w-8 h-8" className="bg-green-100" />
                <span class="font-medium text-gray-900">{{ settlement.to.name }}</span>
              </div>
            </div>

            <!-- Amount -->
            <div class="text-right">
              <p class="text-lg font-semibold text-gray-900">
                {{ formatCurrency(settlement.amount, currency) }}
              </p>
              <button
                @click="recordSettlement(settlement)"
                class="mt-1 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 rounded transition-colors"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Settlements -->
      <div v-else class="text-center py-8">
        <svg class="mx-auto h-12 w-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">All settled up!</h3>
        <p class="mt-1 text-sm text-gray-500">No pending settlements in this group.</p>
      </div>

      <!-- Recorded Settlements -->
      <div v-if="settlements.length" class="mt-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Recent Payments</h3>
          <p class="text-sm text-gray-500">Payment history</p>
        </div>

        <div class="space-y-3">
          <div
            v-for="settlement in settlements"
            :key="settlement._id"
            class="flex items-center justify-between p-4 border rounded-lg"
            :class="settlement.status === 'confirmed' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'"
          >
            <div class="flex items-center space-x-4">
              <!-- Settlement Info -->
              <div class="flex items-center space-x-2">
                <UserAvatar :src="settlement.from.avatar" :name="settlement.from.name" size="w-8 h-8" className="bg-blue-100" />
                <span class="font-medium text-gray-900">{{ settlement.from.name }}</span>
              </div>

              <!-- Arrow -->
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
              </svg>

              <!-- To User -->
              <div class="flex items-center space-x-2">
                <UserAvatar :src="settlement.to.avatar" :name="settlement.to.name" size="w-8 h-8" className="bg-green-100" />
                <span class="font-medium text-gray-900">{{ settlement.to.name }}</span>
              </div>

              <!-- Amount and Method -->
              <div class="text-sm text-gray-600">
                <p class="font-medium">{{ formatCurrency(settlement.amount, settlement.currency) }}</p>
                <p class="capitalize">{{ settlement.method }}</p>
              </div>
            </div>

            <!-- Status and Actions -->
            <div class="text-right space-y-2">
              <div>
                <span
                  :class="[
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    settlement.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  ]"
                >
                  {{ settlement.status === 'confirmed' ? 'Confirmed' : 'Pending Confirmation' }}
                </span>
              </div>

              <!-- Actions for pending settlements -->
              <div v-if="settlement.status === 'pending'" class="flex space-x-2">
                <!-- Confirm button (for recipient) -->
                <button
                  v-if="settlement.to._id === authStore.user._id"
                  @click="confirmReceivedPayment(settlement._id)"
                  class="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-2 py-1 rounded transition-colors"
                >
                  Confirm Receipt
                </button>

                <!-- Cancel button (for sender) -->
                <button
                  v-if="settlement.from._id === authStore.user._id"
                  @click="cancelSettlement(settlement._id)"
                  class="text-xs bg-red-50 text-red-700 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>

              <!-- Settlement date -->
              <p class="text-xs text-gray-500">
                {{ formatDate(settlement.settledAt || settlement.createdAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Record Settlement Modal -->
    <div v-if="showSettlementModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4 text-black">Record Settlement</h3>
        
        <div class="mb-4">
          <p class="text-sm text-gray-600 mb-2">
            <span class="font-medium">{{ selectedSettlement?.from.name }}</span>
            pays
            <span class="font-medium">{{ selectedSettlement?.to.name }}</span>
          </p>
          <p class="text-2xl font-bold text-gray-900">
            {{ formatCurrency(selectedSettlement?.amount || 0, currency) }}
          </p>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
          <select
            v-model="settlementMethod"
            class="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="paypal">PayPal</option>
            <option value="venmo">Venmo</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
          <textarea
            v-model="settlementNotes"
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Add any notes about this payment..."
          />
        </div>

        <div class="flex justify-end space-x-3">
          <button
            @click="showSettlementModal = false"
            class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="confirmSettlement"
            :disabled="settlementLoading"
            class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <span v-if="settlementLoading">Recording...</span>
            <span v-else>Record Payment</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/store/AuthStore';
import { expensesAPI, settlementsAPI } from '@/services/api';
import UserAvatar from '@/components/UserAvatar.vue';

const props = defineProps({
  groupId: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  }
});

const authStore = useAuthStore();

const loading = ref(false);
const error = ref(null);
const balancesData = ref(null);
const settlements = ref([]);
const showSettlementModal = ref(false);
const selectedSettlement = ref(null);
const settlementMethod = ref('cash');
const settlementNotes = ref('');
const settlementLoading = ref(false);

const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

const getBalanceColor = (balance) => {
  if (Math.abs(balance) < 0.01) return 'text-gray-600';
  return balance > 0 ? 'text-green-600' : 'text-red-600';
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

const fetchBalances = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await expensesAPI.getGroupBalances(props.groupId);
    if (response.success) {
      balancesData.value = response.data;
    }
  } catch (err) {
    console.error('Failed to fetch balances:', err);
    error.value = err.message || 'Failed to load balances';
  } finally {
    loading.value = false;
  }
};

const recordSettlement = (settlement) => {
  selectedSettlement.value = settlement;
  settlementMethod.value = 'cash';
  settlementNotes.value = '';
  showSettlementModal.value = true;
};

const confirmSettlement = async () => {
  try {
    settlementLoading.value = true;

    const settlementData = {
      groupId: props.groupId,
      fromUserId: selectedSettlement.value.from._id,
      toUserId: selectedSettlement.value.to._id,
      amount: selectedSettlement.value.amount,
      method: settlementMethod.value,
      notes: settlementNotes.value,
      currency: props.currency
    };

    const response = await settlementsAPI.createSettlement(settlementData);

    if (response.success) {
      showSettlementModal.value = false;
      await fetchBalances(); // Refresh balances
      await fetchSettlements(); // Refresh settlements
      alert('Payment recorded successfully! Waiting for confirmation from the recipient.');
    }
  } catch (err) {
    console.error('Failed to record settlement:', err);
    alert(err.message || 'Failed to record settlement');
  } finally {
    settlementLoading.value = false;
  }
};

const fetchSettlements = async () => {
  try {
    const response = await settlementsAPI.getGroupSettlements(props.groupId);
    if (response.success) {
      settlements.value = response.data.settlements;
    }
  } catch (err) {
    console.error('Failed to fetch settlements:', err);
  }
};

const confirmReceivedPayment = async (settlementId) => {
  try {
    const response = await settlementsAPI.confirmSettlement(settlementId);
    if (response.success) {
      await fetchBalances();
      await fetchSettlements();
      alert('Payment confirmed successfully!');
    }
  } catch (err) {
    console.error('Failed to confirm settlement:', err);
    alert(err.message || 'Failed to confirm settlement');
  }
};

const cancelSettlement = async (settlementId) => {
  if (!confirm('Are you sure you want to cancel this settlement?')) return;

  try {
    const response = await settlementsAPI.cancelSettlement(settlementId);
    if (response.success) {
      await fetchBalances();
      await fetchSettlements();
      alert('Settlement cancelled successfully!');
    }
  } catch (err) {
    console.error('Failed to cancel settlement:', err);
    alert(err.message || 'Failed to cancel settlement');
  }
};

onMounted(() => {
  fetchBalances();
  fetchSettlements();
});
</script>
