<template>
  <component :is="tag" :class="['user-avatar', sizeClass, shapeClass, className]">
    <img v-if="src" :src="src" :alt="altText" class="avatar-img" />
    <span v-else class="avatar-initial">{{ initial }}</span>
  </component>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  src: { type: String, default: '' },
  name: { type: String, default: '' },
  size: { type: String, default: 'w-8 h-8' },
  rounded: { type: Boolean, default: true },
  tag: { type: String, default: 'div' },
  className: { type: String, default: '' }
});

const initial = computed(() => {
  if (!props.name) return 'U';
  return props.name.trim().charAt(0).toUpperCase();
});

const sizeClass = computed(() => props.size);
const shapeClass = computed(() => (props.rounded ? 'rounded-full' : 'rounded'));
const altText = computed(() => props.name || 'avatar');
</script>

<style scoped>
.user-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.12));
  color: #111827;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar-initial {
  font-size: 0.7rem;
  font-weight: 700;
  color: #1f2937;
}
</style>
