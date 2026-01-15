<script setup lang="ts">
import RecruitmentManagement from './RecruitmentManagement.vue';
</script>

<template>
  <div id="recruitment-container" class="w-[75%] h-full flex flex-col p-5 gap-4 min-w-0">
    <div class="flex flex-row justify-between">
      <h1 class="text-5xl font-bold text-secondary-blue">Reclutamiento</h1>
      <img src="/src/images/profile-image.jpg" class="rounded-[50%] max-h-[50px] max-w-[50px] min-h-[50px] min-w-[50px]" />
    </div>
    <RecruitmentManagement />
  </div>
</template>
