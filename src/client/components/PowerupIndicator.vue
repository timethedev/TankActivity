<script setup lang="ts">
  import { defineProps, ref, watch } from 'vue'

  const props = defineProps({
    powerup: Object,
    inGame: Boolean
  })
  
  const powerup = ref(props.powerup)
  const inGame = ref(props.inGame)

  watch(() => props.powerup, (p) => {
    powerup.value = p
  })

  watch(() => props.inGame, (g) => {
    inGame.value = g
  })
</script>

<template>
  <div :class="`powerupIndicator ${(!inGame || !powerup?.id) && 'hidden'}`">
    <img class="icon" :src="powerup.img"/>
  </div>
</template>

<style scoped>
.powerupIndicator {
  position:absolute;
  top:3.5vw;
  left:3.5vW;
  border-radius:500vw;
  background: radial-gradient(circle, #0094FF 10%, #18D5FF 100%);
  border: .15vw solid #030026;
  box-sizing:border-box;
  padding:.25vw;
  box-shadow: 0px .4vw 1vw 0px rgba(3,0,38,.5);
  
  display:flex;
  justify-content:center;
  align-items:center;
  pointer-events:none;
  z-index:6;

  width:4.5vw;
  height:4.5vw;
}

.powerupIndicator.hidden {
  display:none;
}

.powerupIndicator .icon {
  width:60%;
  border-radius:100vw;
  pointer-events:none;
}
</style>

