import kaboom, { GameObj, Vec2 } from "kaboom";
import "kaboom/global";

import { io } from "socket.io-client";
const socket = io();

import { Tank } from "./assets/objects/Tank";
import { Projectile } from "./assets/projectiles/Projectile";
import { PlayerData } from "../data-structures/PlayerData";

kaboom({
    width: innerWidth,
    height: innerHeight,
    letterbox: true,
    background: [20, 20, 40],
    logTime: 3,
    logMax: 3,
});


// MATHEMATICAL FUNCTIONS
// const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_RAD = Math.PI / 180;

// function getAngleFromUnitVector(vector: Vec2): number {
//     return Math.atan2(vector.y, vector.x) * RAD_TO_DEG; // Assuming conversion to degrees
// }

function getUnitVectorFromAngle(angleInDegrees: number): Vec2 {
    const angleInRadians = angleInDegrees * DEG_TO_RAD; // Assuming conversion to radians
    const x = Math.cos(angleInRadians);
    const y = Math.sin(angleInRadians);
    return vec2(x, y);
}


// GAMEOBJECT BEHAVIOR
onUpdate("Projectile", (projectile) => { // Use Projectile type
    const projectileData = projectile.data;
    const projectileSpeed = projectileData.speed;
    const projectileAngle = projectileData.angle;
    const unitVector = getUnitVectorFromAngle(projectileAngle);
    projectile.pos = projectile.pos.add(unitVector.scale(projectileSpeed));
    projectile.angle = projectileAngle;
});

onUpdate("Tank", (tank) => { // Use Tank type
    if (!tank.is("LocalPlayer")) return;

    const tankData = tank.data;
  
    const leftInput = isKeyDown('a') ? -1 : 0;
    const rightInput = isKeyDown('d') ? 1 : 0;
    const upInput = isKeyDown('w') ? -1 : 0;
    const downInput = isKeyDown('s') ? 1 : 0;

    const turnInput = leftInput + rightInput;
    const moveInput = upInput + downInput;

    const acceleration = 4;
    const deacceleration = 3;
    const maxSpeed = 5;
    const turnSpeed = 180;

    tankData.speed += moveInput * acceleration * dt();
    tankData.speed -= moveInput !== 0 ? 0 : Math.sign(tankData.speed) * deacceleration * dt();
    tankData.speed = Math.min(Math.max(tankData.speed, -maxSpeed), maxSpeed);

    if (moveInput !== 0) {
        tankData.angle += -Math.sign(moveInput * 10 + 1) * turnInput * turnSpeed * dt();
    } else {
        tankData.angle += turnInput * turnSpeed * dt();
    }

    const speed = tankData.speed;
    const angle = tankData.angle;
    const velocity = vec2(speed * Math.cos(angle * DEG_TO_RAD), speed * Math.sin(angle * DEG_TO_RAD));

    tank.pos = tank.pos.add(velocity);
    tank.angle = tankData.angle;
});

onUpdate("Turret", (turret) =>{
    if (!turret.is("LocalPlayer")) return;

    const turretData = turret.data;
    turret.pos = turretData.tank.pos; // Assuming attachment to tank

    const angularVelocity = 1;
    const currentAngle = turretData.angle;

    const rotations = Math.floor(currentAngle / 360);
    const desiredAngle = turret.pos.angle(mousePos()) + (rotations + 1) * 360;

    const angularDistanceLeft = (desiredAngle - currentAngle + 360) % 360;
    const angularDistanceRight = 360 - angularDistanceLeft;
    const angularDirection = (angularDistanceLeft > angularDistanceRight) ? 1 : -1;

    turretData.angle += 100 * angularVelocity * angularDirection * dt()
    turret.angle = turretData.angle;
})


// USER INPUT
onKeyPress("space", () => {
    for (const tank of get("Tank")) {
        const tankData = tank.data;
        const turret = tankData.turret;
        const turretData = turret.data;
        new Projectile(tankData, turret.pos, turretData.angle, BLUE); // Use Projectile
    }
});

const generateUserId = (): number => Math.floor(Math.random() * (2 ** 16))

const userId = generateUserId()

// TEST SECTION
const Red = rgb(255, 0, 62);
const Blue = rgb(62, 0, 255);
const localTank: Tank = new Tank(Red, "LocalPlayer", userId);

class Player {
    constructor (id: string | undefined) {
        this.id = id;
    }
    id: string | undefined;
}

//Join Room
socket.emit("join-room", {
    userId: userId
});

//Update Player Data Every Second
socket.on("update-player-data", (PlayerData: PlayerData[]) => {
    const allTanks = get("Tank");

    PlayerData.map((Player) => {
        const userIdString: string | undefined = Player.userId?.toString();

        if (userIdString) {
            let tank: Tank = allTanks.find((tankObject) => Player.userId == tankObject.data.userId)?.data || new Tank(Red, `Player_${Player.userId}`, Player.userId);

            if (Player.userId != localTank.userId) {
                tween(tank.tankModel.pos, vec2(Player.position.x, Player.position.y), dt()*100, (p) => tank.tankModel.pos = p, easings.linear)
                tank.tankModel.angle = Player.angle
            }
        }
    })

    //remove tank if player has left
    allTanks.map((tankObject) => {
        const player = PlayerData.find((player) => tankObject.data.userId == player.userId)
        if (!player) destroy(tankObject)
    })
})


setInterval(() => {
    const playerData = localTank.exportData();
    socket.emit("send-player-data", playerData);
    debug.log("-----")
}, 50)

onUpdate(() => {
    const allTanks = get("Tank");

    let avgX: number = 0;
    let avgY: number = 0;

    allTanks.map((tankObject: GameObj) => {
        avgX += tankObject.pos.x
        avgY += tankObject.pos.y
    })

    avgX /= allTanks.length;
    avgY /= allTanks.length;

    camPos(vec2(avgX, avgY))
})