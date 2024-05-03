<script setup lang="ts">
  import { defineProps, ref } from 'vue'

  const props = defineProps({
    src: String
  })

  const src = ref(props.src)
</script>

<template>
  <img class="playerIcon" :src="`https://i.imgur.com/o7JdGRL.png`"/>
</template>

<style scoped>
  .playerIcon {
    height:2.35vw;
    width:2.35vw;
    border: .1vw solid white;
    border-radius:50px;
  }
</style>

