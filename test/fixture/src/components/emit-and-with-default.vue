<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    buttonText?: string;
  }>(),
  {
    buttonText: "Click",
  },
);

const emit = defineEmits<{
  (e: "clickBtn"): void;
}>();
</script>

<template>
  <div>
    <button @click="emit('clickBtn')">{{ buttonText }}</button>
  </div>
</template>
