<script setup lang="ts">
import { ModalIds, useModalsStore } from '@stores/modals';

interface ModalContainerProps {
  modalId: ModalIds;
  classes?: string;
}

const { modalId } = defineProps<ModalContainerProps>();

const modalsStore = useModalsStore();
</script>

<template>
  <div v-if="modalsStore.listModalIds[modalId]" class="fixed inset-0 z-10 flex items-center justify-center bg-[#181e27c7]" @click.self="modalsStore.toggleModal(modalId)">
    <div :class="['relative w-fit h-fit flex flex-col gap-4 rounded-2xl p-6 bg-white border-2 border-primary-white', classes]">
      <span class="close-button-modal absolute top-0 right-2 font-bold text-[#9b0000] text-xl cursor-pointer" @click="modalsStore.toggleModal(modalId)">x</span>
      <slot />
    </div>
  </div>
</template>
