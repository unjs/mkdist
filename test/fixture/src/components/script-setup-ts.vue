<template>
  <div>{{ str }}</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Color } from "#prop-types";

const props = defineProps<{
  msg: string;
  color: Color;
}>();

const str = ref<string | number>("hello");
</script>
