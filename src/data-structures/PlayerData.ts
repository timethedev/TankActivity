import { Vec2 } from "../server/main";

export interface PlayerData {
  position: Vec2;
  angle: number;
  alive: boolean;
  userId: number | undefined;
}


