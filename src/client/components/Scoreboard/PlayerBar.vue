<script setup lang="ts">
  import getAvatar from '../../discord/getAvatar';
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
      if (pData.wins != props.member.wins || pData.spectating != props.member.spectating) {
        member.value = pData
      }
    } 
  })
</script>

<template>
  <div v-if="(member.spectating == false)" class="playerBar">
    <img class="playerIcon" :src="getAvatar(member.user)"/>
    <p class="username">{{ member.user.username }}</p>
    <p class="score">{{member.wins || 0}}/{{rounds}}</p>
  </div>
</template>

<style scoped>
  .playerBar {
    display:flex;
    width:27vw;
    height:3.5vw;
    gap:1.3vw;
    align-items:center;
  }

  .playerBar:not(:last-child) {
    margin-bottom:1vw;
  }

  .username {
    font-size:1.2vw;
    flex:1;
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

