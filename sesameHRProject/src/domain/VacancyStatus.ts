export enum VacancyStatusText {
  New = 'Nuevo',
  InProgress = 'En proceso',
  Offer = 'Oferta',
  Selected = 'Seleccionado',
  Discarded = 'Descartado',
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
