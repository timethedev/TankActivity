<script setup lang="ts">
  import { invite } from "../../discord/discordSdk.js"

  const handleClick = () => {
    invite()
  }
</script>

<template>
  <div class="inviteButton" v-hover-sound @click="handleClick">
    +
  </div>
</template>

<style scoped>
  .inviteButton {
    height:4.75vw;
    width:4.75vw;
    border-radius:100vw;

    display:flex;
    justify-content: center;
    align-items: center;
    font-size:3.5vw;
    background:white;
    color: #150093;
    box-sizing: border-box;

    user-select: none;
    transition: .1s ease;
  }

  .inviteButton:hover {
    cursor: pointer;
    transform: scale(1.05);
  }
</style>

