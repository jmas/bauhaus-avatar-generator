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
}

function generateSVG(input: string, options: GenerateOptions = {}): string {
  const {
    colors = DEFAULT_COLORS,
    weights = DEFAULT_WEIGHTS,
    size = 512,
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

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">\n${svgElems.join(
    "\n"
  )}\n</svg>`;
}

export { generateSVG };
export type { GenerateOptions };
