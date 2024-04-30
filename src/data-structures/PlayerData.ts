import { Projectile } from "../client/assets/projectiles/Projectile";
import { Vec2 } from "../server/main";

export interface PlayerData {
  position: Vec2;
  angle: number;
  bulletType: Projectile;
  alive: boolean;
  userId: number | undefined;
}


