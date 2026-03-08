<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">👥 Friends & Partners</h1>
          <p class="text-gray-600 mt-1">Manage your friends and set up shared expense partners</p>
        </div>
        <div class="w-full sm:w-auto">
          <div class="relative w-full sm:w-72">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by name or email"
              class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              @input="searchUsers"
            />
            <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-8 border-b border-gray-200">
        <div class="flex gap-8">
          <button
            @click="activeTab = 'friends'"
            :class="['pb-4 px-1 font-medium transition-colors', activeTab === 'friends' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900']"
          >
            Friends ({{ friends.length }})
          </button>
          <button
            @click="activeTab = 'partners'"
            :class="['pb-4 px-1 font-medium transition-colors', activeTab === 'partners' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900']"
          >
            Expense Partners ({{ partners.length }})
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Friends List / Partners List -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow">
            <!-- Friends Tab -->
            <div v-if="activeTab === 'friends'">
              <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-lg font-semibold text-gray-900">Your Friends</h2>
              </div>

              <!-- Loading State -->
              <div v-if="loading" class="flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>

              <!-- Error State -->
              <div v-else-if="error" class="p-6">
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p class="text-red-700">{{ error }}</p>
                  <button @click="fetchFriends" class="mt-2 text-red-600 hover:text-red-800 underline">
                    Try Again
                  </button>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else-if="!friends.length" class="text-center py-12">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No friends yet</h3>
                <p class="mt-1 text-sm text-gray-500">Search for users to add as friends and start splitting expenses.</p>
              </div>

              <!-- Friends List -->
              <div v-else class="divide-y divide-gray-200">
                <div
                  v-for="friend in friends"
                  :key="friend._id"
                  class="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div class="flex items-center space-x-4">
                      <UserAvatar :src="friend.avatar" :name="friend.name" size="w-12 h-12" className="bg-gradient-to-br from-blue-500 to-purple-600" />
                      <div>
                        <h3 class="text-lg font-medium text-gray-900">{{ friend.name }}</h3>
                      </div>
                    </div>

                    <div class="flex items-center justify-between sm:justify-end gap-4">
                      <!-- Actions -->
                      <div class="flex gap-2">
                        <button
                          @click="makePartner(friend)"
                          :class="['text-sm px-3 py-1 rounded transition-colors', isPartner(friend._id) ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-blue-50 text-blue-700 hover:bg-blue-100']"
                        >
                          {{ isPartner(friend._id) ? '✓ Partner' : 'Add as Partner' }}
                        </button>
                        <button
                          @click="removeFriend(friend._id)"
                          class="text-sm bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1 rounded transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Partners Tab -->
            <div v-if="activeTab === 'partners'">
              <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900">Expense Sharing Partners</h2>
                <button
                  @click="activeTab = 'friends'"
                  class="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Add from Friends
                </button>
              </div>

              <!-- Empty State -->
              <div v-if="!partners.length" class="text-center py-12">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No partners yet</h3>
                <p class="mt-1 text-sm text-gray-500">Add friends as expense sharing partners to track shared expenses together.</p>
              </div>

              <!-- Partners List -->
              <div v-else class="divide-y divide-gray-200">
                <div
                  v-for="partner in partners"
                  :key="partner._id"
                  class="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div class="flex items-center space-x-4">
                      <div class="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                        {{ partner.name.charAt(0).toUpperCase() }}
                      </div>
                      <div>
                        <h3 class="text-lg font-medium text-gray-900">{{ partner.name }}</h3>
                        <p class="text-sm text-gray-500">Partner since {{ formatDate(partner.partnerSince) }}</p>
                      </div>
                    </div>

                    <div class="flex items-center justify-between sm:justify-end gap-4">
                      <div class="text-right">
                        <p class="text-sm text-gray-600">Balance</p>
                        <p :class="['font-semibold', partner.balance >= 0 ? 'text-green-600' : 'text-red-600']">
                          {{ formatCurrency(partner.balance, authStore.user?.currency) }}
                        </p>
                      </div>
                      <div class="flex gap-2">
                        <button
                          @click="openPartnerDetails(partner)"
                          class="text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 rounded transition-colors"
                        >
                          View
                        </button>
                        <button
                          @click="removePartner(partner._id)"
                          class="text-sm bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1 rounded transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Add Friends Panel -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Add Friends</h2>
            </div>
            
            <div class="p-6">
              <!-- Search Results -->
              <div v-if="searchResults.length" class="space-y-3 mb-6">
                <h3 class="text-sm font-medium text-gray-700">Search Results</h3>
                <div class="max-h-64 overflow-y-auto space-y-2">
                  <div
                    v-for="user in searchResults"
                    :key="user._id"
                    class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div class="flex items-center space-x-3">
                      <UserAvatar :src="user.avatar" :name="user.name" size="w-8 h-8" className="bg-blue-100" />
                      <div>
                        <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                        <!-- Email hidden for privacy -->
                      </div>
                    </div>
                    <button
                      @click="addFriend(user)"
                      :disabled="addingFriend === user._id"
                      class="text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 rounded transition-colors disabled:opacity-50"
                    >
                      <span v-if="addingFriend === user._id">Adding...</span>
                      <span v-else>Add</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Instructions -->
              <div v-else class="text-center py-8">
                <svg class="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <p class="mt-2 text-sm text-gray-500">
                  Search for users by name or email to add them as friends
                </p>
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="mt-6 bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Total Friends</span>
                <span class="font-medium">{{ friends.length }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">You Owe</span>
                <span class="font-medium text-red-600">{{ formatCurrency(totalOwed, authStore.user?.currency) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Owed to You</span>
                <span class="font-medium text-green-600">{{ formatCurrency(totalOwedToYou, authStore.user?.currency) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Feature Coming Soon Modal -->
    <div v-if="showFeatureModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="showFeatureModal = false">
      <div class="bg-white rounded-lg p-6 max-w-md mx-4" @click.stop>
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Feature Coming Soon</h3>
          <p class="text-sm text-gray-500 mb-4">
            This feature will be implemented in a future update. Stay tuned for more exciting features!
          </p>
          <button
            @click="showFeatureModal = false"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/AuthStore';
import { usersAPI } from '@/services/api';
import UserAvatar from '@/components/UserAvatar.vue';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const error = ref(null);
const friends = ref([]);
const partners = ref([]);
const activeTab = ref('friends');
const searchQuery = ref('');
const searchResults = ref([]);
const addingFriend = ref(null);
const searchTimeout = ref(null);
const showFeatureModal = ref(false);

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
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const isPartner = (friendId) => {
  return partners.value.some(p => p._id === friendId);
};

const makePartner = async (friend) => {
  if (isPartner(friend._id)) {
    // Remove as partner
    removePartner(friend._id);
  } else {
    // Add as partner
    const newPartner = {
      ...friend,
      partnerSince: new Date().toISOString(),
      balance: 0
    };
    partners.value.push(newPartner);
    savePartners();
  }
};

const removePartner = (partnerId) => {
  if (!confirm('Remove this person as an expense partner?')) return;
  partners.value = partners.value.filter(p => p._id !== partnerId);
  savePartners();
};

const savePartners = () => {
  localStorage.setItem('expense_partners', JSON.stringify(partners.value));
  // Trigger event so other components can update
  window.dispatchEvent(new Event('partners:updated'));
};

const openPartnerDetails = (partner) => {
  console.log('View partner details:', partner);
  // Open a modal or navigate to partner details page
};

const totalOwed = computed(() => {
  return friends.value
    .filter(friend => (friend.totalBalance || 0) < 0)
    .reduce((sum, friend) => sum + Math.abs(friend.totalBalance || 0), 0);
});

const totalOwedToYou = computed(() => {
  return friends.value
    .filter(friend => (friend.totalBalance || 0) > 0)
    .reduce((sum, friend) => sum + (friend.totalBalance || 0), 0);
});

const fetchFriends = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await usersAPI.getFriends();
    if (response.success) {
      friends.value = response.data.friends;
    }
  } catch (err) {
    console.error('Failed to fetch friends:', err);
    error.value = err.message || 'Failed to load friends';
  } finally {
    loading.value = false;
  }
};

const searchUsers = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  searchTimeout.value = setTimeout(async () => {
    if (searchQuery.value.length < 2) {
      searchResults.value = [];
      return;
    }

    try {
      const response = await usersAPI.searchUsers(searchQuery.value);
      if (response.success) {
        const friendIds = friends.value.map(f => f._id);
        searchResults.value = response.data.users.filter(
          user => user._id !== authStore.user._id && !friendIds.includes(user._id)
        );
      }
    } catch (err) {
      console.error('Search failed:', err);
    }
  }, 300);
};

const addFriend = async (user) => {
  try {
    addingFriend.value = user._id;
    
    const response = await usersAPI.addFriend(user._id);
    if (response.success) {
      friends.value.push(response.data.friend);
      searchResults.value = searchResults.value.filter(u => u._id !== user._id);
      searchQuery.value = '';
      try { window.dispatchEvent(new Event('app:refresh')); } catch (e) { }
    }
  } catch (err) {
    console.error('Failed to add friend:', err);
    alert('Failed to add friend');
  } finally {
    addingFriend.value = null;
  }
};

const removeFriend = async (friendId) => {
  if (!confirm('Are you sure you want to remove this friend?')) return;

  try {
    await usersAPI.removeFriend(friendId);
    friends.value = friends.value.filter(f => f._id !== friendId);
  } catch (err) {
    console.error('Failed to remove friend:', err);
    alert('Failed to remove friend');
  }
};

const viewFriendExpenses = (friendId) => {
  showFeatureModal.value = true;
};

onMounted(() => {
  fetchFriends();
  // Load partners from localStorage or API
  const savedPartners = localStorage.getItem('expense_partners');
  if (savedPartners) {
    partners.value = JSON.parse(savedPartners);
  }
});
</script>
