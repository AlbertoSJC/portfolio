<script setup lang="ts">
interface ButtonProps {
  text: string;
  disabled?: boolean;
  classes?: string;
}

defineProps<ButtonProps>();
</script>

<template>
  <button
    :class="[
      disabled
        ? '!bg-[#535353] border-[#b5b5b5] !text-white pointer-events-none'
        : 'cursor-pointer border-secondary-blue text-white bg-secondary-blue hover:text-secondary-color hover:border-secondary-color',
      classes,
    ]"
  >
    {{ text }}
  </button>
</template>

<style scoped>
@reference "tailwindcss";

button {
  @apply w-fit py-1 px-3 rounded-xl border-2 transition duration-300 ease-in-out hover:bg-white;
}
</style>
