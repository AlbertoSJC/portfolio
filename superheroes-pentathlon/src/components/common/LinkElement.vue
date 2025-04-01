<script setup lang="ts">
import ButtonElement from './ButtonElement.vue';

interface LinkProps {
  url: string;
  text: string;
  disabled?: boolean;
  classes?: string;
}
defineProps<LinkProps>();
</script>

<template>
  <a :href="url" class="mt-4" :class="[{ 'pointer-events-none': disabled }, classes]">
    <ButtonElement :text="text" :disabled="disabled" />
  </a>
</template>
