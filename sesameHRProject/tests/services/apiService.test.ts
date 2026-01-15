import apiService from '@services/apiService';
import { mockCandidateData } from '@tests/mocks/candidateMocks';
import axios from 'axios';
import { ENV_VARIABLES } from 'src/env';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('axios');

describe('apiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should fetch candidature statuses successfully', async () => {
    const mockVacancyStatuses = [{ id: '1', name: 'Nuevo', order: 1, companyId: 'company1', vacancyId: 'vacancy1' }];

    vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        data: mockVacancyStatuses,
      },
    });

    const result = await apiService.fetchCandidatureStatuses();

    expect(axios.get).toHaveBeenCalledWith(`${ENV_VARIABLES.PUBLIC_BASE_API_URL}/recruitment/v1/candidate-status/${ENV_VARIABLES.PUBLIC_VACANCY_ID}`, {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${ENV_VARIABLES.PUBLIC_API_TOKEN}`,
      },
    });

    expect(result).toEqual(mockVacancyStatuses);
  });

  test('should fetch candidates successfully', async () => {
    const mockCandidates = [{ id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' }];

    vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        data: mockCandidates,
      },
    });

    const result = await apiService.fetchCandidates();

    expect(axios.get).toHaveBeenCalledWith(`${ENV_VARIABLES.PUBLIC_BASE_API_URL}/recruitment/v1/vacancies/${ENV_VARIABLES.PUBLIC_VACANCY_ID}/candidates`, {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${ENV_VARIABLES.PUBLIC_API_TOKEN}`,
      },
    });

    expect(result).toEqual(mockCandidates);
  });

  test('should save a candidate successfully', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: {
        data: mockCandidateData,
      },
    });

    const result = await apiService.saveCandidate(mockCandidateData);

    expect(axios.post).toHaveBeenCalledWith(`${ENV_VARIABLES.PUBLIC_BASE_API_URL}/recruitment/v1/candidates`, mockCandidateData, {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${ENV_VARIABLES.PUBLIC_API_TOKEN}`,
      },
    });

    expect(result).toEqual(mockCandidateData);
  });

  test('should edit a candidate successfully', async () => {
    vi.mocked(axios.put).mockResolvedValueOnce({
      data: {
        data: mockCandidateData,
      },
    });

    const result = await apiService.editCandidate(mockCandidateData);

    expect(axios.put).toHaveBeenCalledWith(`${ENV_VARIABLES.PUBLIC_BASE_API_URL}/recruitment/v1/candidates/${mockCandidateData.id}`, mockCandidateData, {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${ENV_VARIABLES.PUBLIC_API_TOKEN}`,
      },
    });

    expect(result).toEqual(mockCandidateData);
  });
});
