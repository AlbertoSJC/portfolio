<script setup lang="ts">
import HeroCard from '@components/list/HeroCard.vue';
import { PentathlonSuperhero } from '@domain/PentathlonSuperhero';
import { computed } from 'vue';

interface PropsModel {
  superhero: PentathlonSuperhero;
  canBeEdited?: boolean;
  canBeSelected?: boolean;
  index: number;
}

const { superhero, index } = defineProps<PropsModel>();

const positionTitle = computed(() => {
  if (index === 0) {
    return 'Winner';
  } else if (index === 1) {
    return 'Second';
  } else {
    return 'Third';
  }
});
</script>

<template>
  <div :key="superhero.id" class="flex flex-col items-center">
    <span class="text-xl font-bold superhero-fonting text-shadow" :class="{ '!text-[#d9d9d8]': index === 1, '!text-[#e7af7d]': index === 2 }">{{ positionTitle }}</span>
    <HeroCard :hero="superhero" :can-be-edited="canBeEdited" :can-be-selected="canBeSelected" />
    <span class="text-l font-bold superhero-fonting small-text-shadow">Total Points: {{ superhero.totalPoints }}</span>
  </div>
</template>

<style scoped></style>
