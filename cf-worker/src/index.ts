import {
  GenerateOptions,
  GradientGenerateOptions,
  generateGradientSVG,
  generateSVG,
} from "bauhaus-avatar-generator";

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);

    // Handle favicon.ico redirect to favicon.svg
    if (url.pathname === "/favicon.ico") {
      return Response.redirect(
        new URL("/favicon.svg", url.origin).toString(),
        301
      );
    }

    // Check if the request is for the allowed domain
    if (env.ALLOWED_DOMAIN && url.hostname === env.ALLOWED_DOMAIN) {
      const pathParts = url.pathname.split("/");
      const filename = pathParts.pop(); // abcd123.svg

      // If filename is empty (root path), return usage instructions
      if (!filename || filename === "") {
        const usageInstructions = `
# Bauhaus Avatar Generator

Generate unique Bauhaus-style avatars using this service.

## Usage

\`\`\`
https://${env.ALLOWED_DOMAIN}/[ID].svg
\`\`\`

## Parameters

- **ID**: A unique identifier (required)
- **size**: Image size in pixels (default: 200)
- **type**: Avatar type - "bauhaus" or "gradient" (default: bauhaus)
- **icon**: Icon to include in the avatar (optional)
- **complexity**: For gradient type - "simple", "medium", or "complex" (default: medium)
- **pattern**: For gradient type - "radial", "linear", "mesh", "conic", or "random" (default: random)

## Examples

- \`https://${env.ALLOWED_DOMAIN}/user123.svg\`
- \`https://${env.ALLOWED_DOMAIN}/user123.svg?size=400&type=gradient\`
- \`https://${env.ALLOWED_DOMAIN}/user123.svg?size=300&icon=star&complexity=complex\`

## Response

Returns an SVG image with appropriate cache headers.
        `.trim();

        return new Response(usageInstructions, {
          headers: {
            "Content-Type": "text/plain",
            "Cache-Control": "no-cache",
          },
        });
      }
    }

    const pathParts = url.pathname.split("/");
    const filename = pathParts.pop(); // abcd123.svg
    const [id, extension] = filename?.split(".") ?? []; // id = "abcd123", ext = "svg"

    // Validate that we have a valid ID and it's requesting an SVG
    if (!id || !extension || extension.toLowerCase() !== "svg") {
      // Pass through the request if ID is not found or not requesting SVG
      return fetch(request);
    }

    // Validate ID format (basic validation - adjust as needed)
    if (id.length === 0 || id.length > 100) {
      // Pass through the request if ID format is invalid
      return fetch(request);
    }

    // Create cache key based on ID and query parameters
    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;

    try {
      // Try to get cached response first
      const cachedResponse = await cache.match(cacheKey);
      if (cachedResponse) {
        // Create new headers without the old cache status headers
        const headers = new Headers(cachedResponse.headers);
        headers.delete("X-Cache");
        headers.delete("X-Cache-Status");
        headers.set("X-Cache", "HIT");
        headers.set("X-Cache-Status", "cached");

        // Return cached response with updated headers
        const response = new Response(cachedResponse.body, {
          status: cachedResponse.status,
          statusText: cachedResponse.statusText,
          headers: headers,
        });
        return response;
      }

      const defaultSize = 200;

      // Check for query parameters
      const icon = url.searchParams.get("icon") || undefined;
      const size = url.searchParams.has("size")
        ? parseInt(url.searchParams.get("size") as string, 10) || defaultSize
        : defaultSize;
      const type = url.searchParams.get("type") || "bauhaus"; // Default to bauhaus
      const complexity = url.searchParams.get("complexity") as
        | "simple"
        | "medium"
        | "complex"
        | undefined;
      const pattern = url.searchParams.get("pattern") as
        | "radial"
        | "linear"
        | "mesh"
        | "conic"
        | "random"
        | undefined;

      let svgContent: string;
      let response: Response;

      if (type === "gradient") {
        const gradientOptions: GradientGenerateOptions = {
          icon,
          size,
          complexity: complexity || "medium",
          pattern: pattern || "random",
        };

        svgContent = generateGradientSVG(id, gradientOptions);
      } else {
        // Default bauhaus generation
        const svgOptions: GenerateOptions = {
          icon,
          size,
        };

        svgContent = generateSVG(id, svgOptions);
      }

      // Create response with cache headers
      response = new Response(svgContent, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, immutable, max-age=31536000",
          ETag: `"${id}-${type}-${size}-${icon || "no-icon"}-${
            complexity || "default"
          }-${pattern || "default"}"`,
          "X-Cache": "MISS",
          "X-Cache-Status": "generated",
        },
      });

      // Store in cache asynchronously (don't wait for it)
      ctx.waitUntil(cache.put(cacheKey, response.clone()));

      return response;
    } catch (error) {
      // If there's an error generating the SVG, pass through the request
      console.error("Error generating SVG:", error);
      return fetch(request);
    }
  },
} satisfies ExportedHandler<Env>;
