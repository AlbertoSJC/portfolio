import { PentathlonList } from '@domain/PentathlonList';
import { Superhero } from '@domain/Superhero';
import { SuperheroesList } from '@domain/SuperheroesList';
import { useSuperheroesStore } from '@stores/superheroes';
import { mockSuperheroData } from '@tests/mocks/superheroMocks';
import apiService from 'src/services/apiService';
import { flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('src/services/apiService');

describe('useSuperheroesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  test('should initialize with default state', () => {
    const store = useSuperheroesStore();

    expect(store.list).toStrictEqual(new SuperheroesList());
    expect(store.heroToUpload).toStrictEqual(new Superhero({}));
    expect(store.heroToBeforeEdit).toBeNull();
    expect(store.pentathlonList).toStrictEqual(new PentathlonList());
    expect(store.pentathlonWinnersList).toBeNull();
    expect(store.pentathlonLosersList).toBeNull();
    expect(store.errorMessage).toBeNull();
    expect(store.pentathlonLoading).toBe(false);
  });

  test('should cancel edit and restore the previous hero state', () => {
    const store = useSuperheroesStore();
    const originalHero = new Superhero({ ...mockSuperheroData, id: '1', name: 'Original' });
    store.list = new SuperheroesList([{ ...mockSuperheroData, id: '1', name: 'Modified' }]);
    store.heroToBeforeEdit = originalHero;
    store.heroToUpload = store.list.superheroes[0];

    store.cancelEdit();

    expect(store.list.superheroes[0].name).toBe('Original');
    expect(store.heroToUpload).toStrictEqual(new Superhero({}));
    expect(store.heroToBeforeEdit).toBeNull();
  });

  test('should select a superhero for pentathlon and add to pentathlon list', () => {
    const store = useSuperheroesStore();
    store.list = new SuperheroesList([{ ...mockSuperheroData, id: '1' }]);
    const hero = store.list.superheroes[0];

    store.selectPentathlonSuperhero(hero);

    expect(store.pentathlonList.superheroes).toHaveLength(1);
    expect(store.pentathlonWinnersList).toBeNull();
  });

  test('should deselect a superhero for pentathlon and remove from pentathlon list', () => {
    const store = useSuperheroesStore();
    store.list = new SuperheroesList([{ ...mockSuperheroData, id: '1', selected: true }]);
    const hero = store.list.superheroes[0];
    store.pentathlonList.addSuperhero(hero);

    store.selectPentathlonSuperhero(hero);

    expect(store.pentathlonList.superheroes).toHaveLength(0);
  });

  test('should select a hero to update', async () => {
    const store = useSuperheroesStore();
    store.list = new SuperheroesList([{ ...mockSuperheroData, id: '1' }]);
    const hero = store.list.superheroes[0];

    await store.selectHeroToUpdate(hero);

    expect(store.heroToUpload.id).toBe('1');
    expect(store.heroToBeforeEdit).toBeDefined();
  });

  test('should remove a hero via api and update the list', async () => {
    const store = useSuperheroesStore();
    store.list = new SuperheroesList([{ ...mockSuperheroData, id: '1' }, { ...mockSuperheroData, id: '2' }]);
    const hero = store.list.superheroes[0];
    vi.mocked(apiService.deleteSuperhero).mockResolvedValueOnce(undefined);

    await store.removeHero(hero);

    expect(apiService.deleteSuperhero).toHaveBeenCalledWith(hero);
    expect(store.list.superheroes).toHaveLength(1);
    expect(store.list.superheroes[0].id).toBe('2');
  });

  test('should create a hero via api and add it to the list', async () => {
    const store = useSuperheroesStore();
    const newHeroResponse = { ...mockSuperheroData, id: '99', name: 'New Hero' };
    store.heroToUpload = new Superhero({ name: 'New Hero', attributes: mockSuperheroData.attributes });
    vi.mocked(apiService.postSuperhero).mockResolvedValueOnce(newHeroResponse);

    await store.createOrUpdateHero();

    expect(apiService.postSuperhero).toHaveBeenCalled();
    expect(store.list.superheroes).toHaveLength(1);
    expect(store.list.superheroes[0].id).toBe('99');
    expect(store.heroToUpload).toStrictEqual(new Superhero({}));
  });

  test('should update a hero via api', async () => {
    const store = useSuperheroesStore();
    const existingHero = new Superhero({ ...mockSuperheroData, id: '1' });
    store.list = new SuperheroesList([{ ...mockSuperheroData, id: '1' }]);
    store.heroToUpload = existingHero;
    store.heroToBeforeEdit = existingHero;
    vi.mocked(apiService.updateSuperhero).mockResolvedValueOnce({ ...mockSuperheroData, id: '1' });

    await store.createOrUpdateHero();

    expect(apiService.updateSuperhero).toHaveBeenCalledWith(existingHero);
    expect(store.heroToBeforeEdit).toBeNull();
  });

  test('should set errorMessage when create hero fails', async () => {
    const store = useSuperheroesStore();
    store.heroToUpload = new Superhero({ name: 'Fail Hero' });
    vi.mocked(apiService.postSuperhero).mockRejectedValueOnce({ response: { data: { message: 'Name is too long' } } });

    store.createOrUpdateHero();
    await flushPromises();

    expect(store.errorMessage).toBe('Name is too long');
  });

  test('should run the pentathlon, split winners and losers', () => {
    const store = useSuperheroesStore();
    const heroes = [
      { id: '1', name: 'A', attributes: { agility: 8, strength: 9, weight: 4, endurance: 7, charisma: 6 } },
      { id: '2', name: 'B', attributes: { agility: 5, strength: 5, weight: 6, endurance: 5, charisma: 9 } },
      { id: '3', name: 'C', attributes: { agility: 3, strength: 4, weight: 8, endurance: 3, charisma: 3 } },
      { id: '4', name: 'D', attributes: { agility: 7, strength: 6, weight: 5, endurance: 6, charisma: 7 } },
    ];
    heroes.forEach((h) => store.pentathlonList.addSuperhero(h));

    store.pentathlonRunning();

    expect(store.pentathlonWinnersList?.superheroes).toHaveLength(3);
    expect(store.pentathlonLosersList?.superheroes).toHaveLength(1);
    expect(store.pentathlonLoading).toBe(false);
  });

  test('should set pentathlonLosersList to null when all heroes fit in top 3', () => {
    const store = useSuperheroesStore();
    const heroes = [
      { id: '1', name: 'A', attributes: { agility: 8, strength: 9, weight: 4, endurance: 7, charisma: 6 } },
      { id: '2', name: 'B', attributes: { agility: 5, strength: 5, weight: 6, endurance: 5, charisma: 9 } },
      { id: '3', name: 'C', attributes: { agility: 3, strength: 4, weight: 8, endurance: 3, charisma: 3 } },
    ];
    heroes.forEach((h) => store.pentathlonList.addSuperhero(h));

    store.pentathlonRunning();

    expect(store.pentathlonWinnersList?.superheroes).toHaveLength(3);
    expect(store.pentathlonLosersList).toBeNull();
  });
});
