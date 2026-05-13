import { AllVacancyStatus } from '@domain/AllVacancyStatus';
import { VacancyStatus, VacancyStatusText } from '@domain/VacancyStatus';

describe('AllVacancyStatus', () => {
  let allVacancyStatus: AllVacancyStatus;

  beforeEach(() => {
    allVacancyStatus = new AllVacancyStatus();
  });

  test('Should initialize with an empty statuses array if no data is provided', () => {
    expect(allVacancyStatus.statuses).toEqual([]);
  });

  test('Should initialize with statuses if data is provided', () => {
    const mockData = [
      { id: '1', name: VacancyStatusText.New, order: 1, companyId: 'company1', vacancyId: 'vacancy1' },
      { id: '2', name: VacancyStatusText.InProgress, order: 2, companyId: 'company2', vacancyId: 'vacancy2' },
    ];
    allVacancyStatus = new AllVacancyStatus(mockData);

    expect(allVacancyStatus.statuses.length).toBe(2);
    expect(allVacancyStatus.statuses[0].id).toBe('1');
    expect(allVacancyStatus.statuses[1].id).toBe('2');
  });

  test('Should find a status by ID', () => {
    const mockData = [
      { id: '1', name: VacancyStatusText.New, order: 1, companyId: 'company1', vacancyId: 'vacancy1' },
      { id: '2', name: VacancyStatusText.InProgress, order: 2, companyId: 'company2', vacancyId: 'vacancy2' },
    ];
    allVacancyStatus = new AllVacancyStatus(mockData);

    const status = allVacancyStatus.findStatusById('1');
    expect(status).toBeDefined();
    expect(status?.id).toBe('1');
  });

  test('Should return undefined if status is not found by ID', () => {
    const mockData = [{ id: '1', name: VacancyStatusText.New, order: 1, companyId: 'company1', vacancyId: 'vacancy1' }];
    allVacancyStatus = new AllVacancyStatus(mockData);

    const status = allVacancyStatus.findStatusById('2');
    expect(status).toBeUndefined();
  });

  test('Should find the index of a status', () => {
    const mockData = [
      { id: '1', name: VacancyStatusText.New, order: 1, companyId: 'company1', vacancyId: 'vacancy1' },
      { id: '2', name: VacancyStatusText.InProgress, order: 2, companyId: 'company2', vacancyId: 'vacancy2' },
    ];
    allVacancyStatus = new AllVacancyStatus(mockData);

    const status = new VacancyStatus({ id: '1', name: VacancyStatusText.New, order: 1, companyId: 'company1', vacancyId: 'vacancy1' });
    const index = allVacancyStatus.findStatusIndex(status);
    expect(index).toBe(0);
  });

  test('Should return -1 if status index is not found', () => {
    const mockData = [{ id: '1', name: VacancyStatusText.New, order: 1, companyId: 'company1', vacancyId: 'vacancy1' }];
    allVacancyStatus = new AllVacancyStatus(mockData);

    const status = new VacancyStatus({ id: '2', name: VacancyStatusText.InProgress, order: 2, companyId: 'company2', vacancyId: 'vacancy2' });
    const index = allVacancyStatus.findStatusIndex(status);
    expect(index).toBe(-1);
  });

  test('Should add a status to the statuses array', () => {
    const status = new VacancyStatus({ id: '1', name: VacancyStatusText.New, order: 1, companyId: 'company1', vacancyId: 'vacancy1' });
    allVacancyStatus.addStatus(status);

    expect(allVacancyStatus.statuses.length).toBe(1);
    expect(allVacancyStatus.statuses[0].id).toBe('1');
  });

  test('Should edit an existing status', () => {
    const mockData = [{ id: '1', name: VacancyStatusText.New, order: 1, companyId: 'company1', vacancyId: 'vacancy1' }];
    allVacancyStatus = new AllVacancyStatus(mockData);

    const updatedStatus = new VacancyStatus({ id: '1', name: VacancyStatusText.Offer, order: 1, companyId: 'company1', vacancyId: 'vacancy1' });
    allVacancyStatus.editStatus(updatedStatus);

    expect(allVacancyStatus.statuses[0].name).toBe(VacancyStatusText.Offer);
  });

  test('Should not edit a status if it does not exist', () => {
    const mockData = [{ id: '1', name: VacancyStatusText.New, order: 1, companyId: 'company1', vacancyId: 'vacancy1' }];
    allVacancyStatus = new AllVacancyStatus(mockData);

    const nonExistentStatus = new VacancyStatus({ id: '2', name: VacancyStatusText.InProgress, order: 2, companyId: 'company2', vacancyId: 'vacancy2' });
    allVacancyStatus.editStatus(nonExistentStatus);

    expect(allVacancyStatus.statuses.length).toBe(1);
    expect(allVacancyStatus.statuses[0].id).toBe('1');
  });
});
