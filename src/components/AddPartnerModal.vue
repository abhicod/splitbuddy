<template>
  <div class="add-partner-modal fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="modal-content bg-white rounded-lg shadow-xl max-w-md w-full">
      <!-- Header -->
      <div class="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 class="text-lg font-bold text-gray-900">Add Partner</h2>
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 transition"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Tabs -->
      <div class="px-6 pt-4 border-b border-gray-200 flex gap-4">
        <button
          @click="activeTab = 'select'"
          :class="['px-4 py-2 font-medium border-b-2 transition', activeTab === 'select' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900']"
        >
          Select Friend
        </button>
        <button
          @click="activeTab = 'add'"
          :class="['px-4 py-2 font-medium border-b-2 transition', activeTab === 'add' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900']"
        >
          Add New
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Select Friend Tab -->
        <div v-if="activeTab === 'select'" class="space-y-3 max-h-80 overflow-y-auto">
          <p class="text-sm text-gray-600 mb-4">Select a friend to track expenses with</p>
          <div v-if="friends.length === 0" class="text-center py-8">
            <p class="text-gray-500">No friends added yet</p>
          </div>
          <button
            v-for="friend in friends"
            :key="friend.id"
            @click="selectFriend(friend)"
            class="friend-item w-full p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition text-left"
          >
            <div class="flex items-center gap-3">
              <div class="friend-avatar w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                {{ friend.name.charAt(0).toUpperCase() }}
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ friend.name }}</p>
                <p class="text-xs text-gray-500">{{ friend.email }}</p>
              </div>
            </div>
          </button>
        </div>

        <!-- Add New Partner Tab -->
        <div v-if="activeTab === 'add'" class="space-y-4">
          <p class="text-sm text-gray-600 mb-4">Create a new partner profile</p>

          <!-- Name Field -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              v-model="newPartner.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Partner's name"
            />
          </div>

          <!-- Email Field -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
            <input
              v-model="newPartner.email"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="partner@example.com"
            />
          </div>

          <!-- Phone Field -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
            <input
              v-model="newPartner.phone"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Phone number"
            />
          </div>

          <!-- Color Picker -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">Avatar Color</label>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="color in avatarColors"
                :key="color"
                @click="newPartner.color = color"
                :class="['w-8 h-8 rounded-full border-2 transition', newPartner.color === color ? 'border-gray-900' : 'border-transparent']"
                :style="{ backgroundColor: color }"
              ></button>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 flex gap-3">
        <button
          @click="closeModal"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
        >
          Cancel
        </button>
        <button
          v-if="activeTab === 'add'"
          @click="createPartner"
          :disabled="!newPartner.name"
          class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const emit = defineEmits(['close', 'partner-selected']);

const activeTab = ref('select');
const error = ref(null);

// Load friends and expense partners from app
const friends = ref([]);
const expensePartners = ref([]);

const loadFriendsAndPartners = () => {
  // Load partners from localStorage (set from FriendsPage)
  const savedPartners = localStorage.getItem('expense_partners');
  if (savedPartners) {
    expensePartners.value = JSON.parse(savedPartners);
  }

  // In a real app, this would load friends from API
  friends.value = expensePartners.value;
};

const newPartner = ref({
  name: '',
  email: '',
  phone: '',
  color: '#3b82f6'
});

const avatarColors = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316'
];

const closeModal = () => {
  emit('close');
};

// Load data on mount
onMounted(() => {
  loadFriendsAndPartners();
});

const selectFriend = (friend) => {
  emit('partner-selected', {
    id: friend.id,
    name: friend.name,
    email: friend.email,
    color: '#3b82f6'
  });
};

const createPartner = () => {
  error.value = null;

  if (!newPartner.value.name.trim()) {
    error.value = 'Name is required';
    return;
  }

  emit('partner-selected', {
    id: Date.now(),
    name: newPartner.value.name,
    email: newPartner.value.email,
    phone: newPartner.value.phone,
    color: newPartner.value.color
  });
};
</script>

<style scoped>
.add-partner-modal {
  animation: fadeIn 0.2s ease-in;
}

.modal-content {
  animation: slideUp 0.3s ease-out;
  max-height: 90vh;
  overflow-y: auto;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.friend-item {
  cursor: pointer;
}

.friend-avatar {
  font-weight: bold;
  color: white;
}
</style>
