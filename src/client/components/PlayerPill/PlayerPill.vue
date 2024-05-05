<script setup lang="ts">
  import PlayerIcon from "./PlayerIcon.vue";
  import InviteButton from "./InviteButton.vue";

  import { defineProps, ref, watch } from 'vue'

  const props = defineProps({
    members: Array,
    spectating: Boolean
  })
  
  const members = ref(props.members)
  const spectating = ref(props.spectating)

  watch(() => props.members, (m) => {
    members.value = m;
  });

  watch(() => props.spectating, (s) => {
    spectating.value = s;
  });
</script>

<template>
  <div :class="`playerPill ${spectating && 'spectating'}`">
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

  .playerPill.spectating {
    z-index:8;
    height:min-content;
  }
</style>

