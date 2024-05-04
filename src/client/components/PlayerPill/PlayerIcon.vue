<script setup lang="ts">
  import getAvatar from '../../discord/getAvatar';
  import { defineProps } from 'vue'

  const props = defineProps({
    member: Object
  })
  
  const member = props.member
</script>

<template>
  <img class="playerIcon" :src="getAvatar(member)"/>
</template>

<style scoped>
  .playerIcon {
    height:4.75vw;
    width:4.75vw;
    border-radius:50px;
  }
</style>

