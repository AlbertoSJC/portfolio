<script setup lang="ts">
import ServicesContainer from './services/ServicesContainer.vue';
import CurrentUsageContainer from './usage/CurrentUsageContainer.vue';
import ModesContainer from './modes/ModesContainer.vue';
import Menu from './menu/Menu.vue';
</script>

<template>
  <div>
    <ServicesContainer />
    <CurrentUsageContainer />
    <ModesContainer />
    <Menu />
  </div>
</template>
