import { Candidate } from '@domain/Candidate';
import { mockCandidateData, mockPartialCandidateData } from '@tests/mocks/candidateMocks';
import { describe, expect, test } from 'vitest';

describe('Candidate', () => {
  test('should create a Candidate instance with all properties', () => {
    const candidate = new Candidate(mockCandidateData);

    expect(candidate.firstName).toBe(mockCandidateData.firstName);
    expect(candidate.lastName).toBe(mockCandidateData.lastName);
    expect(candidate.email).toBe(mockCandidateData.email);
    expect(candidate.phone).toBe(mockCandidateData.phone);
    expect(candidate.linkedInURL).toBe(mockCandidateData.linkedInURL);
    expect(candidate.desiredSalary).toBe(mockCandidateData.desiredSalary);
    expect(candidate.startWorkDate).toBe(mockCandidateData.startWorkDate);
    expect(candidate.web).toBe(mockCandidateData.web);
    expect(candidate.location).toBe(mockCandidateData.location);
    expect(candidate.vacancyId).toBe(mockCandidateData.vacancyId);
    expect(candidate.statusId).toBe(mockCandidateData.statusId);
  });

  test('should handle optional properties being undefined', () => {
    const candidate = new Candidate(mockPartialCandidateData);

    expect(candidate.firstName).toBe(mockPartialCandidateData.firstName);
    expect(candidate.lastName).toBe(mockPartialCandidateData.lastName);
    expect(candidate.email).toBe(mockPartialCandidateData.email);
    expect(candidate.phone).toBeUndefined();
    expect(candidate.linkedInURL).toBeUndefined();
    expect(candidate.desiredSalary).toBeUndefined();
    expect(candidate.startWorkDate).toBeUndefined();
    expect(candidate.web).toBeUndefined();
    expect(candidate.location).toBeUndefined();
    expect(candidate.vacancyId).toBe(mockPartialCandidateData.vacancyId);
    expect(candidate.statusId).toBe(mockPartialCandidateData.statusId);
  });

  test('should convert Candidate instance to API JSON format', () => {
    const candidate = new Candidate({
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: 123456789,
      linkedInURL: 'https://linkedin.com/in/johndoe',
      desiredSalary: 50000,
      startWorkDate: '2025-04-05',
      web: 'https://johndoe.com',
      location: 'USA',
      vacancyId: 'vacancy-123',
      statusId: 'status-456',
    });

    const apiJson = candidate.toApiJson();

    expect(apiJson).toEqual({
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '123456789',
      linkedInURL: 'https://linkedin.com/in/johndoe',
      desiredSalary: '50000',
      startWorkDate: '2025-04-05',
      web: 'https://johndoe.com',
      location: 'USA',
      vacancyId: 'vacancy-123',
      statusId: 'status-456',
    });
  });

  test('should handle undefined optional properties in toApiJson', () => {
    const candidate = new Candidate({
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      vacancyId: 'vacancy-789',
      statusId: 'status-101',
    });

    const apiJson = candidate.toApiJson();

    expect(apiJson).toEqual({
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: 'undefined',
      linkedInURL: undefined,
      desiredSalary: 'undefined',
      startWorkDate: undefined,
      web: undefined,
      location: undefined,
      vacancyId: 'vacancy-789',
      statusId: 'status-101',
    });
  });
});
