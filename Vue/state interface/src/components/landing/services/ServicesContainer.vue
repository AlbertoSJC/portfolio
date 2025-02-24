<script setup lang="ts">
import ServiceCard from '@components/landing/services/ServiceCard.vue';
import { useOperaStore } from '@stores/opera';

const operaStore = useOperaStore();
</script>

<template>
  <div class="services-main-container">
    <div class="sides-container">
      <div class="scrollable-list">
        <ServiceCard v-for="(service, index) in operaStore.servicesState" :name="service.name" :icon="service.icon" :color="service.color" :temperature="service.temperature" :key="index" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.services-main-container {
  width: 100%;
  padding: 18px 0px 18px 0px;
  overflow-y: hidden;
  background-color: white;
}
.scrollable-list {
  width: 100%;
  display: flex;
  align-items: center;
  overflow-y: scroll;
  scrollbar-width: none;
  box-sizing: content-box;
}

.scrollable-list:-webkit-scrollbar {
  display: none;
}

.scrollable-list::-webkit-scrollbar {
  display: none;
}
</style>
