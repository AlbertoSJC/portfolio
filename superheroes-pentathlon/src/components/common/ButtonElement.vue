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
    class="bg-black font-bold py-2 px-4 transition duration-300 ease-in-out cursor-pointer hover:bg-[#fff66f] hover:!text-black hover:drop-shadow-none rounded-[10px] min-w-[180px]"
    :class="[{ '!bg-[#535353] !text-black pointer-events-none': disabled, 'superhero-fonting small-text-shadow': !disabled }, classes]"
  >
    {{ text }}
  </button>
</template>
