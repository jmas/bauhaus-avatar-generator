# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
