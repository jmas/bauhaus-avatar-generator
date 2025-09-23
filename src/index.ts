function crc32(str: string): number {
  let crc = 0 ^ -1;
  for (let i = 0; i < str.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i)) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const table: number[] = (() => {
  let c: number;
  const tbl: number[] = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    tbl[n] = c;
  }
  return tbl;
})();

function makeRand(seed: number): () => number {
  return function (): number {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

// All 80 patterns from the image with exact colors
const patterns = [
  // Row 1 (patterns 1-10)
  "diagonal_split_red_blue_yellow_quarter", // 1.1
  "half_yellow_half_striped", // 1.2
  "four_triangles_yellow_red_blue", // 1.3
  "diagonal_split_red_blue_yellow_quarter_alt", // 1.4
  "checkerboard_black_white", // 1.5
  "diagonal_split_red_blue_white_triangle", // 1.6
  "six_red_dots_grid", // 1.7
  "overlapping_yellow_blue_circles", // 1.8
  "diagonal_split_red_blue_yellow_quarter_copy", // 1.9
  "black_triangle_arrow", // 1.10

  // Row 2 (patterns 11-20)
  "black_diamond_white_center", // 2.1
  "yellow_blue_quarters_red_triangle", // 2.2
  "yellow_blue_quarters_red_triangle_alt", // 2.3
  "half_yellow_half_striped_copy", // 2.4
  "solid_yellow_circle", // 2.5
  "diagonal_red_stripes", // 2.6
  "four_quarters_red_blue_yellow_white", // 2.7
  "black_triangle_arrow_copy", // 2.8
  "yellow_blue_quarters_red_triangle_copy", // 2.9
  "solid_yellow_circle_copy", // 2.10

  // Row 3 (patterns 21-30)
  "blue_outlined_square", // 3.1
  "four_triangles_black_yellow_blue", // 3.2
  "four_triangles_yellow_red_blue_copy", // 3.3
  "curved_c_black", // 3.4
  "plant_motif_black_stem", // 3.5
  "yellow_blue_quarters", // 3.6
  "blue_star_cross", // 3.7
  "yellow_blue_quarters_red_triangle_copy2", // 3.8
  "curved_c_black_copy", // 3.9
  "plant_motif_black_stem_copy", // 3.10

  // Row 4 (patterns 31-40)
  "l_shapes_black_red", // 4.1
  "four_quarters_red_blue_yellow_black", // 4.2
  "left_arrow_black", // 4.3
  "red_blue_quarters_yellow_triangle", // 4.4
  "semi_circles_blue_red_striped", // 4.5
  "cross_squares_yellow_blue_red_black", // 4.6
  "black_triangle_arrow_copy2", // 4.7
  "diagonal_split_red_blue_yellow_quarter_copy2", // 4.8
  "l_shapes_black_red_copy", // 4.9
  "cross_squares_yellow_blue_red_black_copy", // 4.10

  // Row 5 (patterns 41-50)
  "concentric_red_circles", // 5.1
  "semi_circles_blue_red_striped_copy", // 5.2
  "four_triangles_yellow_red_blue_copy2", // 5.3
  "semi_circles_blue_red_striped_copy2", // 5.4
  "semi_circles_blue_red_striped_copy3", // 5.5
  "diagonal_split_red_blue_yellow_quarter_copy3", // 5.6
  "corner_black_triangles", // 5.7
  "yellow_blue_quarters_copy", // 5.8
  "four_blue_dots", // 5.9
  "concentric_red_circles_copy", // 5.10

  // Row 6 (patterns 51-60)
  "yellow_red_quarters", // 6.1
  "semi_circles_blue_red_striped_copy4", // 6.2
  "three_black_diamonds", // 6.3
  "cross_squares_yellow_blue_red_black_copy2", // 6.4
  "red_blue_petal_flower", // 6.5
  "horizontal_stripes_red_yellow_blue", // 6.6
  "semi_circles_blue_red_striped_copy5", // 6.7
  "vertical_black_arrow", // 6.8
  "yellow_red_quarters_copy", // 6.9
  "three_black_diamonds_copy", // 6.10

  // Row 7 (patterns 61-70)
  "red_yellow_semi_circles", // 7.1
  "half_blue_half_striped", // 7.2
  "diagonal_split_red_blue_yellow_quarter_copy4", // 7.3
  "grid_blue_dots", // 7.4
  "four_yellow_circles_red_centers", // 7.5
  "half_yellow_half_striped_copy2", // 7.6
  "yellow_circle_blue_red_quarters", // 7.7
  "four_quarters_red_blue_yellow_black_copy", // 7.8
  "red_yellow_semi_circles_copy", // 7.9
  "grid_blue_dots_copy", // 7.10

  // Row 8 (patterns 71-80)
  "yellow_circle_blue_quarter", // 8.1
  "black_k_shape", // 8.2
  "diagonal_split_red_blue_yellow_quarter_copy5", // 8.3
  "black_triangle_arrow_copy3", // 8.4
  "red_blue_petal_flower_copy", // 8.5
  "semi_circles_blue_red_striped_copy6", // 8.6
  "curved_c_black_copy2", // 8.7
  "facing_black_semicircles_red_center", // 8.8
  "black_plus_sign", // 8.9
  "yellow_circle_blue_quarter_copy", // 8.10
] as const;

type Pattern = (typeof patterns)[number];

function generatePattern(
  pattern: Pattern,
  inner: number,
  palette: string[],
  rand: () => number,
  backgroundColor?: string
): string {
  // Helper function to get a color that's different from background
  const getSafeColor = (paletteIndex: number) => {
    const color = palette[paletteIndex];
    if (backgroundColor && color === backgroundColor) {
      // Find a different color from the palette
      for (let i = 0; i < palette.length; i++) {
        if (palette[i] !== backgroundColor) {
          return palette[i];
        }
      }
    }
    return color;
  };
  // Standard size constants for consistent proportions
  const sizes = {
    tiny: inner * 0.05, // 5% - very small elements
    small: inner * 0.1, // 10% - small elements
    medium: inner * 0.15, // 15% - medium elements
    large: inner * 0.25, // 25% - large elements
    xlarge: inner * 0.4, // 40% - extra large elements
    full: inner * 0.5, // 50% - half cell
    cell: inner, // 100% - full cell
  };

  // Standard position constants for consistent placement
  const pos = {
    quarter: inner * 0.25, // 25% from edge
    third: inner * 0.33, // 33% from edge
    center: inner * 0.5, // 50% - center
    twoThirds: inner * 0.67, // 67% from edge
    threeQuarters: inner * 0.75, // 75% from edge
  };

  // Helper function to get random colors from palette
  const getRandomColor = () => palette[Math.floor(rand() * palette.length)];

  // Helper function to get high-contrast harmonious colors with figure-background contrast
  const getHarmoniousColors = (count: number) => {
    // Pick a random base color
    const baseColor = BASE_COLORS[Math.floor(rand() * BASE_COLORS.length)];
    const relationships =
      COLOR_RELATIONSHIPS[baseColor as keyof typeof COLOR_RELATIONSHIPS];

    const colors: string[] = [baseColor];

    if (count > 1) {
      // Prioritize complementary color for maximum contrast (80% chance)
      if (Math.random() < 0.8) {
        colors.push(relationships.complement);
      }

      // Fill remaining with high-contrast colors
      const remainingCount = count - colors.length;
      if (remainingCount > 0) {
        const triadicColors = relationships.triadic;
        const analogousColors = relationships.analogous;

        // Prioritize triadic colors for better contrast
        if (Math.random() < 0.6) {
          // Add triadic colors first (they provide better contrast)
          for (
            let i = 0;
            i < Math.min(remainingCount, triadicColors.length);
            i++
          ) {
            colors.push(triadicColors[i]);
          }

          // If still need more colors, add high-contrast analogous
          const stillNeeded = count - colors.length;
          if (stillNeeded > 0) {
            // Pick the most contrasting analogous colors
            const highContrastAnalogous = [
              analogousColors[0], // Dark variant
              analogousColors[analogousColors.length - 1], // Light variant
            ];

            for (
              let i = 0;
              i < Math.min(stillNeeded, highContrastAnalogous.length);
              i++
            ) {
              colors.push(highContrastAnalogous[i]);
            }
          }
        } else {
          // Sometimes use high-contrast analogous first
          const highContrastAnalogous = [
            analogousColors[0], // Dark variant
            analogousColors[analogousColors.length - 1], // Light variant
          ];

          for (
            let i = 0;
            i < Math.min(remainingCount, highContrastAnalogous.length);
            i++
          ) {
            colors.push(highContrastAnalogous[i]);
          }

          // If still need more colors, add triadic
          const stillNeeded = count - colors.length;
          if (stillNeeded > 0) {
            for (
              let i = 0;
              i < Math.min(stillNeeded, triadicColors.length);
              i++
            ) {
              colors.push(triadicColors[i]);
            }
          }
        }
      }

      // If we still need more colors, fill with high-contrast colors from palette
      while (colors.length < count) {
        const randomColor = getRandomColor();
        if (!colors.includes(randomColor)) {
          colors.push(randomColor);
        }
      }
    }

    return colors.slice(0, count);
  };

  // Helper function to get contrasting colors that work well together and differ from background
  const getContrastingColors = (count: number, backgroundColor?: string) => {
    let colors = getHarmoniousColors(count);
    // If background color is provided, ensure pattern colors are different
    if (backgroundColor) {
      colors = colors.filter((color) => color !== backgroundColor);
      // If we don't have enough colors after filtering, get more colors
      while (colors.length < count) {
        const additionalColors = getHarmoniousColors(count + 1);
        const newColors = additionalColors.filter(
          (color) => color !== backgroundColor && !colors.includes(color)
        );
        colors.push(...newColors);
      }
      // Take only the number of colors we need
      colors = colors.slice(0, count);
    }
    return colors;
  };

  // Helper function to get random sizes with variation
  const getRandomSize = (baseSize: number, variation: number = 0.3) => {
    const minSize = baseSize * (1 - variation);
    const maxSize = baseSize * (1 + variation);
    return minSize + rand() * (maxSize - minSize);
  };

  // Helper function to get random position with variation
  const getRandomPos = (basePos: number, variation: number = 0.2) => {
    const minPos = basePos * (1 - variation);
    const maxPos = basePos * (1 + variation);
    return minPos + rand() * (maxPos - minPos);
  };
  switch (pattern) {
    // Row 1 patterns (1-10)
    case "diagonal_split_red_blue_yellow_quarter": // 1.1
      const colors1 = getContrastingColors(3);
      const circleX1 = getRandomPos(pos.quarter);
      const circleY1 = getRandomPos(pos.threeQuarters);
      const circleR1 = getRandomSize(sizes.large);
      return `<polygon points="0,0 ${inner},0 ${inner},${inner} 0,${inner}" fill="${colors1[0]}" />
              <polygon points="0,0 ${inner},${inner} 0,${inner}" fill="${colors1[1]}" />
              <circle cx="${circleX1}" cy="${circleY1}" r="${circleR1}" fill="${colors1[2]}" />`;

    case "half_yellow_half_striped": // 1.2
      const colors2 = getContrastingColors(3);
      return `<rect x="0" y="0" width="${sizes.full}" height="${
        sizes.cell
      }" fill="${colors2[0]}" />
              <rect x="${sizes.full}" y="0" width="${sizes.full}" height="${
        sizes.cell
      }" fill="${colors2[1]}" />
              ${Array.from({ length: 8 })
                .map(
                  (_, i) =>
                    `<rect x="${sizes.full}" y="${i * inner * 0.125}" width="${
                      sizes.full
                    }" height="${sizes.tiny}" fill="${colors2[2]}" />`
                )
                .join("")}`;

    case "four_triangles_yellow_red_blue": // 1.3
      const colors1_3 = getContrastingColors(3);
      return `<polygon points="0,0 ${inner},0 ${inner * 0.5},${
        inner * 0.5
      }" fill="${colors1_3[0]}" />
              <polygon points="${inner},0 ${inner},${inner} ${inner * 0.5},${
        inner * 0.5
      }" fill="${colors1_3[1]}" />
              <polygon points="0,${inner} ${inner},${inner} ${inner * 0.5},${
        inner * 0.5
      }" fill="${colors1_3[2]}" />
              <polygon points="0,0 0,${inner} ${inner * 0.5},${
        inner * 0.5
      }" fill="${colors1_3[0]}" />`;

    case "diagonal_split_red_blue_yellow_quarter_alt": // 1.4
      return `<polygon points="0,0 ${inner},0 ${inner},${inner} 0,${inner}" fill="${getSafeColor(
        0
      )}" />
              <polygon points="0,0 ${inner},${inner} 0,${inner}" fill="${getSafeColor(
        9
      )}" />
              <circle cx="${inner * 0.75}" cy="${inner * 0.25}" r="${
        inner * 0.2
      }" fill="${palette[5]}" />`;

    case "checkerboard_black_white": // 1.5
      const checkerColors = getContrastingColors(2);
      return `<rect x="0" y="0" width="${inner * 0.5}" height="${
        inner * 0.5
      }" fill="${BLACK}" />
              <rect x="${inner * 0.5}" y="${inner * 0.5}" width="${
        inner * 0.5
      }" height="${inner * 0.5}" fill="${BLACK}" />
              <rect x="${inner * 0.5}" y="0" width="${inner * 0.5}" height="${
        inner * 0.5
      }" fill="${checkerColors[0]}" />
              <rect x="0" y="${inner * 0.5}" width="${inner * 0.5}" height="${
        inner * 0.5
      }" fill="${checkerColors[1]}" />`;

    case "diagonal_split_red_blue_white_triangle": // 1.6
      return `<polygon points="0,0 ${inner},0 ${inner},${inner} 0,${inner}" fill="${getSafeColor(
        0
      )}" />
              <polygon points="0,0 ${inner},${inner} 0,${inner}" fill="${getSafeColor(
        9
      )}" />
              <polygon points="0,0 ${inner * 0.5},${
        inner * 0.5
      } 0,${inner}" fill="${palette[4]}" />`;

    case "six_red_dots_grid": // 1.7
      return Array.from({ length: 2 })
        .map((_, row) =>
          Array.from({ length: 3 })
            .map(
              (_, col) =>
                `<circle cx="${inner * (0.2 + col * 0.3)}" cy="${
                  inner * (0.25 + row * 0.5)
                }" r="${inner * 0.08}" fill="${palette[0]}" />`
            )
            .join("")
        )
        .join("");

    case "overlapping_yellow_blue_circles": // 1.8
      const colors8 = getContrastingColors(3);
      const circle1X = getRandomPos(inner * 0.4);
      const circle1Y = getRandomPos(inner * 0.4);
      const circle2X = getRandomPos(inner * 0.6);
      const circle2Y = getRandomPos(inner * 0.6);
      const circle1R = getRandomSize(sizes.xlarge);
      const circle2R = getRandomSize(sizes.xlarge);
      const inner1R = getRandomSize(sizes.small);
      const inner2R = getRandomSize(sizes.small);
      return `<circle cx="${circle1X}" cy="${circle1Y}" r="${circle1R}" fill="${colors8[0]}" />
              <circle cx="${circle2X}" cy="${circle2Y}" r="${circle2R}" fill="${colors8[1]}" />
              <circle cx="${circle1X}" cy="${circle1Y}" r="${inner1R}" fill="${colors8[2]}" />
              <circle cx="${circle2X}" cy="${circle2Y}" r="${inner2R}" fill="${colors8[2]}" />`;

    case "diagonal_split_red_blue_yellow_quarter_copy": // 1.9
      return `<polygon points="0,0 ${inner},0 ${inner},${inner} 0,${inner}" fill="${getSafeColor(
        0
      )}" />
              <polygon points="0,0 ${inner},${inner} 0,${inner}" fill="${getSafeColor(
        9
      )}" />
              <circle cx="${inner * 0.25}" cy="${inner * 0.75}" r="${
        inner * 0.2
      }" fill="${palette[5]}" />`;

    case "black_triangle_arrow": // 1.10
      return `<polygon points="${inner * 0.2},${inner * 0.2} ${inner * 0.8},${
        inner * 0.2
      } ${inner * 0.8},${inner * 0.1} ${inner},${inner * 0.5} ${inner * 0.8},${
        inner * 0.9
      } ${inner * 0.8},${inner * 0.8} ${inner * 0.2},${
        inner * 0.8
      }" fill="${BLACK}" />`;

    // Row 2 patterns (11-20)
    case "black_diamond_white_center": // 2.1
      const diamondColor = getRandomColor();
      return `<polygon points="${inner * 0.5},0 ${inner},${inner * 0.5} ${
        inner * 0.5
      },${inner} 0,${inner * 0.5}" fill="${BLACK}" />
              <rect x="${inner * 0.4}" y="${inner * 0.4}" width="${
        inner * 0.2
      }" height="${inner * 0.2}" fill="${diamondColor}" />`;

    case "yellow_blue_quarters_red_triangle": // 2.2
      const triangleColors = getContrastingColors(3, backgroundColor);
      return `<path d="M 0 0 A ${inner} ${inner} 0 0 1 ${inner} 0 L 0 0 Z" fill="${
        triangleColors[0]
      }" />
              <path d="M ${inner} ${inner} A ${inner} ${inner} 0 0 1 0 ${inner} L ${inner} ${inner} Z" fill="${
        triangleColors[1]
      }" />
              <polygon points="${inner * 0.8},${inner * 0.2} ${inner * 0.8},${
        inner * 0.4
      } ${inner * 0.6},${inner * 0.3}" fill="${triangleColors[2]}" />`;

    case "yellow_blue_quarters_red_triangle_alt": // 2.3
      return `<path d="M 0 0 A ${inner} ${inner} 0 0 1 ${inner} 0 L 0 0 Z" fill="${getSafeColor(
        5
      )}" />
              <path d="M ${inner} ${inner} A ${inner} ${inner} 0 0 1 0 ${inner} L ${inner} ${inner} Z" fill="${getSafeColor(
        9
      )}" />
              <polygon points="${inner * 0.2},${inner * 0.8} ${inner * 0.4},${
        inner * 0.8
      } ${inner * 0.3},${inner * 0.6}" fill="${palette[0]}" />`;

    case "half_yellow_half_striped_copy": // 2.4
      return `<rect x="0" y="0" width="${
        inner * 0.5
      }" height="${inner}" fill="${palette[5]}" />
              <rect x="${inner * 0.5}" y="0" width="${
        inner * 0.5
      }" height="${inner}" fill="${palette[4]}" />
              ${Array.from({ length: 8 })
                .map(
                  (_, i) =>
                    `<rect x="${inner * 0.5}" y="${i * inner * 0.125}" width="${
                      inner * 0.5
                    }" height="${inner * 0.02}" fill="${palette[1]}" />`
                )
                .join("")}`;

    case "solid_yellow_circle": // 2.5
      const centerX = getRandomPos(pos.center, 0.1);
      const centerY = getRandomPos(pos.center, 0.1);
      const centerR = getRandomSize(sizes.full, 0.2);
      return `<circle cx="${centerX}" cy="${centerY}" r="${centerR}" fill="${getRandomColor()}" />`;

    case "diagonal_red_stripes": // 2.6
      return Array.from({ length: 8 })
        .map((_, i) => {
          const x = i * inner * 0.1;
          return `<rect x="${x}" y="${x}" width="${
            inner * 0.1
          }" height="${inner}" fill="${
            i % 2 === 0 ? "${palette[0]}" : "${palette[4]}"
          }" transform="rotate(45 ${x + inner * 0.05} ${inner / 2})" />`;
        })
        .join("");

    case "four_quarters_red_blue_yellow_white": // 2.7
      return `<path d="M 0 0 A ${inner} ${inner} 0 0 1 ${inner} 0 L 0 0 Z" fill="${getSafeColor(
        0
      )}" />
              <path d="M ${inner} 0 A ${inner} ${inner} 0 0 1 ${inner} ${inner} L ${inner} 0 Z" fill="${
        palette[9]
      }" />
              <path d="M 0 ${inner} A ${inner} ${inner} 0 0 1 0 0 L 0 ${inner} Z" fill="${getSafeColor(
        5
      )}" />
              <path d="M ${inner} ${inner} A ${inner} ${inner} 0 0 1 0 ${inner} L ${inner} ${inner} Z" fill="${
        palette[4]
      }" />`;

    case "black_triangle_arrow_copy": // 2.8
      return `<polygon points="${inner * 0.2},${inner * 0.2} ${inner * 0.8},${
        inner * 0.2
      } ${inner * 0.8},${inner * 0.1} ${inner},${inner * 0.5} ${inner * 0.8},${
        inner * 0.9
      } ${inner * 0.8},${inner * 0.8} ${inner * 0.2},${inner * 0.8}" fill="${
        palette[1]
      }" />`;

    case "yellow_blue_quarters_red_triangle_copy": // 2.9
      return `<path d="M 0 0 A ${inner} ${inner} 0 0 1 ${inner} 0 L 0 0 Z" fill="${getSafeColor(
        5
      )}" />
              <path d="M ${inner} ${inner} A ${inner} ${inner} 0 0 1 0 ${inner} L ${inner} ${inner} Z" fill="${getSafeColor(
        9
      )}" />
              <polygon points="${inner * 0.8},${inner * 0.2} ${inner * 0.8},${
        inner * 0.4
      } ${inner * 0.6},${inner * 0.3}" fill="${getSafeColor(0)}" />`;

    case "solid_yellow_circle_copy": // 2.10
      return `<circle cx="${inner / 2}" cy="${inner / 2}" r="${
        inner / 2
      }" fill="${palette[5]}" />`;

    // Row 3 patterns (21-30)
    case "blue_outlined_square": // 3.1
      return `<rect x="0" y="0" width="${inner}" height="${inner}" fill="${
        palette[4]
      }" stroke="${palette[9]}" stroke-width="${inner * 0.1}" />`;

    case "four_triangles_black_yellow_blue": // 3.2
      return `<polygon points="0,0 ${inner},0 ${inner * 0.5},${
        inner * 0.5
      }" fill="${palette[1]}" />
              <polygon points="${inner},0 ${inner},${inner} ${inner * 0.5},${
        inner * 0.5
      }" fill="${palette[9]}" />
              <polygon points="0,${inner} ${inner},${inner} ${inner * 0.5},${
        inner * 0.5
      }" fill="${palette[1]}" />
              <polygon points="0,0 0,${inner} ${inner * 0.5},${
        inner * 0.5
      }" fill="${palette[5]}" />`;

    case "four_triangles_yellow_red_blue_copy": // 3.3
      return `<polygon points="0,0 ${inner},0 ${inner * 0.5},${
        inner * 0.5
      }" fill="${palette[5]}" />
              <polygon points="${inner},0 ${inner},${inner} ${inner * 0.5},${
        inner * 0.5
      }" fill="${palette[9]}" />
              <polygon points="0,${inner} ${inner},${inner} ${inner * 0.5},${
        inner * 0.5
      }" fill="${palette[5]}" />
              <polygon points="0,0 0,${inner} ${inner * 0.5},${
        inner * 0.5
      }" fill="${palette[0]}" />`;

    case "curved_c_black": // 3.4
      return `<path d="M ${inner * 0.2} ${inner * 0.2} Q ${inner * 0.5} ${
        inner * 0.1
      } ${inner * 0.8} ${inner * 0.2}" stroke="${BLACK}" stroke-width="${
        inner * 0.05
      }" fill="none" />
              <path d="M ${inner * 0.2} ${inner * 0.4} Q ${inner * 0.5} ${
        inner * 0.3
      } ${inner * 0.8} ${inner * 0.4}" stroke="${BLACK}" stroke-width="${
        inner * 0.05
      }" fill="none" />
              <path d="M ${inner * 0.2} ${inner * 0.6} Q ${inner * 0.5} ${
        inner * 0.5
      } ${inner * 0.8} ${inner * 0.6}" stroke="${BLACK}" stroke-width="${
        inner * 0.05
      }" fill="none" />`;

    case "plant_motif_black_stem": // 3.5
      const plantColors = getContrastingColors(3);
      return `<rect x="${inner * 0.45}" y="${inner * 0.3}" width="${
        inner * 0.1
      }" height="${inner * 0.4}" fill="${BLACK}" />
              <circle cx="${inner * 0.3}" cy="${inner * 0.4}" r="${
        inner * 0.15
      }" fill="${plantColors[0]}" />
              <circle cx="${inner * 0.7}" cy="${inner * 0.4}" r="${
        inner * 0.15
      }" fill="${plantColors[1]}" />
              <circle cx="${inner * 0.3}" cy="${inner * 0.6}" r="${
        inner * 0.15
      }" fill="${plantColors[2]}" />
              <circle cx="${inner * 0.7}" cy="${inner * 0.6}" r="${
        inner * 0.15
      }" fill="${plantColors[0]}" />`;

    case "yellow_blue_quarters": // 3.6
      const quarterColors = getContrastingColors(2);
      return `<path d="M 0 0 A ${inner} ${inner} 0 0 1 ${inner} 0 L 0 0 Z" fill="${quarterColors[0]}" />
              <path d="M ${inner} ${inner} A ${inner} ${inner} 0 0 1 0 ${inner} L ${inner} ${inner} Z" fill="${quarterColors[1]}" />`;

    case "blue_star_cross": // 3.7
      const starColors = getContrastingColors(1, backgroundColor);
      return `<polygon points="${inner * 0.5},0 ${inner * 0.6},${
        inner * 0.4
      } ${inner},${inner * 0.4} ${inner * 0.7},${inner * 0.6} ${
        inner * 0.8
      },${inner} ${inner * 0.5},${inner * 0.8} ${inner * 0.2},${inner} ${
        inner * 0.3
      },${inner * 0.6} 0,${inner * 0.4} ${inner * 0.4},${inner * 0.4}" fill="${
        starColors[0]
      }" />`;

    case "yellow_blue_quarters_red_triangle_copy2": // 3.8
      return `<path d="M 0 0 A ${inner} ${inner} 0 0 1 ${inner} 0 L 0 0 Z" fill="${getSafeColor(
        5
      )}" />
              <path d="M ${inner} ${inner} A ${inner} ${inner} 0 0 1 0 ${inner} L ${inner} ${inner} Z" fill="${getSafeColor(
        9
      )}" />
              <polygon points="${inner * 0.8},${inner * 0.2} ${inner * 0.8},${
        inner * 0.4
      } ${inner * 0.6},${inner * 0.3}" fill="${getSafeColor(0)}" />`;

    case "curved_c_black_copy": // 3.9
      return `<path d="M ${inner * 0.2} ${inner * 0.2} Q ${inner * 0.5} ${
        inner * 0.1
      } ${inner * 0.8} ${inner * 0.2}" stroke="${palette[1]}" stroke-width="${
        inner * 0.05
      }" fill="none" />
              <path d="M ${inner * 0.2} ${inner * 0.4} Q ${inner * 0.5} ${
        inner * 0.3
      } ${inner * 0.8} ${inner * 0.4}" stroke="${palette[1]}" stroke-width="${
        inner * 0.05
      }" fill="none" />
              <path d="M ${inner * 0.2} ${inner * 0.6} Q ${inner * 0.5} ${
        inner * 0.5
      } ${inner * 0.8} ${inner * 0.6}" stroke="${palette[1]}" stroke-width="${
        inner * 0.05
      }" fill="none" />`;

    case "plant_motif_black_stem_copy": // 3.10
      return `<rect x="${inner * 0.45}" y="${inner * 0.3}" width="${
        inner * 0.1
      }" height="${inner * 0.4}" fill="${palette[1]}" />
              <circle cx="${inner * 0.3}" cy="${inner * 0.4}" r="${
        inner * 0.15
      }" fill="${palette[5]}" />
              <circle cx="${inner * 0.7}" cy="${inner * 0.4}" r="${
        inner * 0.15
      }" fill="${palette[5]}" />
              <circle cx="${inner * 0.3}" cy="${inner * 0.6}" r="${
        inner * 0.15
      }" fill="${palette[0]}" />
              <circle cx="${inner * 0.7}" cy="${inner * 0.6}" r="${
        inner * 0.15
      }" fill="${palette[0]}" />`;

    // Row 4 patterns (31-40)
    case "l_shapes_black_red": // 4.1
      return `<path d="M 0 ${inner * 0.5} L 0 ${inner} L ${
        inner * 0.5
      } ${inner} L ${inner * 0.5} ${inner * 0.5} Z" fill="${palette[1]}" />
              <path d="M ${inner * 0.5} 0 L ${inner} 0 L ${inner} ${
        inner * 0.5
      } L ${inner * 0.5} ${inner * 0.5} Z" fill="${palette[0]}" />`;

    case "four_quarters_red_blue_yellow_black": // 4.2
      return `<path d="M 0 0 A ${inner} ${inner} 0 0 1 ${inner} 0 L 0 0 Z" fill="${getSafeColor(
        0
      )}" />
              <path d="M ${inner} 0 A ${inner} ${inner} 0 0 1 ${inner} ${inner} L ${inner} 0 Z" fill="${
        palette[9]
      }" />
              <path d="M 0 ${inner} A ${inner} ${inner} 0 0 1 0 0 L 0 ${inner} Z" fill="${getSafeColor(
        5
      )}" />
              <path d="M ${inner} ${inner} A ${inner} ${inner} 0 0 1 0 ${inner} L ${inner} ${inner} Z" fill="${
        palette[1]
      }" />`;

    case "left_arrow_black": // 4.3
      return `<rect x="${inner * 0.1}" y="${inner * 0.4}" width="${
        inner * 0.3
      }" height="${inner * 0.2}" fill="${palette[1]}" />
              <polygon points="${inner * 0.4},${inner * 0.3} ${inner * 0.4},${
        inner * 0.5
      } ${inner * 0.6},${inner * 0.4}" fill="${palette[1]}" />`;

    case "red_blue_quarters_yellow_triangle": // 4.4
      return `<path d="M 0 0 A ${inner} ${inner} 0 0 1 ${inner} 0 L 0 0 Z" fill="${getSafeColor(
        0
      )}" />
              <path d="M ${inner} ${inner} A ${inner} ${inner} 0 0 1 0 ${inner} L ${inner} ${inner} Z" fill="${getSafeColor(
        9
      )}" />
              <polygon points="${inner * 0.8},${inner * 0.2} ${inner * 0.8},${
        inner * 0.4
      } ${inner * 0.6},${inner * 0.3}" fill="${palette[5]}" />`;

    case "semi_circles_blue_red_striped": // 4.5
      return `<path d="M 0 ${inner * 0.5} A ${inner * 0.5} ${
        inner * 0.5
      } 0 0 1 ${inner} ${
        inner * 0.5
      } L ${inner} ${inner} L 0 ${inner} Z" fill="${palette[9]}" />
              <path d="M 0 0 A ${inner * 0.5} ${
        inner * 0.5
      } 0 0 0 ${inner} 0 L ${inner} ${inner * 0.5} L 0 ${
        inner * 0.5
      } Z" fill="${palette[0]}" />
              ${Array.from({ length: 4 })
                .map(
                  (_, i) =>
                    `<rect x="0" y="${
                      inner * 0.5 + i * inner * 0.125
                    }" width="${inner}" height="${inner * 0.02}" fill="${
                      palette[1]
                    }" />`
                )
                .join("")}`;

    case "cross_squares_yellow_blue_red_black": // 4.6
      const crossColors = getContrastingColors(4);
      return `<rect x="${inner * 0.1}" y="${inner * 0.35}" width="${
        inner * 0.3
      }" height="${inner * 0.3}" fill="${crossColors[0]}" />
              <rect x="${inner * 0.6}" y="${inner * 0.35}" width="${
        inner * 0.3
      }" height="${inner * 0.3}" fill="${crossColors[1]}" />
              <rect x="${inner * 0.35}" y="${inner * 0.1}" width="${
        inner * 0.3
      }" height="${inner * 0.3}" fill="${crossColors[2]}" />
              <rect x="${inner * 0.35}" y="${inner * 0.6}" width="${
        inner * 0.3
      }" height="${inner * 0.3}" fill="${BLACK}" />`;

    case "black_triangle_arrow_copy2": // 4.7
      return `<polygon points="${inner * 0.2},${inner * 0.2} ${inner * 0.8},${
        inner * 0.2
      } ${inner * 0.8},${inner * 0.1} ${inner},${inner * 0.5} ${inner * 0.8},${
        inner * 0.9
      } ${inner * 0.8},${inner * 0.8} ${inner * 0.2},${inner * 0.8}" fill="${
        palette[1]
      }" />`;

    case "diagonal_split_red_blue_yellow_quarter_copy2": // 4.8
      return `<polygon points="0,0 ${inner},0 ${inner},${inner} 0,${inner}" fill="${getSafeColor(
        0
      )}" />
              <polygon points="0,0 ${inner},${inner} 0,${inner}" fill="${getSafeColor(
        9
      )}" />
              <circle cx="${inner * 0.25}" cy="${inner * 0.75}" r="${
        inner * 0.2
      }" fill="${palette[5]}" />`;

    case "l_shapes_black_red_copy": // 4.9
      return `<path d="M 0 ${inner * 0.5} L 0 ${inner} L ${
        inner * 0.5
      } ${inner} L ${inner * 0.5} ${inner * 0.5} Z" fill="${palette[1]}" />
              <path d="M ${inner * 0.5} 0 L ${inner} 0 L ${inner} ${
        inner * 0.5
      } L ${inner * 0.5} ${inner * 0.5} Z" fill="${palette[0]}" />`;

    case "cross_squares_yellow_blue_red_black_copy": // 4.10
      return `<rect x="${inner * 0.1}" y="${inner * 0.35}" width="${
        inner * 0.3
      }" height="${inner * 0.3}" fill="${palette[5]}" />
              <rect x="${inner * 0.6}" y="${inner * 0.35}" width="${
        inner * 0.3
      }" height="${inner * 0.3}" fill="${palette[9]}" />
              <rect x="${inner * 0.35}" y="${inner * 0.1}" width="${
        inner * 0.3
      }" height="${inner * 0.3}" fill="${palette[0]}" />
              <rect x="${inner * 0.35}" y="${inner * 0.6}" width="${
        inner * 0.3
      }" height="${inner * 0.3}" fill="${palette[1]}" />`;

    // Row 5 patterns (41-50)
    case "concentric_red_circles": // 5.1
      const concentricColors = getContrastingColors(3);
      const concentricX = getRandomPos(pos.center, 0.1);
      const concentricY = getRandomPos(pos.center, 0.1);
      const outerR = getRandomSize(sizes.xlarge);
      const middleR = getRandomSize(sizes.large);
      const innerR = getRandomSize(sizes.small);
      return `<circle cx="${concentricX}" cy="${concentricY}" r="${outerR}" fill="${concentricColors[0]}" />
              <circle cx="${concentricX}" cy="${concentricY}" r="${middleR}" fill="${concentricColors[1]}" />
              <circle cx="${concentricX}" cy="${concentricY}" r="${innerR}" fill="${concentricColors[2]}" />`;

    case "semi_circles_blue_red_striped_copy": // 5.2
      return `<path d="M 0 ${inner * 0.5} A ${inner * 0.5} ${
        inner * 0.5
      } 0 0 1 ${inner} ${
        inner * 0.5
      } L ${inner} ${inner} L 0 ${inner} Z" fill="${palette[9]}" />
              <path d="M 0 0 A ${inner * 0.5} ${
        inner * 0.5
      } 0 0 0 ${inner} 0 L ${inner} ${inner * 0.5} L 0 ${
        inner * 0.5
      } Z" fill="${palette[0]}" />
              ${Array.from({ length: 4 })
                .map(
                  (_, i) =>
                    `<rect x="0" y="${
                      inner * 0.5 + i * inner * 0.125
                    }" width="${inner}" height="${inner * 0.02}" fill="${
                      palette[1]
                    }" />`
                )
                .join("")}`;

    case "four_triangles_yellow_red_blue_copy2": // 5.3
      return `<polygon points="0,0 ${inner},0 ${inner * 0.5},${
        inner * 0.5
      }" fill="${palette[5]}" />
              <polygon points="${inner},0 ${inner},${inner} ${inner * 0.5},${
        inner * 0.5
      }" fill="${palette[9]}" />
              <polygon points="0,${inner} ${inner},${inner} ${inner * 0.5},${
        inner * 0.5
      }" fill="${palette[5]}" />
              <polygon points="0,0 0,${inner} ${inner * 0.5},${
        inner * 0.5
      }" fill="${palette[0]}" />`;

    case "semi_circles_blue_red_striped_copy2": // 5.4
      return `<path d="M 0 ${inner * 0.5} A ${inner * 0.5} ${
        inner * 0.5
      } 0 0 1 ${inner} ${
        inner * 0.5
      } L ${inner} ${inner} L 0 ${inner} Z" fill="${palette[9]}" />
              <path d="M 0 0 A ${inner * 0.5} ${
        inner * 0.5
      } 0 0 0 ${inner} 0 L ${inner} ${inner * 0.5} L 0 ${
        inner * 0.5
      } Z" fill="${palette[0]}" />
              ${Array.from({ length: 4 })
                .map(
                  (_, i) =>
                    `<rect x="0" y="${
                      inner * 0.5 + i * inner * 0.125
                    }" width="${inner}" height="${inner * 0.02}" fill="${
                      palette[1]
                    }" />`
                )
                .join("")}`;

    case "semi_circles_blue_red_striped_copy3": // 5.5
      return `<path d="M 0 ${inner * 0.5} A ${inner * 0.5} ${
        inner * 0.5
      } 0 0 1 ${inner} ${
        inner * 0.5
      } L ${inner} ${inner} L 0 ${inner} Z" fill="${palette[9]}" />
              <path d="M 0 0 A ${inner * 0.5} ${
        inner * 0.5
      } 0 0 0 ${inner} 0 L ${inner} ${inner * 0.5} L 0 ${
        inner * 0.5
      } Z" fill="${palette[0]}" />
              ${Array.from({ length: 4 })
                .map(
                  (_, i) =>
                    `<rect x="0" y="${
                      inner * 0.5 + i * inner * 0.125
                    }" width="${inner}" height="${inner * 0.02}" fill="${
                      palette[1]
                    }" />`
                )
                .join("")}`;

    case "diagonal_split_red_blue_yellow_quarter_copy3": // 5.6
      return `<polygon points="0,0 ${inner},0 ${inner},${inner} 0,${inner}" fill="${getSafeColor(
        0
      )}" />
              <polygon points="0,0 ${inner},${inner} 0,${inner}" fill="${getSafeColor(
        9
      )}" />
              <circle cx="${inner * 0.75}" cy="${inner * 0.25}" r="${
        inner * 0.2
      }" fill="${palette[5]}" />`;

    case "corner_black_triangles": // 5.7
      return `<polygon points="0,0 ${inner * 0.3},0 0,${inner * 0.3}" fill="${
        palette[1]
      }" />
              <polygon points="${inner},${inner} ${
        inner * 0.7
      },${inner} ${inner},${inner * 0.7}" fill="${palette[1]}" />`;

    case "yellow_blue_quarters_copy": // 5.8
      return `<path d="M 0 0 A ${inner} ${inner} 0 0 1 ${inner} 0 L 0 0 Z" fill="${palette[5]}" />
              <path d="M ${inner} ${inner} A ${inner} ${inner} 0 0 1 0 ${inner} L ${inner} ${inner} Z" fill="${palette[9]}" />`;

    case "four_blue_dots": // 5.9
      const dotColors = getContrastingColors(4);
      const dot1X = getRandomPos(pos.quarter);
      const dot1Y = getRandomPos(pos.quarter);
      const dot2X = getRandomPos(pos.threeQuarters);
      const dot2Y = getRandomPos(pos.quarter);
      const dot3X = getRandomPos(pos.quarter);
      const dot3Y = getRandomPos(pos.threeQuarters);
      const dot4X = getRandomPos(pos.threeQuarters);
      const dot4Y = getRandomPos(pos.threeQuarters);
      const dot1R = getRandomSize(sizes.small);
      const dot2R = getRandomSize(sizes.small);
      const dot3R = getRandomSize(sizes.small);
      const dot4R = getRandomSize(sizes.small);
      return `<circle cx="${dot1X}" cy="${dot1Y}" r="${dot1R}" fill="${dotColors[0]}" />
              <circle cx="${dot2X}" cy="${dot2Y}" r="${dot2R}" fill="${dotColors[1]}" />
              <circle cx="${dot3X}" cy="${dot3Y}" r="${dot3R}" fill="${dotColors[2]}" />
              <circle cx="${dot4X}" cy="${dot4Y}" r="${dot4R}" fill="${dotColors[3]}" />`;

    case "concentric_red_circles_copy": // 5.10
      return `<circle cx="${inner / 2}" cy="${inner / 2}" r="${
        inner * 0.4
      }" fill="${palette[0]}" />
              <circle cx="${inner / 2}" cy="${inner / 2}" r="${
        inner * 0.25
      }" fill="${palette[0]}" />
              <circle cx="${inner / 2}" cy="${inner / 2}" r="${
        inner * 0.1
      }" fill="${palette[0]}" />`;

    // Row 6 patterns (51-60)
    case "yellow_red_quarters": // 6.1
      return `<path d="M 0 0 A ${inner} ${inner} 0 0 1 ${inner} 0 L 0 0 Z" fill="${palette[5]}" />
              <path d="M ${inner} ${inner} A ${inner} ${inner} 0 0 1 0 ${inner} L ${inner} ${inner} Z" fill="${palette[0]}" />`;

    case "semi_circles_blue_red_striped_copy4": // 6.2
      return `<path d="M 0 ${inner * 0.5} A ${inner * 0.5} ${
        inner * 0.5
      } 0 0 1 ${inner} ${
        inner * 0.5
      } L ${inner} ${inner} L 0 ${inner} Z" fill="${palette[9]}" />
              <path d="M 0 0 A ${inner * 0.5} ${
        inner * 0.5
      } 0 0 0 ${inner} 0 L ${inner} ${inner * 0.5} L 0 ${
        inner * 0.5
      } Z" fill="${palette[0]}" />
              ${Array.from({ length: 4 })
                .map(
                  (_, i) =>
                    `<rect x="0" y="${
                      inner * 0.5 + i * inner * 0.125
                    }" width="${inner}" height="${inner * 0.02}" fill="${
                      palette[1]
                    }" />`
                )
                .join("")}`;

    case "three_black_diamonds": // 6.3
      return `<polygon points="${inner * 0.5},${inner * 0.2} ${inner * 0.6},${
        inner * 0.3
      } ${inner * 0.5},${inner * 0.4} ${inner * 0.4},${inner * 0.3}" fill="${
        palette[1]
      }" />
              <polygon points="${inner * 0.5},${inner * 0.4} ${inner * 0.6},${
        inner * 0.5
      } ${inner * 0.5},${inner * 0.6} ${inner * 0.4},${inner * 0.5}" fill="${
        palette[1]
      }" />
              <polygon points="${inner * 0.5},${inner * 0.6} ${inner * 0.6},${
        inner * 0.7
      } ${inner * 0.5},${inner * 0.8} ${inner * 0.4},${inner * 0.7}" fill="${
        palette[1]
      }" />`;

    case "cross_squares_yellow_blue_red_black_copy2": // 6.4
      return `<rect x="${inner * 0.1}" y="${inner * 0.35}" width="${
        inner * 0.3
      }" height="${inner * 0.3}" fill="${palette[5]}" />
              <rect x="${inner * 0.6}" y="${inner * 0.35}" width="${
        inner * 0.3
      }" height="${inner * 0.3}" fill="${palette[9]}" />
              <rect x="${inner * 0.35}" y="${inner * 0.1}" width="${
        inner * 0.3
      }" height="${inner * 0.3}" fill="${palette[0]}" />
              <rect x="${inner * 0.35}" y="${inner * 0.6}" width="${
        inner * 0.3
      }" height="${inner * 0.3}" fill="${palette[1]}" />`;

    case "red_blue_petal_flower": // 6.5
      return `<ellipse cx="${inner * 0.5}" cy="${inner * 0.3}" rx="${
        inner * 0.2
      }" ry="${inner * 0.15}" fill="${palette[0]}" />
              <ellipse cx="${inner * 0.7}" cy="${inner * 0.5}" rx="${
        inner * 0.15
      }" ry="${inner * 0.2}" fill="${palette[9]}" />
              <ellipse cx="${inner * 0.5}" cy="${inner * 0.7}" rx="${
        inner * 0.2
      }" ry="${inner * 0.15}" fill="${palette[0]}" />
              <ellipse cx="${inner * 0.3}" cy="${inner * 0.5}" rx="${
        inner * 0.15
      }" ry="${inner * 0.2}" fill="${palette[9]}" />`;

    case "horizontal_stripes_red_yellow_blue": // 6.6
      return `<rect x="0" y="0" width="${inner}" height="${
        inner / 3
      }" fill="${getSafeColor(0)}" />
              <rect x="0" y="${inner / 3}" width="${inner}" height="${
        inner / 3
      }" fill="${palette[5]}" />
              <rect x="0" y="${(inner * 2) / 3}" width="${inner}" height="${
        inner / 3
      }" fill="${palette[9]}" />`;

    case "semi_circles_blue_red_striped_copy5": // 6.7
      return `<path d="M 0 ${inner * 0.5} A ${inner * 0.5} ${
        inner * 0.5
      } 0 0 1 ${inner} ${
        inner * 0.5
      } L ${inner} ${inner} L 0 ${inner} Z" fill="${palette[9]}" />
              <path d="M 0 0 A ${inner * 0.5} ${
        inner * 0.5
      } 0 0 0 ${inner} 0 L ${inner} ${inner * 0.5} L 0 ${
        inner * 0.5
      } Z" fill="${palette[0]}" />
              ${Array.from({ length: 4 })
                .map(
                  (_, i) =>
                    `<rect x="0" y="${
                      inner * 0.5 + i * inner * 0.125
                    }" width="${inner}" height="${inner * 0.02}" fill="${
                      palette[1]
                    }" />`
                )
                .join("")}`;

    case "vertical_black_arrow": // 6.8
      return `<polygon points="${inner * 0.3},${inner * 0.2} ${inner * 0.7},${
        inner * 0.2
      } ${inner * 0.7},${inner * 0.1} ${inner * 0.5},0 ${inner * 0.3},${
        inner * 0.1
      }" fill="${palette[1]}" />
              <rect x="${inner * 0.45}" y="${inner * 0.2}" width="${
        inner * 0.1
      }" height="${inner * 0.6}" fill="${palette[1]}" />
              <polygon points="${inner * 0.3},${inner * 0.8} ${inner * 0.7},${
        inner * 0.8
      } ${inner * 0.7},${inner * 0.9} ${inner * 0.5},${inner} ${inner * 0.3},${
        inner * 0.9
      }" fill="${palette[1]}" />`;

    case "yellow_red_quarters_copy": // 6.9
      return `<path d="M 0 0 A ${inner} ${inner} 0 0 1 ${inner} 0 L 0 0 Z" fill="${palette[5]}" />
              <path d="M ${inner} ${inner} A ${inner} ${inner} 0 0 1 0 ${inner} L ${inner} ${inner} Z" fill="${palette[0]}" />`;

    case "three_black_diamonds_copy": // 6.10
      return `<polygon points="${inner * 0.5},${inner * 0.2} ${inner * 0.6},${
        inner * 0.3
      } ${inner * 0.5},${inner * 0.4} ${inner * 0.4},${inner * 0.3}" fill="${
        palette[1]
      }" />
              <polygon points="${inner * 0.5},${inner * 0.4} ${inner * 0.6},${
        inner * 0.5
      } ${inner * 0.5},${inner * 0.6} ${inner * 0.4},${inner * 0.5}" fill="${
        palette[1]
      }" />
              <polygon points="${inner * 0.5},${inner * 0.6} ${inner * 0.6},${
        inner * 0.7
      } ${inner * 0.5},${inner * 0.8} ${inner * 0.4},${inner * 0.7}" fill="${
        palette[1]
      }" />`;

    // Row 7 patterns (61-70)
    case "red_yellow_semi_circles": // 7.1
      const semicircleColors = getContrastingColors(3, backgroundColor);
      return `<path d="M 0 ${inner * 0.3} A ${inner * 0.3} ${
        inner * 0.3
      } 0 0 1 0 ${inner * 0.7} L 0 ${inner * 0.3} Z" fill="${
        semicircleColors[0]
      }" />
              <path d="M ${inner} ${inner * 0.3} A ${inner * 0.3} ${
        inner * 0.3
      } 0 0 0 ${inner} ${inner * 0.7} L ${inner} ${inner * 0.3} Z" fill="${
        semicircleColors[1]
      }" />
              <rect x="0" y="${inner * 0.48}" width="${inner}" height="${
        inner * 0.04
      }" fill="${semicircleColors[2]}" />`;

    case "half_blue_half_striped": // 7.2
      return `<rect x="0" y="0" width="${
        inner * 0.5
      }" height="${inner}" fill="${palette[9]}" />
              <rect x="${inner * 0.5}" y="0" width="${
        inner * 0.5
      }" height="${inner}" fill="${palette[4]}" />
              ${Array.from({ length: 8 })
                .map(
                  (_, i) =>
                    `<rect x="${inner * 0.5}" y="${i * inner * 0.125}" width="${
                      inner * 0.5
                    }" height="${inner * 0.02}" fill="${palette[1]}" />`
                )
                .join("")}`;

    case "diagonal_split_red_blue_yellow_quarter_copy4": // 7.3
      return `<polygon points="0,0 ${inner},0 ${inner},${inner} 0,${inner}" fill="${getSafeColor(
        0
      )}" />
              <polygon points="0,0 ${inner},${inner} 0,${inner}" fill="${getSafeColor(
        9
      )}" />
              <circle cx="${inner * 0.25}" cy="${inner * 0.75}" r="${
        inner * 0.2
      }" fill="${palette[5]}" />`;

    case "grid_blue_dots": // 7.4
      return Array.from({ length: 4 })
        .map((_, row) =>
          Array.from({ length: 4 })
            .map(
              (_, col) =>
                `<circle cx="${inner * (0.125 + col * 0.25)}" cy="${
                  inner * (0.125 + row * 0.25)
                }" r="${inner * 0.05}" fill="${palette[9]}" />`
            )
            .join("")
        )
        .join("");

    case "four_yellow_circles_red_centers": // 7.5
      return `<circle cx="${inner * 0.25}" cy="${inner * 0.25}" r="${
        inner * 0.15
      }" fill="${palette[5]}" />
              <circle cx="${inner * 0.75}" cy="${inner * 0.25}" r="${
        inner * 0.15
      }" fill="${palette[5]}" />
              <circle cx="${inner * 0.25}" cy="${inner * 0.75}" r="${
        inner * 0.15
      }" fill="${palette[5]}" />
              <circle cx="${inner * 0.75}" cy="${inner * 0.75}" r="${
        inner * 0.15
      }" fill="${palette[5]}" />
              <circle cx="${inner * 0.25}" cy="${inner * 0.25}" r="${
        inner * 0.05
      }" fill="${palette[0]}" />
              <circle cx="${inner * 0.75}" cy="${inner * 0.25}" r="${
        inner * 0.05
      }" fill="${palette[0]}" />
              <circle cx="${inner * 0.25}" cy="${inner * 0.75}" r="${
        inner * 0.05
      }" fill="${palette[0]}" />
              <circle cx="${inner * 0.75}" cy="${inner * 0.75}" r="${
        inner * 0.05
      }" fill="${palette[0]}" />`;

    case "half_yellow_half_striped_copy2": // 7.6
      return `<rect x="0" y="0" width="${
        inner * 0.5
      }" height="${inner}" fill="${palette[5]}" />
              <rect x="${inner * 0.5}" y="0" width="${
        inner * 0.5
      }" height="${inner}" fill="${palette[4]}" />
              ${Array.from({ length: 8 })
                .map(
                  (_, i) =>
                    `<rect x="${inner * 0.5}" y="${i * inner * 0.125}" width="${
                      inner * 0.5
                    }" height="${inner * 0.02}" fill="${palette[1]}" />`
                )
                .join("")}`;

    case "yellow_circle_blue_red_quarters": // 7.7
      return `<circle cx="${inner / 2}" cy="${inner / 2}" r="${
        inner / 2
      }" fill="${palette[5]}" />
              <path d="M ${inner} 0 A ${inner} ${inner} 0 0 1 ${inner} ${inner} L ${inner} 0 Z" fill="${getSafeColor(
        9
      )}" />
              <path d="M 0 ${inner} A ${inner} ${inner} 0 0 1 0 0 L 0 ${inner} Z" fill="${getSafeColor(
        0
      )}" />`;

    case "four_quarters_red_blue_yellow_black_copy": // 7.8
      return `<path d="M 0 0 A ${inner} ${inner} 0 0 1 ${inner} 0 L 0 0 Z" fill="${palette[0]}" />
              <path d="M ${inner} 0 A ${inner} ${inner} 0 0 1 ${inner} ${inner} L ${inner} 0 Z" fill="${palette[9]}" />
              <path d="M 0 ${inner} A ${inner} ${inner} 0 0 1 0 0 L 0 ${inner} Z" fill="${palette[5]}" />
              <path d="M ${inner} ${inner} A ${inner} ${inner} 0 0 1 0 ${inner} L ${inner} ${inner} Z" fill="${palette[1]}" />`;

    case "red_yellow_semi_circles_copy": // 7.9
      return `<path d="M 0 ${inner * 0.3} A ${inner * 0.3} ${
        inner * 0.3
      } 0 0 1 0 ${inner * 0.7} L 0 ${inner * 0.3} Z" fill="${palette[0]}" />
              <path d="M ${inner} ${inner * 0.3} A ${inner * 0.3} ${
        inner * 0.3
      } 0 0 0 ${inner} ${inner * 0.7} L ${inner} ${
        inner * 0.3
      } Z" fill="${getSafeColor(5)}" />
              <rect x="0" y="${inner * 0.48}" width="${inner}" height="${
        inner * 0.04
      }" fill="${palette[1]}" />`;

    case "grid_blue_dots_copy": // 7.10
      return Array.from({ length: 4 })
        .map((_, row) =>
          Array.from({ length: 4 })
            .map(
              (_, col) =>
                `<circle cx="${inner * (0.125 + col * 0.25)}" cy="${
                  inner * (0.125 + row * 0.25)
                }" r="${inner * 0.05}" fill="${palette[9]}" />`
            )
            .join("")
        )
        .join("");

    // Row 8 patterns (71-80)
    case "yellow_circle_blue_quarter": // 8.1
      return `<circle cx="${inner * 0.25}" cy="${inner * 0.25}" r="${
        inner * 0.2
      }" fill="${palette[5]}" />
              <path d="M ${inner} ${inner} A ${inner} ${inner} 0 0 1 0 ${inner} L ${inner} ${inner} Z" fill="${getSafeColor(
        9
      )}" />`;

    case "black_k_shape": // 8.2
      return `<rect x="${inner * 0.1}" y="0" width="${
        inner * 0.15
      }" height="${inner}" fill="${palette[1]}" />
              <polygon points="${inner * 0.25},0 ${inner * 0.9},${
        inner * 0.3
      } ${inner * 0.9},${inner * 0.5} ${inner * 0.25},${inner * 0.5}" fill="${
        palette[1]
      }" />
              <polygon points="${inner * 0.25},${inner * 0.5} ${inner * 0.9},${
        inner * 0.7
      } ${inner * 0.9},${inner} ${inner * 0.25},${inner}" fill="${
        palette[1]
      }" />`;

    case "diagonal_split_red_blue_yellow_quarter_copy5": // 8.3
      return `<polygon points="0,0 ${inner},0 ${inner},${inner} 0,${inner}" fill="${getSafeColor(
        0
      )}" />
              <polygon points="0,0 ${inner},${inner} 0,${inner}" fill="${getSafeColor(
        9
      )}" />
              <circle cx="${inner * 0.75}" cy="${inner * 0.25}" r="${
        inner * 0.2
      }" fill="${palette[5]}" />`;

    case "black_triangle_arrow_copy3": // 8.4
      return `<polygon points="${inner * 0.2},${inner * 0.2} ${inner * 0.8},${
        inner * 0.2
      } ${inner * 0.8},${inner * 0.1} ${inner},${inner * 0.5} ${inner * 0.8},${
        inner * 0.9
      } ${inner * 0.8},${inner * 0.8} ${inner * 0.2},${inner * 0.8}" fill="${
        palette[1]
      }" />`;

    case "red_blue_petal_flower_copy": // 8.5
      return `<ellipse cx="${inner * 0.5}" cy="${inner * 0.3}" rx="${
        inner * 0.2
      }" ry="${inner * 0.15}" fill="${palette[0]}" />
              <ellipse cx="${inner * 0.7}" cy="${inner * 0.5}" rx="${
        inner * 0.15
      }" ry="${inner * 0.2}" fill="${palette[9]}" />
              <ellipse cx="${inner * 0.5}" cy="${inner * 0.7}" rx="${
        inner * 0.2
      }" ry="${inner * 0.15}" fill="${palette[0]}" />
              <ellipse cx="${inner * 0.3}" cy="${inner * 0.5}" rx="${
        inner * 0.15
      }" ry="${inner * 0.2}" fill="${palette[9]}" />`;

    case "semi_circles_blue_red_striped_copy6": // 8.6
      return `<path d="M 0 ${inner * 0.5} A ${inner * 0.5} ${
        inner * 0.5
      } 0 0 1 ${inner} ${
        inner * 0.5
      } L ${inner} ${inner} L 0 ${inner} Z" fill="${palette[9]}" />
              <path d="M 0 0 A ${inner * 0.5} ${
        inner * 0.5
      } 0 0 0 ${inner} 0 L ${inner} ${inner * 0.5} L 0 ${
        inner * 0.5
      } Z" fill="${palette[0]}" />
              ${Array.from({ length: 4 })
                .map(
                  (_, i) =>
                    `<rect x="0" y="${
                      inner * 0.5 + i * inner * 0.125
                    }" width="${inner}" height="${inner * 0.02}" fill="${
                      palette[1]
                    }" />`
                )
                .join("")}`;

    case "curved_c_black_copy2": // 8.7
      return `<path d="M ${inner * 0.2} ${inner * 0.2} Q ${inner * 0.5} ${
        inner * 0.1
      } ${inner * 0.8} ${inner * 0.2}" stroke="${palette[1]}" stroke-width="${
        inner * 0.05
      }" fill="none" />
              <path d="M ${inner * 0.2} ${inner * 0.4} Q ${inner * 0.5} ${
        inner * 0.3
      } ${inner * 0.8} ${inner * 0.4}" stroke="${palette[1]}" stroke-width="${
        inner * 0.05
      }" fill="none" />
              <path d="M ${inner * 0.2} ${inner * 0.6} Q ${inner * 0.5} ${
        inner * 0.5
      } ${inner * 0.8} ${inner * 0.6}" stroke="${palette[1]}" stroke-width="${
        inner * 0.05
      }" fill="none" />`;

    case "facing_black_semicircles_red_center": // 8.8
      return `<path d="M 0 ${inner * 0.3} A ${inner * 0.3} ${
        inner * 0.3
      } 0 0 1 0 ${inner * 0.7} L 0 ${inner * 0.3} Z" fill="${palette[1]}" />
              <path d="M ${inner} ${inner * 0.3} A ${inner * 0.3} ${
        inner * 0.3
      } 0 0 0 ${inner} ${inner * 0.7} L ${inner} ${inner * 0.3} Z" fill="${
        palette[1]
      }" />
              <rect x="${inner * 0.45}" y="${inner * 0.3}" width="${
        inner * 0.1
      }" height="${inner * 0.4}" fill="${palette[0]}" />`;

    case "black_plus_sign": // 8.9
      return `<rect x="${inner * 0.4}" y="0" width="${
        inner * 0.2
      }" height="${inner}" fill="${palette[1]}" />
              <rect x="0" y="${inner * 0.4}" width="${inner}" height="${
        inner * 0.2
      }" fill="${palette[1]}" />`;

    case "yellow_circle_blue_quarter_copy": // 8.10
      return `<circle cx="${inner * 0.25}" cy="${inner * 0.25}" r="${
        inner * 0.2
      }" fill="${palette[5]}" />
              <path d="M ${inner} ${inner} A ${inner} ${inner} 0 0 1 0 ${inner} L ${inner} ${inner} Z" fill="${getSafeColor(
        9
      )}" />`;

    default:
      return `<rect width="${inner}" height="${inner}" fill="${palette[0]}" />`;
  }
}

// Enhanced vibrant color palette with improved contrast
const BASE_COLORS = [
  "#E2533A", // Vibrant orange-red
  "#197DAE", // Deep ocean blue
  "#F4BE51", // Warm golden yellow
  "#F8F8F5", // Enhanced off-white (slightly warmer)
  "#2A1F23", // Deeper dark brown (more contrast)
  "#A98682", // Warm taupe
  "#EDCC7D", // Soft golden beige
  "#8BC4D8", // Enhanced sky blue (more vibrant)
  "#1E2A3A", // Deeper navy blue (more contrast)
  "#5BA8E8", // Enhanced bright blue (more saturated)
];

// Vibrant color relationships for new palette
const COLOR_RELATIONSHIPS = {
  "#E2533A": {
    // Vibrant orange-red
    complement: "#95C3D2", // Light sky blue - vibrant contrast
    analogous: ["#A98682", "#E2533A", "#F4BE51"], // Warm taupe, vibrant orange-red, warm golden yellow
    triadic: ["#197DAE", "#EDCC7D"], // Deep ocean blue, soft golden beige - dynamic contrast
  },
  "#197DAE": {
    // Deep ocean blue
    complement: "#EDCC7D", // Soft golden beige - ocean/sand contrast
    analogous: ["#2E3952", "#197DAE", "#68BCF4"], // Deep navy blue, deep ocean blue, bright sky blue
    triadic: ["#E2533A", "#A98682"], // Vibrant orange-red, warm taupe - warm/cool balance
  },
  "#F4BE51": {
    // Warm golden yellow
    complement: "#1E2A3A", // Deeper navy blue - enhanced sun/night contrast
    analogous: ["#EDCC7D", "#F4BE51", "#F8F8F5"], // Soft golden beige, warm golden yellow, enhanced off-white
    triadic: ["#E2533A", "#197DAE"], // Vibrant orange-red, deep ocean blue - vibrant harmony
  },
  "#F8F8F5": {
    // Enhanced off-white
    complement: "#2A1F23", // Deeper dark brown - enhanced light/dark contrast
    analogous: ["#EDCC7D", "#F8F8F5", "#8BC4D8"], // Soft golden beige, enhanced off-white, enhanced sky blue
    triadic: ["#E2533A", "#197DAE"], // Vibrant orange-red, deep ocean blue - vibrant contrast
  },
  "#2A1F23": {
    // Deeper dark brown
    complement: "#F8F8F5", // Enhanced off-white - enhanced dark/light contrast
    analogous: ["#A98682", "#2A1F23", "#1E2A3A"], // Warm taupe, deeper dark brown, deeper navy blue
    triadic: ["#F4BE51", "#8BC4D8"], // Warm golden yellow, enhanced sky blue - earth/sky harmony
  },
  "#A98682": {
    // Warm taupe
    complement: "#5BA8E8", // Enhanced bright blue - earth/sky contrast
    analogous: ["#2A1F23", "#A98682", "#EDCC7D"], // Deeper dark brown, warm taupe, soft golden beige
    triadic: ["#197DAE", "#F4BE51"], // Deep ocean blue, warm golden yellow - natural balance
  },
  "#EDCC7D": {
    // Soft golden beige
    complement: "#197DAE", // Deep ocean blue - warm/cool contrast
    analogous: ["#A98682", "#EDCC7D", "#F4BE51"], // Warm taupe, soft golden beige, warm golden yellow
    triadic: ["#E2533A", "#2E3952"], // Vibrant orange-red, deep navy blue - rich contrast
  },
  "#8BC4D8": {
    // Enhanced sky blue
    complement: "#E2533A", // Vibrant orange-red - sky/sunset contrast
    analogous: ["#5BA8E8", "#8BC4D8", "#F8F8F5"], // Enhanced bright blue, enhanced sky blue, enhanced off-white
    triadic: ["#F4BE51", "#2A1F23"], // Warm golden yellow, deeper dark brown - natural harmony
  },
  "#1E2A3A": {
    // Deeper navy blue
    complement: "#F4BE51", // Warm golden yellow - enhanced night/sun contrast
    analogous: ["#2A1F23", "#1E2A3A", "#197DAE"], // Deeper dark brown, deeper navy blue, deep ocean blue
    triadic: ["#EDCC7D", "#E2533A"], // Soft golden beige, vibrant orange-red - sophisticated contrast
  },
  "#5BA8E8": {
    // Enhanced bright blue
    complement: "#A98682", // Warm taupe - sky/earth contrast
    analogous: ["#8BC4D8", "#5BA8E8", "#197DAE"], // Enhanced sky blue, enhanced bright blue, deep ocean blue
    triadic: ["#2A1F23", "#F4BE51"], // Deeper dark brown, warm golden yellow - earth/sky balance
  },
};

// Create expanded palette with all colors
const DEFAULT_PALETTE = [
  ...BASE_COLORS,
  // Add complementary colors
  ...Object.values(COLOR_RELATIONSHIPS).map((rel) => rel.complement),
  // Add analogous colors (first two of each)
  ...Object.values(COLOR_RELATIONSHIPS).flatMap((rel) =>
    rel.analogous.slice(0, 2)
  ),
  // Add triadic colors
  ...Object.values(COLOR_RELATIONSHIPS).flatMap((rel) => rel.triadic),
];

// Black color for lines and structural elements
const BLACK = "#000000";

export function generateSVG(
  input: string,
  size: number = 512,
  customPalette?: string[]
): string {
  const seed = crc32(input);
  const rand = makeRand(seed);
  // Use custom palette if provided, otherwise use default
  const palette = customPalette || DEFAULT_PALETTE;

  // Select a single pattern - use specific patterns for 'art', 'avatar', and 'bold' variants
  let pattern: Pattern;
  if (input.toLowerCase() === "art") {
    // Use a more artistic, flowing pattern for 'art'
    pattern = "plant_motif_black_stem";
  } else if (input.toLowerCase() === "avatar") {
    // Use a more face-like, centered pattern for 'avatar'
    pattern = "concentric_red_circles";
  } else if (input.toLowerCase() === "bold") {
    // Use a bold, striking pattern for 'bold'
    pattern = "black_plus_sign";
  } else {
    // Use random selection for other inputs
    const patternIndex = Math.floor(rand() * patterns.length);
    pattern = patterns[patternIndex];
  }

  // Use the full size for the single pattern
  const inner = size;

  // Use a harmonious background color from the base palette (prefer lighter/neutral colors)
  const lightColors = ["#F8F8F5", "#EDCC7D", "#A98682", "#8BC4D8", "#5BA8E8"];
  const allColors = [...BASE_COLORS];
  const backgroundColor =
    Math.random() < 0.7
      ? lightColors[Math.floor(rand() * lightColors.length)]
      : allColors[Math.floor(rand() * allColors.length)];
  const svgElems: string[] = [
    `<rect width="${size}" height="${size}" fill="${backgroundColor}"/>`,
  ];

  // Generate the single pattern centered in the full size
  const elem = generatePattern(pattern, inner, palette, rand, backgroundColor);
  svgElems.push(elem);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">\n${svgElems.join(
    "\n"
  )}\n</svg>`;
}
