<template>
  <header v-if="authStore.isAuthenticated" class="bg-black/90 backdrop-blur-lg shadow-lg border-b border-red-900/50 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <!-- Logo -->
        <router-link to="/dashboard" class="flex items-center space-x-3 group"  :class="{ 'text-red-300 bg-red-900/30 border-red-700/50 shadow-sm': $route.path === '/dashboard' }">
          <div class="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
          <h1 class="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">SplitBuddy</h1>
        </router-link>

        <!-- Navigation -->
        <nav class="hidden lg:flex items-center space-x-2">
          <router-link
            to="/dashboard"
            class="flex items-center space-x-2 px-4 py-2.5 text-red-400 hover:text-white hover:bg-red-900/20 rounded-xl transition-all duration-200 font-medium text-sm border border-transparent hover:border-red-800/50"
            :class="[ $route.path === '/dashboard' ? 'text-red-300 bg-red-900/30 border-red-700/50 shadow-sm' : '' ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
            </svg>
            Dashboard
          </router-link>
          <router-link
            to="/groups"
            class="flex items-center space-x-2 px-4 py-2.5 text-red-400 hover:text-white hover:bg-red-900/20 rounded-xl transition-all duration-200 font-medium text-sm border border-transparent hover:border-red-800/50"
            :class="[ $route.path.startsWith('/groups') ? 'text-red-300 bg-red-900/30 border-red-700/50 shadow-sm' : '' ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            Groups
          </router-link>
          <router-link
            to="/friends"
            class="flex items-center space-x-2 px-4 py-2.5 text-red-400 hover:text-white hover:bg-red-900/20 rounded-xl transition-all duration-200 font-medium text-sm border border-transparent hover:border-red-800/50"
            :class="[ $route.path === '/friends' ? 'text-red-300 bg-red-900/30 border-red-700/50 shadow-sm' : '' ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Friends
          </router-link>
          <router-link
            to="/expenses"
            class="flex items-center space-x-2 px-4 py-2.5 text-red-400 hover:text-white hover:bg-red-900/20 rounded-xl transition-all duration-200 font-medium text-sm border border-transparent hover:border-red-800/50"
            :class="[ $route.path === '/expenses' ? 'text-red-300 bg-red-900/30 border-red-700/50 shadow-sm' : '' ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"></path>
            </svg>
            Expenses
          </router-link>
          <router-link
            to="/expenses/monthly"
            class="flex items-center space-x-2 px-4 py-2.5 text-red-400 hover:text-white hover:bg-red-900/20 rounded-xl transition-all duration-200 font-medium text-sm border border-transparent hover:border-red-800/50"
            :class="[ $route.path.startsWith('/expenses/monthly') ? 'text-red-300 bg-red-900/30 border-red-700/50 shadow-sm' : '' ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            Monthly
          </router-link>
        </nav>

        <!-- Mobile Menu Button -->
        <div class="lg:hidden">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-200"
          >
            <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- User Menu -->
        <div class="hidden lg:flex items-center space-x-4">
          <router-link to="/profile/edit" class="flex items-center space-x-3 px-4 py-2 bg-red-900/20 backdrop-blur-sm rounded-xl border border-red-800/50 hover:bg-red-900/30 transition-all">
            <div class="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center ring-2 ring-red-500 shadow-sm">
              <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" alt="avatar" class="w-full h-full object-cover rounded-full" />
              <span v-else class="text-sm font-semibold text-white">{{ (authStore.user?.name || 'U').charAt(0).toUpperCase() }}</span>
            </div>
            <div class="hidden sm:block text-left">
              <p class="text-sm font-semibold text-white">{{ authStore.user?.name }}</p>
              <p class="text-xs text-red-300">{{ authStore.user?.email }}</p>
            </div>
          </router-link>

          <button
            @click="logout"
            class="px-4 py-2 text-sm font-medium text-red-400 hover:text-white hover:bg-red-600 rounded-xl transition-all duration-200 border border-red-800 hover:border-red-600"
          >
            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="mobileMenuOpen" class="lg:hidden border-t border-red-900/50 bg-black/95 backdrop-blur-lg">
      <div class="px-4 py-4 space-y-3">
        <!-- Mobile Navigation -->
        <router-link
          v-for="item in navigationItems"
          :key="item.path"
          :to="item.path"
          @click="mobileMenuOpen = false"
          class="flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-white hover:bg-red-900/20 rounded-xl transition-all duration-200 font-medium"
          :class="[ isActiveRoute(item.path) ? 'text-red-300 bg-red-900/30 shadow-sm' : '' ]"
        >
          <component :is="item.icon" class="w-5 h-5" />
          {{ item.name }}
        </router-link>

        <!-- Mobile User Info -->
        <div class="pt-4 mt-4 border-t border-red-800/50">
          <div class="flex items-center space-x-3 px-4 py-3 bg-red-900/20 rounded-xl">
            <div class="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center">
              <span class="font-semibold text-white">
                {{ (authStore.user?.name || 'U').charAt(0).toUpperCase() }}
              </span>
            </div>
            <div>
              <p class="font-semibold text-white">{{ authStore.user?.name }}</p>
              <p class="text-sm text-red-300">{{ authStore.user?.email }}</p>
            </div>
          </div>
          <button
            @click="logout"
            class="w-full mt-3 px-4 py-3 text-red-400 hover:text-white hover:bg-red-600 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            <span class="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/store/AuthStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const mobileMenuOpen = ref(false);

// Navigation items for mobile menu
const navigationItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: 'IconDashboard'
  },
  {
    name: 'Groups',
    path: '/groups',
    icon: 'IconGroups'
  },
  {
    name: 'Friends',
    path: '/friends',
    icon: 'IconFriends'
  },
  {
    name: 'Expenses',
    path: '/expenses',
    icon: 'IconExpenses'
  },
  {
    name: 'Monthly Tracker',
    path: '/expenses/monthly',
    icon: 'IconMonthly'
  },
  {
    name: 'Profile',
    path: '/profile/edit',
    icon: 'IconProfile'
  }
];

const isActiveRoute = (path) => {
  if (path === '/dashboard') return route.path === '/dashboard';
  if (path === '/groups') return route.path.startsWith('/groups');
  if (path === '/expenses/monthly') return route.path.startsWith('/expenses/monthly') || route.path.startsWith('/expenses/analytics');
  return route.path === path;
};

const logout = () => {
  authStore.logout();
  router.push('/auth');
  mobileMenuOpen.value = false;
};
</script>

<style scoped>

/* Smooth backdrop blur */
@supports (backdrop-filter: blur(16px)) {
  .backdrop-blur-lg {
    backdrop-filter: blur(16px);
  }
}

/* Mobile menu animation */
@media (max-width: 1024px) {
  .lg\:hidden {
    animation: slideDown 0.3s ease-out;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom scrollbar for mobile menu */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 2px;
}
</style>

<!-- Icon Components -->
<script>
const IconDashboard = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path></svg>`
};

const IconGroups = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>`
};

const IconFriends = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
};

const IconExpenses = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"></path></svg>`
};

const IconMonthly = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>`
};

const IconProfile = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-4.418 0-8 1.79-8 4v1h16v-1c0-2.21-3.582-4-8-4z"></path></svg>`
};

export default {
  components: {
    IconDashboard,
    IconGroups,
    IconFriends,
    IconExpenses,
    IconMonthly,
    IconProfile
  }
};
</script>
