<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 class="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Groups</h1>
          <p class="text-gray-600 mt-2 text-base sm:text-lg">Manage your expense groups and collaborations</p>
        </div>
        <button
          @click="showCreateGroup = true"
          class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Create Group
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-700">{{ error }}</p>
        <button @click="fetchGroups" class="mt-2 text-red-600 hover:text-red-800 underline">
          Try Again
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="!groups?.length" class="flex justify-center">
        <div class="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center my-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          <h3 class="mt-4 text-lg font-semibold text-gray-900">No groups yet</h3>
          <p class="mt-2 text-sm text-gray-600">Create a group to add members, log expenses, select who participated, and keep a clear settlement history.</p>
          <button
            @click="showCreateGroup = true"
            class="mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-lg"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Create Your First Group
          </button>
        </div>
      </div>

      <!-- Groups Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="group in groups"
          :key="group._id"
          class="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-200/50 hover:border-blue-300/50 transform hover:scale-[1.02] hover:-translate-y-1"
          @click="goToGroup(group._id)"
        >
          <!-- Group Header -->
          <div class="p-6 pb-4">
            <div class="flex items-center justify-between mb-4">
              <div class="relative">
                <div class="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <div class="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <span class="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full capitalize border border-gray-300/50">
                {{ getCategoryEmoji(group.category) }} {{ group.category }}
              </span>
            </div>

            <!-- Group Info -->
            <h3 class="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors">{{ group.name }}</h3>
            <p v-if="group.description" class="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{{ group.description }}</p>

            <!-- Stats -->
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-1 text-gray-500">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-sm font-medium">{{ group.members?.length || 0 }} members</span>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-gray-900">
                  {{ formatCurrency(group.totalExpenses || 0, group.currency) }}
                </p>
                <p class="text-xs text-gray-500 font-medium">total spent</p>
              </div>
            </div>
          </div>

          <!-- Members Preview -->
          <div class="px-6 pb-6">
            <div class="flex items-center justify-between">
              <div class="flex -space-x-3">
                <UserAvatar
                  v-for="(member, index) in group.members?.slice(0, 4)"
                  :key="member.user?._id || index"
                  :src="member.user?.avatar"
                  :name="member.user?.name"
                  size="w-8 h-8"
                  className="border-3 border-white shadow-sm hover:z-10 hover:scale-110 transition-all duration-200"
                />
                <div
                  v-if="(group.members?.length || 0) > 4"
                  class="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border-3 border-white shadow-sm"
                >
                  <span class="text-xs font-bold text-gray-600">
                    +{{ (group.members?.length || 0) - 4 }}
                  </span>
                </div>
              </div>
              <div class="flex items-center space-x-1 text-gray-400">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-xs font-medium">{{ formatDate(group.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Group Modal -->
    <CreateGroupModal
      v-if="showCreateGroup"
      @close="showCreateGroup = false"
      @created="handleGroupCreated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { groupsAPI } from '@/services/api';
import CreateGroupModal from '@/components/CreateGroupModal.vue';
import UserAvatar from '@/components/UserAvatar.vue';

const router = useRouter();

const loading = ref(false);
const error = ref(null);
const groups = ref([]);
const showCreateGroup = ref(false);

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
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
};

const getCategoryEmoji = (category) => {
  const emojis = {
    trip: '🏖️',
    home: '🏠',
    couple: '💑',
    other: '📂'
  };
  return emojis[category] || '📂';
};

const goToGroup = (groupId) => {
  router.push(`/groups/${groupId}`);
};

const fetchGroups = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await groupsAPI.getGroups();
    if (response.success) {
      groups.value = response.data.groups;
    }
  } catch (err) {
    console.error('Failed to fetch groups:', err);
    error.value = err.message || 'Failed to load groups';
  } finally {
    loading.value = false;
  }
};

const handleGroupCreated = (newGroup) => {
  groups.value.unshift(newGroup);
  showCreateGroup.value = false;
};

onMounted(() => {
  fetchGroups();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Card animations */
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

.grid > div {
  animation: slideUp 0.6s ease-out;
}

.grid > div:nth-child(1) { animation-delay: 0s; }
.grid > div:nth-child(2) { animation-delay: 0.1s; }
.grid > div:nth-child(3) { animation-delay: 0.2s; }
.grid > div:nth-child(4) { animation-delay: 0.3s; }
.grid > div:nth-child(5) { animation-delay: 0.4s; }
.grid > div:nth-child(6) { animation-delay: 0.5s; }

/* Enhanced hover effects */
.group:hover .w-14 {
  transform: rotate(5deg) scale(1.1);
}

.group:hover .absolute {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* Border animations */
.border-3 {
  border-width: 3px;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .backdrop-blur-sm {
    backdrop-filter: blur(4px);
  }

  .grid {
    gap: 1rem;
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
</style>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
