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

    try {
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

      if (type === "gradient") {
        const gradientOptions: GradientGenerateOptions = {
          icon,
          size,
          complexity: complexity || "medium",
          pattern: pattern || "random",
        };

        return new Response(generateGradientSVG(id, gradientOptions), {
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, immutable, max-age=31536000",
          },
        });
      } else {
        // Default bauhaus generation
        const svgOptions: GenerateOptions = {
          icon,
          size,
        };

        return new Response(generateSVG(id, svgOptions), {
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, immutable, max-age=31536000",
          },
        });
      }
    } catch (error) {
      // If there's an error generating the SVG, pass through the request
      return fetch(request);
    }
  },
} satisfies ExportedHandler<Env>;
