<script setup lang="ts">
import ButtonElement from '@components/common/ButtonElement.vue';
import { ModalIds, useModalsStore } from '@stores/modals';
import { useRecruitmentStore } from '@stores/recruitment';
import { ModalFormSuccess } from '@typesOrigin/recruitment';
import { computed } from 'vue';

const recruitmentStore = useRecruitmentStore();
const modalsStore = useModalsStore();

const editCandidate = async () => {
  await recruitmentStore.editCandidate();
  setTimeout(() => {
    if (recruitmentStore.formStatus === ModalFormSuccess.Success) {
      modalsStore.toggleModal(ModalIds.EditCandidate);
    }
    recruitmentStore.formStatus = null;
  }, 1500);
};

const buttonFormClasses = computed(() => {
  if (recruitmentStore.formStatus === ModalFormSuccess.Success) return 'bg-[#137019] border-[#137019] hover:!bg-[#137019] hover:!border-[#137019] text-white hover:text-white pointer-none font-bold';
  if (recruitmentStore.formStatus === ModalFormSuccess.Failure) return 'bg-[#801111] border-[#801111] hover:!bg-[#801111] hover:!border-[#801111] text-white hover:text-white pointer-none font-bold';
  return '';
});

const buttonFormText = computed(() => {
  if (recruitmentStore.formStatus === ModalFormSuccess.Success) return 'Editado!';
  if (recruitmentStore.formStatus === ModalFormSuccess.Failure) return 'Error!';
  return 'Editar';
});
</script>

<template>
  <div class="flex flex-row justify-between items-end pb-2 border-b-2 border-[#F1F5F9]">
    <div class="flex flex-row gap-3 items-start">
      <img src="src/images/new-candidate.svg" alt="Edit candidate" class="h-[25px]" />
      <h5 class="text-2xl font-bold text-secondary-blue">Editar candidato</h5>
    </div>
    <ButtonElement :text="buttonFormText" @click="editCandidate" :disabled="recruitmentStore.errors !== null" :classes="buttonFormClasses" />
  </div>
</template>
