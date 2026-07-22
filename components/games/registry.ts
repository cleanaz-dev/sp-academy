import dynamic from "next/dynamic";
import { GameType } from "@prisma/client";

export const GAME_COMPONENTS = {
  // Your previous visual game
  [GameType.Visual]: dynamic(() => import("./types/visual-game")),
  
  // Your new voice describe game!
  [GameType.Speech_Describe]: dynamic(() => import("./types/image-describe-game")),
};