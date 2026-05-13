import type { SuperheroInformation } from '@models/typesFile';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ENV_VARIABLE } from 'src/env';

const mock = new MockAdapter(axios, { delayResponse: 300 });

const BASE = ENV_VARIABLE.PUBLIC_BASE_API_URL;
const KEY = ENV_VARIABLE.PUBLIC_SUPERHERO_API_KEY;

const now = () => new Date().toISOString();

const heroes: SuperheroInformation[] = [
  {
    id: '1',
    name: 'Iron Fist',
    picture: '',
    createdAt: now(),
    updatedAt: now(),
    attributes: { agility: 90, strength: 75, weight: 80, endurance: 85, charisma: 70 },
  },
  {
    id: '2',
    name: 'Black Widow',
    picture: '',
    createdAt: now(),
    updatedAt: now(),
    attributes: { agility: 95, strength: 70, weight: 60, endurance: 80, charisma: 88 },
  },
  {
    id: '3',
    name: 'Thor',
    picture: '',
    createdAt: now(),
    updatedAt: now(),
    attributes: { agility: 75, strength: 99, weight: 95, endurance: 99, charisma: 85 },
  },
  {
    id: '4',
    name: 'Spider-Man',
    picture: '',
    createdAt: now(),
    updatedAt: now(),
    attributes: { agility: 98, strength: 80, weight: 65, endurance: 85, charisma: 82 },
  },
];

let nextId = heroes.length + 1;

export function setupMockAdapter() {
  mock.onGet(`${BASE}/api-keys/${KEY}`).reply(200, { id: 'mock-key', createdAt: now(), updatedAt: now() });

  mock.onGet(`${BASE}/pentathlon/heroes`).reply(() => [200, [...heroes]]);

  mock.onPost(`${BASE}/pentathlon/heroes`).reply((config) => {
    const body = JSON.parse(config.data);
    const newHero: SuperheroInformation = { ...body, id: String(nextId++), createdAt: now(), updatedAt: now() };
    heroes.push(newHero);
    return [200, newHero];
  });

  mock.onPut(new RegExp(`${BASE}/pentathlon/heroes/.*`)).reply((config) => {
    const body = JSON.parse(config.data);
    const index = heroes.findIndex((h) => h.id === body.id);
    if (index !== -1) heroes[index] = { ...body, updatedAt: now() };
    return [200, { ...body, updatedAt: now() }];
  });

  mock.onDelete(new RegExp(`${BASE}/pentathlon/heroes/.*`)).reply(200);
}
