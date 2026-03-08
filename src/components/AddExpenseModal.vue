<template>
  <div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
    <div class="bg-black rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-red-800/50">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-red-800/50">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-white">Add Expense</h3>
          <button
            @click="$emit('close')"
            class="text-red-400 hover:text-red-300 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Error Display -->
        <div v-if="error" class="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
          {{ error }}
        </div>

        <!-- Basic Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-red-300 mb-1">Expense Title *</label>
            <input
              v-model="form.title"
              type="text"
              required
              maxlength="200"
              class="w-full px-3 py-2 bg-gray-900 border border-red-800/50 rounded-lg text-white placeholder-red-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
              placeholder="e.g., Dinner at restaurant, Gas for trip..."
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-red-300 mb-1">Amount *</label>
            <div class="relative">
              <span class="absolute left-3 top-2 text-red-400">{{ getCurrencySymbol(group.currency) }}</span>
              <input
                v-model.number="form.amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                class="w-full pl-8 pr-3 py-2 bg-gray-900 border border-red-800/50 rounded-lg text-white placeholder-red-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-red-300 mb-1">Category</label>
            <select
              v-model="form.category"
              class="w-full px-3 py-2 bg-gray-900 border border-red-800/50 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
            >
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

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-red-300 mb-1">Description</label>
          <textarea
            v-model="form.description"
            rows="3"
            maxlength="1000"
            class="w-full px-3 py-2 bg-gray-900 border border-red-800/50 rounded-lg text-white placeholder-red-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors resize-none"
            placeholder="Optional details about this expense..."
          />
        </div>

        <!-- Date -->
        <div>
          <label class="block text-sm font-medium text-red-300 mb-1">Date</label>
          <input
            v-model="form.date"
            type="date"
            class="w-full px-3 py-2 bg-gray-900 border border-red-800/50 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
          />
        </div>

        <!-- Who Paid -->
        <div>
          <label class="block text-sm font-medium text-red-300 mb-2">Who paid for this expense?</label>
          <div class="space-y-2">
            <label
              v-for="member in group.members"
              :key="'payer-' + member.user._id"
              class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-red-900/20"
              :class="form.paidBy === member.user._id ? 'border-red-500 bg-red-900/30' : 'border-red-800/50'"
            >
              <input
                v-model="form.paidBy"
                type="radio"
                :value="member.user._id"
                class="sr-only"
              />
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center space-x-3">
                  <UserAvatar :src="member.user.avatar" :name="member.user.name" size="w-8 h-8" className="bg-red-100" />
                  <div>
                    <p class="font-medium text-white">{{ member.user.name }}</p>
                    <p class="text-sm text-red-300">{{ member.user.email }}</p>
                  </div>
                </div>
                <!-- Radio button indicator -->
                <div class="w-4 h-4 rounded-full border-2" :class="form.paidBy === member.user._id ? 'border-red-500 bg-red-500' : 'border-red-800/50'">
                  <div v-if="form.paidBy === member.user._id" class="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- Split Type -->
        <div>
          <label class="block text-sm font-medium text-red-300 mb-2">How should this be split?</label>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-red-900/20" :class="form.splitType === 'equal' ? 'border-red-500 bg-red-900/30' : 'border-red-800/50'">
              <input
                v-model="form.splitType"
                type="radio"
                value="equal"
                class="sr-only"
              />
              <div class="flex items-center space-x-2">
                <div class="w-4 h-4 rounded-full border-2" :class="form.splitType === 'equal' ? 'border-red-500 bg-red-500' : 'border-red-800/50'">
                  <div v-if="form.splitType === 'equal'" class="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                </div>
                <div>
                  <p class="font-medium text-white">Equal Split</p>
                  <p class="text-sm text-red-300">Split equally among all</p>
                </div>
              </div>
            </label>

            <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-red-900/20" :class="form.splitType === 'exact' ? 'border-red-500 bg-red-900/30' : 'border-red-800/50'">
              <input
                v-model="form.splitType"
                type="radio"
                value="exact"
                class="sr-only"
              />
              <div class="flex items-center space-x-2">
                <div class="w-4 h-4 rounded-full border-2" :class="form.splitType === 'exact' ? 'border-red-500 bg-red-500' : 'border-red-800/50'">
                  <div v-if="form.splitType === 'exact'" class="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                </div>
                <div>
                  <p class="font-medium text-white">Exact Amounts</p>
                  <p class="text-sm text-red-300">Enter specific amounts</p>
                </div>
              </div>
            </label>

            <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-red-900/20" :class="form.splitType === 'percentage' ? 'border-red-500 bg-red-900/30' : 'border-red-800/50'">
              <input
                v-model="form.splitType"
                type="radio"
                value="percentage"
                class="sr-only"
              />
              <div class="flex items-center space-x-2">
                <div class="w-4 h-4 rounded-full border-2" :class="form.splitType === 'percentage' ? 'border-red-500 bg-red-500' : 'border-red-800/50'">
                  <div v-if="form.splitType === 'percentage'" class="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                </div>
                <div>
                  <p class="font-medium text-white">Percentages</p>
                  <p class="text-sm text-red-300">Split by percentage</p>
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- Members Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Who was involved?</label>
          <div class="space-y-2 max-h-48 overflow-y-auto">
            <label
              v-for="member in group.members"
              :key="member.user._id"
              class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              :class="isInvolved(member.user._id) ? 'border-blue-500 bg-blue-50' : 'border-gray-300'"
            >
              <input
                :value="member.user._id"
                type="checkbox"
                @change="toggleMember(member.user._id, $event)"
                :checked="isInvolved(member.user._id)"
                class="sr-only"
              />
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center space-x-3">
                  <UserAvatar :src="member.user.avatar" :name="member.user.name" size="w-8 h-8" className="bg-blue-100" />
                  <div>
                    <p class="font-medium text-gray-900">{{ member.user.name }}</p>
                    <p class="text-sm text-gray-500">{{ member.user.email }}</p>
                  </div>
                </div>

                <!-- Split Input -->
                <div v-if="isInvolved(member.user._id) && form.splitType !== 'equal'" class="flex items-center space-x-2">
                  <div v-if="form.splitType === 'exact'" class="flex items-center">
                    <span class="text-sm text-gray-500 mr-1">{{ getCurrencySymbol(group.currency) }}</span>
                    <input
                      :value="getSplitAmount(member.user._id)"
                      @input="updateSplit(member.user._id, 'amount', $event.target.value)"
                      type="number"
                      step="0.01"
                      min="0"
                      class="w-20 px-2 py-1 text-sm bg-gray-900 border border-red-800/50 rounded text-white"
                      placeholder="0.00"
                    />
                  </div>
                  <div v-else-if="form.splitType === 'percentage'" class="flex items-center">
                    <input
                      :value="getSplitPercentage(member.user._id)"
                      @input="updateSplit(member.user._id, 'percentage', $event.target.value)"
                      type="number"
                      min="0"
                      max="100"
                      class="w-16 px-2 py-1 text-sm bg-gray-900 border border-red-800/50 rounded text-white"
                      placeholder="0"
                    />
                    <span class="text-sm text-gray-500 ml-1">%</span>
                  </div>
                </div>

                <!-- Checkmark -->
                <div v-if="isInvolved(member.user._id)" class="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- Split Summary -->
        <div v-if="involvedMembers.length && form.amount" class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-medium text-gray-900 mb-3">Split Summary</h4>
          <div class="space-y-2">
            <div
              v-for="member in involvedMembers"
              :key="member._id"
              class="flex justify-between text-sm"
            >
              <span class="text-black"> {{ getMemberName(member) }}</span>
              <span class="font-medium text-black">{{ formatCurrency(getCalculatedAmount(member), group.currency) }}</span>
            </div>
            <div class="border-t pt-2 flex justify-between font-medium">
              <span class="text-black">Total</span>
              <span class="text-black">{{ formatCurrency(calculateTotal(), group.currency) }}</span>
            </div>
          </div>
          
          <!-- Validation Errors -->
          <div v-if="!isValidSplit" class="mt-2 text-sm text-red-600">
            <p v-if="form.splitType === 'exact'">
              Split amounts must add up to {{ formatCurrency(form.amount, group.currency) }}
            </p>
            <p v-else-if="form.splitType === 'percentage'">
              Percentages must add up to 100%
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading || !canSubmit"
            class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="loading">Adding...</span>
            <span v-else>Add Expense</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { useAuthStore } from '@/store/AuthStore';
import { expensesAPI } from '@/services/api';
import UserAvatar from '@/components/UserAvatar.vue';

const props = defineProps({
  group: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'created']);
const authStore = useAuthStore();

const loading = ref(false);
const error = ref(null);
const involvedMembers = ref([]);
const customSplits = ref({});

const form = reactive({
  title: '',
  description: '',
  amount: null,
  category: 'other',
  splitType: 'equal',
  date: new Date().toISOString().split('T')[0],
  paidBy: authStore.user._id // Default to current user
});

const getCurrencySymbol = (currency) => {
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    CAD: 'C$',
    AUD: 'A$'
  };
  return symbols[currency] || currency;
};

const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount || 0);
};

const isInvolved = (userId) => {
  return involvedMembers.value.includes(userId);
};

const toggleMember = (userId, event) => {
  if (event.target.checked) {
    involvedMembers.value.push(userId);
    if (form.splitType !== 'equal') {
      customSplits.value[userId] = { amount: 0, percentage: 0 };
    }
  } else {
    involvedMembers.value = involvedMembers.value.filter(id => id !== userId);
    delete customSplits.value[userId];
  }
};

const updateSplit = (userId, type, value) => {
  if (!customSplits.value[userId]) {
    customSplits.value[userId] = { amount: 0, percentage: 0 };
  }
  customSplits.value[userId][type] = parseFloat(value) || 0;
};

const getSplitAmount = (userId) => {
  return customSplits.value[userId]?.amount || 0;
};

const getSplitPercentage = (userId) => {
  return customSplits.value[userId]?.percentage || 0;
};

const getMemberName = (userId) => {
  const member = props.group.members.find(m => m.user._id === userId);
  return member?.user.name || '';
};

const getCalculatedAmount = (userId) => {
  if (form.splitType === 'equal') {
    return form.amount / involvedMembers.value.length;
  } else if (form.splitType === 'exact') {
    return customSplits.value[userId]?.amount || 0;
  } else if (form.splitType === 'percentage') {
    return (form.amount * (customSplits.value[userId]?.percentage || 0)) / 100;
  }
  return 0;
};

const calculateTotal = () => {
  if (form.splitType === 'equal') {
    return form.amount;
  } else if (form.splitType === 'exact') {
    return involvedMembers.value.reduce((total, userId) => {
      return total + (customSplits.value[userId]?.amount || 0);
    }, 0);
  } else if (form.splitType === 'percentage') {
    return form.amount;
  }
  return 0;
};

const isValidSplit = computed(() => {
  if (!form.amount || !involvedMembers.value.length) return true;
  
  if (form.splitType === 'equal') return true;
  
  if (form.splitType === 'exact') {
    const total = calculateTotal();
    return Math.abs(total - form.amount) < 0.01;
  }
  
  if (form.splitType === 'percentage') {
    const totalPercentage = involvedMembers.value.reduce((total, userId) => {
      return total + (customSplits.value[userId]?.percentage || 0);
    }, 0);
    return Math.abs(totalPercentage - 100) < 0.01;
  }
  
  return false;
});

const canSubmit = computed(() => {
  return form.title.trim() &&
         form.amount > 0 &&
         involvedMembers.value.length > 0 &&
         form.paidBy &&
         isValidSplit.value;
});

// Watch for split type changes
watch(() => form.splitType, (newType) => {
  customSplits.value = {};
  if (newType === 'equal') {
    // Equal split doesn't need custom splits
  } else if (newType === 'percentage') {
    // Initialize with equal percentages
    const equalPercentage = 100 / involvedMembers.value.length;
    involvedMembers.value.forEach(userId => {
      customSplits.value[userId] = { amount: 0, percentage: equalPercentage };
    });
  } else if (newType === 'exact') {
    // Initialize with equal amounts
    const equalAmount = form.amount / involvedMembers.value.length || 0;
    involvedMembers.value.forEach(userId => {
      customSplits.value[userId] = { amount: equalAmount, percentage: 0 };
    });
  }
});

// Initialize with current user selected
involvedMembers.value = [authStore.user._id];

const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = null;

    const expenseData = {
      title: form.title.trim(),
      description: form.description.trim(),
      amount: form.amount,
      category: form.category,
      groupId: props.group._id,
      splitType: form.splitType,
      members: involvedMembers.value,
      date: form.date,
      paidBy: form.paidBy
    };

    if (form.splitType !== 'equal') {
      expenseData.customSplits = involvedMembers.value.map(userId => ({
        user: userId,
        amount: getCalculatedAmount(userId),
        ...(form.splitType === 'percentage' && { percentage: getSplitPercentage(userId) })
      }));
    }

    const response = await expensesAPI.createExpense(expenseData);
    
    if (response.success) {
      emit('created', response.data.expense);
      // notify app to refresh dashboard data
      try { window.dispatchEvent(new Event('app:refresh')); } catch (e) { /* ignore */ }
    } else {
      throw new Error(response.message || 'Failed to create expense');
    }
  } catch (err) {
    console.error('Create expense failed:', err);
    error.value = err.message || 'Failed to create expense';
  } finally {
    loading.value = false;
  }
};
</script>
