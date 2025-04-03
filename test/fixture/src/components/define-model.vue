<script setup lang="ts">
const model = defineModel<string>({ required: true });
const twoType = defineModel<string | number>("twoType", { required: true });
const runtimeOnly = defineModel("runtimeOnly", {
  type: String,
  required: true,
});
const nameOnly = defineModel("nameOnly");
const empty = defineModel();
const { disabled } = defineProps<{
  disabled?: boolean;
}>();
const emit = defineEmits<{
  submit: [value: string];
}>();
</script>

<template>
  <div>
    <input v-model="model" :disabled />
    <button @click="emit('submit', model)">Submit</button>
  </div>
</template>
