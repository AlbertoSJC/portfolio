<script setup lang="ts">
import DraggableScroll from '@components/common/DraggableScroll.vue';
import { useRecruitmentStore } from '@stores/recruitment';
import VacancyStatusCard from './VacancyStatusCard.vue';

const recruitmentStore = useRecruitmentStore();
</script>

<template>
  <DraggableScroll id="vacancies-container" classes="flex flex-row h-full w-full min-w-0 gap-3 pb-2 overflow-x-auto scroll-container">
    <VacancyStatusCard v-for="(vacancyStatus, index) in recruitmentStore.vacancyStatusList.statuses" :status="vacancyStatus" :key="index" :index="index" />
  </DraggableScroll>
</template>
