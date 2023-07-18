<template>
  <div>{{ test }}</div>
</template>

<script lang="ts">
import test from "..";

const str: "test" = "test";

export default {
  data: () => ({
    test: test(),
    str,
  }),
};
</script>
