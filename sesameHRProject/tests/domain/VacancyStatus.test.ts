import { VacancyStatus, VacancyStatusText, type VacancyStatusInformation } from '@domain/VacancyStatus';
import { describe, expect, test } from 'vitest';

describe('VacancyStatus', () => {
  test('should correctly initialize properties from VacancyStatusInformation', () => {
    const data: VacancyStatusInformation = {
      id: '123',
      name: VacancyStatusText.Default,
      order: 1,
      companyId: '456',
      vacancyId: '789',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
    };

    const vacancyStatus = new VacancyStatus(data);

    expect(vacancyStatus.id).toBe(data.id);
    expect(vacancyStatus.name).toBe(data.name);
    expect(vacancyStatus.order).toBe(data.order);
    expect(vacancyStatus.companyId).toBe(data.companyId);
    expect(vacancyStatus.vacancyId).toBe(data.vacancyId);
    expect(vacancyStatus.createdAt).toEqual(data.createdAt);
    expect(vacancyStatus.updatedAt).toEqual(data.updatedAt);
  });

  test('should handle optional fields correctly', () => {
    const data: VacancyStatusInformation = {
      id: '123',
      name: VacancyStatusText.Selected,
      order: 2,
      companyId: '456',
      vacancyId: '789',
    };

    const vacancyStatus = new VacancyStatus(data);

    expect(vacancyStatus.id).toBe(data.id);
    expect(vacancyStatus.name).toBe(data.name);
    expect(vacancyStatus.order).toBe(data.order);
    expect(vacancyStatus.companyId).toBe(data.companyId);
    expect(vacancyStatus.vacancyId).toBe(data.vacancyId);
    expect(vacancyStatus.createdAt).toBeUndefined();
    expect(vacancyStatus.updatedAt).toBeUndefined();
  });
});
