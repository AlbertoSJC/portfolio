import { AllCandidates } from '@domain/AllCandidates';
import { Candidate, type CandidateInformation } from '@domain/Candidate';

const mockData: CandidateInformation[] = [
  { id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', vacancyId: 'idVacacy', statusId: 'statusId' },
  { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', vacancyId: 'idVacacy2', statusId: 'statusId2' },
];

describe('AllCandidates', () => {
  let allCandidates: AllCandidates;

  beforeEach(() => {
    allCandidates = new AllCandidates();
  });

  test('Should initialize with an empty candidates array if no data is provided', () => {
    expect(allCandidates.candidates).toEqual([]);
  });

  test('Should initialize with candidates if data is provided', () => {
    allCandidates = new AllCandidates(mockData);

    expect(allCandidates.candidates.length).toBe(2);
    expect(allCandidates.candidates[0].id).toBe('1');
    expect(allCandidates.candidates[1].id).toBe('2');
  });

  test('Should find a candidate by ID', () => {
    allCandidates = new AllCandidates(mockData);

    const candidate = allCandidates.findCandidateById('1');
    expect(candidate).toBeDefined();
    expect(candidate?.id).toBe('1');
  });

  test('Should return undefined if candidate is not found by ID', () => {
    allCandidates = new AllCandidates(mockData);

    const candidate = allCandidates.findCandidateById('3');
    expect(candidate).toBeUndefined();
  });

  test('Should find the index of a candidate', () => {
    allCandidates = new AllCandidates(mockData);

    const candidate = new Candidate(mockData[0]);
    const index = allCandidates.findCandidateIndex(candidate);
    expect(index).toBe(0);
  });

  test('Should return -1 if candidate index is not found', () => {
    allCandidates = new AllCandidates(mockData);

    const candidate = new Candidate({ id: '7', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', vacancyId: 'idVacacy', statusId: 'statusId' });
    const index = allCandidates.findCandidateIndex(candidate);
    expect(index).toBe(-1);
  });

  test('Should add a candidate to the candidates array', () => {
    const candidate = new Candidate({ id: '3', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', vacancyId: 'idVacacy', statusId: 'statusId' });
    allCandidates.addCandidate(candidate);

    expect(allCandidates.candidates.length).toBe(1);
    expect(allCandidates.candidates[0].id).toBe('3');
  });

  test('Should edit an existing candidate', () => {
    allCandidates = new AllCandidates(mockData);

    const updatedCandidate = new Candidate({ id: '1', firstName: 'John', lastName: 'Updated', email: 'john.updated@example.com', vacancyId: 'idVacacy', statusId: 'statusId' });
    allCandidates.editCandidate(updatedCandidate);

    expect(allCandidates.candidates[0].lastName).toBe('Updated');
    expect(allCandidates.candidates[0].email).toBe('john.updated@example.com');
  });

  test('Should not edit a candidate if it does not exist', () => {
    allCandidates = new AllCandidates(mockData);

    const nonExistentCandidate = new Candidate({ id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', vacancyId: 'idVacacy2', statusId: 'statusId2' });
    allCandidates.editCandidate(nonExistentCandidate);

    expect(allCandidates.candidates[0].id).toBe('1');
  });
});
