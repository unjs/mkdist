<template>
  <div>{{ test }} </div>
</template>

<script>
import test from '..'

const str = 'test'

export default {
  data: () => ({
    test: test(),
    str
  })
}
</script>
