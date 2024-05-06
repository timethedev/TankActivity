<script setup lang="ts">
  import { defineProps, ref, watch } from 'vue'

  const props = defineProps({
    inGame: Boolean,
    auth: Object,
    allPlayerData: Object
  })
  
  const auth = ref({})
  const inGame = ref(props.inGame)
  const ammo = ref(0)

  watch(() => props.auth, (a) => {
    auth.value = a
  })

  watch(() => props.allPlayerData, (p) => {
    let pD = p.find((pD) => pD.userId == auth.value?.user?.id)
    if (pD) ammo.value = pD?.ammo
  })

  watch(() => props.inGame, (g) => {
    inGame.value = g
  })
</script>

<template>
  <div :class="`ammoIndicator ${!inGame && 'hidden'}`">
    <h1>{{ammo}}/3</h1>
    <img class="bulletIcon" :src="'/assets/Bullet.png'"/>
  </div>
</template>

<style scoped>
.ammoIndicator {
  position:absolute;
  bottom:2vw;
  right:3vw;
  box-sizing:border-box;
  padding:.25vw;
  
  display:flex;
  justify-content:center;
  align-items:center;
  pointer-events:none;
  gap:1vw;

  z-index:6;
  transform: scale(.8);
  transform-origin:bottom right;

  height:4.5vw;
}

.ammoIndicator.hidden {
  display:none;
}

.ammoIndicator h1 {
  font-family: "Fredoka Variable", sans-serif;
  padding:0;
  margin:0;
  text-align: center;
  color:white;

  -webkit-text-stroke-width: .4vw;
  -webkit-text-stroke-color: black;
  paint-order: stroke fill;


  font-size:2.4vw;
  text-shadow: black 0 .45vw;
}

.bulletIcon {
  height:80%;
  padding-top:1.2vw;
}
</style>

