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

type Palette = string[];

function pickPalette(rand: () => number): Palette {
  const palettes: Palette[] = [
    [
      "#FEEAD3",
      "#F94144",
      "#F3722C",
      "#F9C74F",
      "#43AA8B",
      "#577590",
      "#000000",
    ],
    [
      "#FFF1E6",
      "#FF595E",
      "#FFCA3A",
      "#8AC926",
      "#1982C4",
      "#6A4C93",
      "#000000",
    ],
    [
      "#FDE2E4",
      "#FEC5BB",
      "#FCD5CE",
      "#F8EDEB",
      "#E8E8E4",
      "#D8E2DC",
      "#000000",
    ],
  ];
  return palettes[Math.floor(rand() * palettes.length)];
}

function makeRand(seed: number): () => number {
  return function (): number {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

export function generateSVG(input: string, size: number = 512): string {
  const seed = crc32(input);
  const rand = makeRand(seed);
  const palette = pickPalette(rand);
  const colors = palette;
  const cell = Math.floor(size / 3);
  const inner = cell;

  const svgElems: string[] = [
    `<rect width="${size}" height="${size}" fill="#FFFFFF"/>`,
  ];

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
  ] as const;
  type Shape = (typeof shapes)[number];

  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      const cx = x * cell;
      const cy = y * cell;

      const cellBg = colors[Math.floor(rand() * colors.length)];
      const cellRect = `<rect x="0" y="0" width="${inner}" height="${inner}" fill="${cellBg}" />`;

      const stype: Shape = shapes[Math.floor(rand() * shapes.length)];
      const color = colors[Math.floor(rand() * colors.length)];
      const rot = [0, 90, 180, 270][Math.floor(rand() * 4)];

      const gOpen = `<g transform="translate(${cx},${cy}) rotate(${rot} ${
        inner / 2
      } ${inner / 2})">`;
      const gClose = `</g>`;
      let elem = "";

      switch (stype) {
        case "circle":
          elem = `<circle cx="${inner / 2}" cy="${inner / 2}" r="${
            inner / 2
          }" fill="${color}" />`;
          break;
        case "half":
          elem = `<path d="M 0 ${inner / 2} A ${inner / 2} ${
            inner / 2
          } 0 1 1 ${inner} ${
            inner / 2
          } L ${inner} ${inner} L 0 ${inner} Z" fill="${color}" />`;
          break;
        case "quarter":
          elem = `<path d="M 0 ${inner} A ${inner} ${inner} 0 0 1 ${inner} 0 L 0 0 Z" fill="${color}" />`;
          break;
        case "triangle":
          elem = `<polygon points="0,${inner} ${
            inner / 2
          },0 ${inner},${inner}" fill="${color}" />`;
          break;
        case "square":
          elem = `<rect width="${inner}" height="${inner}" fill="${color}" />`;
          break;
        case "diamond":
          elem = `<polygon points="${inner / 2},0 ${inner},${inner / 2} ${
            inner / 2
          },${inner} 0,${inner / 2}" fill="${color}" />`;
          break;
        case "stripes":
          const w = inner / 5;
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
          const rdot = inner * 0.12;
          const spacing = inner / 3;
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
          const h = inner / 4;
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
