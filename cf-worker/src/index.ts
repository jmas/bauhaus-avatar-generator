import {
  GenerateOptions,
  GradientGenerateOptions,
  generateGradientSVG,
  generateSVG,
} from "bauhaus-avatar-generator";

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);

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
