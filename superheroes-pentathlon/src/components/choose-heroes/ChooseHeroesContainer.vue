<script setup lang="ts">
import LinkElement from '@components/common/LinkElement.vue';
import HeroesList from '../list/HeroesList.vue';
import HeroCreation from './HeroCreation.vue';
import { UrlRoutes } from 'src/enums/superheroEnums';
import { useSuperheroesStore } from '@stores/superheroes';

const superheroesStore = useSuperheroesStore();
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-6">
    <div class="flex justify-center items-center flex-row gap-6">
      <HeroCreation />
      <HeroesList :can-be-edited="true" />
    </div>
    <LinkElement :url="UrlRoutes.SUPERHERO_PENTATHLON" text="Let's start the pentathlon!" :disabled="!(superheroesStore.list.superheroes.length >= 2)" />
  </div>
</template>
