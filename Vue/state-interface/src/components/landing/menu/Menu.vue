<script setup lang="ts">
import { useOperaStore } from '@stores/opera';
import MenuItem from './MenuItem.vue';

const operaStore = useOperaStore();
</script>

<template>
  <div class="main-container-menu">
    <div class="items-container-menu">
      <MenuItem v-for="(item, index) in operaStore.menuItems" :key="index" :image="item.image" :title="item.title" :active="item.active" />
    </div>
  </div>
</template>

<style scoped>
.main-container-menu {
  background-color: white;
  padding: 2% 0%;
  width: 100%;
}
.items-container-menu {
  display: flex;
  margin: 0px 24px;
  gap: 20px;
  align-items: center;
}
</style>
