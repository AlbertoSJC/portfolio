<script setup lang="ts">
import type { InputProps } from '@models/typesFile';
import { defineProps } from 'vue';

const { label, classes, id, placeholder } = defineProps<InputProps>();

const modelValue = defineModel<string>();
</script>

<template>
  <div class="flex flex-row gap-2 items-center">
    <label v-if="label" :for="id" class="font-semibold">{{ label }}</label>
    <input
      class="my-2.5 border-[2.5px] font-bold border-black p-1.25 rounded-[10px] max-w-[50px] text-center focus:border-[#fff66f] focus:outline-0 active:border-[#fff66f] active:outline-0 focus-visible:border-[#fff66f] focus-visible:outline-0"
      v-model="modelValue"
      :class="classes"
      type="text"
      :id="id"
      :placeholder="placeholder"
    />
  </div>
</template>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='text'] {
  appearance: auto;
  -moz-appearance: textfield;
}
</style>
