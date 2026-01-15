import LoaderElement from '@components/common/LoaderElement.vue';
import CandidatesTab from '@components/recruitment/candidates/CandidatesTab.vue';
import HeaderTabs from '@components/recruitment/HeaderTabs.vue';
import HeaderTools from '@components/recruitment/HeaderTools.vue';
import RecruitmentManagement from '@components/recruitment/RecruitmentManagement.vue';
import VacanciesTab from '@components/recruitment/vacancies/VacanciesTab.vue';
import { VacancyStatus, VacancyStatusText } from '@domain/VacancyStatus';
import apiService from '@services/apiService';
import { useRecruitmentStore } from '@stores/recruitment';
import { RecruitmentTabs } from '@typesOrigin/recruitment';
import { flushPromises, mount, shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const mockResponse = [{ id: '1', name: VacancyStatusText.Default, order: 1, companyId: '123', vacancyId: '456', index: 0 }];
const mockCandidatesResponse = [{ id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', vacancyId: 'vacancyId', statusId: 'statusId' }];
const mockError = new Error('Network Error');

vi.mock('@services/apiService', () => ({
  default: {
    fetchCandidatureStatuses: vi.fn().mockResolvedValue([]),
    fetchCandidates: vi.fn().mockResolvedValue([]),
  },
}));

describe('RecruitmentManagement', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  test('Should mount', () => {
    const wrapper = shallowMount(RecruitmentManagement);
    expect(wrapper).toBeDefined();
  });

  test('Should call apiService.fetchCandidatureStatuses and apiService.fetchCandidates on mount and update the store', async () => {
    const recruitmentStore = useRecruitmentStore();

    vi.mocked(apiService.fetchCandidatureStatuses).mockResolvedValueOnce(mockResponse);
    vi.mocked(apiService.fetchCandidates).mockResolvedValueOnce(mockCandidatesResponse);

    const wrapper = mount(RecruitmentManagement);

    await wrapper.vm.$nextTick();

    await flushPromises();

    expect(apiService.fetchCandidatureStatuses).toHaveBeenCalled();
    expect(apiService.fetchCandidates).toHaveBeenCalled();
    expect(recruitmentStore.vacancyStatusList.statuses[0]).toEqual(new VacancyStatus(mockResponse[0]));
    expect(recruitmentStore.candidateList.candidates[0].firstName).toBe(mockCandidatesResponse[0].firstName);
  });

  test('Should handle errors from apiService.fetchCandidatureStatuses and apiService.fetchCandidates', async () => {
    vi.mocked(apiService.fetchCandidatureStatuses).mockRejectedValueOnce(mockError);
    vi.mocked(apiService.fetchCandidates).mockRejectedValueOnce(mockError);

    const wrapper = shallowMount(RecruitmentManagement);

    await wrapper.vm.$nextTick();

    await flushPromises();

    expect(apiService.fetchCandidatureStatuses).toHaveBeenCalled();
    expect(apiService.fetchCandidates).toHaveBeenCalled();
  });

  test('Should render LoaderElement while loading', async () => {
    const recruitmentStore = useRecruitmentStore();
    recruitmentStore.loading = true;

    const wrapper = shallowMount(RecruitmentManagement);

    const loader = wrapper.findComponent(LoaderElement);
    expect(loader.exists()).toBe(true);
  });

  test('Should render HeaderTabs component', () => {
    const wrapper = shallowMount(RecruitmentManagement);
    const headerTabs = wrapper.findComponent(HeaderTabs);
    expect(headerTabs.exists()).toBe(true);
  });

  test('Should render HeaderTools component', () => {
    const wrapper = shallowMount(RecruitmentManagement);
    const headerTools = wrapper.findComponent(HeaderTools);
    expect(headerTools.exists()).toBe(true);
  });

  test('Should render VacanciesTab component when Vacancies tab is active', async () => {
    vi.mocked(apiService.fetchCandidatureStatuses).mockResolvedValueOnce(mockResponse);
    const recruitmentStore = useRecruitmentStore();
    recruitmentStore.vacancyTabs = {
      [RecruitmentTabs.Vacancies]: true,
      [RecruitmentTabs.Candidates]: false,
    };

    const wrapper = mount(RecruitmentManagement);

    await flushPromises();

    const vacanciesTab = wrapper.findComponent(VacanciesTab);
    expect(vacanciesTab.exists()).toBe(true);
  });

  test('Should render CandidatesTab component when Candidates tab is active', async () => {
    vi.mocked(apiService.fetchCandidatureStatuses).mockResolvedValueOnce(mockResponse);
    const recruitmentStore = useRecruitmentStore();
    recruitmentStore.vacancyTabs = {
      [RecruitmentTabs.Vacancies]: false,
      [RecruitmentTabs.Candidates]: true,
    };

    const wrapper = mount(RecruitmentManagement);
    await flushPromises();
    const candidatesTab = wrapper.findComponent(CandidatesTab);

    expect(candidatesTab.exists()).toBe(true);
  });
});
