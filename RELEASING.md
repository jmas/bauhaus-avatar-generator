# 🚀 Quick Release Guide

## One-Time Setup

1. **Create npm account** at [npmjs.com](https://www.npmjs.com)
2. **Generate npm token** (Automation type)
3. **Add GitHub secret**: `NPM_TOKEN` = your npm token

## Making a Release

### Option 1: GitHub Web Interface (Easiest)

```bash
# 1. Update version
npm version patch  # or minor/major

# 2. Push changes
git push origin main

# 3. Create release on GitHub.com
# - Go to Releases → Create new release
# - Tag: v1.0.1 (match package.json version)
# - Add release notes
# - Publish release
```

### Option 2: Command Line

```bash
# 1. Update version and create tag
npm version patch

# 2. Push everything
git push origin main --tags

# 3. Create release (if you have GitHub CLI)
gh release create v1.0.1 --title "Version 1.0.1" --notes "Bug fixes"
```

## Version Types

- `patch`: Bug fixes (1.0.0 → 1.0.1)
- `minor`: New features (1.0.0 → 1.1.0)
- `major`: Breaking changes (1.0.0 → 2.0.0)

## What Happens Next

1. GitHub Action automatically triggers
2. Builds the package
3. Publishes to npm
4. Check Actions tab for status

## Verify Release

- Visit: https://www.npmjs.com/package/bauhaus-avatar-generator
- Test: `npm install bauhaus-avatar-generator@latest`

---

📖 **Full guide**: See [RELEASING.md](./RELEASING.md) for detailed instructions
