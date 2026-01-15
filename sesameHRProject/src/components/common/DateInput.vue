<script setup lang="ts">
import type { ExtendedInputProps, InputProps } from '@typesOrigin/recruitment';

defineProps<ExtendedInputProps>();

const modelValue = defineModel<string>();
</script>

<template>
  <div :class="[{ 'w-full items-start': widthFull }, 'flex flex-col items-center']">
    <label v-if="label" :for="id" class="font-semibold text-secondary-blue">{{ label }}</label>
    <input
      v-model="modelValue"
      :class="['my-1 border border-primary-white bg-secondary-white text-primary-grey p-1.25 rounded-xl outline-0', classes, { '!text-black': modelValue, 'w-full': widthFull }]"
      type="date"
      :id="id"
      :placeholder="placeholder"
    />
  </div>
</template>
