import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    /**
     * Z3 uses SharedArrayBuffers, which require cross-origin isolation.
     * The headers below enable that isolation in dev mode.
     * For production you must configure your server to send the same headers.
     */
    {
      name: "configure-response-headers",
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          next();
        });
      },
    },
  ],
});
