import { build } from "vite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function buildAll() {
  try {
    console.log("Building client...");
    // Build client
    await build({
      configFile: resolve(__dirname, "vite.config.js"),
      build: {
        outDir: "dist/client",
        ssrManifest: true,
      },
    });

    console.log("Building server...");
    // Build server
    await build({
      configFile: resolve(__dirname, "vite.config.js"),
      build: {
        ssr: true,
        outDir: "dist/server",
        rollupOptions: {
          input: resolve(__dirname, "src/entry-server.jsx"),
        },
      },
    });

    console.log("Build completed successfully!");
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

buildAll();
