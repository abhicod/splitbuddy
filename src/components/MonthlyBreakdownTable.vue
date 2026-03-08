<template>
  <div class="monthly-breakdown-table bg-white rounded-lg shadow overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="text-lg font-bold text-gray-900">Month-by-Month Breakdown</h2>
      <p class="text-sm text-gray-500 mt-1">Detailed view of income, expenses, and balance for each month</p>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Month</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Income</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Expenses</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Investment</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Net Balance</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr
            v-for="month in monthlyData"
            :key="month.month"
            class="hover:bg-gray-50 transition"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="font-medium text-gray-900">{{ getMonthName(month.month) }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
              <span class="text-green-600 font-semibold">{{ formatCurrency(month.income) }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
              <span class="text-red-600 font-semibold">{{ formatCurrency(month.expense) }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
              <span class="text-blue-600 font-semibold">{{ formatCurrency(month.investment) }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
              <span :class="[
                'font-bold',
                month.netBalance >= 0 ? 'text-emerald-600' : 'text-orange-600'
              ]">
                {{ formatCurrency(month.netBalance) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                month.netBalance > 0 ? 'bg-green-100 text-green-800' :
                month.netBalance < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
              ]">
                {{ month.netBalance > 0 ? 'Surplus' : month.netBalance < 0 ? 'Deficit' : 'Balanced' }}
              </span>
            </td>
          </tr>

          <!-- Total Row -->
          <tr class="bg-gray-50 font-bold border-t-2 border-gray-300">
            <td class="px-6 py-4 whitespace-nowrap text-gray-900">Total</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-green-600">{{ formatCurrency(yearlyTotals.totalIncome) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-red-600">{{ formatCurrency(yearlyTotals.totalExpense) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-blue-600">{{ formatCurrency(yearlyTotals.totalInvestment) }}</td>
            <td :class="[
              'px-6 py-4 whitespace-nowrap text-right',
              yearlyTotals.totalNetBalance >= 0 ? 'text-emerald-600' : 'text-orange-600'
            ]">
              {{ formatCurrency(yearlyTotals.totalNetBalance) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                yearlyTotals.totalNetBalance > 0 ? 'bg-green-100 text-green-800' :
                yearlyTotals.totalNetBalance < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
              ]">
                {{ yearlyTotals.totalNetBalance > 0 ? 'Surplus' : yearlyTotals.totalNetBalance < 0 ? 'Deficit' : 'Balanced' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useExpenseStore } from '@/store/ExpenseStore';
import { useAuthStore } from '@/store/AuthStore';

const expenseStore = useExpenseStore();
const authStore = useAuthStore();

const monthlyData = computed(() => expenseStore.yearlyReport?.monthlyData || []);
const yearlyTotals = computed(() => expenseStore.yearlyReport?.yearlyTotals || {
  totalIncome: 0,
  totalExpense: 0,
  totalInvestment: 0,
  totalNetBalance: 0
});

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: authStore.user?.currency || 'USD'
  }).format(amount || 0);
};

const getMonthName = (month) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1];
};
</script>

<style scoped>
.monthly-breakdown-table {
  background: white;
}

tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

table {
  border-collapse: collapse;
}
</style>
