<script setup lang="ts">
import HeroCard from '@components/list/HeroCard.vue';
import type { PentathlonSuperhero } from '@domain/PentathlonSuperhero';

interface PropsModel {
  chosenHero: PentathlonSuperhero;
  canBeEdited?: boolean;
  canBeSelected?: boolean;
}

defineProps<PropsModel>();
</script>

<template>
  <div class="flex flex-row justify-around items-center bg-black border-2 border-[#fff66f] p-2.5 rounded-lg">
    <HeroCard :hero="chosenHero" :can-be-selected="canBeSelected" />
    <div class="flex justify-center flex-col p-2.5 gap-2.5 items-start flex-nowrap capitalize">
      <div v-for="[key, value] in Object.entries(chosenHero.attributes)" :key="key" class="w-full min-w-[100px] flex justify-between superhero-fonting text-shadow">
        <span class="font-semibold">{{ key }}</span> <span>{{ value }}</span>
      </div>
    </div>
  </div>
</template>
