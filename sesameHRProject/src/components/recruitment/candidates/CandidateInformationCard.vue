<script setup lang="ts">
import type { Candidate } from '@domain/Candidate';
import { formatDate } from 'src/utils/dateUtils';

interface CandidateCardProps {
  candidate: Candidate;
}

defineProps<CandidateCardProps>();
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-row gap-1 items-center">
      <img :src="`src/images/icon-clock.svg`" class="h-[16px] w-[16px]" />
      <span class="text-sm text-primary-grey">{{ formatDate(candidate.createdAt as string) }}</span>
    </div>
    <div class="flex flex-col items-start gap-1">
      <span class="text-secondary-blue font-bold text-lg">Nombre:</span>
      <span>{{ candidate.firstName }}</span>
    </div>
    <div class="flex flex-col items-start gap-1">
      <span class="text-secondary-blue font-bold text-lg">Apellidos:</span>
      <span>{{ candidate.lastName }}</span>
    </div>
    <div class="flex flex-col items-start gap-1">
      <span class="text-secondary-blue font-bold text-lg">Email:</span>
      <a :href="`mailto:${candidate.email}`" class="text-blue-500 hover:underline">
        {{ candidate.email }}
      </a>
    </div>
    <div v-if="candidate.phone" class="flex flex-col items-start gap-1">
      <span class="text-secondary-blue font-bold text-lg">Telefono:</span>
      <span>{{ candidate.phone }}</span>
    </div>
    <div v-if="candidate.linkedInURL" class="flex flex-col items-start gap-1">
      <span class="text-secondary-blue font-bold text-lg">LinkedIn:</span>
      <a :href="candidate.linkedInURL" class="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
        {{ candidate.linkedInURL }}
      </a>
    </div>
    <div v-if="candidate.desiredSalary" class="flex flex-col items-start gap-1">
      <span class="text-secondary-blue font-bold text-lg">Salario deseado:</span>
      <span>{{ candidate.desiredSalary }}</span>
    </div>
    <div v-if="candidate.web" class="flex flex-col items-start gap-1">
      <span class="text-secondary-blue font-bold text-lg">Website/GitHub:</span>
      <a :href="candidate.web" class="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
        {{ candidate.web }}
      </a>
    </div>
    <div v-if="candidate.location" class="flex flex-col items-start gap-1">
      <span class="text-secondary-blue font-bold text-lg">Localización:</span>
      <span>{{ candidate.location }}</span>
    </div>
    <div v-if="candidate.startWorkDate" class="flex flex-col items-start gap-1">
      <span class="text-secondary-blue font-bold text-lg">Dia deseado de comienzo:</span>
      <span>{{ formatDate(candidate.startWorkDate) }}</span>
    </div>
  </div>
</template>
