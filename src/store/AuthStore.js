import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authAPI } from "../services/api.js";

export const useAuthStore = defineStore(
  "auth",
  () => {
    const user = ref(null);
    const token = ref(null);
    const loading = ref(false);
    const error = ref(null);

    const isAuthenticated = computed(() => !!token.value && !!user.value);

    const setAuth = (userData, authToken) => {
      user.value = userData;
      token.value = authToken;
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      error.value = null;
    };

    const clearAuth = () => {
      user.value = null;
      token.value = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      error.value = null;
    };

    const login = async (credentials) => {
      try {
        loading.value = true;
        error.value = null;

        const response = await authAPI.login(credentials);

        if (response.success) {
          setAuth(response.data.user, response.data.token);
          return { success: true };
        } else {
          throw new Error(response.message || 'Login failed');
        }
      } catch (err) {
        error.value = err.message || 'An error occurred during login';
        return { success: false, error: error.value };
      } finally {
        loading.value = false;
      }
    };

    const register = async (userData) => {
      try {
        loading.value = true;
        error.value = null;

        const response = await authAPI.register(userData);

        if (response.success) {
          setAuth(response.data.user, response.data.token);
          return { success: true };
        } else {
          throw new Error(response.message || 'Registration failed');
        }
      } catch (err) {
        error.value = err.message || 'An error occurred during registration';
        return { success: false, error: error.value };
      } finally {
        loading.value = false;
      }
    };

    const logout = () => {
      clearAuth();
    };

    const fetchProfile = async () => {
      try {
        if (!token.value) return;

        const response = await authAPI.getProfile();
        if (response.success) {
          user.value = response.data.user;
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        clearAuth();
      }
    };

    const updateProfile = async (userData) => {
      try {
        loading.value = true;
        error.value = null;

        const response = await authAPI.updateProfile(userData);

        if (response.success) {
          user.value = response.data.user;
          localStorage.setItem('user', JSON.stringify(response.data.user));
          return { success: true };
        }
      } catch (err) {
        error.value = err.message || 'Failed to update profile';
        return { success: false, error: error.value };
      } finally {
        loading.value = false;
      }
    };

    // Initialize auth state from localStorage
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          token.value = storedToken;
          user.value = JSON.parse(storedUser);
          // Optionally validate token by fetching profile
          fetchProfile();
        } catch (err) {
          console.error('Failed to initialize auth:', err);
          clearAuth();
        }
      }
    };

    return {
      user,
      token,
      loading,
      error,
      isAuthenticated,
      login,
      register,
      logout,
      updateProfile,
      fetchProfile,
      initializeAuth,
      setAuth,
      clearAuth
    };
  },
  { persist: true }
);

// // this is how we use in options api
// export const useAuthStore = defineStore("auth", {
//   state: () => ({
//     user: null,
//     token: "null",
//   }),
//   getters: {
//     getUser() {
//       return this.user;
//     },
//     getToken() {
//       return this.token;
//     },
//   },
//   actions: {
//     setUser(user) {
//       this.user = user;
//     },
//     setToken(token) {
//       this.token = token;
//     },
//   },
//   persist: true,
// });
