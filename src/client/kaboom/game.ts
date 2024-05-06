// IMPORTS
import { Color, GameObj, Vec2 } from "kaboom";

// Class Imports
import { Tank } from "../assets/objects/Tank";
import { Projectile, FireProjectile, IceProjectile } from "../assets/projectiles/Projectile";
import { PlayerData } from "../../data-structures/PlayerData";
import { Turret } from "../assets/objects/Turret";
import { Powerup } from "../assets/objects/Powerup"
import Maps from "../../common/Maps";
import { Sound } from "../assets/SoundManager";



/////////// START //////////////////
export default function game(socket: any, mapId: number, index:number, auth: any) {
//Remove all listeners, otherwise will multiply
socket.removeAllListeners("update-powerups");
socket.removeAllListeners("shoot-projectile");

let changedScene = false

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

loadSprite("RedTank", "/tanks/red/Tank.png")
loadSprite("RedTurret", "/tanks/red/Turret.png")

loadSprite("YellowTank", "/tanks/yellow/Tank.png")
loadSprite("YellowTurret", "/tanks/yellow/Turret.png")

loadSprite("GreenTank", "/tanks/green/Tank.png")
loadSprite("GreenTurret", "/tanks/green/Turret.png")

loadSprite("BlueTank", "/tanks/blue/Tank.png")
loadSprite("BlueTurret", "/tanks/blue/Turret.png")

loadSprite("TurretOutline", "/tanks/TurretOutline.png")


loadSprite("Fire", `/assets/fire.png`)
loadSprite("PowerupOrb", "src/client/assets/sprites/PowerupOrb.png")

/* loadSprite("Collisions", "src\\client\\assets\\sprites\\Map-test\\collisions.png") */
loadSprite("Sea", "src/client/assets/sprites/Sea.png")





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
    if (!reloading) {
        localClientTank.shoot(socket)

        const shootSound = new Sound("/sounds/explosion.wav");
        shootSound.globalPlay(localClientUserId, socket, 1, 0.7);
    } else {
        shake(2)
        const shootAttemptSound = new Sound("/sounds/invalid-shoot.wav");
        shootAttemptSound.localPlay(0.6);
    }
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
    onKeyPress("escape", () => {
        allPolygons = []
    })
}

let map = Maps[mapId]

let spawnPos = index >= 0 ? vec2(map.spawns[index][0], map.spawns[index][1]) : vec2(0, 0)
let mapPolygon = {
    adjusted: map.polygon.map((point) => {return vec2(Math.ceil((point.x-(width()/2))/1.5), Math.ceil((point.y-(height()/2))/1.5))}),
    unadjusted: map.polygon.map((point) => { return vec2(Math.ceil(point.x), Math.ceil(point.y))})
}

function adjustPolygon(polygon: any) {
    return polygon.map((point: any) => {return vec2(Math.ceil((point.x-(width()/2))/1.5), Math.ceil((point.y-(height()/2))/1.5))})
}


/* add([
    sprite("Ground"),
    "Ground",
    anchor("center"),
    scale(1.5),
    pos(width()/2, height()/2),
    z(-5),
    area({ shape: new Polygon(mapPolygon.adjusted) })
]) */

//map detail handler (stones & stuff) - configure in /common/Maps.ts
map.details.forEach((detail) => {
    if (detail.img) loadSprite(detail.name, detail.img)

    let comps = [
        detail.name,
        z(-4),
    ]

    if (detail.img) comps.push(sprite(detail.name));
    if (detail.size) comps.push(rect(detail.size[0], detail.size[1]));
    if (detail.rot) comps.push(rotate(detail.rot))
    if (detail.pos) comps.push(pos(detail.pos.x, detail.pos.y))
    if (detail.kill) comps.push("Killer")
    if (detail.scale) comps.push(scale(detail.scale))
    if (detail.z) comps.push(z(detail.z))

    if (detail.collider) {
        if (!detail.kill) {
            comps.push(body({ isStatic: true }))
            comps.push("Collider")
        } else {
            comps.push(z(-15))
            comps.push(anchor("center"))
            comps.push(pos(width()/2, height()/2))
        }

        if (detail.collider == "area") {
            comps.push(area())
        } else {
            comps.push(area({shape: new Polygon(adjustPolygon(detail.collider))}))
        }
    }
    
    add(comps)
})

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
const localClientUserId: number = auth.user.id;
let reloading: boolean = false;
let localClientData: PlayerData;

onUpdate(() => {
    if (localClientData) {
        reloading = localClientData.reloading
        if (localClientData.ammo == 0) reloading = true
    }
})

// LocalClient Tank Creation
const localClientTank: Tank = new Tank("LocalClient", index, localClientUserId);
if (index >= 0) localClientTank.controller.pos = spawnPos

//Update Player Controller Data Every Second
function updatePlayerData(allPlayerData: PlayerData[]) {
    const PlayerControllers = get("Tank");

    allPlayerData.map((playerData) => {
        const playerUserId: string | undefined = playerData.userId?.toString();

        if (playerUserId && playerData.alive) {
            let tankData: Tank = PlayerControllers.find((playerController) => playerData.userId == playerController.data.userId)?.data || new Tank(`Player_${playerData.userId}`, playerData.index, parseInt(playerData?.userId));

            if (playerData.userId != localClientTank.userId && playerData?.position?.x) {
                if (playerData.powerup) {
                    tankData.bullet = playerData.powerup.class
                }

                tween(tankData.controller.pos, vec2(playerData.position.x, playerData.position.y), .15, (p) => tankData.controller.pos = p, easings.linear)
                tankData.controller.angle = playerData.angle
                
                const turretData: Turret = tankData.turretData
                const mousePos: any = playerData.mousePos
                turretData.updateController(mousePos, vec2(playerData.position.x, playerData.position.y));
            }
        }

        if (playerData.userId == localClientUserId) {
            localClientData = playerData
        }
    })

    // Remove tank controller if player has left
    PlayerControllers.map((playerController) => {
        const playerData: PlayerData | undefined = allPlayerData.find((playerData) => playerController.data.userId == playerData.userId)
        
        if (!playerData || playerData?.alive == false) {
            shake(2)
            destroy(playerController.data?.turretData.controller)
            destroy(playerController.data?.turretData.controllerOutline)
            destroy(playerController)
        };
    })
}

function collectPowerup(data: any) {
    if (data.powerup) {
        localClientTank.bullet = data.powerup.class
    }
}

socket.on("update-player-data", updatePlayerData);
socket.on("collect-powerup", collectPowerup)

//Update Powerups
socket.on("update-powerups", (PowerupsData: Powerup[]) => {
    const allPowerups = get("Powerup")

    PowerupsData.map((powerupData: Powerup) => {
        const powerup: Powerup = allPowerups.find((powerup) => powerupData.id == powerup.data.id)?.data

        if (!powerup) { //if powerup doesnt exist on map, add it
            powerupData = new Powerup(powerupData) //create new "Powerup" type locally. this way it will include functions
        }
    })

    allPowerups.map((powerup) => {
        const powerupData: Powerup | undefined = PowerupsData.find((powerupData: Powerup) => powerup.data.id == powerupData.id)
        if (!powerupData) destroy(powerup)
    })
})

//Handle Projectile Shot
socket.on("shoot-projectile", (data: any) => {
    const PlayerControllers = get("Tank");
    
    PlayerControllers.map((playerController: GameObj) => {
        let Tank: Tank = playerController.data

        if (Tank.userId == data.userId && data.userId != localClientUserId) {
            shake(3)

            new stringToBullet[Tank.bullet] (Tank, playerController.pos, Tank.turretData.angle);
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

    if (localClientUserId == tank.userId && tank.userId != projectile.tank.userId) {
        tank.kill(socket, projectile.tank)
    }
})

onCollide("Projectile", "Collider", (projectileObj: GameObj) => {
    const explosionSound = new Sound("/sounds/explosion.wav");
    explosionSound.localPlay(0.6);

    destroy(projectileObj)
})

//when tank collied with powerup
onCollide("Tank", "Powerup", (tankObj: GameObj, powerupObj: GameObj) => {
    const tank: Tank = tankObj.data
    const powerup: Powerup = powerupObj.data
    
    if (tank.userId == localClientUserId) {
        const grabPowerUpSound = new Sound("/sounds/grab-powerup.mp3");
        grabPowerUpSound.localPlay(1);

        socket.emit("collect-powerup", {
            powerup: powerup.powerupData
        })
    }
})

//when tank collied with killer
onCollide("Tank", "Killer", (tankObj: GameObj) => {
    const tankData: Tank = tankObj.data
    
    if (tankData.userId == localClientUserId) {
        const explosionSound = new Sound("/sounds/explosion.wav");
        explosionSound.globalPlay(tankData.userId, socket, 1, 0.2);
        
        socket.emit("kill-tank", {
            senderUserId: tankData.userId,
            recieverUserId: tankData.userId
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
let i = setInterval(() => {
    const playerData = localClientTank.exportData();
    socket.emit("send-player-data", playerData);
}, 1000 / 20)

onSceneLeave(() => {
    clearInterval(i)
    changedScene = true

    socket.off('update-player-data', updatePlayerData)
    socket.off("collect-powerup", collectPowerup)
})
}