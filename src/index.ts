function crc32(str: string): number {
  let crc = 0 ^ -1;
  for (let i = 0; i < str.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i)) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

// Таблиця для CRC32
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

// Лінійний конгруентний генератор (детермінований)
function makeRand(seed: number): () => number {
  return function (): number {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

// Палiтри кольорiв з вагами
function createWeightedPalette(colors: string[], weights: number[]): string[] {
  const weightedPalette: string[] = [];
  for (let i = 0; i < colors.length; i++) {
    for (let j = 0; j < weights[i]; j++) {
      weightedPalette.push(colors[i]);
    }
  }
  return weightedPalette;
}

// Дефолтна палітра
const DEFAULT_COLORS = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"];
const DEFAULT_WEIGHTS = [30, 25, 20, 15, 10];

interface GenerateOptions {
  colors?: string[];
  weights?: number[];
  size?: number;
  showUserIcon?: boolean;
}

function generateSVG(input: string, options: GenerateOptions = {}): string {
  const {
    colors = DEFAULT_COLORS,
    weights = DEFAULT_WEIGHTS,
    size = 512,
    showUserIcon = false,
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

  for (let y = 0; y < 2; y++) {
    for (let x = 0; x < 2; x++) {
      const cx = x * cell;
      const cy = y * cell;

      const cellBg = palette[Math.floor(rand() * palette.length)];
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
  if (showUserIcon) {
    // Calculate user icon size with padding (80% of total size to maintain padding)
    const iconSize = size * 0.8;
    const iconOffset = (size - iconSize) / 2;

    // User SVG icon with scaling
    const userIcon = `<g transform="translate(${iconOffset}, ${iconOffset}) scale(${
      iconSize / 32
    })">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M15.9999 2.66667C12.318 2.66667 9.33325 5.65144 9.33325 9.33333C9.33325 13.0152 12.318 16 15.9999 16C19.6818 16 22.6666 13.0152 22.6666 9.33333C22.6666 5.65144 19.6818 2.66667 15.9999 2.66667Z" fill="white"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M12 17.3333C9.78298 17.3333 7.65094 18.3447 6.4015 19.8672C5.76738 20.64 5.32158 21.5961 5.28277 22.6559C5.24313 23.7381 5.63378 24.7944 6.43941 25.7161C8.40284 27.9621 11.5377 29.3333 16 29.3333C20.4622 29.3333 23.5972 27.9621 25.5605 25.7161C26.3661 24.7944 26.7568 23.7381 26.7172 22.6559C26.6784 21.5961 26.2325 20.64 25.5985 19.8672C24.349 18.3447 22.2169 17.3333 20 17.3333H12Z" fill="white"/>
    </g>`;

    svgElems.push(userIcon);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">\n${svgElems.join(
    "\n"
  )}\n</svg>`;
}

export { generateSVG };
export type { GenerateOptions };
