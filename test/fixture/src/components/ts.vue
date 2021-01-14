<template>
  <div>{{ test }} </div>
</template>

<script lang="ts">
import { test } from '..'

export default {
  data () {
    test: test() as () => any
  }
}
</script>
