import { Color, GameObj } from "kaboom";
import "kaboom/global";

import { Turret } from "./Turret";

const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_RAD = Math.PI / 180;

interface UserInput {
    left: number,
    right: number,
    up: number,
    down: number,
}

class Tank {
    constructor (colour: Color, userTag: string, userId: number | undefined) {
        this.controller = add([
            rect(60, 50),
            color(colour),
            anchor("center"),
            pos(width()/2, height()/2),
            area(),
            z(0),
            "Tank",
            userTag,
            {
                data: this,
            },
        ])
        this.turretData = new Turret(this, userTag);
        this.userId = userId;
    }
    controller: GameObj;
    turretData: Turret;
    userId: number | undefined;
    speed: number = 0;
    angle: number = 0;

    exportData (tankData: Tank = this) {
        const tankController: GameObj = tankData.controller;
        return {
            position: tankController.pos,
            angle: tankData.angle,
            userId: tankData.userId,
        }
    }

    updateController (userInput: UserInput) {
        const tankData = this;
        const tankController = tankData.controller;

        const turnInput = userInput.left + userInput.right;
        const moveInput = userInput.up + userInput.down;

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

        tankController.pos = tankController.pos.add(velocity);
        tankController.angle = tankData.angle;
    }
}

export { Tank };