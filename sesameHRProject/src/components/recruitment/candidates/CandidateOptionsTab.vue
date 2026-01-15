<script setup lang="ts">
import { Candidate, type CandidateInformation } from '@domain/Candidate';
import { VacancyStatusText, type VacancyStatus } from '@domain/VacancyStatus';
import { ModalIds, useModalsStore } from '@stores/modals';
import { useRecruitmentStore } from '@stores/recruitment';
import { vacancyStatusCardOutput } from '@typesOrigin/recruitment';
import { computed, onMounted, onUnmounted, ref } from 'vue';

interface PropsModel {
  candidate: Candidate;
}

const { candidate } = defineProps<PropsModel>();

const recruitmentStore = useRecruitmentStore();
const modalsStore = useModalsStore();

const idForSelector = `id-${Math.random().toString(36).substring(2, 9)}`;

const moreThanFiveCandidates = computed(() => recruitmentStore.candidateList.getCandidatesByStatusId(candidate.statusId as string).length > 5);
const isLastCandidate = computed(() => {
  const candidateIndex = recruitmentStore.candidateList.findCandidateIndex(candidate);
  const lastIndex = recruitmentStore.candidateList.candidates.length - 1;
  return candidateIndex === lastIndex;
});

const showSubmenu = ref(false);
const showStatus = ref(false);

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest(`#${idForSelector}`)) {
    showSubmenu.value = false;
    showStatus.value = false;
  }
};

const handleSubmenuClick = () => {
  showSubmenu.value = !showSubmenu.value;
  showStatus.value = false;
};

const handleStatusClick = () => {
  showStatus.value = !showStatus.value;
};

const editCandidate = () => {
  showSubmenu.value = false;
  showStatus.value = false;
  recruitmentStore.formStatus = null;
  recruitmentStore.errors = null;
  recruitmentStore.candidateToUpload = new Candidate(candidate as CandidateInformation);
  modalsStore.toggleModal(ModalIds.EditCandidate);
};

const changeStatus = async (status: VacancyStatus) => {
  showSubmenu.value = false;
  showStatus.value = false;
  recruitmentStore.candidateToUpload = candidate;
  recruitmentStore.candidateToUpload.statusId = status.id;
  await recruitmentStore.editCandidate();
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div :id="idForSelector" class="relative px-2">
    <div
      v-if="showSubmenu"
      :class="[
        'absolute flex flex-col items-start gap-1 -bottom-[78px] -left-[95px] w-fit bg-white p-2 rounded-xl border-2 border-secondary-color',
        { 'bottom-5 -left-[105px]': moreThanFiveCandidates && isLastCandidate },
      ]"
    >
      <span class="edit-candidate-tab-button w-full cursor-pointer text-sm text-secondary-color hover:text-secondary-blue" @click="editCandidate">Editar Candidato</span>
      <hr class="w-full text-secondary-color bg-secondary-color h-[2px] border-0" />
      <span class="show-status-trigger w-full text-sm text-secondary-color hover:text-secondary-blue cursor-pointer" @click="handleStatusClick">Cambiar Status</span>
      <div
        v-if="showStatus"
        :class="[
          'absolute flex flex-col items-start gap-1 bg-white border-2 border-secondary-color text-white -left-26 -bottom-20 rounded-xl',
          { 'bottom-0': moreThanFiveCandidates && isLastCandidate },
        ]"
      >
        <template v-for="status in recruitmentStore.vacancyStatusList.statuses">
          <span
            :style="{
              color: vacancyStatusCardOutput[status.name ?? VacancyStatusText.Default].color,
            }"
            v-if="status.id !== candidate.statusId"
            class="status-element-text p-1 w-full text-sm cursor-pointer hover:bg-primary-white rounded-none first:rounded-t-xl last:rounded-b-xl"
            @click="changeStatus(status)"
            >{{ status.name }}</span
          >
        </template>
      </div>
    </div>
    <img src="src/images/submenu-icon.svg" class="cursor-pointer" @click="handleSubmenuClick" />
  </div>
</template>
