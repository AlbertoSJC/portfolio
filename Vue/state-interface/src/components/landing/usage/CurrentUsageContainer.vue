<script setup lang="ts">
import { useOperaStore } from '@stores/opera';
import MainUsageTooltip from './MainUsageTooltip.vue';

const operaStore = useOperaStore();
</script>

<template>
  <div class="main-container">
    <span class="title">Current usage</span>
    <div class="container">
      <div class="image-block-container">
        <div class="image-background-container">
          <img alt="temperature-icon" src="/src/images/usage/temperature.svg" />
        </div>
        <span class="font-bold">21°C</span>
      </div>
      <MainUsageTooltip />
      <div id="toggle-water-page" class="image-block-container" @click="operaStore.toggleShowWaterPage">
        <div class="image-background-container">
          <img alt="water-icon" src="/src/images/usage/water.svg" />
        </div>
        <span class="font-bold">58%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  background: url(/src/images/usage/background-shape.svg) no-repeat center bottom;
  background-size: 450px;
  padding: 5px 0px 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

@media (min-width: 450px) {
  .main-container {
    background: none;
    background-color: white;
  }
}

.title {
  display: block;
  width: 100%;
  text-align: center;
  color: hsla(0, 0%, 0%, 0.6);
}

.container {
  display: flex;
  justify-content: space-between;
  margin: 20px 24px;
  max-width: 320px;
  width: 100%;
}

.image-block-container {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8px;
  margin: 5px;
  cursor: pointer;
}

.image-background-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  box-shadow: 0px 4px 10px 0px hsla(216, 25%, 79%, 0.5) inset;
}

.font-bold {
  font-weight: 900;
}
</style>
