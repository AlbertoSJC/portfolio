<script setup lang="ts">
import ButtonElement from '@components/common/ButtonElement.vue';
import LinkElement from '@components/common/LinkElement.vue';
import NumberInput from '@components/common/NumberInput.vue';
import TextInput from '@components/common/TextInput.vue';
import { useSuperheroesStore } from '@stores/superheroes';
import { UrlRoutes } from 'src/enums/superheroEnums';
import HeroImageSelector from './HeroImageSelector.vue';

const superheroesStore = useSuperheroesStore();
</script>

<template>
  <div class="relative">
    <LinkElement text="Go back" :url="UrlRoutes.BASE" classes="absolute top-[-5rem] left-0" />
    <p class="text-4xl font-bold superhero-fonting text-shadow mb-4 text-center">Create your personal Superhero!</p>
    <HeroImageSelector />
    <div class="mt-6">
      <TextInput v-model="superheroesStore.heroToUpload.name" id="named-superhero" label="Name:" placeholder="Spiderman" classes="min-w-[90%]" />
      <div class="flex flex-col gap-4 mt-4 items-center justify-center">
        <span class="text-xl font-bold superhero-fonting text-shadow mb-4">Attributes</span>
        <div class="flex flex-col gap-4 w-[80%]">
          <NumberInput v-model="superheroesStore.heroToUpload.attributes.agility" label="Agility:" id="agility-input" :spaceBetween="true" :limitToTen="true" placeholder="12" />
          <NumberInput v-model="superheroesStore.heroToUpload.attributes.strength" label="Strength:" id="strength-input" :spaceBetween="true" :limitToTen="true" placeholder="5" />
          <NumberInput v-model="superheroesStore.heroToUpload.attributes.charisma" label="Charisma:" id="charisma-input" :spaceBetween="true" :limitToTen="true" placeholder="9" />
          <NumberInput v-model="superheroesStore.heroToUpload.attributes.endurance" label="Endurance:" id="endurance-input" :spaceBetween="true" :limitToTen="true" placeholder="6" />
          <NumberInput v-model="superheroesStore.heroToUpload.attributes.weight" label="Weight:" id="weight-input" :spaceBetween="true" :limitToTen="true" placeholder="8" />
        </div>
      </div>
    </div>
    <div class="flex flex-col justify-center items-center gap-4">
      <span class="text-red-950 font-bold text-center" v-if="superheroesStore.errorMessage">{{ superheroesStore.errorMessage }}</span>
      <div class="flex flex-row justify-center items-center gap-4">
        <ButtonElement v-if="superheroesStore.heroToBeforeEdit" @click="superheroesStore.cancelEdit" text="Start New Hero" classes="!bg-black !text-white hover:!bg-white hover:!text-black" />
        <ButtonElement
          @click="superheroesStore.createOrUpdateHero()"
          :text="!superheroesStore.heroToBeforeEdit ? `Save you Hero!` : `Edit your hero!`"
          :disabled="!superheroesStore.heroToUpload.name"
        />
      </div>
    </div>
  </div>
</template>
