import type { SuperheroInformation } from '@models/typesFile';

export const mockSuperheroData: SuperheroInformation = {
  id: '1',
  name: 'Iron Fist',
  picture: 'https://example.com/iron-fist.jpg',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  attributes: {
    agility: 8,
    strength: 7,
    weight: 5,
    endurance: 6,
    charisma: 4,
  },
};

export const mockPartialSuperheroData: SuperheroInformation = {
  id: '2',
};
