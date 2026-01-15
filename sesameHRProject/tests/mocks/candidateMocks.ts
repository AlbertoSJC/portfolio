import type { CandidateInformation } from '@domain/Candidate';

export const mockCandidateData: CandidateInformation = {
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
  vacancyId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  statusId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
};

export const mockPartialCandidateData: CandidateInformation = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  vacancyId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  statusId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
};
