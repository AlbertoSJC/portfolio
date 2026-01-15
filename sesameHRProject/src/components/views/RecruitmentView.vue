<script setup lang="ts">
import RecruitmentContainer from '@components/recruitment/RecruitmentContainer.vue';
import CompanySidebar from '@components/sidebar/CompanySidebar.vue';
import DecorativeSidebar from '@components/sidebar/DecorativeSidebar.vue';
</script>

<template>
  <div class="w-full h-full flex flex-row gap-4 bg-secondary-white">
    <CompanySidebar />
    <RecruitmentContainer />
    <DecorativeSidebar />
  </div>
</template>
