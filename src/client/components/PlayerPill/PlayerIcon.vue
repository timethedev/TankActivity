<script setup lang="ts">
  import getAvatar from '../../discord/getAvatar';
  import { defineProps, watch, ref } from 'vue'

  const props = defineProps({
    member: Object,
    allPlayerData: Object
  })

  const member = ref(props.member)

  watch(() => props.allPlayerData, (allPlayerData) => {
    let pData = allPlayerData?.find((pData: any) => pData.userId == props.member?.userId)
    
    if (pData) {
      if (pData.speaking != member.value.speaking) {
        member.value = pData
      }
    } 
  })
</script>

<template>
  <img :class="`playerIcon ${member?.speaking && 'speaking'}`" :src="getAvatar(member?.user)"/>
</template>

<style scoped>
  .speaking {
    border:.3vw solid #2E8B57;
  }
  .playerIcon {
    height:4.75vw;
    width:4.75vw;
    border-radius:100vw;
    box-sizing:border-box;
  }
</style>

