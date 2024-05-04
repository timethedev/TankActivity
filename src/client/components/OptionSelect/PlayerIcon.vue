<script setup lang="ts">
  import { defineProps, ref } from 'vue'
  import getAvatar from '../../discord/getAvatar';

  const props = defineProps({
    member: Object
  })

  const member = ref(props.member)
</script>

<template>
  <img class="playerIcon" :src="getAvatar(member)"/>
</template>

<style scoped>
  .playerIcon {
    height:2.35vw;
    width:2.35vw;
    border: .1vw solid white;
    border-radius:50px;
  }
</style>

