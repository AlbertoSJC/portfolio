<script setup lang="ts">
import HeroCard from '@components/list/HeroCard.vue';
import { useSuperheroesStore } from '@stores/superheroes';
import WinnerSuperheroCard from '../WinnerSuperheroCard.vue';

const superheroesStore = useSuperheroesStore();
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col items-center gap-3" v-if="superheroesStore.pentathlonWinnersList">
      <h3 class="text-4xl font-bold superhero-fonting text-shadow">And the Winners are...</h3>
      <div class="flex flex-row gap-4">
        <WinnerSuperheroCard v-for="(superhero, index) in superheroesStore.pentathlonWinnersList.superheroes" :superhero="superhero" :index="index" />
      </div>
    </div>
    <div class="flex flex-col items-center gap-3" v-if="superheroesStore.pentathlonLosersList?.superheroes && superheroesStore.pentathlonLosersList?.superheroes.length > 0">
      <h3 class="text-xl font-bold superhero-fonting text-shadow">We thank for participating to...</h3>
      <div class="flex flex-row flex-wrap justify-center gap-2">
        <HeroCard v-for="superhero in superheroesStore.pentathlonLosersList?.superheroes" :hero="superhero" />
      </div>
    </div>
  </div>
</template>
