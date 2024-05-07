<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import OptionSection from "./components/OptionSelect/OptionSection.vue";
  import PlayerPill from "./components/PlayerPill/PlayerPill.vue";
  import Title from "./components/Title.vue";
  import CircleButton from "./components/CircleButton.vue";
  import Scoreboard from "./components/Scoreboard/Scoreboard.vue"
  import LoadingScreen from "./components/LoadingScreen.vue"
  import PowerupIndicator from "./components/PowerupIndicator.vue"
  import AmmoIndicator from "./components/AmmoIndicator.vue"
  
  import { setupDiscordSdk } from "./discord/discordSdk";

  import setup, { showGame, hideGame } from './kaboom/setup'
  import { socket } from './socket'

  let discordSdk: any;
  let auth

  let members = ref([])
  let playerData = ref([])
  let optionData = ref({})
  let optionTitle = ref("")

  let loaded = ref(false)
  let scoreboardEnabled = ref(false)

  let rounds = ref(0)
  let inGame = ref(false)
  let spectating = ref(false)

  let powerup = ref({})

  const compareArrays = (a: any[], b: any[]) => {
    return JSON.stringify(a) === JSON.stringify(b);
  };

  let oldOptions: any;

  onMounted(() => {
    setup(socket)

    socket.on("update-members", (m) => {
      members.value = m
    })

    socket.on("update-options", (o) => {
      if (!compareArrays(oldOptions?.options, o?.options)) {
        optionData.value = o
        oldOptions = o
      }

      optionTitle.value = `${o.title} ${(o.counting && o.timer != 10) ? `- ${o.timer}s` : ''}`
    })

    socket.on("start-round", (data) => {
      console.log(data)
      showGame(data.mapId, data.spawnpoint)
      rounds.value = data.options.rounds
      inGame.value = true
      spectating.value = data.spectating
      powerup.value = {}
    })

    socket.on("end-game", () => {
      hideGame()
      inGame.value = false
      spectating.value = false
    })

    socket.on("collect-powerup", (data: any) => {
      powerup.value = data.powerup
    })

    socket.on("toggle-scoreboard", (toggled) => {
      scoreboardEnabled.value = toggled
    })
    
    socket.on("update-player-data", (allPlayerData: PlayerData[]) => {
      playerData.value = allPlayerData
    })


    setupDiscordSdk().then((data) => {
      discordSdk = data.discordSdk
      auth = data.auth
      
      setTimeout(() => loaded.value = true, 2500)

      //Join Room - Server

      discordSdk.commands.getChannel({
        channel_id: discordSdk.channelId,
      }).then((channel) => {
        if (channel.id) {
          socket.emit("join-room", {
            auth: auth,
            channelId: channel.id
          });
        }
      })
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

  <PowerupIndicator :inGame="inGame" :powerup="powerup"/>
  <LoadingScreen :loaded="loaded"/>
  <Scoreboard :members="members" :playerData="playerData" :rounds="rounds" :scoreboardEnabled="scoreboardEnabled"/>
  <Title :title="optionTitle" :subtitle="optionData.subtitle"/>
  <OptionSection :options="optionData.options"/>
  <PlayerPill :members="members" :spectating="spectating"/>
  <AmmoIndicator :inGame="inGame" :auth="auth" :allPlayerData="playerData"/>
  
  <h1 v-if="spectating" class="spectating">SPECTATING</h1>
</template>

<style scoped>
.centerCont {
  display:flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap:3vw;
}

h1.spectating  {

  position: absolute;
  bottom:11vw;
  left:50%;
  transform: translateX(-50%);
  z-index:8;

  font-family: "Fredoka Variable", sans-serif;
  padding:0;
  margin:0;
  text-align: center;
  color:white;

  -webkit-text-stroke-width: .4vw;
  -webkit-text-stroke-color: black;
  paint-order: stroke fill;


  font-size:2.4vw;
  text-shadow: black 0 .45vw;
}
</style>
