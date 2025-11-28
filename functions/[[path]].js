import { render } from "../dist/server/entry-server.js";

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Serve static assets directly
  if (
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/locales/") ||
    url.pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|css|js|json|woff|woff2|ttf|eot)$/)
  ) {
    return env.ASSETS.fetch(request);
  }

  try {
    // Read the template HTML
    const template = await env.ASSETS.fetch(new URL("/index.html", url.origin));
    let html = await template.text();

    // Render the app HTML
    const { html: appHtml } = render(url.pathname);

    // Replace the placeholder with the rendered HTML
    html = html.replace("<!--app-html-->", appHtml);

    // Return the HTML response
    return new Response(html, {
      headers: {
        "Content-Type": "text/html;charset=UTF-8",
      },
    });
  } catch (error) {
    console.error("SSR Error:", error);

    // Fallback to serving the template HTML
    return env.ASSETS.fetch(new URL("/index.html", url.origin));
  }
}
