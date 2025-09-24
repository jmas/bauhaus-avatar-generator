# Bauhaus Avatar Generator

![Bauhaus Avatar Generator](https://bauhaus-avatar-generator.pp.ua/test.svg?size=100)
![Bauhaus Avatar Generator](https://bauhaus-avatar-generator.pp.ua/test.svg?type=gradient&size=100)

A TypeScript library for generating beautiful, deterministic Bauhaus-style SVG avatars from any input string. Each input string will always generate the same unique avatar, making it perfect for user profiles, placeholders, and visual identification.

## Features

- 🎨 **Bauhaus-inspired design** - Clean, geometric shapes with bold colors
- 🌈 **Gradient backgrounds** - Complex gradient patterns with color harmony
- 🔄 **Deterministic generation** - Same input always produces the same avatar
- 📱 **SVG output** - Scalable vector graphics that work everywhere
- 🎯 **TypeScript support** - Full type definitions included
- ⚡ **Zero dependencies** - Lightweight and fast
- 🎲 **Weighted color palettes** - Control color distribution with custom weights
- 🎨 **2x2 grid layout** - Clean, balanced geometric compositions
- 🎭 **9 shape types** - Circles, triangles, squares, diamonds, and more
- 🔧 **Color collision prevention** - Ensures shapes are always visible
- 👤 **User icon overlay** - Optional centered user icon with automatic contrast color selection
- 🎨 **Color harmony rules** - Complementary, triadic, analogous, and split-complementary color schemes
- 🌊 **Algorithmic blending** - Smooth color transitions and gradient patterns

## Installation

```bash
npm install bauhaus-avatar-generator
```

## Usage

### Basic Usage

```typescript
import { generateSVG, generateGradientSVG } from "bauhaus-avatar-generator";

// Generate a 512x512 Bauhaus-style avatar with default palette
const avatar = generateSVG("john@example.com");
console.log(avatar);

// Generate a gradient-based avatar
const gradientAvatar = generateGradientSVG("john@example.com");
console.log(gradientAvatar);
```

### With Custom Options

```typescript
import {
  generateSVG,
  generateGradientSVG,
  GenerateOptions,
  GradientGenerateOptions,
} from "bauhaus-avatar-generator";

// Generate Bauhaus-style avatar with custom size
const avatar = generateSVG("alice", { size: 256 });

// Generate with custom colors and weights
const avatar2 = generateSVG("bob", {
  colors: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"],
  weights: [30, 25, 20, 15, 10],
  size: 300,
});

// Generate with user icon overlay
const avatar3 = generateSVG("charlie", {
  size: 400,
  icon: "user",
});

// Generate gradient avatar with custom complexity and pattern
const gradientAvatar = generateGradientSVG("diana", {
  complexity: "complex",
  pattern: "radial",
  size: 400,
  icon: "user",
});
```

### With Weighted Color Palette

```typescript
import { generateSVG } from "bauhaus-avatar-generator";

// Define colors and their weights (higher weight = more likely to appear)
const options = {
  colors: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"],
  weights: [35, 20, 17, 15, 13], // 35% coral, 20% turquoise, etc.
  size: 400,
};

const avatar = generateSVG("user123", options);
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

      const avatar = generateSVG("user@example.com", { size: 200 });
      document.getElementById("avatar").innerHTML = avatar;
    </script>
  </body>
</html>
```

### In React

```tsx
import React from "react";
import { generateSVG, GenerateOptions } from "bauhaus-avatar-generator";

interface AvatarProps {
  input: string;
  options?: GenerateOptions;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  input,
  options = { size: 200 },
  className,
}) => {
  const svg = generateSVG(input, options);

  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: svg }} />
  );
};

// Usage
<Avatar input="user@example.com" options={{ size: 150 }} />;
<Avatar
  input="user@example.com"
  options={{
    size: 150,
    colors: ["#ff6b6b", "#4ecdc4", "#45b7d1"],
    weights: [40, 30, 30],
  }}
/>;
```

## API Reference

### `generateSVG(input: string, options?: GenerateOptions): string`

Generates a Bauhaus-style SVG avatar from an input string.

**Parameters:**

- `input` (string): The input string to generate the avatar from. Can be any string (email, username, ID, etc.)
- `options` (GenerateOptions, optional): Configuration options for the avatar generation.

**GenerateOptions Interface:**

```typescript
interface GenerateOptions {
  colors?: string[]; // Array of hex color strings
  weights?: number[]; // Array of weights for each color (must match colors length)
  size?: number; // Size in pixels (default: 512)
  icon?: string; // Icon type to overlay (e.g., 'user' for user icon, default: undefined)
}
```

**Returns:**

- `string`: A complete SVG element as a string.

**Examples:**

```typescript
// Basic usage with default palette
const avatar = generateSVG("hello@world.com");
// Returns: <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">...</svg>

// Custom size
const avatar2 = generateSVG("hello@world.com", { size: 300 });

// Custom colors and weights
const avatar3 = generateSVG("hello@world.com", {
  colors: ["#ff6b6b", "#4ecdc4", "#45b7d1"],
  weights: [40, 30, 30],
  size: 400,
});
```

### Default Color Palette

The library comes with a vibrant default palette with weighted distribution:

```typescript
const DEFAULT_COLORS = [
  "#ff6b6b", // Coral red (30% weight)
  "#4ecdc4", // Turquoise (25% weight)
  "#45b7d1", // Sky blue (20% weight)
  "#96ceb4", // Mint green (15% weight)
  "#feca57", // Golden yellow (10% weight)
];

const DEFAULT_WEIGHTS = [30, 25, 20, 15, 10];
```

This means coral red will appear in ~30% of color selections, turquoise in ~25%, and so on.

### Smart Contrast Color for User Icons

When using the `icon: "user"` option, the library automatically calculates the optimal contrast color for the user icon based on the background colors:

- **Light backgrounds** (high luminance) → User icon appears in **black**
- **Dark backgrounds** (low luminance) → User icon appears in **white**

The contrast calculation uses the WCAG (Web Content Accessibility Guidelines) formula to ensure optimal readability and accessibility across all color palettes.

## How It Works

The avatar generator uses a deterministic algorithm that:

1. **Hashes the input** - Uses CRC32 to convert any string into a consistent number
2. **Creates weighted palette** - Expands the color palette based on weights (e.g., 30% coral = 30 copies in 100-color palette)
3. **Generates 2x2 grid** - Creates a 2x2 grid of cells, each with its own background color and shape
4. **Selects shapes** - Each cell gets one of 9 geometric shapes:
   - Circles
   - Triangles
   - Squares
   - Diamonds
   - Half-circles
   - Quarter-circles
   - Stripes
   - Dots
   - Chevrons
5. **Applies transformations** - Rotates shapes randomly (0°, 90°, 180°, 270°)
6. **Prevents color collisions** - Ensures shape colors are always different from background colors
7. **Smart contrast icons** - User icons automatically use black or white based on background luminance for optimal visibility
8. **Uses deterministic randomness** - Linear Congruential Generator ensures same input always produces same result

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

### 4.0.0

- 🎨 **NEW: Gradient Avatar Generation** - Brand new `generateGradientSVG` function for stunning gradient-based avatars
- 🌈 **Advanced Color Harmony** - Complementary, triadic, analogous, and split-complementary color schemes
- 🎭 **Multiple Gradient Patterns** - Radial, linear, mesh, and conic gradient support
- 🔧 **Complexity Levels** - Simple, medium, and complex gradient generation options
- 🎨 **Algorithmic Blending** - Smooth color transitions and advanced gradient patterns
- 🎯 **Enhanced Color Theory** - Complete HSL/RGB conversion utilities and contrast calculations
- 🌊 **Pattern Customization** - Fine-grained control over gradient complexity and visual style
- 🎪 **Mix Blend Modes** - Advanced layering with multiply, overlay, soft-light, and hard-light modes

### 3.0.0

- 🚀 **Major version release** - Enhanced avatar generation with improved algorithms
- 🎨 **Refined design system** - Optimized shape rendering and color distribution
- ⚡ **Performance improvements** - Faster generation and better memory usage
- 🔧 **Code optimization** - Cleaner, more maintainable codebase
- 📦 **Updated dependencies** - Latest TypeScript and build tools

### 2.1.0

- 🎨 **New**: 2x2 grid layout for cleaner, more balanced compositions
- ⚖️ **New**: Weighted color palette system - control color distribution with custom weights
- 🔧 **New**: Color collision prevention - ensures shapes are always visible
- 🎭 **Enhanced**: 9 distinct shape types with improved sizing and padding
- 🔄 **Updated**: CRC32 hash function for better distribution
- 📐 **Improved**: Better shape positioning and sizing within cells
- 🎯 **New**: GenerateOptions interface for cleaner API
- 🐛 **Fixed**: Consistent results across all implementations (examples.html, example.js, main library)

### 1.3.0

- ✨ **New**: Custom color palette support
- 🎨 **Updated**: New default Bauhaus-inspired color palette
- 📚 **Improved**: Enhanced documentation with palette examples
- 🔧 **Enhanced**: All 80 geometric patterns now use dynamic color palette
- 🎲 **New**: Smart cell pattern selection - ensures variety by avoiding duplicate patterns and distributing across categories
- 📐 **Enhanced**: Standardized pattern sizing and positioning for more consistent, professional appearance
- 🎯 **Updated**: Single pattern rendering instead of 3x3 grid for cleaner, more focused designs
- 🎨 **New**: Enhanced color randomization - each pattern element uses random colors from the palette for maximum variety
- 📏 **New**: Size randomization - figures within patterns have randomized sizes and positions for dynamic appearance

### 1.0.0

- Initial release
- Core avatar generation functionality
- TypeScript support
- Multiple shape types and color palettes
