function crc32(str: string): number {
  let crc = 0 ^ -1;
  for (let i = 0; i < str.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i)) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

// CRC32 lookup table
const table: number[] = (() => {
  let c: number;
  const table: number[] = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

// Linear congruential generator (deterministic)
function makeRand(seed: number): () => number {
  return function (): number {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

// Color palettes with weights
function createWeightedPalette(colors: string[], weights: number[]): string[] {
  const weightedPalette: string[] = [];
  for (let i = 0; i < colors.length; i++) {
    for (let j = 0; j < weights[i]; j++) {
      weightedPalette.push(colors[i]);
    }
  }
  return weightedPalette;
}

// Default palette
const DEFAULT_COLORS = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"];
const DEFAULT_WEIGHTS = [30, 25, 20, 15, 10];

interface GenerateOptions {
  colors?: string[];
  weights?: number[];
  size?: number;
  icon?: string;
}

function generateSVG(input: string, options: GenerateOptions = {}): string {
  const {
    colors = DEFAULT_COLORS,
    weights = DEFAULT_WEIGHTS,
    size = 512,
    icon = undefined,
  } = options;

  const seed = crc32(input);
  const rand = makeRand(seed);
  const palette = createWeightedPalette(colors, weights);
  const cell = Math.floor(size / 2);
  const inner = cell;
  let svgElems = [`<rect width="${size}" height="${size}" fill="#FFFFFF"/>`];
  const shapes = [
    "circle",
    "half",
    "quarter",
    "triangle",
    "square",
    "diamond",
    "stripes",
    "dots",
    "chevrons",
  ];

  // Track background colors for contrast calculation
  const backgroundColors: string[] = [];

  for (let y = 0; y < 2; y++) {
    for (let x = 0; x < 2; x++) {
      const cx = x * cell;
      const cy = y * cell;

      const cellBg = palette[Math.floor(rand() * palette.length)];
      backgroundColors.push(cellBg);
      const cellRect = `<rect x="0" y="0" width="${inner}" height="${inner}" fill="${cellBg}" />`;

      const stype = shapes[Math.floor(rand() * shapes.length)];
      let color = palette[Math.floor(rand() * palette.length)];

      // Ensure shape color is different from background color
      while (color === cellBg) {
        color = palette[Math.floor(rand() * palette.length)];
      }
      const rot = [0, 90, 180, 270][Math.floor(rand() * 4)];

      const gOpen = `<g transform="translate(${cx},${cy}) rotate(${rot} ${
        inner / 2
      } ${inner / 2})">`;
      const gClose = `</g>`;
      let elem = "";

      switch (stype) {
        case "circle":
          elem = `<circle cx="${inner / 2}" cy="${inner / 2}" r="${
            inner * 0.4
          }" fill="${color}" />`;
          break;
        case "half":
          elem = `<path d="M ${inner * 0.1} ${inner / 2} A ${inner * 0.4} ${
            inner * 0.4
          } 0 1 1 ${inner * 0.9} ${inner / 2} L ${inner * 0.9} ${
            inner * 0.9
          } L ${inner * 0.1} ${inner * 0.9} Z" fill="${color}" />`;
          break;
        case "quarter":
          elem = `<path d="M ${inner * 0.1} ${inner * 0.9} A ${inner * 0.8} ${
            inner * 0.8
          } 0 0 1 ${inner * 0.9} ${inner * 0.1} L ${inner * 0.1} ${
            inner * 0.1
          } Z" fill="${color}" />`;
          break;
        case "triangle":
          elem = `<polygon points="${inner * 0.1},${inner * 0.9} ${inner / 2},${
            inner * 0.1
          } ${inner * 0.9},${inner * 0.9}" fill="${color}" />`;
          break;
        case "square":
          elem = `<rect x="${inner * 0.1}" y="${inner * 0.1}" width="${
            inner * 0.8
          }" height="${inner * 0.8}" fill="${color}" />`;
          break;
        case "diamond":
          elem = `<polygon points="${inner / 2},${inner * 0.1} ${inner * 0.9},${
            inner / 2
          } ${inner / 2},${inner * 0.9} ${inner * 0.1},${
            inner / 2
          }" fill="${color}" />`;
          break;
        case "stripes":
          let w = inner / 5;
          elem = Array.from({ length: 5 })
            .map(
              (_, i) =>
                `<rect x="${
                  i * w
                }" y="0" width="${w}" height="${inner}" fill="${
                  i % 2 === 0 ? color : cellBg
                }" />`
            )
            .join("");
          break;
        case "dots":
          let rdot = inner * 0.12;
          let spacing = inner / 3;
          elem = [0, 1]
            .map((iy) =>
              [0, 1]
                .map(
                  (ix) =>
                    `<circle cx="${spacing * (0.5 + ix)}" cy="${
                      spacing * (0.5 + iy)
                    }" r="${rdot}" fill="${color}" />`
                )
                .join("")
            )
            .join("");
          break;
        case "chevrons":
          let h = inner / 4;
          elem = Array.from({ length: 3 })
            .map(
              (_, i) =>
                `<polygon points="0,${i * h} ${inner / 2},${
                  (i + 1) * h
                } ${inner},${i * h}" fill="${color}" />`
            )
            .join("");
          break;
      }

      svgElems.push(gOpen + cellRect + elem + gClose);
    }
  }

  // Add user icon layer if requested
  if (icon === "user") {
    // Calculate user icon size with padding (80% of total size to maintain padding)
    const iconSize = size * 0.8;
    const iconOffset = (size - iconSize) / 2;

    // Calculate contrast color based on dominant background color
    const dominantBgColor = backgroundColors[0]; // Use first cell as dominant color
    const contrastColor = getContrastColor(dominantBgColor);

    // User SVG icon with scaling and contrast color
    const userIcon = `<g transform="translate(${iconOffset}, ${iconOffset}) scale(${
      iconSize / 32
    })">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M15.9999 2.66667C12.318 2.66667 9.33325 5.65144 9.33325 9.33333C9.33325 13.0152 12.318 16 15.9999 16C19.6818 16 22.6666 13.0152 22.6666 9.33333C22.6666 5.65144 19.6818 2.66667 15.9999 2.66667Z" fill="${contrastColor}"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M12 17.3333C9.78298 17.3333 7.65094 18.3447 6.4015 19.8672C5.76738 20.64 5.32158 21.5961 5.28277 22.6559C5.24313 23.7381 5.63378 24.7944 6.43941 25.7161C8.40284 27.9621 11.5377 29.3333 16 29.3333C20.4622 29.3333 23.5972 27.9621 25.5605 25.7161C26.3661 24.7944 26.7568 23.7381 26.7172 22.6559C26.6784 21.5961 26.2325 20.64 25.5985 19.8672C24.349 18.3447 22.2169 17.3333 20 17.3333H12Z" fill="${contrastColor}"/>
    </g>`;

    svgElems.push(userIcon);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">\n${svgElems.join(
    "\n"
  )}\n</svg>`;
}

// Color harmony utilities
interface HSLColor {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

interface RGBColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

// Convert hex to RGB
function hexToRgb(hex: string): RGBColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

// Convert RGB to HSL
function rgbToHsl(rgb: RGBColor): HSLColor {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Convert HSL to RGB
function hslToRgb(hsl: HSLColor): RGBColor {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// Convert RGB to hex
function rgbToHex(rgb: RGBColor): string {
  return (
    "#" +
    ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1)
  );
}

// Calculate contrast color (black or white) based on background color
function getContrastColor(backgroundColor: string): string {
  const rgb = hexToRgb(backgroundColor);

  // Calculate relative luminance using WCAG formula
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);

  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

// Color harmony generators
function getComplementaryColor(hex: string): string {
  const hsl = rgbToHsl(hexToRgb(hex));
  hsl.h = (hsl.h + 180) % 360;
  return rgbToHex(hslToRgb(hsl));
}

function getTriadicColors(hex: string): string[] {
  const hsl = rgbToHsl(hexToRgb(hex));
  return [
    hex,
    rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 120) % 360 })),
    rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 240) % 360 })),
  ];
}

function getAnalogousColors(hex: string, count: number = 3): string[] {
  const hsl = rgbToHsl(hexToRgb(hex));
  const colors: string[] = [];
  const step = 30; // 30 degree steps for analogous colors

  for (let i = 0; i < count; i++) {
    const offset = (i - Math.floor(count / 2)) * step;
    const newHsl = { ...hsl, h: (hsl.h + offset + 360) % 360 };
    colors.push(rgbToHex(hslToRgb(newHsl)));
  }

  return colors;
}

function getSplitComplementaryColors(hex: string): string[] {
  const hsl = rgbToHsl(hexToRgb(hex));
  return [
    hex,
    rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 150) % 360 })),
    rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 210) % 360 })),
  ];
}

// Gradient generation utilities
interface GradientStop {
  color: string;
  offset: number;
}

interface GradientPattern {
  type: "radial" | "linear" | "mesh" | "conic";
  stops: GradientStop[];
  centerX?: number;
  centerY?: number;
  angle?: number;
  radius?: number;
}

// Generate harmonious gradient stops
function generateHarmoniousStops(
  baseColor: string,
  rand: () => number,
  count: number = 3
): GradientStop[] {
  const harmonyTypes = [
    "complementary",
    "triadic",
    "analogous",
    "splitComplementary",
  ];
  const harmonyType = harmonyTypes[Math.floor(rand() * harmonyTypes.length)];

  let colors: string[];

  switch (harmonyType) {
    case "complementary":
      colors = [baseColor, getComplementaryColor(baseColor)];
      break;
    case "triadic":
      colors = getTriadicColors(baseColor);
      break;
    case "analogous":
      colors = getAnalogousColors(baseColor, count);
      break;
    case "splitComplementary":
      colors = getSplitComplementaryColors(baseColor);
      break;
    default:
      colors = [baseColor];
  }

  // Generate stops with controlled randomness
  const stops: GradientStop[] = [];
  for (let i = 0; i < Math.min(colors.length, count); i++) {
    const offset = i / (count - 1);
    // Add slight randomness to offset (±10%)
    const randomOffset = Math.max(
      0,
      Math.min(1, offset + (rand() - 0.5) * 0.2)
    );
    stops.push({
      color: colors[i],
      offset: randomOffset,
    });
  }

  return stops.sort((a, b) => a.offset - b.offset);
}

// Algorithmic blending for smooth transitions (available for future use)
// function blendColors(color1: string, color2: string, ratio: number): string {
//   const rgb1 = hexToRgb(color1);
//   const rgb2 = hexToRgb(color2);
//
//   const blended = {
//     r: Math.round(rgb1.r + (rgb2.r - rgb1.r) * ratio),
//     g: Math.round(rgb1.g + (rgb2.g - rgb1.g) * ratio),
//     b: Math.round(rgb1.b + (rgb2.b - rgb1.b) * ratio)
//   };
//
//   return rgbToHex(blended);
// }

// Generate complex gradient patterns
function generateGradientPattern(
  baseColor: string,
  rand: () => number
): GradientPattern {
  const patternTypes = ["radial", "linear", "mesh", "conic"];
  const patternType = patternTypes[
    Math.floor(rand() * patternTypes.length)
  ] as GradientPattern["type"];

  const stops = generateHarmoniousStops(
    baseColor,
    rand,
    3 + Math.floor(rand() * 3)
  );

  switch (patternType) {
    case "radial":
      return {
        type: "radial",
        stops,
        centerX: 0.3 + rand() * 0.4, // 30-70% from left
        centerY: 0.3 + rand() * 0.4, // 30-70% from top
        radius: 0.5 + rand() * 0.5, // 50-100% of size
      };

    case "linear":
      return {
        type: "linear",
        stops,
        angle: rand() * 360,
      };

    case "mesh":
      // Create a mesh gradient with multiple radial gradients
      return {
        type: "mesh",
        stops: generateHarmoniousStops(
          baseColor,
          rand,
          4 + Math.floor(rand() * 4)
        ),
      };

    case "conic":
      return {
        type: "conic",
        stops,
        centerX: 0.4 + rand() * 0.2,
        centerY: 0.4 + rand() * 0.2,
      };

    default:
      return {
        type: "radial",
        stops,
        centerX: 0.5,
        centerY: 0.5,
        radius: 0.7,
      };
  }
}

// Generate SVG gradient definition
function generateSVGGradient(
  pattern: GradientPattern,
  size: number,
  gradientId: string
): string {
  const {
    type,
    stops,
    centerX = 0.5,
    centerY = 0.5,
    angle = 0,
    radius = 0.7,
  } = pattern;

  let gradientDef = "";

  switch (type) {
    case "radial":
      gradientDef = `<radialGradient id="${gradientId}" cx="${centerX}" cy="${centerY}" r="${radius}">`;
      break;

    case "linear":
      const x1 = 0.5 + Math.cos(((angle - 90) * Math.PI) / 180) * 0.5;
      const y1 = 0.5 + Math.sin(((angle - 90) * Math.PI) / 180) * 0.5;
      const x2 = 0.5 + Math.cos(((angle + 90) * Math.PI) / 180) * 0.5;
      const y2 = 0.5 + Math.sin(((angle + 90) * Math.PI) / 180) * 0.5;
      gradientDef = `<linearGradient id="${gradientId}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">`;
      break;

    case "conic":
      gradientDef = `<radialGradient id="${gradientId}" cx="${centerX}" cy="${centerY}" r="0.7" gradientTransform="rotate(${angle} ${
        centerX * size
      } ${centerY * size})">`;
      break;

    case "mesh":
      // For mesh, we'll create a complex radial gradient
      gradientDef = `<radialGradient id="${gradientId}" cx="${centerX}" cy="${centerY}" r="0.8">`;
      break;
  }

  // Add gradient stops
  const stopElements = stops
    .map(
      (stop) =>
        `<stop offset="${(stop.offset * 100).toFixed(1)}%" stop-color="${
          stop.color
        }"/>`
    )
    .join("\n    ");

  return `${gradientDef}
    ${stopElements}
  </${type === "linear" ? "linearGradient" : "radialGradient"}>`;
}

// Main gradient avatar generation function
interface GradientGenerateOptions {
  colors?: string[];
  size?: number;
  complexity?: "simple" | "medium" | "complex";
  pattern?: "radial" | "linear" | "mesh" | "conic" | "random";
  icon?: string;
}

function generateGradientSVG(
  input: string,
  options: GradientGenerateOptions = {}
): string {
  const {
    colors = DEFAULT_COLORS,
    size = 512,
    complexity = "medium",
    pattern = "random",
    icon = undefined,
  } = options;

  const seed = crc32(input);
  const rand = makeRand(seed);

  // Select base color from palette
  const baseColor = colors[Math.floor(rand() * colors.length)];

  // Determine complexity
  let gradientCount = 1;
  let shapeCount = 0;

  switch (complexity) {
    case "simple":
      gradientCount = 1;
      shapeCount = 0;
      break;
    case "medium":
      gradientCount = 1 + Math.floor(rand() * 2);
      shapeCount = Math.floor(rand() * 3);
      break;
    case "complex":
      gradientCount = 2 + Math.floor(rand() * 3);
      shapeCount = 2 + Math.floor(rand() * 4);
      break;
  }

  // Generate gradient patterns
  const gradients: GradientPattern[] = [];
  const gradientIds: string[] = [];

  for (let i = 0; i < gradientCount; i++) {
    const currentPattern = pattern === "random" ? undefined : pattern;
    const gradientPattern = generateGradientPattern(baseColor, rand);
    if (currentPattern) {
      gradientPattern.type = currentPattern;
    }
    gradients.push(gradientPattern);
    gradientIds.push(`gradient-${i}`);
  }

  // Build SVG
  let svgElements: string[] = [];

  // Add gradient definitions
  const gradientDefs = gradients
    .map((grad, i) => generateSVGGradient(grad, size, gradientIds[i]))
    .join("\n  ");

  svgElements.push(`<defs>
  ${gradientDefs}
</defs>`);

  // Add background with primary gradient
  svgElements.push(
    `<rect width="${size}" height="${size}" fill="url(#${gradientIds[0]})"/>`
  );

  // Add additional gradient layers for complexity
  for (let i = 1; i < gradients.length; i++) {
    const opacity = 0.3 + rand() * 0.4; // 30-70% opacity
    const blendMode = ["multiply", "overlay", "soft-light", "hard-light"][
      Math.floor(rand() * 4)
    ];

    svgElements.push(
      `<rect width="${size}" height="${size}" fill="url(#${gradientIds[i]})" opacity="${opacity}" style="mix-blend-mode: ${blendMode}"/>`
    );
  }

  // Add geometric shapes for additional complexity
  const shapes = ["circle", "ellipse", "polygon", "path"];
  for (let i = 0; i < shapeCount; i++) {
    const shapeType = shapes[Math.floor(rand() * shapes.length)];
    const shapeColor = colors[Math.floor(rand() * colors.length)];
    const opacity = 0.1 + rand() * 0.3; // 10-40% opacity

    let shapeElement = "";

    switch (shapeType) {
      case "circle":
        const radius = size * (0.1 + rand() * 0.3);
        const cx = size * (0.2 + rand() * 0.6);
        const cy = size * (0.2 + rand() * 0.6);
        shapeElement = `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${shapeColor}" opacity="${opacity}"/>`;
        break;

      case "ellipse":
        const rx = size * (0.1 + rand() * 0.3);
        const ry = size * (0.1 + rand() * 0.3);
        const ecx = size * (0.2 + rand() * 0.6);
        const ecy = size * (0.2 + rand() * 0.6);
        shapeElement = `<ellipse cx="${ecx}" cy="${ecy}" rx="${rx}" ry="${ry}" fill="${shapeColor}" opacity="${opacity}"/>`;
        break;

      case "polygon":
        const sides = 3 + Math.floor(rand() * 5); // 3-7 sides
        const centerX = size * (0.2 + rand() * 0.6);
        const centerY = size * (0.2 + rand() * 0.6);
        const polyRadius = size * (0.1 + rand() * 0.2);

        const points = Array.from({ length: sides }, (_, i) => {
          const angle = (i * 2 * Math.PI) / sides;
          const x = centerX + polyRadius * Math.cos(angle);
          const y = centerY + polyRadius * Math.sin(angle);
          return `${x},${y}`;
        }).join(" ");

        shapeElement = `<polygon points="${points}" fill="${shapeColor}" opacity="${opacity}"/>`;
        break;

      case "path":
        // Create a curved path
        const pathX = size * (0.1 + rand() * 0.8);
        const pathY = size * (0.1 + rand() * 0.8);
        const controlX1 = size * (0.1 + rand() * 0.8);
        const controlY1 = size * (0.1 + rand() * 0.8);
        const controlX2 = size * (0.1 + rand() * 0.8);
        const controlY2 = size * (0.1 + rand() * 0.8);
        const endX = size * (0.1 + rand() * 0.8);
        const endY = size * (0.1 + rand() * 0.8);

        shapeElement = `<path d="M ${pathX} ${pathY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}" stroke="${shapeColor}" stroke-width="${
          size * 0.02
        }" fill="none" opacity="${opacity}"/>`;
        break;
    }

    svgElements.push(shapeElement);
  }

  // Add user icon layer if requested
  if (icon === "user") {
    const iconSize = size * 0.8;
    const iconOffset = (size - iconSize) / 2;

    // Calculate contrast color based on base color
    const contrastColor = getContrastColor(baseColor);

    const userIcon = `<g transform="translate(${iconOffset}, ${iconOffset}) scale(${
      iconSize / 32
    })">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M15.9999 2.66667C12.318 2.66667 9.33325 5.65144 9.33325 9.33333C9.33325 13.0152 12.318 16 15.9999 16C19.6818 16 22.6666 13.0152 22.6666 9.33333C22.6666 5.65144 19.6818 2.66667 15.9999 2.66667Z" fill="${contrastColor}"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M12 17.3333C9.78298 17.3333 7.65094 18.3447 6.4015 19.8672C5.76738 20.64 5.32158 21.5961 5.28277 22.6559C5.24313 23.7381 5.63378 24.7944 6.43941 25.7161C8.40284 27.9621 11.5377 29.3333 16 29.3333C20.4622 29.3333 23.5972 27.9621 25.5605 25.7161C26.3661 24.7944 26.7568 23.7381 26.7172 22.6559C26.6784 21.5961 26.2325 20.64 25.5985 19.8672C24.349 18.3447 22.2169 17.3333 20 17.3333H12Z" fill="${contrastColor}"/>
    </g>`;

    svgElements.push(userIcon);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
${svgElements.join("\n")}
</svg>`;
}

export { generateGradientSVG, generateSVG };
export type { GenerateOptions, GradientGenerateOptions };
