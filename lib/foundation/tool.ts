// Maps spoon number (1,2,3,4...) to the 7-step cycle index (1,3,5, 8,10,12...)
export function getSpoonSpriteOrderIndex(spoon: number): number {
  const milestoneIndex = Math.ceil(spoon / 3);
  return (spoon - 1) * 2 + (milestoneIndex - 1) + 1;
}