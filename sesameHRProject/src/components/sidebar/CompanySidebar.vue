<script setup lang="ts">
import { ref } from 'vue';

const triggerFirstMenu = ref(false);
const triggerSecondMenu = ref(false);
</script>

<template>
  <div class="h-full w-[20%] flex flex-row shadow-inset-lg">
    <div class="h-full w-[20%] bg-[#f1f5f9]"></div>
    <div class="h-full w-[80%] bg-white flex flex-col items-start gap-6 p-4">
      <img src="src/images/sesame-logo.svg" class="w-full max-h-[46px]" />
      <div class="w-full h-fit flex flex-col gap-2">
        <div class="w-full h-fit flex flex-col items-start gap-2 transition duration-200 ease-in-out overflow-hidden first-menu-trigger" :class="{ 'max-h-[16px]': !triggerFirstMenu }">
          <div class="w-full flex flex-row items-center justify-between gap-2 cursor-pointer" @click="triggerFirstMenu = !triggerFirstMenu">
            <span class="text-[#64748B] text-xs">ADMINISTRADOR</span>
            <img src="src/images/deactivated-menu-arrow.svg" class="h-[16px] w-[16px]" />
          </div>
          <div class="w-full flex flex-col items-start gap-2 p-2 bg-secondary-white rounded-lg transition duration-200 ease-in-out overflow-hidden" :class="{ 'max-h-[35px]': !triggerSecondMenu }">
            <div class="w-full flex flex-row items-center justify-between gap-2 cursor-pointer second-menu-trigger" @click="triggerSecondMenu = !triggerSecondMenu">
              <div class="w-full flex flex-row items-center gap-2">
                <img src="src/images/favourite-menu.svg" class="h-[16px] w-[16px]" />
                <span class="text-sm text-secondary-color">Talento</span>
              </div>
              <img src="src/images/activated-menu-arrow.svg" class="h-[16px] w-[16px]" />
            </div>
            <div class="w-full flex flex-row items-center">
              <span class="font-semibold text-sm w-full text-secondary-color border-l-3 border-secondary-color ml-1.5 pl-3.5 py-2">Reclutamiento</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
