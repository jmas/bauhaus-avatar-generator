# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.0.0] - 2024-12-XX

### Added

- Enhanced avatar generation with improved algorithms
- Refined design system with optimized shape rendering and color distribution
- Performance improvements for faster generation and better memory usage
- Code optimization for cleaner, more maintainable codebase
- Updated dependencies including latest TypeScript and build tools

## [2.1.0] - 2024-XX-XX

### Added

- 2x2 grid layout for cleaner, more balanced compositions
- Weighted color palette system - control color distribution with custom weights
- Color collision prevention - ensures shapes are always visible
- 9 distinct shape types with improved sizing and padding
- GenerateOptions interface for cleaner API

### Changed

- CRC32 hash function for better distribution
- Better shape positioning and sizing within cells
- Consistent results across all implementations (examples.html, example.js, main library)

## [1.3.0] - 2024-XX-XX

### Added

- Custom color palette support
- New default Bauhaus-inspired color palette
- Smart cell pattern selection - ensures variety by avoiding duplicate patterns and distributing across categories
- Enhanced color randomization - each pattern element uses random colors from the palette for maximum variety
- Size randomization - figures within patterns have randomized sizes and positions for dynamic appearance

### Changed

- All 80 geometric patterns now use dynamic color palette
- Standardized pattern sizing and positioning for more consistent, professional appearance
- Single pattern rendering instead of 3x3 grid for cleaner, more focused designs

### Improved

- Enhanced documentation with palette examples

## [1.0.0] - 2024-01-XX

### Added

- Initial release of Bauhaus Avatar Generator
- Core `generateSVG` function for creating deterministic SVG avatars
- Support for custom avatar sizes (default: 512px)
- Multiple Bauhaus-inspired color palettes
- 9 different geometric shapes (circles, triangles, squares, diamonds, etc.)
- TypeScript support with full type definitions
- Zero dependencies
- Comprehensive documentation and examples

### Technical Details

- Uses CRC32 hashing for deterministic generation
- Linear congruential generator for consistent randomness
- SVG output with proper namespacing
- ES modules support
- Source maps for debugging
