import type { Superhero } from '@domain/Superhero';
import type { KEY_PARAMETERS, SuperheroInformation } from '@models/typesFile';
import axios from 'axios';
import { ENV_VARIABLE } from 'src/env';

const apiService = {
  async fetchApiKeyDetails(): Promise<KEY_PARAMETERS> {
    try {
      const response = await axios.get(`${ENV_VARIABLE.PUBLIC_BASE_API_URL}/api-keys/${ENV_VARIABLE.PUBLIC_SUPERHERO_API_KEY}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching API key details:', error);
      throw error;
    }
  },

  async fetchSuperHeroesList(): Promise<SuperheroInformation[]> {
    try {
      const response = await axios.get(`${ENV_VARIABLE.PUBLIC_BASE_API_URL}/pentathlon/heroes`, {
        headers: { Authorization: ENV_VARIABLE.PUBLIC_SUPERHERO_API_KEY },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Superheroes list:', error);
      throw error;
    }
  },

  async postSuperhero(hero: Superhero): Promise<SuperheroInformation> {
    try {
      const response = await axios.post(`${ENV_VARIABLE.PUBLIC_BASE_API_URL}/pentathlon/heroes`, hero, {
        headers: { Authorization: ENV_VARIABLE.PUBLIC_SUPERHERO_API_KEY, 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error) {
      console.error('Error posting superhero:', (error as any).response.data.message);
      throw error;
    }
  },

  async updateSuperhero(hero: Superhero): Promise<SuperheroInformation> {
    try {
      const response = await axios.put(`${ENV_VARIABLE.PUBLIC_BASE_API_URL}/pentathlon/heroes/${hero.id}`, hero, {
        headers: { Authorization: ENV_VARIABLE.PUBLIC_SUPERHERO_API_KEY, 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error) {
      console.error('Error posting superhero:', (error as any).response.data.message);
      throw error;
    }
  },

  async deleteSuperhero(hero: Superhero): Promise<void> {
    try {
      const response = await axios.delete(`${ENV_VARIABLE.PUBLIC_BASE_API_URL}/pentathlon/heroes/${hero.id}`, {
        headers: { Authorization: ENV_VARIABLE.PUBLIC_SUPERHERO_API_KEY },
      });
      return response.data;
    } catch (error) {
      console.error('Error removing hero:', (error as any).response.data.message);
      throw error;
    }
  },
};

export default apiService;
