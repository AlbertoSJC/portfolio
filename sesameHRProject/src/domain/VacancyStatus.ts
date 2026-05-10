export enum VacancyStatusText {
  New = 'New',
  InProgress = 'In progress',
  Offer = 'Offer',
  Selected = 'Selected',
  Discarded = 'Discarded',
  Default = 'Default',
}

export interface VacancyStatusInformation {
  id: string;
  name: VacancyStatusText;
  order: number;
  companyId: string;
  vacancyId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class VacancyStatus implements VacancyStatusInformation {
  id: string;
  name: VacancyStatusText;
  order: number;
  companyId: string;
  vacancyId: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: VacancyStatusInformation) {
    this.id = data.id;
    this.name = data.name;
    this.order = data.order;
    this.companyId = data.companyId;
    this.vacancyId = data.vacancyId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
