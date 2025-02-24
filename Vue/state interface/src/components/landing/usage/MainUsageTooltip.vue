<script setup lang="ts"></script>

<template>
  <div class="main-background-container">
    <div class="ellipsis-container">
      <img class="ellipsis" alt="electricity-icon" src="/src/images/usage/background-circle.svg" />
      <img class="ellipsis" alt="electricity-icon" src="/src/images/usage/background-outline.svg" />
    </div>
    <div class="main-electricity-container">
      <img alt="electricity-icon" src="/src/images/usage/electricity.svg" />
      <span class="consumed">14 kWh</span>
      <span class="cost">€ 1.25</span>
    </div>
  </div>
</template>

<style scoped>
.main-background-container {
  position: relative;
  box-shadow: 0px 4px 10px 0px hsla(216, 25%, 79%, 0.5) inset;
  border-radius: 50%;
  width: 128px;
  height: 128px;
  padding: 16px;
}

.main-electricity-container {
  display: flex;
  z-index: 2;
  flex-direction: column;
  align-items: center;
  background-color: white;
  gap: 6px;
  border-radius: 50%;
  box-shadow: 0px 6px 18px 0px hsla(202, 96%, 24%, 0.15);
  width: 112px;
  height: 112px;
  justify-content: center;
  padding: 9px;
  position: absolute;
  top: 15px;
}

.consumed {
  font-weight: 900;
}

.ellipsis-container {
  position: relative;
}

.ellipsis {
  z-index: 1;
  position: absolute;
  display: block;
  top: -7px;
  right: -9px;
  transform: scale(1.22);
}
</style>
