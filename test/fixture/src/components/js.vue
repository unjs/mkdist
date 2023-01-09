<template>
  <div>{{ test }}</div>
</template>

<script>
import test from "..";

const str = "test";

export default {
  data: () => ({
    test: test(),
    str,
  }),
};
</script>

<style lang="scss" scoped>
$color: red;

.test {
  color: $color;
}
</style>
