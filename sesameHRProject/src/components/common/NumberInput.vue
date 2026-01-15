<script setup lang="ts">
import type { ExtendedInputProps } from '@typesOrigin/recruitment';
import { watch } from 'vue';

defineProps<ExtendedInputProps>();

const modelValue = defineModel<number>();

watch(modelValue, (newValue) => {
  const newValueToString = newValue?.toString() as string;
  if (newValueToString === '' || (newValue && newValue < 0)) {
    modelValue.value = undefined;
  }
});
</script>

<template>
  <div :class="[{ 'w-full items-start': widthFull }, 'flex flex-col items-center']">
    <label v-if="label" :for="id" class="font-semibold text-secondary-blue">{{ label }}</label>
    <input
      v-model="modelValue"
      :class="[
        'my-1 border border-primary-white bg-secondary-white text-primary-grey p-1.25 rounded-xl outline-0',
        classes,
        { '!text-black': modelValue !== null && modelValue !== undefined, 'w-full': widthFull },
      ]"
      type="number"
      :id="id"
      :placeholder="placeholder"
    />
  </div>
</template>
