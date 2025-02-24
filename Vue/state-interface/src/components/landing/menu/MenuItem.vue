<script setup lang="ts">
import type { ToggleItems } from '@components/types/types';

const { image, title, active } = defineProps<ToggleItems>();
</script>

<template>
  <div class="menu-item-main-container">
    <div class="content-container" :class="{ 'blue-background': active }">
      <img class="image-element" :src="`${image}`" :alt="`${title}`" />
      <span class="title" v-if="active">{{ title }}</span>
    </div>
  </div>
</template>

<style scoped>
.menu-item-main-container {
  width: 100%;
}

.content-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.blue-background.content-container {
  background-color: hsla(184, 100%, 44%, 0.15);
  border-radius: 40px;
  padding: 15px;
}
.title {
  font-size: 14px;
  font-weight: 900;
  color: #00d2df;
}
</style>
