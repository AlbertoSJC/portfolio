<script setup lang="ts">
import type { Service } from '@components/types/types';

const { color, icon, temperature, name } = defineProps<Service>();
</script>

<template>
  <div class="service-card-main-container">
    <div class="image-background-container">
      <div class="image-container" :class="color">
        <img class="icon-element" :src="`${icon}`" :alt="`${name}-icon`" />
      </div>
    </div>
    <span class="temperature-text">{{ temperature }}</span>
    <span class="service-name">{{ name }}</span>
  </div>
</template>

<style scoped>
.service-card-main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-width: 72px;
  margin: 0% 5%;
}
.image-background-container {
  padding: 12px;
  border-radius: 16px;
  box-shadow: 0px 6px 18px 0px #034e7826;
}
.image-container {
  width: fit-content;
  display: flex;
  justify-content: center;
  border-radius: 8px;
  padding: 8px;
}
.green.image-container {
  background: linear-gradient(#00ebc1, #00bdc9);
  box-shadow: 0px 5px 12px 0px #01a4c866;
}
.orange.image-container {
  background: linear-gradient(#ffd875, #f43d53);
  box-shadow: 0px 5px 12px 0px #f6744366;
}
.blue.image-container {
  background: linear-gradient(#26c8fc, #5e76f5);
  box-shadow: 0px 5px 12px 0px #0151c866;
}
.violet.image-container {
  background: linear-gradient(#fc6fff, #af3df4);
  box-shadow: 0px 5px 12px 0px #b742f666;
}
.icon-element {
  width: 32px;
  height: 32px;
}
.temperature-text {
  font-weight: 900;
  margin-top: 12px;
  margin-bottom: 2px;
}
.service-name {
  text-align: center;
  color: hsla(0, 0%, 0%, 0.4);
  font-size: 14px;
}
</style>
