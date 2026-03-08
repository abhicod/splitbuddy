<template>
  <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between">
      <!-- Expense Info -->
      <div class="flex-1">
        <div class="flex items-center space-x-3 mb-2">
          <!-- Category Icon -->
          <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="categoryStyle.bg">
            <component :is="categoryIcon" :class="['w-4 h-4', categoryStyle.text]" />
          </div>
          <div>
            <h3 class="font-medium text-gray-900">{{ expense.title }}</h3>
            <p v-if="expense.description" class="text-sm text-gray-600">{{ expense.description }}</p>
          </div>
        </div>

        <!-- Expense Details -->
        <div class="flex items-center space-x-4 text-sm text-gray-500 mb-3">
          <span>{{ formatDate(expense.createdAt) }}</span>
          <span>•</span>
          <span>Paid by {{ expense.paidBy.name }}</span>
          <span>•</span>
          <span class="capitalize">{{ expense.splitType }} split</span>
        </div>

        <!-- Split Details -->
        <div class="flex items-center space-x-4">
          <div class="flex -space-x-2">
            <UserAvatar
              v-for="split in expense.splits.slice(0, 4)"
              :key="split.user._id"
              :src="split.user.avatar"
              :name="split.user.name"
              size="w-6 h-6"
              className="bg-blue-100 border-2 border-white"
              :title="`${split.user.name}: ${formatCurrency(split.amount, expense.currency)}`"
            />
            <div
              v-if="expense.splits.length > 4"
              class="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white"
            >
              <span class="text-xs font-medium text-gray-600">
                +{{ expense.splits.length - 4 }}
              </span>
            </div>
          </div>
          <span class="text-sm text-gray-600">
            {{ expense.splits.length }} {{ expense.splits.length === 1 ? 'person' : 'people' }}
          </span>
        </div>
      </div>

      <!-- Amount and Actions -->
      <div class="text-right">
        <p class="text-lg font-semibold text-gray-900 mb-2">
          {{ formatCurrency(expense.amount, expense.currency) }}
        </p>
        
        <!-- Your Share -->
        <div class="mb-3">
          <p class="text-sm text-gray-600">Your share:</p>
          <p class="font-medium" :class="userSplitClass">
            {{ formatCurrency(userSplit?.amount || 0, expense.currency) }}
          </p>
        </div>

        <!-- Status Badge -->
        <div class="mb-3">
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

        <!-- Actions -->
        <div class="flex flex-col space-y-2">
          <button
            v-if="userSplit && !userSplit.paid && userSplit.user._id !== expense.paidBy._id"
            @click="markAsPaid"
            class="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-2 py-1 rounded transition-colors self-start"
          >
            Mark Paid
          </button>

          <div class="flex justify-end">
            <button
              v-if="canDelete"
              @click="$emit('delete', expense._id)"
              class="text-xs bg-red-50 text-red-700 hover:bg-red-100 px-2 py-1 rounded transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { expensesAPI } from '@/services/api';
import UserAvatar from '@/components/UserAvatar.vue';

const props = defineProps({
  expense: {
    type: Object,
    required: true
  },
  currentUserId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['edit', 'delete']);

const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
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

const userSplit = computed(() => {
  return props.expense.splits.find(split => split.user._id === props.currentUserId);
});

const userSplitClass = computed(() => {
  if (!userSplit.value) return 'text-gray-900';
  
  if (userSplit.value.paid) {
    return 'text-green-600';
  } else if (userSplit.value.user._id === props.expense.paidBy._id) {
    return 'text-blue-600';
  } else {
    return 'text-red-600';
  }
});

const canEdit = computed(() => {
  // return props.expense.createdBy === props.currentUserId;
  return false
  
});

const canDelete = computed(() => {
  return props.expense.createdBy === props.currentUserId;
});

const categoryStyle = computed(() => {
  const styles = {
    food: { bg: 'bg-orange-100', text: 'text-orange-600' },
    transport: { bg: 'bg-blue-100', text: 'text-blue-600' },
    accommodation: { bg: 'bg-purple-100', text: 'text-purple-600' },
    entertainment: { bg: 'bg-pink-100', text: 'text-pink-600' },
    shopping: { bg: 'bg-green-100', text: 'text-green-600' },
    utilities: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    other: { bg: 'bg-gray-100', text: 'text-gray-600' }
  };
  return styles[props.expense.category] || styles.other;
});

const categoryIcon = computed(() => {
  const icons = {
    food: 'IconFood',
    transport: 'IconTransport',
    accommodation: 'IconHome',
    entertainment: 'IconEntertainment',
    shopping: 'IconShopping',
    utilities: 'IconUtilities',
    other: 'IconOther'
  };
  return icons[props.expense.category] || 'IconOther';
});

const markAsPaid = async () => {
  try {
    await expensesAPI.markSplitPaid(props.expense._id, props.currentUserId);
    // Update local state
    if (userSplit.value) {
      userSplit.value.paid = true;
    }
  } catch (err) {
    console.error('Failed to mark as paid:', err);
    alert('Failed to mark as paid');
  }
};
</script>

<script>
// Simple icon components
const IconFood = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 5M7 13l-1.5-5m0 0h2.5m0 0L9 15m11 1a3 3 0 11-6 0 3 3 0 016 0zM9 15a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`
};

const IconTransport = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 17l4 4 4-4m-4-5v9"></path></svg>`
};

const IconHome = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0h6m0 0h3a1 1 0 001-1V10M9 21h6"></path></svg>`
};

const IconEntertainment = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1m-6 0h6m-6 0v1a2 2 0 002 2h2a2 2 0 002-2v-1m-6 0v4a2 2 0 002 2h2a2 2 0 002-2v-4"></path></svg>`
};

const IconShopping = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>`
};

const IconUtilities = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>`
};

const IconOther = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>`
};

export default {
  components: {
    IconFood,
    IconTransport,
    IconHome,
    IconEntertainment,
    IconShopping,
    IconUtilities,
    IconOther
  }
};
</script>
