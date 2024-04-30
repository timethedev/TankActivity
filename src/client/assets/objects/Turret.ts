import { GameObj, Vec2 } from "kaboom";
import "kaboom/global";

import { Tank } from "./Tank";

class Turret {
    constructor (tank: Tank, userTag: string) {
        this.tank = tank;
        this.controller = add([
            sprite("RedTurret"),
            anchor("left"),
            pos(center()),
            scale(0.8),
            z(1),
            "Turret",
            userTag,
            {
                data: this,
            },
        ]);
        this.controllerOutline = add([
            sprite("RedTurretOutline"),
            anchor("left"),
            pos(center()),
            scale(0.8),
            z(-1),
            "TurretOutline",
            userTag,
        ]);
    }

    tank: Tank;
    speed: number = 0;
    angle: number = 0;
    controller: GameObj;
    controllerOutline: GameObj;

    updateController (targetPosition: Vec2) {
        // Position
        const turretData: Turret = this;
        const turretController: GameObj = turretData.controller;
        const turretControllerOutline: GameObj = turretData.controllerOutline;

        const tankData: Tank = turretData.tank;
        const tankController: GameObj = tankData.controller;

        turretController.pos = tankController.pos; // Assuming attachment to tank controller
        turretControllerOutline.pos = turretController.pos;

        // Rotation
        const angularVelocity = 1;
        const currentAngle = turretData.angle;

        const turretRotations = Math.floor(currentAngle / 360);
        const desiredAngle = turretController.pos.angle(targetPosition) + (turretRotations + 1) * 360;

        const rotationLeft = (desiredAngle - currentAngle + 360) % 360;
        const rotationRight = 360 - rotationLeft;
        const angularDirection = (rotationLeft > rotationRight) ? 1 : -1;

        turretData.angle += 100 * angularVelocity * angularDirection * dt()
        turretController.angle = turretData.angle;
        turretControllerOutline.angle = turretData.angle;
    }
}

export { Turret };