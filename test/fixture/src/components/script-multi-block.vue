<template>
  <div>{{ msg }}</div>
</template>

<script lang="ts">
interface MyComponentProps {
  msg: string;
}
</script>

<script setup lang="ts">
defineProps<MyComponentProps>();
</script>
