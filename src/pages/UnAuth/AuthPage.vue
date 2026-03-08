<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
    <!-- Decorative floating background elements (visible from md and up) -->
    <div class="bg-decor pointer-events-none absolute inset-0 -z-10 lg:block hidden">
      <span class="decor-item decor-rupee">₹</span>
      <span class="decor-item decor-dollar">$</span>
      <span class="decor-item decor-percent">%</span>
      <span class="decor-item decor-text">expenses</span>
    </div>

    <div class="auth-card relative bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl w-full max-w-xl p-8 md:p-10 border border-white/40">
      
      <!-- Brand Header -->
      <div class="text-center mb-8">
        <div class="brand-icon mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl transform hover:rotate-6 transition-transform duration-300">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight">SplitBuddy</h1>
        <p class="text-gray-500 mt-2">{{ isLogin ? 'Sign in to your account' : 'Create your account' }}</p>
      </div>

      <!-- Auth Tabs -->
      <div class="flex p-1 bg-gray-100 rounded-xl mb-8">
        <button 
          @click="isLogin = true"
          :class="['flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200', isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
        >
          Login
        </button>
        <button 
          @click="isLogin = false"
          :class="['flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200', !isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
        >
          Sign Up
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-3">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        {{ error }}
      </div>

      <!-- Email/Password Form -->
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div v-if="!isLogin" class="space-y-1">
          <label class="text-sm font-medium text-gray-700 ml-1">Full Name</label>
          <input 
            v-model="form.name"
            type="text" 
            required
            placeholder="John Doe"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200"
          />
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700 ml-1">Email Address</label>
          <input 
            v-model="form.email"
            type="email" 
            required
            placeholder="name@company.com"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200"
          />
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700 ml-1">Password</label>
          <div class="relative">
            <input 
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="••••••••"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200"
            />
            <button 
              type="button" 
              @click="showPassword = !showPassword"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/></svg>
            </button>
          </div>
        </div>

        <button 
          type="submit"
          :disabled="loading"
          class="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
          <span v-else>{{ isLogin ? 'Sign In' : 'Create Account' }}</span>
        </button>
      </form>

      <!-- Divider -->
      <div class="relative my-8">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-100"></div>
        </div>
        <div class="relative flex justify-center text-xs text-gray-400 uppercase tracking-widest bg-white/0 px-4">
          <span class="bg-white px-2">Or continue with</span>
        </div>
      </div>

      <!-- Google Button -->
      <div class="flex justify-center">
        <div id="google-signin-button" class="w-full flex justify-center"></div>
      </div>

      <p class="mt-8 text-center text-xs text-gray-400">
        By signing in you agree to our 
        <router-link to="/terms" class="text-blue-500 hover:underline">Terms</router-link> and 
        <router-link to="/privacy" class="text-blue-500 hover:underline">Privacy Policy</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/AuthStore';
import { authAPI } from '@/services/api';

const router = useRouter();
const authStore = useAuthStore();

const isLogin = ref(true);
const loading = ref(false);
const error = ref('');
const showPassword = ref(false);

const form = reactive({
  name: '',
  email: '',
  password: ''
});

const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = '';

    const payload = isLogin.value 
      ? { email: form.email, password: form.password }
      : { name: form.name, email: form.email, password: form.password };

    const res = isLogin.value 
      ? await authStore.login(payload)
      : await authStore.register(payload);

    if (res.success) {
      router.push('/dashboard');
    } else {
      error.value = res.error || (isLogin.value ? 'Login failed' : 'Registration failed');
    }
  } catch (err) {
    console.error('Auth error:', err);
    error.value = 'An unexpected error occurred';
  } finally {
    loading.value = false;
  }
};

const handleGoogleCredential = async (response) => {
  try {
    loading.value = true;
    const idToken = response.credential;
    const res = await authAPI.googleSignIn(idToken);
    if (res.success) {
      authStore.setAuth(res.data.user, res.data.token);
      router.push('/dashboard');
    } else {
      error.value = res.message || 'Google sign-in failed';
    }
  } catch (err) {
    console.error('Google sign-in failed:', err);
    error.value = 'Google sign-in failed';
  } finally {
    loading.value = false;
  }
};

const loadGoogleScript = () => {
  return new Promise((resolve, reject) => {
    if (document.getElementById('google-identity')) return resolve();
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.id = 'google-identity';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity script'));
    document.head.appendChild(script);
  });
};

onMounted(async () => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard');
    return;
  }

  try {
    await loadGoogleScript();
    if (window.google) {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (clientId) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredential
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          { theme: 'outline', size: 'large', width: '320px', shape: 'pill' }
        );
      }
    }
  } catch (err) {
    console.warn('Google identity not available:', err);
  }
});
</script>

<style scoped>
/* Decorative background elements */
.bg-decor { position: absolute; inset: 0; overflow: hidden; }
.decor-item { position: absolute; font-weight: 800; opacity: 0.16; transform: translate3d(0,0,0); animation: float 7s ease-in-out infinite; user-select: none; will-change: transform; }
.decor-rupee { left: 6%; top: 6%; font-size: 6rem; color: rgba(16,185,129,0.14); animation-duration: 8s; }
.decor-dollar { right: 8%; top: 18%; font-size: 5rem; color: rgba(99,102,241,0.14); animation-duration: 6s; animation-delay: 1.2s; }
.decor-percent { left: 18%; bottom: 12%; font-size: 4.5rem; color: rgba(236,72,153,0.12); animation-duration: 9s; animation-delay: 2.6s; }
.decor-text { right: 6%; bottom: 8%; font-size: 3rem; color: rgba(59,130,246,0.10); text-transform: lowercase; letter-spacing: 2px; animation-duration: 7s; animation-delay: 0.6s; }

@keyframes float {
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(2deg); }
  100% { transform: translateY(0) rotate(0deg); }
}
</style>
yle>