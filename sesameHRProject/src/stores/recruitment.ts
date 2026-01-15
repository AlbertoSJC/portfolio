import { AllCandidates } from '@domain/AllCandidates';
import { AllVacancyStatus } from '@domain/AllVacancyStatus';
import { Candidate } from '@domain/Candidate';
import { VacancyStatus } from '@domain/VacancyStatus';
import apiService from '@services/apiService';
import { ModalFormSuccess, RecruitmentTabs, type SchemaCandidateErrors } from '@typesOrigin/recruitment.js';
import { defineStore } from 'pinia';
import { ENV_VARIABLES } from 'src/env';
import { computed, ref } from 'vue';
import { candidateSchema } from './validation/SchemaCandidateValidation';

export const useRecruitmentStore = defineStore('recruitment', () => {
  const loading = ref<boolean>(true);
  const formStatus = ref<ModalFormSuccess | null>(null);
  const recruitmentFilterInput = ref<string>('');
  const vacancyStatusList = ref<AllVacancyStatus>(new AllVacancyStatus());
  const candidateList = ref<AllCandidates>(new AllCandidates());
  const candidateToUpload = ref<Candidate>(new Candidate());
  const candidateBeingDragged = ref<Candidate | null>(null);
  const errors = ref<Partial<SchemaCandidateErrors> | null>(null);
  const vacancyTabs = ref<Record<RecruitmentTabs, boolean>>({
    [RecruitmentTabs.Vacancies]: true,
    [RecruitmentTabs.Candidates]: false,
  });
  const filteredCandidates = computed(() => {
    const filter = recruitmentFilterInput.value.toLowerCase();
    if (!filter) return candidateList.value.candidates;

    return candidateList.value.candidates.filter((candidate) => candidate.firstName?.toLowerCase().includes(filter) || candidate.lastName?.toLowerCase().includes(filter));
  });

  const createCandidateToUpload = () => {
    errors.value = null;
    candidateToUpload.value = new Candidate();
    candidateToUpload.value.statusId = vacancyStatusList.value.statuses.length > 0 ? vacancyStatusList.value.statuses[0].id : '';
    candidateToUpload.value.vacancyId = ENV_VARIABLES.PUBLIC_VACANCY_ID;
  };

  const validateCandidate = () => {
    const result = candidateSchema.safeParse(candidateToUpload.value);

    if (!result.success) {
      errors.value = result.error.flatten().fieldErrors;
    } else {
      errors.value = null;
    }
  };

  const clearError = (key: string) => {
    if (errors.value?.[key as keyof SchemaCandidateErrors]) {
      delete errors.value?.[key as keyof SchemaCandidateErrors];
    }

    if (errors.value && Object.keys(errors.value).length === 0) {
      errors.value = null;
    }
  };

  const fetchVacancyStatuses = async () => {
    await apiService
      .fetchCandidatureStatuses()
      .then((response) => {
        response.map((status) => {
          vacancyStatusList.value.addStatus(new VacancyStatus(status));
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const fetchCandidates = async () => {
    await apiService
      .fetchCandidates()
      .then((response) => {
        candidateList.value = new AllCandidates(response);
        candidateList.value.getCandidatesOrdered();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const saveCandidate = async () => {
    validateCandidate();
    if (!errors.value) {
      await apiService
        .saveCandidate(candidateToUpload.value.toApiJson())
        .then((response) => {
          candidateList.value.addCandidate(new Candidate(response));
          candidateList.value.getCandidatesOrdered();
          candidateToUpload.value = new Candidate();
          formStatus.value = ModalFormSuccess.Success;
        })
        .catch((error) => {
          console.log(error);
          formStatus.value = ModalFormSuccess.Failure;
        });
    }
  };

  const editCandidate = async () => {
    validateCandidate();
    if (!errors.value) {
      await apiService
        .editCandidate(candidateToUpload.value.toApiJson())
        .then((response) => {
          candidateList.value.editCandidate(new Candidate(response));
          candidateList.value.getCandidatesOrdered();
          formStatus.value = ModalFormSuccess.Success;
        })
        .catch((error) => {
          console.log(error);
          formStatus.value = ModalFormSuccess.Failure;
        });
    }
  };

  return {
    errors,
    loading,
    formStatus,
    vacancyStatusList,
    vacancyTabs,
    recruitmentFilterInput,
    candidateToUpload,
    candidateList,
    candidateBeingDragged,
    filteredCandidates,

    fetchVacancyStatuses,
    fetchCandidates,
    saveCandidate,
    editCandidate,
    createCandidateToUpload,
    validateCandidate,
    clearError,
  };
});
