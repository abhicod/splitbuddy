import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { analyticsAPI } from '../services/api.js';

export const useExpenseStore = defineStore('expense', () => {
  const currentMonth = ref(new Date().getMonth() + 1);
  const currentYear = ref(new Date().getFullYear());

  const monthlySummary = ref(null);
  const monthlyAnalytics = ref(null);
  const yearlyReport = ref(null);
  const insights = ref(null);
  const userExpenses = ref([]);

  const loading = ref(false);
  const error = ref(null);

  // Computed properties for current month/year display
  const monthName = computed(() => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return months[currentMonth.value - 1];
  });

  const displayDate = computed(() => {
    return `${monthName.value} ${currentYear.value}`;
  });

  // Fetch monthly summary
  const fetchMonthlySummary = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await analyticsAPI.getMonthlySummary(currentMonth.value, currentYear.value);
      if (response.success) {
        monthlySummary.value = response.data;
      }
    } catch (err) {
      error.value = err.message || 'Failed to fetch monthly summary';
      console.error('Error fetching monthly summary:', err);
    } finally {
      loading.value = false;
    }
  };

  // Fetch monthly analytics
  const fetchMonthlyAnalytics = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await analyticsAPI.getMonthlyAnalytics(currentMonth.value, currentYear.value);
      if (response.success) {
        monthlyAnalytics.value = response.data;
      }
    } catch (err) {
      error.value = err.message || 'Failed to fetch monthly analytics';
      console.error('Error fetching monthly analytics:', err);
    } finally {
      loading.value = false;
    }
  };

  // Fetch yearly report
  const fetchYearlyReport = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await analyticsAPI.getYearlyReport(currentYear.value);
      if (response.success) {
        yearlyReport.value = response.data;
      }
    } catch (err) {
      error.value = err.message || 'Failed to fetch yearly report';
      console.error('Error fetching yearly report:', err);
    } finally {
      loading.value = false;
    }
  };

  // Fetch insights
  const fetchInsights = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await analyticsAPI.getInsights(currentMonth.value, currentYear.value);
      if (response.success) {
        insights.value = response.data;
      }
    } catch (err) {
      error.value = err.message || 'Failed to fetch insights';
      console.error('Error fetching insights:', err);
    } finally {
      loading.value = false;
    }
  };

  // Fetch user expenses
  const fetchUserExpenses = async (category = null, paymentMethod = null) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await analyticsAPI.getUserExpenses(
        currentMonth.value,
        currentYear.value,
        category,
        paymentMethod
      );
      if (response.success) {
        userExpenses.value = response.data.expenses;
      }
    } catch (err) {
      error.value = err.message || 'Failed to fetch user expenses';
      console.error('Error fetching user expenses:', err);
    } finally {
      loading.value = false;
    }
  };

  // Fetch all monthly data
  const fetchAllMonthlyData = async () => {
    try {
      await Promise.all([
        fetchMonthlySummary(),
        fetchMonthlyAnalytics(),
        fetchInsights(),
        fetchUserExpenses()
      ]);
    } catch (err) {
      error.value = 'Failed to fetch all data';
      console.error('Error fetching all data:', err);
    }
  };

  // Navigate to previous month
  const previousMonth = () => {
    if (currentMonth.value === 1) {
      currentMonth.value = 12;
      currentYear.value--;
    } else {
      currentMonth.value--;
    }
    fetchAllMonthlyData();
  };

  // Navigate to next month
  const nextMonth = () => {
    const today = new Date();
    if (currentYear.value === today.getFullYear() && currentMonth.value === today.getMonth() + 1) {
      return; // Don't allow going to future months
    }
    if (currentMonth.value === 12) {
      currentMonth.value = 1;
      currentYear.value++;
    } else {
      currentMonth.value++;
    }
    fetchAllMonthlyData();
  };

  // Set specific month/year
  const setMonthYear = (month, year) => {
    currentMonth.value = month;
    currentYear.value = year;
    fetchAllMonthlyData();
  };

  // Clear all data
  const clearData = () => {
    monthlySummary.value = null;
    monthlyAnalytics.value = null;
    yearlyReport.value = null;
    insights.value = null;
    userExpenses.value = [];
    error.value = null;
  };

  return {
    currentMonth,
    currentYear,
    monthlySummary,
    monthlyAnalytics,
    yearlyReport,
    insights,
    userExpenses,
    loading,
    error,
    monthName,
    displayDate,
    fetchMonthlySummary,
    fetchMonthlyAnalytics,
    fetchYearlyReport,
    fetchInsights,
    fetchUserExpenses,
    fetchAllMonthlyData,
    previousMonth,
    nextMonth,
    setMonthYear,
    clearData
  };
}, { persist: true });
