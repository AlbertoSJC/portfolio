<script setup lang="ts">
import ButtonElement from '@components/common/ButtonElement.vue';
import TextInput from '@components/common/TextInput.vue';
import { ModalIds, useModalsStore } from '@stores/modals';
import { useRecruitmentStore } from '@stores/recruitment';
import CreateCandidateModal from './modals/create/CreateCandidateModal.vue';
import EditCandidateModal from './modals/edit/EditCandidateModal.vue';

const recruitmentStore = useRecruitmentStore();
const modalsStore = useModalsStore();

const openModal = () => {
  recruitmentStore.formStatus = null;
  recruitmentStore.createCandidateToUpload();
  modalsStore.toggleModal(ModalIds.CreateCandidate);
};
</script>

<template>
  <div class="flex flex-row items-center justify-between height-fit max-h-[32px]">
    <TextInput placeholder="Buscar" icon="src/images/icon-search.svg" v-model="recruitmentStore.recruitmentFilterInput" :no-errors="true" />
    <ButtonElement text="Añadir candidato" classes="text-sm" @click="openModal" :disabled="recruitmentStore.loading" />
    <CreateCandidateModal />
    <EditCandidateModal />
  </div>
</template>
