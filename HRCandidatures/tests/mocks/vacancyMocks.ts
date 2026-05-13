import { VacancyStatusText, type VacancyStatusInformation } from '@domain/VacancyStatus';

export const mockVacancyStatuses: VacancyStatusInformation[] = [
  {
    id: '1',
    name: VacancyStatusText.New,
    order: 1,
    companyId: '123',
    vacancyId: '456',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
  },
  {
    id: '2',
    name: VacancyStatusText.InProgress,
    order: 2,
    companyId: '123',
    vacancyId: '456',
    createdAt: new Date('2023-01-03'),
    updatedAt: new Date('2023-01-04'),
  },
  {
    id: '3',
    name: VacancyStatusText.Offer,
    order: 3,
    companyId: '123',
    vacancyId: '456',
    createdAt: new Date('2023-01-05'),
    updatedAt: new Date('2023-01-06'),
  },
  {
    id: '4',
    name: VacancyStatusText.Selected,
    order: 4,
    companyId: '123',
    vacancyId: '456',
    createdAt: new Date('2023-01-07'),
    updatedAt: new Date('2023-01-08'),
  },
  {
    id: '5',
    name: VacancyStatusText.Discarded,
    order: 5,
    companyId: '123',
    vacancyId: '456',
    createdAt: new Date('2023-01-09'),
    updatedAt: new Date('2023-01-10'),
  },
];
