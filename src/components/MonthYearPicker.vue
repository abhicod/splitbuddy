<template>
  <div class="month-year-picker flex items-center justify-between gap-4">
    <!-- Mobile: Only show left/right buttons -->
    <div class="flex sm:hidden w-full justify-between">
      <button
        @click="previousMonth"
        class="prev-month-btn px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
        :disabled="isFirstMonth"
      >
        <svg class="w-5 h-5" fill="black" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <button
        @click="nextMonth"
        class="next-month-btn px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
        :disabled="isLastMonth"
      >
        <svg class="w-5 h-5" fill="black" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    </div>

    <!-- Desktop: Show full controls -->
    <div class="hidden sm:flex items-center justify-between gap-4 w-full">
      <button
        @click="previousMonth"
        class="prev-month-btn px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
        :disabled="isFirstMonth"
      >
        <svg class="w-5 h-5" fill="black" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>

      <div class="date-display flex items-center gap-4">
        <div class="month-selector flex items-center gap-2">
          <select
            v-model.number="selectedMonth"
            @change="updateMonth"
            class="month-select px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
          >
            <option v-for="(month, index) in monthNames" :key="index" :value="index + 1">
              {{ month }}
            </option>
          </select>
        </div>
        <div class="year-selector flex items-center gap-2">
          <select
            v-model.number="selectedYear"
            @change="updateYear"
            class="year-select px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
          >
            <option v-for="year in availableYears" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
        <button
          @click="goToToday"
          class="today-btn px-3 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition text-sm font-medium"
        >
          Today
        </button>
      </div>

      <button
        @click="nextMonth"
        class="next-month-btn px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
        :disabled="isLastMonth"
      >
        <svg class="w-5 h-5" fill="black" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useExpenseStore } from "@/store/ExpenseStore";

const expenseStore = useExpenseStore();

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const selectedMonth = ref(expenseStore.currentMonth);
const selectedYear = ref(expenseStore.currentYear);

const today = new Date();
const currentMonth = today.getMonth() + 1;
const currentYear = today.getFullYear();

const isFirstMonth = computed(() => {
  return selectedYear.value === 2020 && selectedMonth.value === 1;
});

const isLastMonth = computed(() => {
  return (
    selectedYear.value === currentYear && selectedMonth.value === currentMonth
  );
});

const availableYears = computed(() => {
  const years = [];
  for (let year = 2020; year <= currentYear; year++) {
    years.push(year);
  }
  return years;
});

watch(
  () => expenseStore.currentMonth,
  (newMonth) => {
    selectedMonth.value = newMonth;
  }
);

watch(
  () => expenseStore.currentYear,
  (newYear) => {
    selectedYear.value = newYear;
  }
);

const updateMonth = () => {
  expenseStore.setMonthYear(selectedMonth.value, selectedYear.value);
};

const updateYear = () => {
  expenseStore.setMonthYear(selectedMonth.value, selectedYear.value);
};

const previousMonth = () => {
  expenseStore.previousMonth();
};

const nextMonth = () => {
  expenseStore.nextMonth();
};

const goToToday = () => {
  expenseStore.setMonthYear(currentMonth, currentYear);
};
</script>

<style scoped>
.month-year-picker {
  background: white;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(229, 231, 235);
}

.prev-month-btn:disabled,
.next-month-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.month-select,
.year-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  padding-right: 1.5rem;
}
</style>
