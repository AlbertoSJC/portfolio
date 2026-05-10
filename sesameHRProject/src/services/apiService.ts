import type { CandidateInformation } from '@domain/Candidate';
import { VacancyStatusText, type VacancyStatusInformation } from '@domain/VacancyStatus';
import axios from 'axios';
import { ENV_VARIABLES } from 'src/env.js';

const mainHeader = {
  accept: 'application/json',
  Authorization: `Bearer ${ENV_VARIABLES.PUBLIC_API_TOKEN}`,
};

const useMockApi = ENV_VARIABLES.PUBLIC_USE_MOCK_API;
const defaultVacancyId = ENV_VARIABLES.PUBLIC_VACANCY_ID || '456';

const mockVacancyStatuses: VacancyStatusInformation[] = [
  {
    id: '1',
    name: VacancyStatusText.New,
    order: 1,
    companyId: '123',
    vacancyId: defaultVacancyId,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
  },
  {
    id: '2',
    name: VacancyStatusText.InProgress,
    order: 2,
    companyId: '123',
    vacancyId: defaultVacancyId,
    createdAt: new Date('2023-01-03'),
    updatedAt: new Date('2023-01-04'),
  },
  {
    id: '3',
    name: VacancyStatusText.Offer,
    order: 3,
    companyId: '123',
    vacancyId: defaultVacancyId,
    createdAt: new Date('2023-01-05'),
    updatedAt: new Date('2023-01-06'),
  },
  {
    id: '4',
    name: VacancyStatusText.Selected,
    order: 4,
    companyId: '123',
    vacancyId: defaultVacancyId,
    createdAt: new Date('2023-01-07'),
    updatedAt: new Date('2023-01-08'),
  },
  {
    id: '5',
    name: VacancyStatusText.Discarded,
    order: 5,
    companyId: '123',
    vacancyId: defaultVacancyId,
    createdAt: new Date('2023-01-09'),
    updatedAt: new Date('2023-01-10'),
  },
];

const initialMockCandidates: CandidateInformation[] = [
  {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa3',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: 123456789,
    linkedInURL: 'https://linkedin.com/in/johndoe',
    desiredSalary: 50000,
    startWorkDate: '2025-05-01',
    web: 'https://johndoe.com',
    location: 'New York',
    vacancyId: defaultVacancyId,
    statusId: mockVacancyStatuses[0].id,
    createdAt: new Date('2025-01-01').toISOString(),
    updatedAt: new Date('2025-01-02').toISOString(),
  },
];

const mockCandidates: CandidateInformation[] = initialMockCandidates.map((candidate) => ({ ...candidate }));

const delay = (milliseconds = 250) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const mockApi = {
  async fetchCandidatureStatuses(): Promise<VacancyStatusInformation[]> {
    await delay();
    return mockVacancyStatuses.map((status) => ({ ...status }));
  },

  async fetchCandidates(): Promise<CandidateInformation[]> {
    await delay();
    return mockCandidates.map((candidate) => ({ ...candidate }));
  },

  async saveCandidate(candidate: CandidateInformation): Promise<CandidateInformation> {
    await delay();

    const newCandidate: CandidateInformation = {
      ...candidate,
      id: candidate.id || createId(),
      vacancyId: candidate.vacancyId || defaultVacancyId,
      createdAt: candidate.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existingIndex = mockCandidates.findIndex((current) => current.id === newCandidate.id);

    if (existingIndex >= 0) {
      mockCandidates[existingIndex] = { ...newCandidate };
    } else {
      mockCandidates.push({ ...newCandidate });
    }

    return { ...newCandidate };
  },

  async editCandidate(candidate: CandidateInformation): Promise<CandidateInformation> {
    await delay();

    if (!candidate.id) {
      throw new Error('Candidate id is required for edit');
    }

    const index = mockCandidates.findIndex((current) => current.id === candidate.id);
    if (index < 0) {
      throw new Error('Candidate not found');
    }

    mockCandidates[index] = {
      ...mockCandidates[index],
      ...candidate,
      updatedAt: new Date().toISOString(),
    };

    return { ...mockCandidates[index] };
  },

  resetMockData() {
    mockCandidates.splice(0, mockCandidates.length, ...initialMockCandidates.map((candidate) => ({ ...candidate })));
  },
};

const realApi = {
  async fetchCandidatureStatuses(): Promise<VacancyStatusInformation[]> {
    try {
      const response = await axios.get(`${ENV_VARIABLES.PUBLIC_BASE_API_URL}/recruitment/v1/candidate-status/${ENV_VARIABLES.PUBLIC_VACANCY_ID}`, {
        headers: mainHeader,
      });

      return response.data.data;
    } catch (error) {
      console.log('Error fetching statuses:', error);
      throw error;
    }
  },

  async fetchCandidates(): Promise<CandidateInformation[]> {
    try {
      const response = await axios.get(`${ENV_VARIABLES.PUBLIC_BASE_API_URL}/recruitment/v1/vacancies/${ENV_VARIABLES.PUBLIC_VACANCY_ID}/candidates`, {
        headers: mainHeader,
      });

      return response.data.data;
    } catch (error) {
      console.log('Error fetching candidates:', error);
      throw error;
    }
  },

  async saveCandidate(candidate: CandidateInformation): Promise<CandidateInformation> {
    try {
      const response = await axios.post(`${ENV_VARIABLES.PUBLIC_BASE_API_URL}/recruitment/v1/candidates`, candidate, {
        headers: mainHeader,
      });
      return response.data.data;
    } catch (error) {
      console.log('Error saving candidate:', error);
      throw error;
    }
  },

  async editCandidate(candidate: CandidateInformation): Promise<CandidateInformation> {
    try {
      const response = await axios.put(`${ENV_VARIABLES.PUBLIC_BASE_API_URL}/recruitment/v1/candidates/${candidate.id}`, candidate, {
        headers: mainHeader,
      });

      return response.data.data;
    } catch (error) {
      console.error('Error editing candidate:', error);
      throw error;
    }
  },
};

const apiService = useMockApi ? mockApi : realApi;

export default apiService;
