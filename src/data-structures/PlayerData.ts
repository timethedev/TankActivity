import { Projectile } from "../client/assets/projectiles/Projectile";
import { Vec2 } from "../server/main";
import { Powerup } from "./Powerup";
import { User } from "./User"

export interface PlayerData {
  position: Vec2;
  angle: number;
  alive: boolean;
  userId: number | string | undefined;
  powerup: Powerup;
  mousePos: Vec2;
}


