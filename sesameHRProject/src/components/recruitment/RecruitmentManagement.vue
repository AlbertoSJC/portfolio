<script setup lang="ts">
import LoaderElement from '@components/common/LoaderElement.vue';
import { useRecruitmentStore } from '@stores/recruitment';
import { RecruitmentTabs } from '@typesOrigin/recruitment';
import { onMounted } from 'vue';
import CandidatesTab from './candidates/CandidatesTab.vue';
import HeaderTabs from './HeaderTabs.vue';
import HeaderTools from './HeaderTools.vue';
import VacanciesTab from './vacancies/VacanciesTab.vue';

const recruitmentStore = useRecruitmentStore();

onMounted(async () => {
  await recruitmentStore.fetchVacancyStatuses();
  await recruitmentStore.fetchCandidates();
  recruitmentStore.loading = false;
});
</script>

<template>
  <div class="h-full flex flex-col min-w-0 bg-white rounded-2xl px-6 py-4 gap-6 shadow-outset-lg">
    <HeaderTabs />
    <HeaderTools />
    <LoaderElement v-if="recruitmentStore.loading" text="Cargando vacantes y candidatos" />
    <VacanciesTab v-else-if="recruitmentStore.vacancyTabs[RecruitmentTabs.Vacancies]" />
    <CandidatesTab v-else-if="recruitmentStore.vacancyTabs[RecruitmentTabs.Candidates]" />
  </div>
</template>
