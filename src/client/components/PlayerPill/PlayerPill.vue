<script setup lang="ts">
  import PlayerIcon from "./PlayerIcon.vue";
  import InviteButton from "./InviteButton.vue";

  import { defineProps, ref, watch } from 'vue'

  const props = defineProps({
    members: Array
  })
  
  const members = ref(props.members)

  watch(() => props.members, (m) => {
    members.value = m;
  });
</script>

<template>
  <div class="playerPill">
    <PlayerIcon v-for="member in members" :key="member" :member="member"/>
    <InviteButton/>
  </div>
</template>

<style scoped>
  .playerPill {
    position:absolute;
    left:50%;
    transform: translateX(-50%);
    bottom:3.5vw;

    padding: .8vw;
    background:#150093;
    border-radius:100vw;

    display:flex;
    gap:.5vw;
  }
</style>

