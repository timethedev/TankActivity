<script setup lang="ts">
  import PlayerBar from "./PlayerBar.vue";

  import { defineProps, ref, watch } from 'vue'

  const props = defineProps({
    members: Array,
    rounds: Number,
    playerData: Array,
    scoreboardEnabled: Boolean,
    overtime: Boolean
  })
  
  const scoreboardEnabled = ref(props.scoreboardEnabled)
  const members = ref(props.members)
  const playerData = ref(props.playerData)
  const rounds = ref(props.rounds)
  const overtime = ref(props.overtime)

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

  watch(() => props.overtime, (p) => {
    overtime.value = p
  })
</script>

<template>
  <div :class="`scoreboardContainer ${!scoreboardEnabled && 'hidden'}`">
    <div class="scoreboard">
        <h1>Scoreboard {{ overtime == true ? ' - Overtime!' : ''}}</h1>
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
    background:black;
    padding:5vw 15vw;
    box-sizing: border-box;

    top:0;
    left:0;

    display:flex;
    justify-content: center;
    align-items: cenmter;
    z-index:7;
  }

  .scoreboardContainer:not(.hidden) {
    animation-name: maskIn;
    animation-duration: .5s;
    animation-fill-mode: forwards;
  }

  .scoreboardContainer.hidden {
    pointer-events: none;

    animation-name: maskOut;
    animation-duration: .5s;
    animation-fill-mode: forwards;
  }

  h1 {
    font-family: "Montserrat Variable", sans-serif;
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
    padding: 2.2vw;
    border-radius:1vw;
    box-sizing:border-box;
    height:min-content;
  }

  @keyframes maskIn {
      0% {
          clip-path: circle(0% at center); /* Initial clip-path */
      }
      100% {
          clip-path: circle(100vw at center); /* Final clip-path */
      }
  }

  @keyframes maskOut {
      0% {
          clip-path: circle(100vw at center); /* Initial clip-path */
      }
      100% {
          clip-path: circle(0% at center); /* Final clip-path */
      }
  }
</style>

