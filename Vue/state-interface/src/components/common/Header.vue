<script setup lang="ts">
import { useOperaStore } from '@stores/opera';

const operaStore = useOperaStore();
</script>

<template>
  <div>
    <div class="header-main-container" :class="{ reverse: operaStore.showWaterPage }">
      <div v-show="!operaStore.showWaterPage" class="menu-container">
        <img alt="menu-icon" src="/src/images/header/menu-icon.svg" />
        <h1 class="header-title">Household</h1>
      </div>
      <div class="profile-container">
        <img class="profile-image" alt="menu-icon" src="/src/images/header/profile-icon-bdtwo.png" />
        <span class="notification-dot"></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-main-container {
  width: 100%;
  padding: 18px 0px 6px 0px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: white;
}
.reverse.header-main-container {
  flex-direction: row-reverse;
}
.menu-container {
  display: flex;
  gap: 15px;
  margin-left: 24px;
}

.profile-container {
  display: flex;
  position: relative;
  border: 3px solid #00d2df;
  border-radius: 50%;
  margin-right: 24px;
}

.profile-image {
  border: 3px solid white;
  border-radius: 50%;
  height: 56px;
  width: 56px;
}

.notification-dot {
  position: absolute;
  top: 0px;
  right: 0px;
  display: block;
  width: 8px;
  height: 8px;
  background-color: #ff6174;
  border-radius: 50%;
  border: 3px solid white;
}

.header-title {
  font-weight: 900;
  font-size: 24px;
}
</style>
