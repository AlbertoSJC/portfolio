<script setup lang="ts">
import { useOperaStore } from '@stores/opera';
import ModesCard from './ModesCard.vue';

const operaStore = useOperaStore();
</script>

<template>
  <div class="modes-main-container">
    <div class="title-container">
      <span class="title">Modes</span>
      <img src="/src/images/modes/settings.svg" alt="settings" />
    </div>
    <div class="cards-container">
      <ModesCard v-for="(mode, index) in operaStore.allModes.modes" :key="index" :image="mode.image" :title="mode.title" :active="mode.active" @click="operaStore.allModes.modesToggling(index)" />
    </div>
  </div>
</template>

<style scoped>
.modes-main-container {
  margin: 0px 24px;
  padding: 15px;
  background-color: rgb(247, 249, 255);
}
.title-container {
  display: flex;
  justify-content: space-between;
}
.title {
  color: hsla(0, 0%, 0%, 0.6);
  font-size: 24px;
  font-weight: 900;
}
.cards-container {
  display: flex;
  margin: 15px 0px;
  justify-content: space-between;
}
</style>
