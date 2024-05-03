// IMPORTS
import { Color, GameObj, Vec2 } from "kaboom";

// Class Imports
import { Tank } from "../assets/objects/Tank";
import { Projectile, FireProjectile, IceProjectile } from "../assets/projectiles/Projectile";
import { PlayerData } from "../../data-structures/PlayerData";
import { Turret } from "../assets/objects/Turret";
import { Powerup } from "../assets/objects/Powerup"
import Maps from "../../common/Maps";

export default function game(socket: any) {
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

loadSprite("Bullet", "src\\client\\assets\\sprites\\Bullet.png")

loadSprite("RedTank", "src\\client\\assets\\sprites\\Red\\Tank.png")
loadSprite("RedTurret", "src\\client\\assets\\sprites\\Red\\Turret.png")
loadSprite("RedTurretOutline", "src\\client\\assets\\sprites\\Red\\TurretOutline.png")

loadSprite("PowerupOrb", "src/client/assets/sprites/PowerupOrb.png")

/* loadSprite("Collisions", "src\\client\\assets\\sprites\\Map-test\\collisions.png") */
loadSprite("Sea", "src/client/assets/sprites/Sea.png")


/* debug.inspect = true */


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

    turretData.updateController();
})

// Projectile
onUpdate("Projectile", (projectileController: GameObj) => { // Use Projectile type
    const projectileData: Projectile = projectileController.data;
    projectileData.updateController();
});

onKeyPress("space", () => { // Shoot projectile
    localClientTank.shoot(socket);
});


const CAM = true
let allPolygons: Vec2[] = []

if (!CAM) {
    onClick(() => {
        const mP = toWorld(mousePos())
        allPolygons.push(mP)

        debug.log("")
        debug.log("Added Polygon")
        debug.log(mP)
    })
    onKeyPress("enter", () => {
        downloadJSON("polygons.json", allPolygons)
    })
}

let map = Maps[0]
let mapPolygon = {
    adjusted: map.polygon.map((point) => {return vec2(Math.ceil((point.x-(width()/2))/1.5), Math.ceil((point.y-(height()/2))/1.5))}),
    unadjusted: map.polygon.map((point) => { return vec2(Math.ceil(point.x), Math.ceil(point.y))})
}

loadSprite("Ground", map.img)

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

    if (ratio >= 1.25) {
        ratio = 1.25
    }

    tween(camPos(), vec2(averageX, averageY), 0.35, (r) => { camPos(r.x, r.y) }, easings.easeOutQuad)
    if(CAM) tween(camScale(), vec2(ratio, ratio), 0.35, (r) => { camScale(r.x, r.y) }, easings.easeOutQuad)
});







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

                const turretData: Turret = tankData.turretData
                const mousePos: any = playerData.mousePos
                turretData.updateController(mousePos, vec2(playerData.position.x, playerData.position.y));
            }
        }
    })

    // Remove tank controller if player has left
    PlayerControllers.map((playerController) => {
        const playerData: PlayerData | undefined = allPlayerData.find((playerData) => playerController.data.userId == playerData.userId)
        if (!playerData) {
            destroy(playerController.data?.turretData.controller)
            destroy(playerController.data?.turretData.controllerOutline)
            destroy(playerController)
        };
    })
})

//Update Powerups
socket.on("update-powerups", (PowerupsData: Powerup[]) => {
    const allPowerups = get("Powerup")

    PowerupsData.map((powerupData: Powerup) => {
        const powerup: Powerup = allPowerups.find((powerup) => powerupData.id == powerup.data.id)?.data

        if (!powerup) { //if powerup doesnt exist on map, add it
            powerupData = new Powerup(powerupData.name, powerupData.pos,powerupData.id) //create new "Powerup" type locally. this way it will include functions
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
            new stringToBullet[Tank.bullet] (Tank, playerController.pos, Tank.turretData.angle);
        }
    });
})

socket.on("collect-powerup", (data) => {
    console.log("collected ", data.powerup)
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
        socket.emit("collect-powerup", {
            powerup: powerup
        })
    }
})

function rayCasting(point: any, polygon: any) {
    const n = polygon.length
    let isIn = false
    const x = point[0]
    const y = point[1]
    let x1, x2, y1, y2

    x1 = polygon[n-1][0]
    y1 = polygon[n-1][1]

    for (let i = 0; i < n; ++i) {
        x2 = polygon[i][0];
        y2 = polygon[i][1];

        if (y < y1 !== y < y2 && x < (x2 - x1) * (y - y1) / (y2 - y1) + x1) {
            isIn = !isIn;
        }
        x1 = x2
        y1 = y2
    }

    return isIn;
}

let dead = false

onUpdate("Tank", (tankObj: GameObj) => {
    const tankData: Tank = tankObj.data;

    const point = [Math.ceil(localClientTank.controller.pos.x), Math.ceil(localClientTank.controller.pos.y)]
    const polygon = mapPolygon.unadjusted.map((p => { return [p.x, p.y ]}));
    const insidePolygon = rayCasting(point, polygon)

    if (!insidePolygon && !dead && tankData.userId == localClientUserId) {
        dead = true

        debug.log("I died!")
        
        socket.emit("kill-tank", {
            senderUserId: tankData.userId,
            recieverUserId: tankData.userId
        })
    } 
})

add([
    sprite("Ground"),
    "Ground",
    anchor("center"),
    scale(1.5),
    pos(width()/2, height()/2),
    z(-5),
    area({ shape: new Polygon(mapPolygon.adjusted) })
])


// const MapShape = get("Ground")[0]
// onUpdate("Tank", (tankController) =>{
//     if (!MapShape.contains(tankController.pos)) {
//         const tankData: Tank = tankController.data;
        
//         
//     }
// })


/* add([
    sprite("Collisions"),
    anchor("center"),
    area(),
    body(),
    scale(1.5),
    pos(width()/2, height()/2),
    z(5)
])
 */
add([
    sprite("Sea"),
    anchor("center"),
    scale(2),
    pos(width()/2, height()/2),
    z(-10)
])

// Send player data - Server
setInterval(() => {
    const playerData = localClientTank.exportData();
    socket.emit("send-player-data", playerData);
}, 1000 / 20)
}