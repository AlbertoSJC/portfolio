import { VacancyStatus, type VacancyStatusInformation } from './VacancyStatus';

export class AllVacancyStatus {
  statuses: VacancyStatus[];

  constructor(data?: VacancyStatusInformation[]) {
    this.statuses = data ? data.map((vacancy) => new VacancyStatus(vacancy)) : [];
  }

  findStatusById(id: string): VacancyStatus | void {
    return this.statuses.find((vacancy) => vacancy.id === id);
  }

  findStatusIndex(vacancy: VacancyStatus): number {
    return this.statuses.findIndex((indexVacancy) => indexVacancy.id === vacancy.id) ?? -1;
  }

  addStatus(status: VacancyStatus) {
    if (!this.findStatusById(status.id)) this.statuses.push(status);
  }

  editStatus(status: VacancyStatus) {
    if (this.findStatusIndex(status) !== -1) {
      this.statuses[this.findStatusIndex(status)] = status;
    }
  }
}
