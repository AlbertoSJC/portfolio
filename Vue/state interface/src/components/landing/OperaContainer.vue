<script setup lang="ts">
import Household from '@components/landing/Household.vue';
import Water from '@components/systems/Water.vue';
import { useOperaStore } from '@stores/opera';

const operaStore = useOperaStore();
</script>

<template>
  <div>
    <Household v-if="!operaStore.showWaterPage" />
    <Water v-if="operaStore.showWaterPage" />
  </div>
</template>
