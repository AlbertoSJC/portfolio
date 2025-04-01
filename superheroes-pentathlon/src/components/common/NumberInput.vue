<script setup lang="ts">
import type { InputProps } from '@models/typesFile';
import { defineProps, watch } from 'vue';

interface PropsModel {
  spaceBetween?: boolean;
  limitToTen?: boolean;
}

const { label, classes, id, placeholder, limitToTen } = defineProps<InputProps & PropsModel>();

const modelValue = defineModel<number>();

watch(modelValue, (newValue) => {
  const newValueToString = newValue?.toString() as string;
  if (newValueToString === '' || (newValue && newValue < 0)) {
    modelValue.value = 0;
  } else if (limitToTen && newValue && newValue > 10) {
    modelValue.value = 10;
  } else if (newValueToString.length >= 3) {
    const maxDecimals = limitToTen ? 2 : 3;
    modelValue.value = Number(newValueToString.slice(0, maxDecimals));
  }
});
</script>

<template>
  <div class="flex flex-row gap-4 items-center" :class="{ 'justify-between': spaceBetween }">
    <label v-if="label" :for="id" class="font-semibold" :id="`${id}-label`">{{ label }}</label>
    <input
      class="my-2.5 border-[2.5px] font-bold border-black p-1.25 rounded-[10px] max-w-[50px] text-center focus:border-[#fff66f] focus:outline-0 active:border-[#fff66f] active:outline-0 focus-visible:border-[#fff66f] focus-visible:outline-0"
      v-model="modelValue"
      :class="classes"
      type="number"
      :id="id"
      :placeholder="placeholder"
      :max-length="3"
    />
  </div>
</template>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  appearance: auto;
  -moz-appearance: textfield;
}
</style>
