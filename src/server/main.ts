import express from "express";
import ViteExpress from "vite-express";

import { Server } from "socket.io";

import dotenv from "dotenv";
import "node-fetch";
import "kaboom/global";

import { Socket } from "socket.io-client";
import { PlayerData } from "../data-structures/PlayerData";
import { Powerup } from "../data-structures/Powerup";
import { User } from "../data-structures/User";
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
  alive: boolean = false;
  userId: number | string | undefined;
  socket: Socket;
  powerup: Powerup;
  mousePos: Vec2;
  spectating: boolean = true;
  user: User;
  wins: number = 0;
  index: number;

  ammo: number = 3;
  reloading: boolean;

  // Initializes a player with a given userId.
  constructor (user: User, socket: Socket) {
    this.userId = user.id;
    this.alive = false;
    this.socket = socket;
    this.user = user;
    this.wins = 0;
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
      mousePos: this.mousePos,
      powerup: this.powerup,
      wins: this.wins,
      user: this.user,
      spectating: this.spectating,
      index: this.index,
      ammo: this.ammo,
      reloading: this.reloading
    }
  }
}

export const generateId = (): number => Math.floor(Math.random() * (2 ** 16));

let Rooms: Room[] = []

class Option {
  name: string;
  members: User[];
  data: number | string;

  constructor (name: string, data: number | string) {
    this.name = name
    this.members = []
    this.data = data
  }
}

class Options {
  title: string;
  subtitle: string;
  options: Option[];
  timer: number;
  room: Room;
  counting: Boolean;
  selected: any;

  mapId:number;
  originalRounds: number;
  actualRounds: number;

  constructor(room: Room) {
    this.room = room
  }

  createOption(title: string, subtitle: string, options: Option[]) {
    const defaultTimer: number = 5;

    return new Promise((resolve) => {
        this.title = title;
        this.subtitle = subtitle;
        this.options = options;
        this.timer = defaultTimer;

        const intervalId = setInterval(() => {
          let highestOption = {option: {}, votes: 0}
          let totalVotes: number = 0;

          this.options.forEach((option) => {
            if (option.members.length >= highestOption.votes) {
              highestOption = {
                option: option,
                votes: option.members.length
              }
              
              totalVotes += option.members.length
            }
          })

          if (highestOption.votes != 0 && totalVotes >= 2) {
            this.timer -= 1;
            this.counting = true
          } else {
            this.timer = defaultTimer
            this.counting = false
          }

          if (this.timer == 0) {
            clearInterval(intervalId); // clear interval when done
            resolve(highestOption.option); // resolve the promise
          }

          if (this.room.players.length == 0) {
            clearInterval(intervalId); // clear interval when done
            resolve(null); // resolve the promise
          }
        }, 1000);
    });
  }

  async start() {
    return new Promise(async (resolve) => {
      let firstOption: Option | any = await this.createOption(
        "VOTE!", 
        "Select a game mode to join the game! (2p minimum)", 
        [ new Option("WIP", "wip"), new Option("Classic", "classic"), new Option("Random", "random") ]
      )

      if (!firstOption) return;

      let secondOption: Option | any = await this.createOption(
        "VOTE!", 
        "Select a round duration to join the game! (2p minimum)",
        [ new Option("1 round", 1), new Option("3 rounds", 3), new Option("6 rounds", 6) ]
      )

      if (!secondOption) return;

      this.selected = {
        gamemode: firstOption.data,
        rounds: secondOption.data,
      }

      resolve(this.selected)
    })
  }

  getData() {
    return {
      title: this.title,
      subtitle: this.subtitle,
      options: this.options,
      timer: this.timer,
      counting: this.counting
    }
  }
}

// Represents a room in the game where players interact.
class Room {
  channelId: number;
  gameInProgress: boolean;
  inProgress: boolean;
  players: Player[];
  powerups: Powerup[];
  options: Options; 
  deleted: Boolean;
  roundId: number;

  // Initializes a room with a given channelId and optionally adds a player.
  constructor (channelId: number, user: User, socket: Socket | any) {
    let room: Room | undefined = Rooms.find((room) => room.channelId == channelId)
    
    if (room) {
      room.addPlayer(user, socket) //add user by default

      return room //return room if it already exists
    } else {
      this.channelId = channelId; //setup a new room if not
      this.inProgress = false
      this.players = []
      this.powerups = []

      this.addPlayer(user, socket); //add user by default

      Rooms.push(this); // add the room to Rooms array

      this.startGame();
      
      //start infinite loop
      setInterval(() => {
        if (this.deleted) return;
        let alivePlayers: Player[] = [];
        let PlayerData: PlayerData[] = []

        //parse all dta to PlayerData[]
        this.players.map((Player: Player) => {
          PlayerData.push(Player.getData())
          if (Player.alive == true) alivePlayers.push(Player)
        })

        if (this.inProgress && alivePlayers.length <= 1) {
          //add win to player if won a round
          if (alivePlayers[0]) {
            alivePlayers[0].wins += 1
          }

          io.to(this.channelId.toString()).emit("toggle-scoreboard", true)

          this.stopRound()
        }

        io.to(this.channelId.toString()).emit("update-player-data", PlayerData)
        io.to(this.channelId.toString()).emit("update-powerups", this.powerups)
        io.to(this.channelId.toString()).emit("update-options", this.options.getData())
      }, 10)
    }
  }

  updateLocalMembers() {
    if (this.players) {
      let PlayerData: PlayerData[] = []

      //parse all dta to PlayerData[]
      this.players.map((Player: Player) => {
        PlayerData.push(Player.getData())
      })

      io.to(this.channelId.toString()).emit("update-members", PlayerData)
    }
  }

  // Retrieves a player from the room based on userId.
  getPlayer(userId: number | string | undefined) : Player | any {
    let player: Player | undefined = this.players.find((player) => player.userId == userId)
    
    if (player) {
      return player;
    }
  }

  // Adds a player to the room.
  addPlayer(user: User, socket: Socket | any) {
    let player: Player | undefined = this.players.find((player) => player.userId == user.id)
    
    if (!player) {
      this.players.push(new Player(user, socket))
      socket.join(this.channelId.toString());
    }
  }

  // Removes a player from the room.
  removePlayer(userId: number | string) {
    let playerIndex: number = this.players.findIndex((player) => player.userId == userId)

    if (playerIndex >= 0) {
      this.players.splice(playerIndex, 1)
    }

    if (this.players.length == 0) {
      let roomIndex: number = Rooms.findIndex((r) => r.channelId == this.channelId)

      if (roomIndex >= 0) {
        this.deleted = true;
        Rooms.splice(roomIndex, 1)
      }
    }

    this.updateLocalMembers()
  }

  removePowerup(powerup: Powerup) {
    const powerupIndex: number = this.powerups.findIndex((sPowerup) => sPowerup.id == powerup.id)

    if (powerupIndex > -1) {
      this.powerups.splice(powerupIndex, 1)
    }
  }

  selectOption(Player: Player, selectedOption: string | null) {
    let alreadySelected: Boolean = false;

    this.options.options.forEach((option) => {
      const members = option.members

      members.map((member, index) => {
        if (member.id == Player.userId) {
          alreadySelected = (option.name == selectedOption)
          members.splice(index, 1)
        }
      })
    })

    if (selectedOption) {
      if (!alreadySelected) {
        let option = this.options.options.find((o) => o.name == selectedOption)
        option?.members.push(Player.user)
      }
    }
  }

  // Marks the start of a round in the room.
  async startGame() {
    //kill everyone on game start
    this.players.forEach((p: Player) => {
      p.alive = false;
      p.wins = 0;
      p.spectating = true
    })

    //ask for options and wait
    this.options = new Options(this);
    await this.options.start();

    this.gameInProgress = true
    
    //remove spectating from all playing members
    this.options.options.forEach((o) => {
      o.members.forEach((m) => {
        this.players.forEach((p: Player) => {
          if (m.id == p.userId) {
            p.spectating = false
          }
        })
      })
    })

    this.options.originalRounds = this.options.selected.rounds;
    this.options.actualRounds = this.options.originalRounds;

    for (let i = 0; i < this.options.actualRounds; i++) {
      let roundEnded: boolean = false;
      this.options.mapId = Math.floor(Math.random() * Maps.length);

      //despawn all powerups
      this.powerups = []

      let totalPlayers: Player[] = [];
      //only add players who aren't spectating
      this.players.forEach((p: Player) => {
        if (!p.spectating) {
          totalPlayers.push(p)
        } else {
          this.spectate(p)
        }
      })

      if (totalPlayers.length <= 1) {
        break;
      }

      totalPlayers.forEach((p: Player, index: number) => {
        p.alive = true;
        p.index = index
        p.ammo = 3;

        p.socket.emit("start-round", {
          mapId: this.options.mapId,
          spawnpoint: p.index,
          options: this.options.selected,
          overtime: this.options.actualRounds > this.options.originalRounds
        }) 
      })


      let i: any = setInterval(() => {
        if (this.deleted || roundEnded) clearInterval(i);
        if (this.powerups.length < 3) {
          const powerup = new Powerup(this.options.mapId)
          this.powerups.push(powerup)
        }
      }, 5000)

      this.inProgress = true;

      //wait until round ends
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (!this.inProgress) {
            clearInterval(interval);
            roundEnded = true;

            setTimeout(() => {
              io.to(this.channelId.toString()).emit("toggle-scoreboard", false)
              resolve(null)
            }, 5000)
          }
        }, 100);

        function checkForDraw(players: Player[]) {
          let maxWins = Math.max(...players.map((player: Player) => player.wins));
          let playersWithMaxWins = players.filter((player: Player) => player.wins === maxWins);
          return playersWithMaxWins.length > 1;
      }

        if (i >= this.options.originalRounds) {
          let draw = checkForDraw(this.players)
          if (draw) this.options.actualRounds += 1
        }
      });
    }

    this.gameInProgress = false;
    io.to(this.channelId.toString()).emit("end-game", true)
    this.startGame()
  }

  spectate(Player: Player | undefined) {
    if (Player) {
      Player.alive = false
      Player.spectating = true

      Player.socket.emit("start-round", {
        mapId: this.options.mapId,
        options: this.options.selected,
        overtime: null,
        spectating: true
      }) 
    }
  }

  // Marks the end of a round in the room.
  stopRound() {
    this.inProgress = false;
  }
}

io.on('connection', (socket) => {
  let userId: number | string;
  let room: Room;
  let auth: any;
  let user: User;
  let localPlayer: Player | undefined;

  console.log(`[${getTime()}] (${socket.id}): User has connected.`);

  socket.on('join-room', (data) =>{
    auth = data.auth;
    user = auth.user;

    userId = user.id;
    room = new Room(123456789, user, socket);
    localPlayer = room.getPlayer(userId);

    if (room.gameInProgress) room.spectate(localPlayer)

    room.updateLocalMembers();
  })

  socket.on("send-player-data", (playerData: Player) => {
    localPlayer?.updateData(playerData);
  })

  socket.on("shoot-projectile", (data) => {
    if (room) {
      if (localPlayer?.alive && localPlayer?.ammo > 0 && !localPlayer.reloading) {
        localPlayer.ammo -= 1
        io.to(room.channelId.toString()).emit("shoot-projectile", data)

        if (localPlayer.ammo == 0) {
          //add ammo every 3 seconds
          localPlayer.reloading = true
          
          for (let i = 0; i < 3; i++) {
            setTimeout(() => {
              if(localPlayer && localPlayer?.ammo < 3) localPlayer.ammo += 1
              if (localPlayer?.ammo == 3) {
                localPlayer.reloading = false;
              }
            }, 1000 * (i + 1));
          }
        }
      }
    }
  })

  socket.on("kill-tank", (data) => {
    if (room) {
      let reciever = room.getPlayer(data.recieverUserId)

      if (localPlayer?.alive && reciever) {
        reciever.alive = false;
      }
    }
  })

  socket.on("collect-powerup", (data) => {
    if (room) {
      const player = room.getPlayer(userId)

      if (player && localPlayer?.alive) {
        const powerup: Powerup = data.powerup
        
        player.changePowerup(powerup)
        room.removePowerup(powerup)
      }
    }
  })

  socket.on("select-option", (data) => {
    if (room) {
      if (localPlayer) {
        room.selectOption(localPlayer, data.selectedOption)
      } 
    }
  })

  socket.on('disconnect', () => {
    console.log(`[${getTime()}] (${socket.id}): User has disconnected.`)
    
    if (room) {
      if (localPlayer) {
        room.selectOption(localPlayer, null)
      } 

      room.removePlayer(userId);
    }
  });
});

ViteExpress.bind(app, server);
ViteExpress.bind(app, io);