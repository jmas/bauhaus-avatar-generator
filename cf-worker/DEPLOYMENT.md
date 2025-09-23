# Cloudflare Worker Deployment Guide

This guide explains how to deploy the Bauhaus Avatar Generator Cloudflare Worker.

## Prerequisites

1. **Node.js**: Ensure you have Node.js installed (version 18 or higher recommended)
2. **Cloudflare Account**: You need a Cloudflare account to deploy workers
3. **Wrangler CLI**: The Cloudflare Workers CLI tool

## Setup

### 1. Install Wrangler CLI

If you haven't installed Wrangler globally:

```bash
npm install -g wrangler
```

### 2. Authenticate with Cloudflare

Login to your Cloudflare account:

```bash
wrangler login
```

This will open a browser window where you can authenticate with your Cloudflare account.

### 3. Install Dependencies

From the `cf-worker` directory:

```bash
npm install
```

## Deployment

### Deploy to Production

To deploy the worker to Cloudflare:

```bash
npm run deploy
```

Or directly with Wrangler:

```bash
wrangler deploy
```

### Deploy to a Specific Environment

If you have multiple environments configured in `wrangler.jsonc`:

```bash
wrangler deploy --env production
```

## Development

### Local Development

Start a local development server:

```bash
npm run dev
```

This will start the worker locally at `http://localhost:8787` where you can test it before deploying.

### Testing

Run the test suite:

```bash
npm test
```

## Configuration

The worker is configured in `wrangler.jsonc`:

- **Name**: `bauhaus-avatar-generator-cf-worker`
- **Entry Point**: `src/index.ts`
- **Compatibility Date**: `2025-09-23`
- **Observability**: Enabled

## How It Works

The worker generates SVG avatars based on URL patterns:

- **URL Format**: `https://your-worker.your-subdomain.workers.dev/avatar-id.svg`
- **Example**: `https://bauhaus-avatar-generator-cf-worker.your-subdomain.workers.dev/abc123.svg`

The worker:

1. Extracts the avatar ID from the URL path
2. Generates an SVG using the `bauhaus-avatar-generator` package
3. Returns the SVG with proper headers and caching

## Troubleshooting

### Common Issues

1. **Authentication Error**: Run `wrangler login` again
2. **Build Errors**: Ensure all dependencies are installed with `npm install`
3. **Deployment Fails**: Check your Cloudflare account limits and billing

### Checking Deployment Status

View your deployed workers:

```bash
wrangler whoami
wrangler list
```

### Viewing Logs

Monitor your worker's logs:

```bash
wrangler tail
```

## Environment Variables

Currently, no environment variables are configured. To add them:

1. Add to `wrangler.jsonc`:

```json
{
  "vars": {
    "MY_VARIABLE": "value"
  }
}
```

2. For sensitive data, use secrets:

```bash
wrangler secret put SECRET_NAME
```

## Custom Domain (Optional)

To use a custom domain:

1. Add domain configuration to `wrangler.jsonc`:

```json
{
  "routes": [
    {
      "pattern": "avatars.yourdomain.com/*",
      "zone_name": "yourdomain.com"
    }
  ]
}
```

2. Deploy with the custom domain configuration

## Monitoring

The worker has observability enabled, so you can monitor:

- Request metrics
- Error rates
- Performance data

Access monitoring through the Cloudflare dashboard or via the Wrangler CLI.
