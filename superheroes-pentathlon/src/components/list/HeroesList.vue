<script setup lang="ts">
import Loader from '@components/common/Loader.vue';
import { SuperheroesList } from '@domain/SuperheroesList';
import { useSuperheroesStore } from '@stores/superheroes';
import apiService from 'src/services/apiService';
import { computed, onMounted, ref } from 'vue';
import HeroCard from './HeroCard.vue';

interface PropsModel {
  canBeEdited?: boolean;
  canBeSelected?: boolean;
}

defineProps<PropsModel>();

const superheroesStore = useSuperheroesStore();

const allSuperheroes = computed(() => superheroesStore.list?.superheroes);
const loading = ref<boolean>(true);

onMounted(async () => {
  await apiService
    .fetchSuperHeroesList()
    .then((response) => {
      superheroesStore.list = new SuperheroesList(response);
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
    });
});
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-2.5 w-[530px] max-h-[700px] overflow-auto scroll-container">
    <template v-if="loading">
      <Loader text="Searching for heroes" />
    </template>
    <template v-else-if="allSuperheroes && allSuperheroes.length > 0">
      <HeroCard v-for="singleHero in allSuperheroes" :hero="singleHero" :can-be-edited="canBeEdited" :can-be-selected="canBeSelected" />
    </template>
    <template v-else>
      <span class="text-lg font-semibold text-center">Oopsie, this looks empty, add your first Superhero!</span>
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
