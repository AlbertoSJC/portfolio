<script setup lang="ts">
import type { ToggleItems } from '@components/types/types';

const { active, image, title } = defineProps<ToggleItems>();
</script>

<template>
  <div class="card-main-container" :class="{ active: active }">
    <div class="image-background-container">
      <div class="image-container">
        <img class="image-element" :src="`${image}`" :alt="`${title}`" />
      </div>
    </div>
    <span class="mode-text">{{ title }}</span>
    <span class="mode-state">{{ active ? 'On' : 'Off' }}</span>
  </div>
</template>

<style scoped>
.card-main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}
.image-background-container {
  padding: 12px;
  border-radius: 16px;
  background-color: white;
  box-shadow: 0px 6px 18px 0px #034e7826;
  border: 2px solid transparent;
  transition: 0.5s;
}
.active .image-background-container,
.image-background-container:hover {
  border-color: #00d2df;
}
.image-container {
  width: fit-content;
  display: flex;
  justify-content: center;
  border-radius: 8px;
  padding: 8px;
}
.image-element {
  width: 40px;
  height: 40px;
  filter: saturate(0%) contrast(150%);
  transition: 0.5s;
}
.active .image-element,
.image-background-container:hover .image-element {
  filter: saturate(100%) contrast(100%);
}
.mode-text {
  font-weight: 900;
  margin-top: 12px;
  margin-bottom: 2px;
}
.active .mode-text {
  color: #00d2df;
}
.mode-state {
  text-align: center;
  color: hsla(0, 0%, 0%, 0.4);
  font-size: 14px;
}
</style>
