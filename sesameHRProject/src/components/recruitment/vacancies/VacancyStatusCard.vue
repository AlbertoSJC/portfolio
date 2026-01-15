<script setup lang="ts">
import { VacancyStatusText, type VacancyStatus } from '@domain/VacancyStatus';
import { useRecruitmentStore } from '@stores/recruitment';
import { vacancyStatusCardOutput } from '@typesOrigin/recruitment';
import { computed } from 'vue';
import CandidateCard from '../candidates/CandidateCard.vue';

interface VacancyStatusCardProps {
  status?: VacancyStatus | null;
  index: number;
}

const recruitmentStore = useRecruitmentStore();

const { status } = defineProps<VacancyStatusCardProps>();

const getCurrentStatus = computed(() => vacancyStatusCardOutput[status?.name ?? VacancyStatusText.Default]);

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
};

const handleDrop = async () => {
  if (recruitmentStore.candidateBeingDragged) {
    recruitmentStore.candidateToUpload = recruitmentStore.candidateBeingDragged;
    recruitmentStore.candidateBeingDragged = null;
    if (recruitmentStore.candidateToUpload.statusId !== status?.id) {
      recruitmentStore.candidateToUpload.statusId = status?.id;
      await recruitmentStore.editCandidate();
    }
  }
};
</script>

<template>
  <div
    @dragover="handleDragOver"
    @drop="handleDrop"
    :class="['flex flex-col h-full w-full min-w-[296px] p-4 gap-4 border-1 border-primary-white rounded-xl', index % 2 !== 0 ? 'bg-secondary-white' : 'bg-white']"
  >
    <div class="flex flex-col gap-3">
      <hr
        :class="[`h-[4px] border-0 rounded-4xl`]"
        :style="{
          backgroundColor: getCurrentStatus.color,
          color: getCurrentStatus.color,
        }"
      />
      <div class="flex flex-row gap-1">
        <img :src="`src/images/status/${getCurrentStatus.imgSrc}.svg`" class="max-h-[24px] max-w-[24px]" />
        <span class="text-secondary-blue font-bold">{{ status?.name ?? 'Recruitment' }}</span>
      </div>
    </div>
    <div v-if="status" id="candidate-cards-container" class="flex flex-col h-full w-full min-w-0 gap-3 pb-2 pr-1 overflow-y-auto overflow-x-hidden scroll-container list-card-scroll-container">
      <CandidateCard v-for="candidate in recruitmentStore.filteredCandidates.filter((candidate) => candidate.statusId === status.id)" :candidate="candidate" :vacancyIndex="index" :key="index" />
    </div>
  </div>
</template>
