import { PentathlonList } from '@domain/PentathlonList';
import { Superhero } from '@domain/Superhero';
import { SuperheroesList } from '@domain/SuperheroesList';
import { defineStore } from 'pinia';
import apiService from 'src/services/apiService';
import { ref } from 'vue';

export const useSuperheroesStore = defineStore('superheroes-store', () => {
  const list = ref<SuperheroesList>(new SuperheroesList());
  const heroToUpload = ref<Superhero>(new Superhero({}));
  const heroToBeforeEdit = ref<Superhero | null>(null);
  const pentathlonList = ref<PentathlonList>(new PentathlonList());
  const pentathlonWinnersList = ref<PentathlonList | null>(null);
  const pentathlonLosersList = ref<PentathlonList | null>(null);
  const errorMessage = ref<string | null>(null);
  const pentathlonLoading = ref<boolean>(false);

  const cancelEdit = () => {
    if (heroToBeforeEdit.value) {
      list.value.updateSuperhero(heroToBeforeEdit.value);
    }
    heroToUpload.value = new Superhero({});
    heroToBeforeEdit.value = null;
  };

  const selectPentathlonSuperhero = (hero: Superhero) => {
    list.value.toggleSuperheroSelect(hero);
    pentathlonWinnersList.value = null;

    if (hero.selected) {
      pentathlonList.value.addSuperhero(hero);
    } else {
      pentathlonList.value.removeSuperhero(hero);
    }
  };

  const selectHeroToUpdate = async (hero: Superhero) => {
    const heroToUpdate = list.value.getSuperheroById(hero.id as string);
    if (heroToUpdate) {
      if (heroToUpdate.id !== heroToUpload.value.id) {
        await cancelEdit();
      }
      heroToBeforeEdit.value = new Superhero(heroToUpdate);
      heroToUpload.value = heroToUpdate;
    }
  };

  const removeHero = async (hero: Superhero) => {
    await apiService
      .deleteSuperhero(hero)
      .then(() => {
        if (heroToUpload && hero.id === heroToUpload.value.id) {
          cancelEdit();
        }
        list.value.removeSuperhero(hero);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const updateHero = async () => {
    await apiService
      .updateSuperhero(heroToUpload.value)
      .then(() => {
        heroToBeforeEdit.value = null;
        heroToUpload.value = new Superhero({});
      })
      .catch((error) => {
        errorMessage.value = (error as any).response.data.message;
      });
  };

  const createHero = async () => {
    await apiService
      .postSuperhero(heroToUpload.value)
      .then((response) => {
        list.value.addSuperhero(new Superhero(response));
        heroToUpload.value = new Superhero({});
      })
      .catch((error) => {
        errorMessage.value = (error as any).response.data.message;
      });
  };

  const createOrUpdateHero = () => {
    if (heroToBeforeEdit.value) {
      updateHero();
    } else {
      createHero();
    }
  };

  const pentathlonRunning = () => {
    pentathlonLoading.value = true;

    const pentathlonRunningList = new PentathlonList(pentathlonList.value.superheroes);

    pentathlonRunningList.executePentathlon();

    const winners = pentathlonRunningList.superheroes.splice(0, 3);

    pentathlonWinnersList.value = new PentathlonList(winners);
    pentathlonLosersList.value = pentathlonRunningList.superheroes.length > 0 ? new PentathlonList(pentathlonRunningList.superheroes) : null;

    pentathlonLoading.value = false;
  };

  return {
    list,
    heroToUpload,
    heroToBeforeEdit,
    pentathlonList,
    pentathlonWinnersList,
    pentathlonLosersList,
    errorMessage,
    pentathlonLoading,
    cancelEdit,
    selectPentathlonSuperhero,
    selectHeroToUpdate,
    removeHero,
    createOrUpdateHero,
    pentathlonRunning,
  };
});
