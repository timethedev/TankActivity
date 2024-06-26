import { GameObj } from "kaboom";
import "kaboom/global";

import { Turret } from "./Turret";
import { Projectile, FireProjectile, IceProjectile } from "../projectiles/Projectile";
import { Socket } from "socket.io-client";

// Constants
const stringToBullet: any = {
    "Projectile": Projectile,
    "FireProjectile": FireProjectile,
    "IceProjectile": IceProjectile
};

const DEG_TO_RAD = Math.PI / 180;

interface UserInput {
    left: number,
    right: number,
    up: number,
    down: number,
}

class Tank {
    constructor (userTag: string, index: number, userId: number | undefined) {
        let tankColor: string = "Red";

        if (index == 1) {
            tankColor = "Yellow"
        } else if (index == 2) {
            tankColor = "Green"
        } else if (index == 3) {
            tankColor = "Blue"
        }

        this.controller = add([
            sprite(`${tankColor}Tank`),
            anchor("center"),
            pos(width()/2, height()/2),
            area(),
            scale(0.8),
            z(1),
            "Tank",
            userTag,
            {
                data: this,
            },
            body({ mass: .05 })
        ])

        let shadow: GameObj = add([
            circle(50),
            color(0, 0, 0),
            opacity(.175),
            z(0)
        ])

        onUpdate(userTag, () => {
            shadow.pos = this.controller.pos
        })

        this.controller.onDestroy(() => {
            destroy(shadow)
        })

        this.turretData = new Turret(this, userTag, tankColor);
        this.userId = userId;
    }

    controller: GameObj;
    turretData: Turret;
    bullet: string = "Projectile";
    userId: number | undefined;
    speed: number = 0;
    angle: number = 0;

    exportData (tankData: Tank = this) {
        const tankController: GameObj = tankData.controller;
        return {
            position: tankController.pos,
            angle: tankData.angle,
            userId: tankData.userId,
            mousePos: mousePos()
        }
    }

    updateController (userInput: UserInput) {
        const tankData = this;
        const tankController = tankData.controller;

        const turnInput = userInput.left + userInput.right;
        const moveInput = userInput.up + userInput.down;

        const acceleration = 6;
        const deacceleration = 6;
        const maxSpeed = 6;
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

        tankController.pos = tankController.pos.add(velocity);
        tankController.angle = tankData.angle;
    }

    shoot (socket: Socket<any>) {
        const tankData: Tank = this;
        const turretData: Turret = tankData.turretData;
        const turretController: GameObj = turretData.controller;
        const bullet = stringToBullet[tankData.bullet];

        shake(10)
        new bullet (tankData, turretController.pos, turretData.angle);

        socket.emit("shoot-projectile", {
            userId: tankData.userId, 
            pos: turretController.pos, 
            angle: turretData.angle,
            bullet: tankData.bullet
        })
    }

    kill (socket: Socket<any>, killerTank: Tank) {
        const tank: Tank = this;

        socket.emit("kill-tank", {
            senderUserId: killerTank.userId,
            recieverUserId: tank.userId
        })
    }
}

export { Tank };