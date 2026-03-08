<template>
  <div
    v-if="isOpen"
    class="add-transaction-modal fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
  >
    <div
      class="modal-content bg-white rounded-lg shadow-xl max-w-md w-full max-h-130 overflow-y-auto"
    >
      <!-- Header -->
      <div
        class="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between"
      >
        <h2 class="text-lg font-bold text-gray-900">Add Transaction</h2>
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 transition"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="submitForm" class="p-6 space-y-4">
        <!-- Title -->
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Title</label
          >
          <input
            v-model="formData.title"
            type="text"
            class="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Grocery Shopping"
            required
          />
        </div>

        <!-- Amount -->
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Amount</label
          >
          <input
            v-model.number="formData.amount"
            type="number"
            step="0.01"
            class="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
            required
            min="0.01"
          />
        </div>

        <!-- Transaction Type -->
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Type</label
          >
          <select
            v-model="formData.transactionType"
            class="form-select w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="investment">Investment</option>
          </select>
        </div>

        <!-- Category -->
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Category</label
          >
          <select
            v-model="formData.category"
            class="form-select w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          >
            <option value="food">🍽️ Food & Dining</option>
            <option value="transport">🚗 Transportation</option>
            <option value="accommodation">🏨 Accommodation</option>
            <option value="entertainment">🎬 Entertainment</option>
            <option value="shopping">🛍️ Shopping</option>
            <option value="utilities">⚡ Utilities</option>
            <option value="salary">💼 Salary</option>
            <option value="investment">📈 Investment</option>
            <option value="other">📂 Other</option>
          </select>
        </div>

        <!-- Payment Method -->
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Payment Method</label
          >
          <select
            v-model="formData.paymentMethod"
            class="form-select w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          >
            <option value="cash">💵 Cash</option>
            <option value="credit_card">💳 Credit Card</option>
            <option value="debit_card">🏧 Debit Card</option>
            <option value="bank_transfer">🏦 Bank Transfer</option>
            <option value="upi">📱 UPI</option>
            <option value="wallet">👝 Wallet</option>
            <option value="other">💸 Other</option>
          </select>
        </div>

        <!-- Date -->
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Date</label
          >
          <input
            v-model="formData.date"
            type="date"
            class="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <!-- Description (Optional) -->
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Description (Optional)</label
          >
          <textarea
            v-model="formData.description"
            class="form-textarea w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add any notes..."
            rows="2"
          ></textarea>
        </div>

        <!-- Error Message -->
        <div
          v-if="error"
          class="error-message bg-red-50 border border-red-200 rounded-lg p-3"
        >
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>

        <!-- Submit Button -->
        <div class="modal-actions flex gap-3 pt-4">
          <button
            type="button"
            @click="closeModal"
            class="cancel-btn flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="submit-btn flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span
              v-if="isSubmitting"
              class="flex items-center gap-2 justify-center"
            >
              <svg
                class="w-4 h-4 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Adding...
            </span>
            <span v-else>Add Transaction</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useAuthStore } from "@/store/AuthStore";
import { expensesAPI } from "@/services/api";

const authStore = useAuthStore();

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  preselectedDate: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["close", "success"]);

const isSubmitting = ref(false);
const error = ref(null);

const formData = ref({
  title: "",
  amount: null,
  description: "",
  transactionType: "expense",
  category: "other",
  paymentMethod: "cash",
  date: new Date().toISOString().split("T")[0],
});

// Watch for preselected date
watch(
  () => props.preselectedDate,
  (newDate) => {
    if (newDate) {
      formData.value.date = newDate;
    }
  }
);

const closeModal = () => {
  resetForm();
  emit("close");
};

const resetForm = () => {
  formData.value = {
    title: "",
    amount: null,
    description: "",
    transactionType: "expense",
    category: "other",
    paymentMethod: "cash",
    date: new Date().toISOString().split("T")[0],
  };
  error.value = null;
};

const submitForm = async () => {
  error.value = null;

  // Validation
  if (!formData.value.title.trim()) {
    error.value = "Title is required";
    return;
  }

  if (!formData.value.amount || formData.value.amount <= 0) {
    error.value = "Amount must be greater than 0";
    return;
  }

  if (!formData.value.date) {
    error.value = "Date is required";
    return;
  }

  try {
    isSubmitting.value = true;

    // Create personal expense (not in a group)
    const expenseData = {
      title: formData.value.title,
      description: formData.value.description,
      amount: formData.value.amount,
      category: formData.value.category,
      transactionType: formData.value.transactionType,
      paymentMethod: formData.value.paymentMethod,
      date: new Date(formData.value.date),
      paidBy: authStore.user._id,
      currency: authStore.user?.currency || "USD",
      splitType: "equal",
      members: [authStore.user._id],
      splits: [
        {
          user: authStore.user._id,
          amount: formData.value.amount,
        },
      ],
    };

    const response = await expensesAPI.createExpense(expenseData);

    if (response.success) {
      emit("success");
      closeModal();
    } else {
      error.value = response.message || "Failed to add transaction";
    }
  } catch (err) {
    error.value = err.message || "An error occurred while adding transaction";
    console.error("Error adding transaction:", err);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.add-transaction-modal {
  animation: fadeIn 0.2s ease-in;
  background: #0000008c;
}

.modal-content {
  animation: slideUp 0.3s ease-out;
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

.form-input,
.form-select,
.form-textarea {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  color: black;
}

.form-select {
  padding-right: 1.5rem;
}
</style>
