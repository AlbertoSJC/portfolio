import { AllCandidates } from '@domain/AllCandidates';
import { AllVacancyStatus } from '@domain/AllVacancyStatus';
import { Candidate } from '@domain/Candidate';
import { useRecruitmentStore } from '@stores/recruitment';
import { mockCandidateData, mockPartialCandidateData } from '@tests/mocks/candidateMocks';
import { mockVacancyStatuses } from '@tests/mocks/vacancyMocks';
import { RecruitmentTabs } from '@typesOrigin/recruitment';
import apiService from '@services/apiService';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('@services/apiService');

describe('useRecruitmentStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  test('should initialize with default state', () => {
    const store = useRecruitmentStore();

    expect(store.loading).toBe(true);
    expect(store.vacancyStatusList).toStrictEqual(new AllVacancyStatus());
    expect(store.candidateList).toStrictEqual(new AllCandidates());
    expect(store.vacancyTabs).toEqual({
      [RecruitmentTabs.Vacancies]: true,
      [RecruitmentTabs.Candidates]: false,
    });
  });

  test('should create a new candidate with default values', () => {
    const store = useRecruitmentStore();

    store.createCandidateToUpload();

    expect(store.candidateToUpload).toBeInstanceOf(Candidate);
    expect(store.candidateToUpload.vacancyId).toBe('');
    expect(store.candidateToUpload.statusId).toBe('');
  });

  test('should validate candidate correctly', () => {
    const store = useRecruitmentStore();

    // Invalid candidate
    store.candidateToUpload.firstName = '';
    store.candidateToUpload.lastName = '';
    store.validateCandidate();
    expect(store.errors).toBeTruthy();
    expect(store.errors?.firstName).toContain('First name is required');
    expect(store.errors?.lastName).toContain('Last name is required');

    // Valid candidate
    store.candidateToUpload.firstName = 'John';
    store.candidateToUpload.lastName = 'Doe';
    store.candidateToUpload.email = 'john.doe@example.com';
    store.candidateToUpload.vacancyId = '123';
    store.candidateToUpload.statusId = '456';
    store.validateCandidate();
    expect(store.errors).toBeNull();
  });

  test('should clear specific error correctly', () => {
    const store = useRecruitmentStore();

    store.errors = { firstName: ['First name is required'], lastName: ['Last name is required'] };
    store.clearError('firstName');
    expect(store.errors?.firstName).toBeUndefined();
    expect(store.errors?.lastName).toBeDefined();

    store.clearError('lastName');
    expect(store.errors).toBeNull();
  });

  test('should fetch vacancy statuses and update the store', async () => {
    const store = useRecruitmentStore();
    vi.mocked(apiService.fetchCandidatureStatuses).mockResolvedValueOnce(mockVacancyStatuses);

    await store.fetchVacancyStatuses();

    expect(apiService.fetchCandidatureStatuses).toHaveBeenCalled();
    expect(store.vacancyStatusList.statuses).toHaveLength(mockVacancyStatuses.length);
  });

  test('should fetch candidates and update the store', async () => {
    const store = useRecruitmentStore();
    vi.mocked(apiService.fetchCandidates).mockResolvedValueOnce([mockCandidateData]);

    await store.fetchCandidates();

    expect(apiService.fetchCandidates).toHaveBeenCalled();
    expect(store.candidateList.candidates).toHaveLength(1);
    expect(store.candidateList.candidates[0].firstName).toBe(mockCandidateData.firstName);
  });

  test('should save a candidate and update the store', async () => {
    const store = useRecruitmentStore();
    vi.mocked(apiService.saveCandidate).mockResolvedValueOnce(mockCandidateData);

    store.candidateToUpload = new Candidate(mockPartialCandidateData);
    await store.saveCandidate();

    expect(store.candidateList.candidates).toHaveLength(1);
    expect(store.candidateList.candidates[0].firstName).toBe(mockCandidateData.firstName);
    expect(store.candidateToUpload.firstName).toBeFalsy();
  });

  test('should edit a candidate and update the store', async () => {
    const store = useRecruitmentStore();
    vi.mocked(apiService.editCandidate).mockResolvedValueOnce(mockCandidateData);

    store.candidateToUpload = new Candidate(mockCandidateData);
    store.candidateToUpload.id = 'idofcandidate';
    store.candidateToUpload.lastName = 'Lasting name';
    store.candidateToUpload.email = 'example@email.com';
    store.candidateList.addCandidate(store.candidateToUpload);
    store.candidateToUpload.firstName = 'Updated Name';

    await store.editCandidate();
    console.log(store.candidateList.candidates);
    expect(store.candidateList.candidates[0].firstName).toBe('Updated Name');
  });
});
