<script setup lang="ts">
import LinkElement from '@components/common/LinkElement.vue';
import { UrlRoutes } from 'src/enums/superheroEnums';
</script>

<template>
  <div>
    <img src="/src/images/superhero-group.png" alt="Superhero group" />
    <div class="flex flex-col items-center justify-center gap-2">
      <h1 class="text-4xl font-bold superhero-fonting text-shadow">Welcome to the Superhero Pentathlon!</h1>
      <p class="text-lg text-black superhero-fonting small-text-shadow">Discover which Superhero would win in a totally fair and not rigged competition!</p>
      <LinkElement :url="UrlRoutes.CHOOSE_YOUR_HEROES" text="Let's do it!" />
    </div>
  </div>
</template>
