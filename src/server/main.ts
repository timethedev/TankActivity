import express from "express";
import ViteExpress from "vite-express";

import { Server } from "socket.io";

import dotenv from "dotenv";
import "node-fetch";
import "kaboom/global";

import { Socket } from "socket.io-client";
import { PlayerData } from "../data-structures/PlayerData";
import Powerups from "../data-structures/Powerups";
import { randomPositionInsidePolygon } from "../common/Polygon";
import Maps from "../common/Maps";

dotenv.config({ path: ".env" });
const app = express();

const server = app.listen(3000, "0.0.0.0", () =>
  console.log("Server is listening...")
);

const io = new Server(server);

// Allow express to parse JSON bodies
app.use(express.json());

app.use(express.static('public'))

app.post("/api/token", async (req, res) => {
    // Exchange the code for an access_token
    const response = await fetch(`https://discord.com/api/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: req.body.code,
      client_id: process.env.VITE_DISCORD_CLIENT_ID || "",
      client_secret: process.env.DISCORD_CLIENT_SECRET || "",
    }),
  });

  // Retrieve the access_token from the response
  const { access_token } = await response.json();

  // Return the access_token to our client as { access_token: "..."}
  res.send({ access_token });
});

// Listen for socket on port 4000
// const serverPlayerModels = [];
function getTime() {
  const Time = new Date();
  return `${Time.getHours()}:${Time.getMinutes()}:${Time.getSeconds()}`;
}

export type Vec2 = {x: number, y: number}

class Player {
  position: Vec2;
  angle: number;
  alive: boolean;
  userId: number | undefined;
  socket: Socket;
  powerup: Powerup;
  mousePos: Vec2;

  // Initializes a player with a given userId.
  constructor (userId: number, socket: Socket) {
    this.userId = userId;
    this.alive = false;
    this.socket = socket;
  }

  changePowerup(powerup: Powerup) {
    this.powerup = powerup;
    
    this.socket?.emit("collect-powerup", {
      powerup: powerup
    })
  }

  // Updates the player's data with new information.
  updateData(playerData: Player) {
    this.position = playerData.position;
    this.angle = playerData.angle;
    this.mousePos = playerData.mousePos;
  }

  getData() {
    return {
      position: this.position,
      angle: this.angle,
      alive: this.alive,
      userId: this.userId,
      mousePos: this.mousePos
    }
  }
}

const generateId = (): number => Math.floor(Math.random() * (2 ** 16));

class Powerup {
  name: string;
  pos: Vec2;
  id: number | undefined;

  constructor() {
    let randomPowerup = Powerups[Math.floor(Math.random() * Powerups.length)] // generate a randomPowerup
    let randomPos = randomPositionInsidePolygon(Maps[0].polygon.map((p) => { return [p.x, p.y] }))

    this.name = randomPowerup.name
    if (randomPos) {
      this.pos = {
        x: randomPos[0], 
        y: randomPos[1]
      }
    }
    this.id = generateId() //generate random id for the powerup, inorder to be able to classify this specific one in the future
  }
}

let Rooms: Room[] = []

// Represents a room in the game where players interact.
class Room {
  channelId: number;
  inProgress: boolean;
  players: Player[];
  powerups: Powerup[];

  // Initializes a room with a given channelId and optionally adds a player.
  constructor (channelId: number, userId: number, socket: Socket | any) {
    let room: Room | undefined = Rooms.find((room) => room.channelId == channelId)
    
    if (room) {
      room.addPlayer(userId, socket) //add user by default

      return room //return room if it already exists
    } else {
      this.channelId = channelId; //setup a new room if not
      this.inProgress = false
      this.players = []
      this.powerups = []

      this.addPlayer(userId, socket) //add user by default

      Rooms.push(this) // add the room to Rooms array
    }

    let oldPlayerData = []

    //start infinite loop
    setInterval(() => {
      let PlayerData: PlayerData[] = []

      //parse all dta to PlayerData[]
      this.players.map((Player: Player) => PlayerData.push(Player.getData()))
      oldPlayerData = PlayerData
      
      io.to(this.channelId.toString()).emit("update-player-data", PlayerData)
      io.to(this.channelId.toString()).emit("update-powerups", this.powerups)
    }, 10)

    setInterval(() => {
      if (this.powerups.length < 3) {
        const powerup = new Powerup()
        this.powerups.push(powerup)
      }
    }, 5000)
  }

  // Retrieves a player from the room based on userId.
  getPlayer(userId: number | undefined) {
    let player: Player | undefined = this.players.find((player) => player.userId == userId)
    
    if (player) {
      return player;
    }
  }

  // Adds a player to the room.
  addPlayer(userId: number, socket: Socket | any) {
    let player: Player | undefined = this.players.find((player) => player.userId == userId)
    
    console.log("adding player")
    if (!player) {
      this.players.push(new Player(userId, socket))
      socket.join(this.channelId.toString());
    }
  }

  // Removes a player from the room.
  removePlayer(userId: number) {
    let playerIndex: number = this.players.findIndex((player) => player.userId == userId)
    console.log(playerIndex)

    if (playerIndex >= 0) {
      this.players.splice(playerIndex, 1)
    }
  }

  removePowerup(powerup: Powerup) {
    const powerupIndex: number = this.powerups.findIndex((sPowerup) => sPowerup.id == powerup.id)

    if (powerupIndex > -1) {
      this.powerups.splice(powerupIndex, 1)
    }
  }

  // Marks the start of a round in the room.
  startRound() {
    this.inProgress = true;
  }

  // Marks the end of a round in the room.
  stopRound() {
    this.inProgress = false;
  }
}

io.on('connection', (socket) => {
  let userId: number;
  let room: Room;
  let localPlayer: Player | undefined;

  console.log(`[${getTime()}] (${socket.id}): User has connected.`);

  socket.on('join-room', (data) =>{
    userId = data.userId;
    room = new Room(123456789, userId, socket);
    localPlayer = room.getPlayer(userId);
  })

  socket.on("send-player-data", (playerData: Player) => {
    localPlayer?.updateData(playerData);
  })

  socket.on("shoot-projectile", (data) => {
    if (room) io.to(room.channelId.toString()).emit("shoot-projectile", data)
  })

  socket.on("kill-tank", (data) => {
    if (room) {
      let reciever = room.getPlayer(data.recieverUserId)

      if (reciever) {
        reciever.socket.disconnect();
      }
    }
  })

  socket.on("collect-powerup", (data) => {
    if (room) {
      const player = room.getPlayer(userId)

      if (player) {
        const powerup: Powerup = data.powerup
        
        player.changePowerup(powerup)
        room.removePowerup(powerup)
      }
    }
  })

  socket.on('disconnect', () => {
    console.log(`[${getTime()}] (${socket.id}): User has disconnected.`)
    
    if (room) {
      room.removePlayer(userId);
    }
  });
});

ViteExpress.bind(app, server);
ViteExpress.bind(app, io);