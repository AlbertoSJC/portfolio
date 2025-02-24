<script setup lang="ts">
interface Props {
  id: string;
  href?: string;
}

const { id, href } = defineProps<Props>();
</script>

<template>
  <a :href="href">
    <button :id="id" :data-cy="id" class="button">
      <slot />
    </button>
  </a>
</template>

<style scoped>
.button {
  padding: 20px;
  cursor: pointer;
  background-color: #00d2df;
  color: white;
  border: none;
  font-weight: 900;
  border-radius: 48px;
  font-size: medium;
  box-shadow: 0px 6px 16px 0px #0091be59;
}
</style>
