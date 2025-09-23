import { generateSVG } from "bauhaus-avatar-generator";

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);

    const pathParts = url.pathname.split("/");
    const filename = pathParts.pop(); // abcd123.svg
    const [id] = filename?.split(".") ?? []; // id = "abcd123", ext = "svg"

    return new Response(generateSVG(id), {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, immutable, max-age=31536000",
      },
    });
  },
} satisfies ExportedHandler<Env>;
