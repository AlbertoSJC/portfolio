<script setup lang="ts">
import { useSuperheroesStore } from '@stores/superheroes';
import { resizeImage } from 'src/utils/images';
import { ref } from 'vue';

const superheroesStore = useSuperheroesStore();

let imageUploadingError = ref<string | null>(null);

const handleImageErrors = (error: string) => {
  imageUploadingError.value = error;
};

const handleImageUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];

  if (!file) {
    handleImageErrors('No file selected.');
    return;
  }

  if (!file.type.startsWith('image/')) {
    handleImageErrors('Please select a valid image file.');
    return;
  }

  try {
    const resizedBase64 = await resizeImage(file, 128, 128);
    superheroesStore.heroToUpload.picture = resizedBase64;
    imageUploadingError.value = null;
  } catch (error) {
    handleImageErrors('Failed to process the image.');
  }
};
</script>

<template>
  <div class="flex flex-col items-center gap-4 min-w-[367px]">
    <div class="flex flex-row-reverse gap-16 w-full items-center justify-center">
      <div v-if="superheroesStore.heroToUpload.picture" class="mt-4 flex flex-col items-center">
        <p class="text-lg font-semibold">Hero Image Selected</p>
        <img :src="superheroesStore.heroToUpload.picture" alt="Resized Image" class="border rounded" />
      </div>

      <label for="file-input" class="bg-[#fff66f] text-black font-bold py-2 px-4 rounded cursor-pointer hover:bg-[#ffcb00] transition">
        {{ superheroesStore.heroToUpload.picture ? 'Change Image' : 'Choose Image' }}
      </label>
      <input id="file-input" type="file" accept="image/*" @change="handleImageUpload" class="hidden" />
    </div>

    <p v-if="imageUploadingError" class="text-red-500">{{ imageUploadingError }}</p>
  </div>
</template>

<style scoped>
input[type='file'] {
  cursor: pointer;
}
img {
  width: 128px;
  height: 128px;
}
</style>
