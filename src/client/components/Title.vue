<script setup lang="ts">
  import { defineProps, ref } from 'vue'

  const props = defineProps({
    title: String,
    subtitle: String
  })
</script>

<template>
  <div class="titleCont">
    <h1>{{ title }}</h1>
    <p>{{ subtitle }}</p>
  </div>
</template>

<style scoped>
.titleCont {
  position: absolute;
  top:5vh;
  left:50%;
  transform: translateX(-50%);
}

.titleCont h1, p {
  font-family: "Fredoka Variable", sans-serif;
  padding:0;
  margin:0;
  text-align: center;
  color:white;

  -webkit-text-stroke-width: .4vw;
  -webkit-text-stroke-color: black;
  paint-order: stroke fill;
}

.titleCont h1 {
  font-size:3.4vw;
  text-shadow: black 0 .45vw;
}

.titleCont p {
  -webkit-text-stroke-width: .3vw;
  font-size:1.5vw;
}
</style>

