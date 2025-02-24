<script setup lang="ts">
import Button from '@components/common/Button.vue';
import { useOperaStore } from '@stores/opera';

const operaStore = useOperaStore();
</script>

<template>
  <div class="main-container">
    <div class="content-container">
      <img alt="environment" src="/src/images/water-system/illustration.png" />
      <div class="text-content">
        <span class="summary">MONTHLY SUMMARY</span>
        <h2 class="title">Goal reached!</h2>
        <span class="success-message">You managed to save <span class="font-bold">42 kWh</span> this month! That’s <span class="font-bold">3 trees</span> high-fiving you ✋</span>
      </div>
      <Button id="water-system-button" @click="operaStore.toggleShowWaterPage">Continue</Button>
    </div>
    <div class="points-obtained-container">
      <img alt="points-obtained" src="/src/images/water-system/coins.svg" />
      <div class="points-obtained-text-container">
        <span class="font-bold">Milestone reached</span>
        <span class="font-bold font-large">+75 credits</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  background-color: white;
  height: 100%;
  padding: 10px 0px;
}
.content-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  gap: 35px;
}
.text-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.summary {
  letter-spacing: 3px;
  font-size: 11px;
}
.title {
  font-size: 32px;
  color: #00d2df;
}
.success-message {
  width: 80%;
  display: block;
}
.points-obtained-container {
  margin: 50px 24px 14px;
  border-radius: 16px;
  background-color: #ffecc7;
  padding: 20px;
  display: flex;
  gap: 25px;
}
.points-obtained-text-container {
  color: #e27436;
  display: flex;
  flex-direction: column;
}
.font-bold {
  font-weight: 900;
}
.font-large {
  font-size: 26px;
}
</style>
