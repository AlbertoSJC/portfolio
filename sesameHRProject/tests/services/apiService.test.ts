import apiService from '@services/apiService';
import { mockCandidateData } from '@tests/mocks/candidateMocks';
import { beforeEach, describe, expect, test } from 'vitest';

describe('apiService', () => {
  beforeEach(() => {
    (apiService as { resetMockData?: () => void }).resetMockData?.();
  });

  test('should fetch candidature statuses successfully', async () => {
    const result = await apiService.fetchCandidatureStatuses();

    expect(result).toHaveLength(5);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('vacancyId');
  });

  test('should fetch candidates successfully', async () => {
    const result = await apiService.fetchCandidates();

    expect(result).toHaveLength(1);
    expect(result[0].firstName).toBe('John');
    expect(result[0].email).toBe('john.doe@example.com');
  });

  test('should save a candidate successfully', async () => {
    const result = await apiService.saveCandidate(mockCandidateData);

    expect(result).toMatchObject({
      firstName: mockCandidateData.firstName,
      lastName: mockCandidateData.lastName,
      email: mockCandidateData.email,
    });
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeDefined();
  });

  test('should edit a candidate successfully', async () => {
    const updatedCandidate = {
      ...mockCandidateData,
      firstName: 'Updated Name',
    };

    const result = await apiService.editCandidate(updatedCandidate);

    expect(result.id).toBe(mockCandidateData.id);
    expect(result.firstName).toBe('Updated Name');
  });
});
