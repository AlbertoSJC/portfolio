<script setup lang="ts">
import Household from '@components/landing/Household.vue';
import GoalPopUp from '@components/systems/GoalPopUp.vue';
import { useOperaStore } from '@stores/opera';

const operaStore = useOperaStore();
</script>

<template>
  <div class="main-content-container">
    <Household v-if="!operaStore.showGoalsPage" />
    <GoalPopUp v-if="operaStore.showGoalsPage" />
  </div>
</template>

<style scoped>
.main-content-container {
  max-width: 1000px;
  margin: auto;
}
</style>
