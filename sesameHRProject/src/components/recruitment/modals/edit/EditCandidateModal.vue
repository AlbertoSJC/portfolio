<script setup lang="ts">
import ModalContainer from '@components/common/ModalContainer.vue';
import { ModalIds } from '@stores/modals';
import CandidateForm from '../CandidateForm.vue';
import HeaderEditCandidate from './HeaderEditCandidate.vue';
</script>

<template>
  <ModalContainer classes="!w-[40%]" :modalId="ModalIds.EditCandidate">
    <HeaderEditCandidate />
    <CandidateForm />
  </ModalContainer>
</template>
