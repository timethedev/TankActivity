import { GameObj, Vec2 } from "kaboom";
import "kaboom/global";

import { Tank } from "./Tank";

class Turret {
    constructor (tank: Tank, userTag: string) {
        this.tank = tank;
        this.controller = add([
            sprite("RedTurret"),
            anchor("right"),
            pos(center()),
            scale(0.8),
            area({ shape: new Rect(vec2(), 10, 10) }),
            z(1),
            "Turret",
            "TankCenter",
            userTag,
            { data: this },
        ]);
        this.controllerOutline = add([
            sprite("RedTurretOutline"),
            anchor("right"),
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

    updateController (targetPosition?: Vec2, tankPos?: Vec2) {
        // Position
        const turretData: Turret = this;
        const turretController: GameObj = turretData.controller;
        const turretControllerOutline: GameObj = turretData.controllerOutline;

        const tankData: Tank = this.tank;
        const tankController: GameObj = tankData.controller;

        if (tankPos) {
            tween(turretController.pos, tankPos, .15, (p) => turretController.pos = p, easings.linear)
            tween(turretControllerOutline.pos, tankPos, .15, (p) => turretControllerOutline.pos = p, easings.linear)
        } else {
            turretController.pos = tankController.pos // Assuming attachment to tank controller
            turretControllerOutline.pos = turretController.pos;
        }

        // Rotation
        const turretPos = tankController.pos;
        const mouseP = toWorld(targetPosition || mousePos());

        const angle = Math.atan2(mouseP.y - turretPos.y, mouseP.x - turretPos.x);
        const angleInDeg = ((angle * 180) / Math.PI)-180;

        turretController.angle = angleInDeg
        turretControllerOutline.angle = angleInDeg
        turretData.angle = angleInDeg-180

        /* const angularVelocity = 1;
        const currentAngle = turretData.angle;

        const turretRotations = Math.floor(currentAngle / 360);
        const desiredAngle = turretController.pos.angle(targetPosition) + (turretRotations + 1) * 360;

        const rotationLeft = (desiredAngle - currentAngle + 360) % 360;
        const rotationRight = 360 - rotationLeft;
        const angularDirection = (rotationLeft > rotationRight) ? 1 : -1;

        turretData.angle += 100 * angularVelocity * angularDirection * dt()
        turretController.angle = turretData.angle + 180;
        turretControllerOutline.angle = turretData.angle + 180; */
    }
}

export { Turret };