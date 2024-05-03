import Powerups from "./Powerups";
import { randomPositionInsidePolygon } from "../common/Polygon";
import Maps from "../common/Maps";
import { Vec2, generateId } from "../server/main";

export class Powerup {
  name: string;
  pos: Vec2;
  id: number | undefined;

  constructor() {
    let randomPowerup = Powerups[Math.floor(Math.random() * Powerups.length)]; // generate a randomPowerup
    let randomPos = randomPositionInsidePolygon(Maps[0].polygon.map((p) => { return [p.x, p.y]; }));

    this.name = randomPowerup.name;
    if (randomPos) {
      this.pos = {
        x: randomPos[0],
        y: randomPos[1]
      };
    }
    this.id = generateId(); //generate random id for the powerup, inorder to be able to classify this specific one in the future
  }
}
