<script setup lang="ts">
  import PlayerBar from "./PlayerBar.vue";

  import { defineProps, ref, watch } from 'vue'

  const props = defineProps({
    members: Array,
    rounds: Number,
    playerData: Array,
    scoreboardEnabled: Boolean
  })
  
  const scoreboardEnabled = ref(props.scoreboardEnabled)
  const members = ref(props.members)
  const playerData = ref(props.playerData)
  const rounds = ref(props.rounds)

  watch(() => props.members, (m) => {
    members.value = m;
  });

  watch(() => props.rounds, (m) => {
    rounds.value = m;
  });

  watch(() => props.scoreboardEnabled, (m) => {
    scoreboardEnabled.value = m;
  });

  watch(() => props.playerData, (p) => {
    playerData.value = p
  })
</script>

<template>
  <div :class="`scoreboardContainer ${!scoreboardEnabled && 'hidden'}`">
    <div class="scoreboard">
        <h1>Scoreboard</h1>
        <PlayerBar v-for="member in members" :key="member" :playerData="playerData" :member="member" :rounds="rounds"/>
    </div>
  </div>
</template>

<style scoped>
  .scoreboardContainer * {

    font-family: "Fredoka Variable", sans-serif;
  }

  .scoreboardContainer {
    position:absolute;
    width:100vw;
    height:100vh;
    background:rgba(0,0,0,.8);
    padding:5vw 15vw;
    border: 1vw solid black;
    box-sizing: border-box;

    top:0;
    left:0;

    display:flex;
    justify-content: center;
    align-items: cenmter;
    z-index:7;
  }

  .scoreboardContainer.hidden {
    display:none;
  }

  h1 {
    text-align:center;
    margin:0;
    margin-bottom: 2vw;
    text-align: center;
    color:white;

    -webkit-text-stroke-width: .4vw;
    -webkit-text-stroke-color: black;
    paint-order: stroke fill;

    font-size:2.6vw;
    text-shadow: black 0 .45vw;
  }

  .scoreboard {
    background:white;
    padding: 2.2vw;
    border-radius:1vw;
    box-sizing:border-box;
    height:min-content;

    box-shadow: 0px .4vw 1vw 0px rgba(0,0,0,.5);
  }
</style>

