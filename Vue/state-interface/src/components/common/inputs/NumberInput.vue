<script setup lang="ts">
import { defineProps } from 'vue';
import type { InputProps } from '@components/types/types';

const { label, classes, id, placeholder } = defineProps<InputProps>();

const modelValue = defineModel<number>();

const limitCharacters = () => {
  const convertToString = modelValue.value?.toString() as string;
  if (convertToString.length > 3) {
    modelValue.value = Number(modelValue.value?.toString().slice(0, 3));
  }
};
</script>

<template>
  <div>
    <label v-if="label" :for="id">{{ id }}</label>
    <input v-model="modelValue" @input="limitCharacters" :class="classes" type="number" :id="id" :placeholder="placeholder" :max="3" :max-length="3" />
  </div>
</template>

<style scoped>
input {
  margin: 10px 0px;
  border: 1.5px solid hsla(184, 100%, 44%, 0.4);
  padding: 5px;
  border-radius: 10px;
  max-width: 50px;
  text-align: center;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  appearance: auto;
  -moz-appearance: textfield;
}
input:focus,
input:active,
input:focus-visible {
  border: 1.5px solid rgb(0, 224, 205);
  outline: none;
}
</style>
