<script setup lang="ts">
import DateInput from '@components/common/DateInput.vue';
import NumberInput from '@components/common/NumberInput.vue';
import TextInput from '@components/common/TextInput.vue';
import { useRecruitmentStore } from '@stores/recruitment';

const recruitmentStore = useRecruitmentStore();
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-row justify-between items-start gap-4">
      <TextInput
        label="Primer nombre*"
        v-model="recruitmentStore.candidateToUpload.firstName"
        placeholder="John"
        :width-full="true"
        id="first-name-candidate"
        :required="true"
        :errors="recruitmentStore.errors?.firstName"
        :onInputCallback="() => recruitmentStore.clearError('firstName')"
      />
      <TextInput
        label="Apellidos*"
        v-model="recruitmentStore.candidateToUpload.lastName"
        placeholder="Doe"
        :width-full="true"
        id="last-name-candidate"
        :required="true"
        :errors="recruitmentStore.errors?.lastName"
        :onInputCallback="() => recruitmentStore.clearError('lastName')"
      />
    </div>
    <div class="flex flex-row justify-between items-start gap-4">
      <TextInput
        label="Email*"
        v-model="recruitmentStore.candidateToUpload.email"
        placeholder="example@gmail.com"
        :width-full="true"
        id="email-candidate"
        :required="true"
        :errors="recruitmentStore.errors?.email"
        :onInputCallback="() => recruitmentStore.clearError('email')"
      />
      <NumberInput label="Teléfono (sin extensión)" v-model="recruitmentStore.candidateToUpload.phone" placeholder="000333555" :width-full="true" id="phone-candidate" />
    </div>
    <div class="flex flex-row justify-between items-start gap-4">
      <TextInput
        label="Perfil Linkedin"
        v-model="recruitmentStore.candidateToUpload.linkedInURL"
        placeholder="https://www.linkedin.com/in/your-name/"
        :width-full="true"
        id="linkedin-candidate"
        :errors="recruitmentStore.errors?.linkedInURL"
        :onInputCallback="() => recruitmentStore.clearError('linkedInURL')"
      />
      <NumberInput label="Salario Deseado" v-model="recruitmentStore.candidateToUpload.desiredSalary" placeholder="10000" :width-full="true" id="salary-candidate" />
    </div>
    <div class="flex flex-row justify-between items-start gap-4">
      <TextInput
        label="Web/GitHub link"
        v-model="recruitmentStore.candidateToUpload.web"
        placeholder="https://www.your-web.com"
        :width-full="true"
        id="web-candidate"
        :errors="recruitmentStore.errors?.web"
        :onInputCallback="() => recruitmentStore.clearError('web')"
      />
      <TextInput label="Localización" v-model="recruitmentStore.candidateToUpload.location" placeholder="España" :width-full="true" id="location-candidate" />
    </div>
    <div class="flex flex-row justify-center items-start gap-4">
      <DateInput label="Posible fecha de entrada" v-model="recruitmentStore.candidateToUpload.startWorkDate" id="web-candidate" />
    </div>
  </div>
</template>
