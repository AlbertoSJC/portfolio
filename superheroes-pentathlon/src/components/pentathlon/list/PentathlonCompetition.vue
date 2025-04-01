<script setup lang="ts">
import Loader from '@components/common/Loader.vue';
import { useSuperheroesStore } from '@stores/superheroes';
import { computed } from 'vue';
import PentathlonSuperheroCard from '../PentathlonSuperheroCard.vue';
import WinnersAndLosersList from './WinnersAndLosersList.vue';

const superheroesStore = useSuperheroesStore();

const allSuperheroes = computed(() => superheroesStore.pentathlonList?.superheroes);
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-2.5 w-[635px] max-h-[700px] overflow-auto scroll-container">
    <template v-if="superheroesStore.pentathlonLoading">
      <Loader text="Heroes are COMPETING!" />
    </template>
    <template v-else-if="superheroesStore.pentathlonWinnersList">
      <WinnersAndLosersList />
    </template>
    <template v-else-if="allSuperheroes && allSuperheroes.length > 0">
      <PentathlonSuperheroCard v-for="singleHero in allSuperheroes" :chosen-hero="singleHero" />
    </template>
    <template v-else>
      <span class="text-lg font-semibold text-center">Add superheroes to start competing!</span>
    </template>
  </div>
</template>

<style scoped>
img:hover {
  transform: scale(1.1);
  transition: transform 0.2s ease-in-out;
}

::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 1);
}

::-webkit-scrollbar-thumb {
  background-color: #fff66f;
  border-radius: 6px;
  border: 2px solid rgba(0, 0, 0, 1);
}

.scroll-container {
  scrollbar-color: #fff66f rgba(0, 0, 0, 1);
  scrollbar-width: thin;
}
</style>
