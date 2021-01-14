<template>
  <div>{{ test }} </div>
</template>

<script>
import { test } from '..'

export default {
  data () {
    test: test()
  }
}
</script>
