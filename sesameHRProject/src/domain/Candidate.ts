export interface CandidateInformation {
  id?: string;
  firstName: string;
  lastName: string;
  vacancyId?: string;
  statusId?: string;
  email: string;
  phone?: string | number;
  linkedInURL?: string;
  desiredSalary?: string | number;
  startWorkDate?: string;
  web?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class Candidate {
  id?: string;
  firstName?: string;
  lastName?: string;
  vacancyId?: string;
  statusId?: string;
  email?: string;
  phone?: number;
  linkedInURL?: string;
  desiredSalary?: number;
  startWorkDate?: string;
  web?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;

  constructor(data?: CandidateInformation) {
    this.id = data?.id;
    this.firstName = data?.firstName;
    this.lastName = data?.lastName;
    this.email = data?.email;
    this.phone = !isNaN(data?.phone as number) ? Number(data?.phone) : undefined;
    this.linkedInURL = data?.linkedInURL;
    this.desiredSalary = !isNaN(data?.desiredSalary as number) ? Number(data?.desiredSalary) : undefined;
    this.startWorkDate = data?.startWorkDate;
    this.web = data?.web;
    this.location = data?.location;
    this.vacancyId = data?.vacancyId;
    this.statusId = data?.statusId;
    this.createdAt = data?.createdAt;
    this.updatedAt = data?.updatedAt;
  }

  toApiJson(): CandidateInformation {
    return {
      id: this.id,
      firstName: this.firstName ?? '',
      lastName: this.lastName ?? '',
      email: this.email ?? '',
      vacancyId: this.vacancyId ?? '',
      statusId: this.statusId ?? '',
      phone: String(this.phone),
      linkedInURL: this.linkedInURL,
      desiredSalary: String(this.desiredSalary),
      startWorkDate: this.startWorkDate,
      web: this.web,
      location: this.location,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
