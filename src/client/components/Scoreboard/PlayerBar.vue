<script setup lang="ts">
  import Orb from "./Orb.vue";
  import getAvatar from '../../discord/getAvatar';
  import getUsername from '../../discord/getUsername';

  import { defineProps, ref, watch } from 'vue'


  const props = defineProps({
    member: Object,
    rounds: Number,
    playerData: Object
  })
  
  const member = ref(props.member)
  const rounds = ref(props.rounds)

  watch(() => props.rounds, (r) => {
    rounds.value = r
  })
  watch(() => props.playerData, (allPlayerData) => {
    let pData = allPlayerData?.find((pData: any) => pData.userId == props.member?.userId)
    
    if (pData && props.member) {
      if (pData.wins != props.member.wins || pData.spectating != props.member.spectating || pData.winPattern != props.member.winPattern) {
        member.value = pData
      }
    } 
  })
</script>

<template>
  <div v-if="(member.spectating == false)" class="playerBar">
    <img crossOrigin="anonymous" class="playerIcon" :src="getAvatar(member.user)" ref="image"/>
    <p class="username">{{ getUsername(member.user) }}</p>
    <div class="orbContainer">
      <Orb v-for="win in member.winPattern" :key="win" :win="win"/>
    </div>
    <p class="score">{{member.wins || 0}}/{{rounds}}</p>
  </div>
</template>

<style scoped>
  .playerBar {
    display:flex;
    height:3.5vw;
    gap:1.3vw;
    align-items:center;
    border-radius:1vw;
  }

  .playerBar * {
    color: white;
  }
  .orbContainer {
    flex:1;
    display:flex;
    height:100%;
    gap:.25vw;
    justify-content:center;
    align-items:center;
    padding: 0 .5vw;
  }

  .playerBar:not(:last-child) {
    margin-bottom:1vw;
  }

  .username {
    font-size:1.2vw;
    flex:.6;
  }

  .score {
    font-size:1.4vw;
    margin-right:.2vw;
    font-weight:500;
  }

  .playerIcon {
    height:100%;
    border-radius:100vw;
  }
</style>

