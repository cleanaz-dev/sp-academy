import { PictureGameData } from "@/lib/schema/games/picture-game-schema";

interface DuckAWearProps {
  gameData: PictureGameData;
  targetLanguage?: string; 
  nativeLanguage?: string; 
  onGameOver: (finalScore: number) => void;
}

export default function PictureGameEngine({ 
  gameData, 
  targetLanguage = "ENGLISH",
  nativeLanguage = "FRENCH",
  onGameOver 
}: DuckAWearProps) {
    return (
        <div>
            Picture Game!
        </div>
    )
}