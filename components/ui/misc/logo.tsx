import React from 'react';

interface SpoonLogoProps {
  className?: string;
}

export function SpoonLogo({
  className = 'text-5xl',
}: SpoonLogoProps) {
  /*
   * The complete logo uses `em` units, so changing the text-size class
   * scales the blocks, letters, spacing, and shadows together.
   *
   * Examples:
   *   <SpoonLogo className="text-2xl" />
   *   <SpoonLogo className="text-7xl" />
   *   <SpoonLogo className="text-[100px]" />
   */
  return (
    <div
      className={`flex items-center select-none ${className}`}
      style={{
        /*
         * Horizontal space between blocks.
         *
         * Decrease this to bring the blocks closer together.
         * You can also use a negative value if you want them to overlap.
         */
        gap: '0.25em',
      }}
      role="img"
      aria-label="SPOON Logo"
    >
      <LogoBlock colorClass="bg-primary" letter="S" />
      <LogoBlock colorClass="bg-secondary" letter="P" />
      <LogoBlock colorClass="bg-accent" letter="O" />
      <LogoBlock colorClass="bg-accent" letter="O" />
      <LogoBlock colorClass="bg-tertiary" letter="N" />
    </div>
  );
}

interface LogoBlockProps {
  colorClass: string;
  letter: string;
}

function LogoBlock({ colorClass, letter }: LogoBlockProps) {
  /*
   * These values are intentionally grouped here so you can adjust the logo
   * without searching through the JSX.
   */

  // Width of each colored background block.
  // Increase this if the blocks still look too narrow.
  const blockWidth = '1.32em';

  // Height of each colored background block.
  // Increase this if the blocks need to look taller.
  const blockHeight = '1.38em';

  /*
   * Corner order:
   * top-left, top-right, bottom-right, bottom-left
   *
   * Larger values create softer, rounder corners.
   * The top-left and bottom-right remain the most rounded to preserve
   * the logo's directional shape.
   */
  const blockRadius = '0.22em 0.25em 0.22em 0.22em';

  /*
   * Negative skew makes the block lean to the left.
   *
   * More negative = stronger lean.
   * Less negative = more upright.
   */
  const blockSkew = '-15deg';

  /*
   * Controls the letter size relative to the block.
   *
   * Increase this if the letters need to extend farther outside the block.
   */
  const letterSize = '1.72em';

  /*
   * Moves the letter horizontally.
   *
   * Less than 50% moves the letter left.
   * Greater than 50% moves it right.
   *
   * Try 44%, 42%, or 40% for progressively stronger left movement.
   */
  const letterLeft = '25%';

  /*
   * Controls vertical alignment.
   *
   * Less than 50% moves the letter up.
   * Greater than 50% moves it down.
   */
  const letterTop = '60%';

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center ${colorClass}`}
      style={{
        width: blockWidth,
        height: blockHeight,
        borderRadius: blockRadius,
        transform: `skewX(${blockSkew})`,

        /*
         * Keep the oversized letters visible when they extend beyond the
         * colored background.
         */
        overflow: 'visible',
      }}
    >
      <span
        aria-hidden="true"
        className="absolute font-black uppercase leading-none tracking-tighter text-white"
        style={{
          fontSize: letterSize,

          /*
           * Arial Black generally resembles the thick reference lettering.
           * Impact is used as a fallback when Arial Black is unavailable.
           */
          fontFamily: '"Arial Black", Impact, system-ui, sans-serif',

          /*
           * A small shadow gives the letters the subtle depth visible in
           * the reference image.
           */
          // textShadow: '0.02em 0.04em 0.05em rgba(0, 0, 0, 0.18)',

          top: letterTop,
          left: letterLeft,

          /*
           * This centers the letter around the `top` and `left` coordinates.
           *
           * The letter is intentionally NOT unskewed because the reference
           * lettering leans with the blocks.
           */
          transform: 'translate(-50%, -50%)',
        }}
      >
        {letter}
      </span>
    </div>
  );
}



// The main values to tweak are:

// ```tsx
// const blockWidth = '1.52em';  // Background width
// const blockHeight = '1.38em'; // Background height
// const blockRadius = '0.7em 0.25em 0.7em 0.25em';
// const blockSkew = '-15deg';
// const letterSize = '1.72em';
// const letterLeft = '43%';     // Lower this to move letters farther left
// ```

// One important limitation is that characters such as `S`, `O`, and `N` have different visual widths. If individual letters still look uneven, add an optional per-letter horizontal offset rather than applying exactly the same `left` value to every character.