import { Candidate, type CandidateInformation } from './Candidate';

export class AllCandidates {
  candidates: Candidate[];

  constructor(data?: CandidateInformation[]) {
    this.candidates = data ? data.map((candidate) => new Candidate(candidate)) : [];
  }

  getCandidatesOrdered() {
    this.candidates.sort((a, b) => {
      const dateA = new Date(a.updatedAt as string).getTime();
      const dateB = new Date(b.updatedAt as string).getTime();
      return dateB - dateA;
    });
  }

  getCandidatesByStatusId(statusId: string): Candidate[] {
    this.getCandidatesOrdered();

    return this.candidates.filter((candidate) => candidate.statusId === statusId);
  }

  findCandidateById(id: string): Candidate | void {
    return this.candidates.find((candidate) => candidate.id === id);
  }

  findCandidateIndex(candidate: Candidate): number {
    return this.candidates.findIndex((indexCandidate) => indexCandidate.id === candidate.id) ?? -1;
  }

  addCandidate(candidate: Candidate) {
    if (candidate.id && !this.findCandidateById(candidate.id)) this.candidates.push(candidate);
  }

  editCandidate(candidate: Candidate) {
    if (this.findCandidateIndex(candidate) !== -1) {
      this.candidates[this.findCandidateIndex(candidate)] = candidate;
    }
  }
}
