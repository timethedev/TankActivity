<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import OptionSection from "./components/OptionSelect/OptionSection.vue";
  import PlayerPill from "./components/PlayerPill/PlayerPill.vue";
  import Title from "./components/Title.vue";
  import CircleButton from "./components/CircleButton.vue";
  import { setupDiscordSdk } from "./discord/discordSdk";

  import setup, { showGame, hideGame } from './kaboom/setup'

  import { io } from "socket.io-client";
  const socket = io({transports: ["websocket"] });

  let discordSdk: any;
  let auth

  let members = ref([])
  let optionData = ref({})

  onMounted(() => {
    setup(socket)

    socket.on("update-members", (m) => {
      members.value = m
    })

    socket.on("update-options", (o) => {
      optionData.value = o
    })
    
    setupDiscordSdk().then((data) => {
      discordSdk = data.discordSdk
      auth = data.auth

      //Join Room - Server
      socket.emit("join-room", {
          auth: auth
      });
    })
  })

  //show() to show actual game
  //hide() to show menu
</script>

<template>
  <img class="logo" :src="'/assets/logo.png'"/>

  <div class="topRight">
    <CircleButton icon="/assets/info.png"/>
    <CircleButton icon="/assets/settings.png"/>
  </div>

  <Title :title="optionData.title" :subtitle="optionData.subtitle"/>
  <OptionSection :options="optionData.options"/>
  <PlayerPill :members="members"/>
</template>

<style scoped>
.centerCont {
  display:flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap:3vw;
}
</style>
