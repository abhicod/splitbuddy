<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Create New Group</h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <!-- Error Display -->
        <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {{ error }}
        </div>

        <!-- Group Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
          <input
            v-model="form.name"
            type="text"
            required
            maxlength="100"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-black"
            placeholder="e.g., Weekend Trip, Roommates, etc."
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            v-model="form.description"
            rows="3"
            maxlength="500"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none text-black"
            placeholder="Optional description for your group..."
          />
          <p class="text-xs text-gray-500 mt-1">{{ form.description.length }}/500 characters</p>
        </div>

        <!-- Category -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            v-model="form.category"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-black"
          >
            <option value="trip">🏖️ Trip</option>
            <option value="home">🏠 Home</option>
            <option value="couple">💑 Couple</option>
            <option value="other">📂 Other</option>
          </select>
        </div>

        <!-- Currency -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <select
            v-model="form.currency"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-black"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="INR">INR - Indian Rupee</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="AUD">AUD - Australian Dollar</option>
          </select>
        </div>

        <!-- Members Section -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2 ">Add Members</label>
          
          <!-- Search Input -->
          <div class="relative mb-3">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search users by name or email..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors pr-10 text-black"
              @input="searchUsers"
            />
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>

          <!-- Search Results -->
          <div v-if="searchResults.length" class="mb-3 max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
            <div
              v-for="user in searchResults"
              :key="user._id"
              class="p-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
              @click="addMember(user)"
            >
              <div class="flex items-center space-x-2">
                <UserAvatar :src="user.avatar" :name="user.name" size="w-6 h-6" />
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                </div>
              </div>
              <button
                type="button"
                class="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Add
              </button>
            </div>
          </div>

          <!-- Selected Members -->
          <div v-if="selectedMembers.length" class="space-y-2">
            <p class="text-sm text-gray-600">Selected members:</p>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="member in selectedMembers"
                :key="member._id"
                class="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
              >
                <UserAvatar :src="member.avatar" :name="member.name" size="w-6 h-6" className="rounded-full" />
                <span>{{ member.name }}</span>
                <button
                  type="button"
                  @click="removeMember(member._id)"
                  class="text-blue-500 hover:text-blue-700"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
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
            :disabled="loading || !form.name.trim()"
            class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="loading">Creating...</span>
            <span v-else>Create Group</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/store/AuthStore';
import { groupsAPI, usersAPI } from '@/services/api';
import UserAvatar from '@/components/UserAvatar.vue';

const emit = defineEmits(['close', 'created']);
const authStore = useAuthStore();

const loading = ref(false);
const error = ref(null);
const searchQuery = ref('');
const searchResults = ref([]);
const selectedMembers = ref([]);
const searchTimeout = ref(null);

const form = reactive({
  name: '',
  description: '',
  category: 'other',
  currency: authStore.user?.currency || 'INR'
});

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
        const selectedIds = selectedMembers.value.map(m => m._id);
        searchResults.value = response.data.users.filter(
          user => !selectedIds.includes(user._id)
        );
      }
    } catch (err) {
      console.error('Search failed:', err);
    }
  }, 300);
};

const addMember = (user) => {
  if (!selectedMembers.value.find(m => m._id === user._id)) {
    selectedMembers.value.push(user);
    searchResults.value = searchResults.value.filter(u => u._id !== user._id);
    searchQuery.value = '';
  }
};

const removeMember = (userId) => {
  selectedMembers.value = selectedMembers.value.filter(m => m._id !== userId);
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = null;

    const groupData = {
      ...form,
      members: selectedMembers.value.map(m => m._id)
    };

    const response = await groupsAPI.createGroup(groupData);
    
    if (response.success) {
      emit('created', response.data.group);
      try { window.dispatchEvent(new Event('app:refresh')); } catch (e) { }
    } else {
      throw new Error(response.message || 'Failed to create group');
    }
  } catch (err) {
    console.error('Create group failed:', err);
    error.value = err.message || 'Failed to create group';
  } finally {
    loading.value = false;
  }
};
</script>
