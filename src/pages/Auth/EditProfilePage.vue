<template>
  <div class="max-w-3xl mx-auto p-6">
    <div class="profile-card bg-black/70 border border-red-900/20 rounded-lg shadow-lg p-6">
      <h2 class="text-2xl font-semibold mb-4 text-white">Edit Profile</h2>

      <div v-if="error" class="p-3 bg-red-900/30 border border-red-700 text-red-100 rounded mb-4">{{ error }}</div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-200 mb-1">Name</label>
          <input v-model="form.name" type="text" required class="w-full px-3 py-2 border rounded bg-white/5 border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-200 mb-1">Email</label>
          <input v-model="form.email" type="email" disabled class="w-full px-3 py-2 border rounded bg-white/5 text-gray-300 border-gray-700 cursor-not-allowed" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-200 mb-1">Profile Picture</label>
          <div class="profile-picture-row flex items-center gap-6">
            <div class="avatar-preview w-24 h-24 bg-white/5 rounded overflow-hidden flex items-center justify-center border border-gray-700">
              <img v-if="preview" :src="preview" alt="Profile preview" class="w-full h-full object-cover" />
              <div v-else class="text-gray-400">No Image</div>
            </div>

            <div class="avatar-actions flex-1 flex flex-col items-start gap-3">
              <input ref="fileInput" type="file" @change="onFileChange" accept="image/*" class="hidden" />

              <div class="action-buttons flex items-center gap-3">
                <button type="button" @click="triggerFileSelect" class="upload-photo-btn px-3 py-1 text-sm rounded text-white font-medium bg-red-600/60 hover:bg-red-600/80 shadow-sm">
                  Upload Photo
                </button>
              </div>

              <p class="text-xs text-gray-300 mt-1">Recommended: square image, max 5MB.</p>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-2">
          <button type="button" @click="cancel" class="px-4 py-2 border border-gray-700 text-gray-200 rounded hover:bg-white/5">Cancel</button>
          <button type="submit" :disabled="loading" class="px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded shadow hover:from-red-700 hover:to-red-900 disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="loading">Saving...</span>
            <span v-else>Save</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/store/AuthStore';
import { authAPI } from '@/services/api';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const loading = ref(false);
const error = ref(null);
const form = ref({ name: '', email: '', avatar: '' });
const preview = ref(null);
const fileInput = ref(null);

const triggerFileSelect = () => {
  try { fileInput.value && fileInput.value.click(); } catch(e) { /* ignore */ }
};


onMounted(() => {
  const user = authStore.user || {};
  form.value.name = user.name || '';
  form.value.email = user.email || '';
  form.value.avatar = user.avatar || '';
  preview.value = user.avatar || null;
});

const onFileChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Clear previous error
  error.value = null;

  // Quick client-side size check (5MB hard limit)
  const MAX_RAW_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_RAW_SIZE) {
    error.value = 'Selected image is too large. Please choose an image smaller than 5MB.';
    return;
  }

  try {
    const compressedDataUrl = await compressImageFile(file, 1024, 0.8);
    form.value.avatar = compressedDataUrl;
    preview.value = compressedDataUrl;

    // final size check on base64 length (~1.37 factor), warn if too big
    const approxSize = Math.ceil((compressedDataUrl.length - 'data:image/jpeg;base64,'.length) * 3 / 4);
    if (approxSize > 4 * 1024 * 1024) {
      error.value = 'Image is still large after compression. Try a smaller image.';
    }
  } catch (err) {
    console.error('File read/compress error', err);
    error.value = 'Failed to process the image. Please try another file.';
  }
};

// Compress image using canvas to target max width and quality
const compressImageFile = (file, maxWidth = 1024, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (ev) => {
      img.src = ev.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);

    img.onload = () => {
      const ratio = img.width / img.height;
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        width = maxWidth;
        height = Math.round(maxWidth / ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Use JPEG for smaller size and resolve
      try {
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => reject(err);
  });
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = null;
    const payload = { name: form.value.name };
    if (form.value.avatar) payload.avatar = form.value.avatar;
    const res = await authAPI.updateProfile(payload);
    if (res.success) {
      // update auth store
      authStore.setAuth(res.data.user, localStorage.getItem('token'));
      router.push('/dashboard');
    } else {
      throw new Error(res.message || 'Failed to update');
    }
  } catch (err) {
    console.error(err);
    error.value = err.message || 'Failed to update profile';
  } finally {
    loading.value = false;
  }
};

const cancel = () => {
  router.push('/dashboard');
};
</script>

<style scoped>
</style>
