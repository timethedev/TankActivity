// IMPORTS
import kaboom, { Color, GameObj, Vec2 } from "kaboom";
import "kaboom/global";

// Server Imports
import { io } from "socket.io-client";
const socket = io({transports: ["websocket"] });

// Class Imports
import { Tank } from "./assets/objects/Tank";
import { Projectile, FireProjectile, IceProjectile } from "./assets/projectiles/Projectile";
import { PlayerData } from "../data-structures/PlayerData";
import { Turret } from "./assets/objects/Turret";
import { Powerup } from "./assets/objects/Powerup"



// Interfaces
interface UserInput {
    left: number,
    right: number,
    up: number,
    down: number,
}



// Constants
const stringToBullet: any = {
    "Projectile": Projectile,
    "FireProjectile": FireProjectile,
    "IceProjectile": IceProjectile
};




// kABOOM SETUP
kaboom({
    width: 1920,
    height: 1080,
    letterbox: true,
    background: [20, 20, 40],
    logTime: 3,
    logMax: 3,
});

loadSprite("Bullet", "src\\client\\assets\\sprites\\Bullet.png")

loadSprite("RedTank", "src\\client\\assets\\sprites\\Red\\Tank.png")
loadSprite("RedTurret", "src\\client\\assets\\sprites\\Red\\Turret.png")
loadSprite("RedTurretOutline", "src\\client\\assets\\sprites\\Red\\TurretOutline.png")




// Mathematical Functions
const RAD_TO_DEG: number = 180 / Math.PI;
const DEG_TO_RAD: number = Math.PI / 180;

function vectorToAngle(vector: Vec2): number {
    return Math.atan2(vector.y, vector.x) * RAD_TO_DEG; // Assuming conversion to degrees
}

function angleToVector(angleInDegrees: number): Vec2 {
    const angleInRadians: number = angleInDegrees * DEG_TO_RAD; // Assuming conversion to radians
    const x: number = Math.cos(angleInRadians);
    const y: number = Math.sin(angleInRadians);
    return vec2(x, y);
}

function Lerp(start: number, end: number, t: number) {
    return start * (1 - t) + end * t;
}

function distance(pos1: Vec2, pos2: Vec2): number {
    return Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2);
}









// GAMEOBJECT BEHAVIOUR
// Tank
onUpdate("Tank", (tankController: GameObj) => { // Use Tank type
    if (!tankController.is("LocalClient")) return;
    const tankData: Tank = tankController.data;
    const userInput: UserInput = {
        left: isKeyDown('a') ? -1 : 0, right: isKeyDown('d') ? 1 : 0,
        up: isKeyDown('w') ? -1 : 0, down: isKeyDown('s') ? 1 : 0,
    }
    tankData.updateController(userInput);
});

// Turret
onUpdate("Turret", (turretController: GameObj) =>{
    if (!turretController.is("LocalClient")) return;
    const turretData: Turret = turretController.data;

    turretData.updateController(mousePos());
})

// Projectile
onUpdate("Projectile", (projectileController: GameObj) => { // Use Projectile type
    const projectileData: Projectile = projectileController.data;
    projectileData.updateController();
});

onKeyPress("space", () => { // Shoot projectile
    localClientTank.shoot(socket);
});







// CAMERA MANAGING
onUpdate(() => { // Control Camera Dynamic Zoom Effect
    const PlayerControllers = get("Tank");

    let averageX: number = 0;
    let averageY: number = 0;

    PlayerControllers.map((playerController: GameObj) => {
        averageX += playerController.pos.x;
        averageY += playerController.pos.y;
    });

    averageX /= PlayerControllers.length;
    averageY /= PlayerControllers.length;

    averageX = lerp(camPos().x, averageX, 0.25);
    averageY = lerp(camPos().y, averageY, 0.25);

    // Calculate the maximum distance between any two tanks
    const padding = 1000

    let maxDistance = 0;
    for (let i = 0; i < PlayerControllers.length; i++) {
        for (let j = i + 1; j < PlayerControllers.length; j++) {
            const dist = distance(PlayerControllers[i].pos, PlayerControllers[j].pos) + padding;

            if (dist > maxDistance) {
                maxDistance = dist;
            }
        }
    }

    // Calculate the ratio based on the maximum distance
    let ratio = (maxDistance > 0 ? 1 / (maxDistance / (height())) : 1)*1.5

    if (ratio >= 1.5) {
        ratio = 1.5
    }

    tween(camPos(), vec2(averageX, averageY), 0.35, (r) => { camPos(r.x, r.y) }, easings.easeOutQuad)
    tween(camScale(), vec2(ratio, ratio), 0.35, (r) => { camScale(r.x, r.y) }, easings.easeOutQuad)
});






add([rect(100,100), pos(width()/2, height()/2)])


// localClient-SIDE SERVER MANAGEMENT
const generateUserId = (): number => Math.floor(Math.random() * (2 ** 16));
const localClientUserId: number = generateUserId();

// Simple Constant Data
const Red: Color = rgb(255, 0, 62);
const Blue: Color = rgb(62, 0, 255);

// LocalClient Tank Creation
const localClientTank: Tank = new Tank("LocalClient", localClientUserId);

class Player {
    constructor (id: string | undefined) {
        this.id = id;
    }
    id: string | undefined;
}

//Join Room - Server
socket.emit("join-room", {
    userId: localClientUserId,
});

//Update Player Controller Data Every Second
socket.on("update-player-data", (allPlayerData: PlayerData[]) => {
    const PlayerControllers = get("Tank");

    allPlayerData.map((playerData) => {
        const playerUserId: string | undefined = playerData.userId?.toString();

        if (playerUserId) {
            let tankData: Tank = PlayerControllers.find((playerController) => playerData.userId == playerController.data.userId)?.data || new Tank(`Player_${playerData.userId}`, playerData.userId);

            if (playerData.userId != localClientTank.userId) {
                tween(tankData.controller.pos, vec2(playerData.position.x, playerData.position.y), .15, (p) => tankData.controller.pos = p, easings.linear)
                tankData.controller.angle = playerData.angle
            }
        }
    })

    // Remove tank controller if player has left
    PlayerControllers.map((playerController) => {
        const playerData: PlayerData | undefined = allPlayerData.find((playerData) => playerController.data.userId == playerData.userId)
        if (!playerData) destroy(playerController);
    })
})

//Update Powerups
socket.on("update-powerups", (PowerupsData: Powerup[]) => {
    const allPowerups = get("Powerup")

    PowerupsData.map((powerupData: Powerup) => {
        const powerup: Powerup = allPowerups.find((powerup) => powerupData.id == powerup.data.id)?.data

        if (!powerup) { //if powerup doesnt exist on map, add it
            powerupData = new Powerup(powerupData.name, powerupData.id) //create new "Powerup" type locally. this way it will include functions
        }
    })

    allPowerups.map((powerup) => {
        const powerupData: Powerup | undefined = PowerupsData.find((powerupData: Powerup) => powerup.data.id == powerupData.id)
        if (!powerupData) destroy(powerup)
    })
})

//Handle Projectile Shot
socket.on("shoot-projectile", (data) => {
    const PlayerControllers = get("Tank");
    
    PlayerControllers.map((playerController: GameObj) => {
        let Tank: Tank = playerController.data

        if (Tank.userId == data.userId && data.userId != localClientUserId) {
            shake(3)
            Tank.shoot(socket);
        }
    });
})

//when bullet collides with tank
onCollide("Tank", "Projectile", (tankObj: GameObj, projectileObj: GameObj) => {
    const tank: Tank = tankObj.data
    const projectile: Projectile = projectileObj.data

    if (localClientUserId == projectile.tank.userId && localClientUserId != tank.userId) {
        tank.kill(socket, projectile.tank)
    }
})

//when tank collied with powerup
onCollide("Tank", "Powerup", (tankObj: GameObj, powerupObj: GameObj) => {
    const tank: Tank = tankObj.data
    const powerup: Powerup = powerupObj.data
    console.log(tank.userId, localClientUserId)
    
    if (tank.userId == localClientUserId) {
        socket.emit("upgrade-powerup", {
            powerup: powerup
        })
    }
})

// Send player data - Server
setInterval(() => {
    const playerData = localClientTank.exportData();
    socket.emit("send-player-data", playerData);
}, 1000 / 20)
