<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

interface PropsModel {
  id: string;
  classes?: string;
}

const { id } = defineProps<PropsModel>();

let isSpacePressed = false;
let isDragging = false;
let startX = 0;
let scrollLeft = 0;

onMounted(() => {
  const scrollable = document.getElementById(`${id}`) as HTMLElement;

  if (!scrollable) return;

  const handleKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(target.tagName) && !target.isContentEditable) {
      e.preventDefault();
      isSpacePressed = true;
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      isSpacePressed = false;
      isDragging = false;
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (isSpacePressed) {
      isDragging = true;
      startX = e.pageX - scrollable.offsetLeft;
      scrollLeft = scrollable.scrollLeft;
      scrollable.classList.add('dragging');
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollable.offsetLeft;
    const walk = x - startX;
    scrollable.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    isDragging = false;
    scrollable.classList.remove('dragging');
  };

  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  scrollable.addEventListener('mousedown', handleMouseDown);
  scrollable.addEventListener('mousemove', handleMouseMove);
  scrollable.addEventListener('mouseup', handleMouseUp);
  scrollable.addEventListener('mouseleave', handleMouseUp);

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    scrollable.removeEventListener('mousedown', handleMouseDown);
    scrollable.removeEventListener('mousemove', handleMouseMove);
    scrollable.removeEventListener('mouseup', handleMouseUp);
    scrollable.removeEventListener('mouseleave', handleMouseUp);
  });
});
</script>

<template>
  <div :id="id" :class="[classes]">
    <slot></slot>
  </div>
</template>
