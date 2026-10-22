// lib/foundation/tools.ts

// Spoons: 1->1, 2->3, 3->5 | 4->8, 5->10, 6->12
export function getSpoonSpriteOrderIndex(spoon: number): number {
  const milestoneIndex = Math.ceil(spoon / 3);
  return (spoon - 1) * 2 + (milestoneIndex - 1) + 1;
}

// Vocab Bridges: 1->2, 2->4, 3->6 | 4->9, 5->11, 6->13
export function getBridgeSpriteOrderIndex(spoon: number): number {
  return getSpoonSpriteOrderIndex(spoon) + 1;
}

// Boss Stages: Boss 1->7, Boss 2->14, Boss 3->21
export function getBossSpriteOrderIndex(milestoneIndex: number): number {
  return milestoneIndex * 7;
}