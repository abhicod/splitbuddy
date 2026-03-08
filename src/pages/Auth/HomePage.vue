<template>
  <div class="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl w-full space-y-8">
      <h1 class="text-4xl font-extrabold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent text-center">
        Welcome to SplitBuddy
      </h1>
      <p class="text-red-300 text-center text-lg">
        Manage your expenses effortlessly with friends and family. Track, split, and settle expenses with ease.
      </p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <div class="bg-red-900/20 rounded-2xl p-6 shadow-lg border border-red-800/50 hover:bg-red-900/30 transition-colors">
          <h2 class="text-xl font-semibold mb-2">Create Groups</h2>
          <p class="text-red-300 text-sm">
            Organize your friends and family into groups for easy expense sharing.
          </p>
        </div>
        <div class="bg-red-900/20 rounded-2xl p-6 shadow-lg border border-red-800/50 hover:bg-red-900/30 transition-colors">
          <h2 class="text-xl font-semibold mb-2">Add Expenses</h2>
          <p class="text-red-300 text-sm">
            Quickly add expenses and split them fairly among group members.
          </p>
        </div>
        <div class="bg-red-900/20 rounded-2xl p-6 shadow-lg border border-red-800/50 hover:bg-red-900/30 transition-colors">
          <h2 class="text-xl font-semibold mb-2">Settle Balances</h2>
          <p class="text-red-300 text-sm">
            Keep track of who owes whom and settle balances easily.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/store/AuthStore';

const authStore = useAuthStore();
</script>
