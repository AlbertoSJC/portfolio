<script setup lang="ts">
import { Candidate, type CandidateInformation } from '@domain/Candidate';
import CandidateInformationCard from './CandidateInformationCard.vue';
import ButtonElement from '@components/common/ButtonElement.vue';
import { useRecruitmentStore } from '@stores/recruitment';
import { ModalIds, useModalsStore } from '@stores/modals';

interface CandidateCardProps {
  candidate?: Candidate | null;
  index: number;
}

const { candidate } = defineProps<CandidateCardProps>();

const recruitmentStore = useRecruitmentStore();
const modalsStore = useModalsStore();

const editCandidate = () => {
  recruitmentStore.formStatus = null;
  recruitmentStore.errors = null;
  recruitmentStore.candidateToUpload = new Candidate(candidate as CandidateInformation);
  modalsStore.toggleModal(ModalIds.EditCandidate);
};
</script>

<template>
  <div :class="['flex flex-col h-full w-full min-w-[296px] p-4 gap-4 border-1 border-primary-white rounded-xl', index % 2 !== 0 ? 'bg-secondary-white' : 'bg-white']">
    <div class="flex flex-col gap-3">
      <hr class="h-[4px] border-0 rounded-4xl bg-primary-grey text-primary-grey" />
      <div class="flex flex-row gap-1 items-center justify-between">
        <div class="flex flex-row gap-1">
          <img :src="`src/images/status/default.svg`" class="max-h-[24px] max-w-[24px]" />
          <span class="text-secondary-blue font-bold max-w-[160px] ellipsis-text" :title="`${candidate?.firstName} ${candidate?.lastName}`">{{ candidate?.firstName }} {{ candidate?.lastName }}</span>
        </div>
        <ButtonElement text="Editar" @click="editCandidate" classes="text-xs" />
      </div>
    </div>
    <div v-if="candidate" id="candidate-list-cards-container" class="flex flex-col h-full w-full min-w-0 gap-3 pb-2 pr-1 overflow-y-auto overflow-x-hidden scroll-container list-card-scroll-container">
      <CandidateInformationCard :candidate="candidate" />
    </div>
  </div>
</template>
