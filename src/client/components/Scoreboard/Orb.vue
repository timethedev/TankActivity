<script setup lang="ts">
  import getAvatar from '../../discord/getAvatar';
  import { defineProps, ref, watch } from 'vue'

  const props = defineProps({
    win: Boolean
  })
  
  const win = ref(props.win)
  
  watch(() => props.win, (w) => {
    win.value = w
  })
</script>

<template>
  <div :class="`orb ${win ? 'win' : 'lose'}`"></div>
</template>

<style scoped>
  .orb {
    flex:1;
    aspect-ratio:1;
    border-radius:100vw;
    height:1vw;
  }

  .orb.win {
    background-color: #FFC700;
  }

  .orb.lose {
    background-color: #333333;
  }
</style>

