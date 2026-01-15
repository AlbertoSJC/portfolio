import type { Candidate, CandidateInformation } from '@domain/Candidate';
import type { VacancyStatus } from '@domain/VacancyStatus';
import axios from 'axios';
import { ENV_VARIABLES } from 'src/env.js';

const mainHeader = {
  accept: 'application/json',
  Authorization: `Bearer ${ENV_VARIABLES.PUBLIC_API_TOKEN}`,
};

const apiService = {
  async fetchCandidatureStatuses(): Promise<VacancyStatus[]> {
    try {
      const response = await axios.get(`${ENV_VARIABLES.PUBLIC_BASE_API_URL}/recruitment/v1/candidate-status/${ENV_VARIABLES.PUBLIC_VACANCY_ID}`, {
        headers: mainHeader,
      });

      return response.data.data;
    } catch (error) {
      console.log('Error fetching statuses:', error);
      throw error;
    }
  },

  async fetchCandidates(): Promise<CandidateInformation[]> {
    try {
      const response = await axios.get(`${ENV_VARIABLES.PUBLIC_BASE_API_URL}/recruitment/v1/vacancies/${ENV_VARIABLES.PUBLIC_VACANCY_ID}/candidates`, {
        headers: mainHeader,
      });

      return response.data.data;
    } catch (error) {
      console.log('Error fetching candidates:', error);
      throw error;
    }
  },

  async saveCandidate(candidate: CandidateInformation): Promise<CandidateInformation> {
    try {
      const response = await axios.post(`${ENV_VARIABLES.PUBLIC_BASE_API_URL}/recruitment/v1/candidates`, candidate, {
        headers: mainHeader,
      });
      return response.data.data;
    } catch (error) {
      console.log('Error saving candidate:', error);
      throw error;
    }
  },

  async editCandidate(candidate: CandidateInformation): Promise<CandidateInformation> {
    try {
      const response = await axios.put(`${ENV_VARIABLES.PUBLIC_BASE_API_URL}/recruitment/v1/candidates/${candidate.id}`, candidate, {
        headers: mainHeader,
      });

      return response.data.data;
    } catch (error) {
      console.error('Error editing candidate:', error);
      throw error;
    }
  },
};

export default apiService;
