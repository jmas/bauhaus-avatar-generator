# Bauhaus Avatar Generator

![Bauhaus Avatar Generator](pages/favicon.svg)

A TypeScript library for generating beautiful, deterministic Bauhaus-style SVG avatars from any input string. Each input string will always generate the same unique avatar, making it perfect for user profiles, placeholders, and visual identification.

## Features

- 🎨 **Bauhaus-inspired design** - Clean, geometric shapes with bold colors
- 🔄 **Deterministic generation** - Same input always produces the same avatar
- 📱 **SVG output** - Scalable vector graphics that work everywhere
- 🎯 **TypeScript support** - Full type definitions included
- ⚡ **Zero dependencies** - Lightweight and fast
- 🎲 **Multiple palettes** - Beautiful color combinations inspired by Bauhaus art

## Installation

```bash
npm install bauhaus-avatar-generator
```

## Usage

### Basic Usage

```typescript
import { generateSVG } from "bauhaus-avatar-generator";

// Generate a 512x512 avatar
const avatar = generateSVG("john@example.com");
console.log(avatar);
```

### With Custom Size

```typescript
import { generateSVG } from "bauhaus-avatar-generator";

// Generate a 256x256 avatar
const avatar = generateSVG("alice", 256);
console.log(avatar);
```

### In HTML

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Avatar Example</title>
  </head>
  <body>
    <div id="avatar"></div>

    <script type="module">
      import { generateSVG } from "bauhaus-avatar-generator";

      const avatar = generateSVG("user@example.com", 200);
      document.getElementById("avatar").innerHTML = avatar;
    </script>
  </body>
</html>
```

### In React

```tsx
import React from "react";
import { generateSVG } from "bauhaus-avatar-generator";

interface AvatarProps {
  input: string;
  size?: number;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ input, size = 200, className }) => {
  const svg = generateSVG(input, size);

  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: svg }} />
  );
};

// Usage
<Avatar input="user@example.com" size={150} />;
```

## API Reference

### `generateSVG(input: string, size?: number): string`

Generates a Bauhaus-style SVG avatar from an input string.

**Parameters:**

- `input` (string): The input string to generate the avatar from. Can be any string (email, username, ID, etc.)
- `size` (number, optional): The size of the generated avatar in pixels. Defaults to 512.

**Returns:**

- `string`: A complete SVG element as a string.

**Example:**

```typescript
const avatar = generateSVG("hello@world.com", 300);
// Returns: <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">...</svg>
```

## How It Works

The avatar generator uses a deterministic algorithm that:

1. **Hashes the input** - Uses CRC32 to convert any string into a consistent number
2. **Selects a palette** - Chooses from predefined Bauhaus-inspired color palettes
3. **Generates shapes** - Creates a 3x3 grid of geometric shapes including:
   - Circles
   - Triangles
   - Squares
   - Diamonds
   - Half-circles
   - Quarter-circles
   - Stripes
   - Dots
   - Chevrons
4. **Applies transformations** - Rotates shapes and applies colors based on the hash

## Design Philosophy

This library is inspired by the Bauhaus movement's principles:

- **Form follows function** - Simple, purposeful geometric shapes
- **Bold colors** - High contrast, vibrant palettes
- **Geometric precision** - Clean lines and mathematical proportions
- **Minimalism** - No unnecessary elements, just essential beauty

## Browser Support

- Modern browsers with ES2022 support
- Node.js 18+ (for server-side usage)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Changelog

### 1.0.0

- Initial release
- Core avatar generation functionality
- TypeScript support
- Multiple shape types and color palettes
