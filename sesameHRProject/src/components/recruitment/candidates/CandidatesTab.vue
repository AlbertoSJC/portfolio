<script setup lang="ts">
import DraggableScroll from '@components/common/DraggableScroll.vue';
import { useRecruitmentStore } from '@stores/recruitment';
import CandidatesListCard from './CandidatesListCard.vue';

const recruitmentStore = useRecruitmentStore();
</script>

<template>
  <DraggableScroll id="candidates-container" classes="flex flex-row h-full w-full min-w-0 gap-3 pb-2 overflow-x-auto scroll-container">
    <CandidatesListCard v-for="(candidate, index) in recruitmentStore.filteredCandidates" :candidate="candidate" :key="index" :index="index" />
  </DraggableScroll>
</template>
