<template>
  <div>{{ str }}</div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  msg: string;
}>();

const str = ref<string | number>("hello");
</script>
