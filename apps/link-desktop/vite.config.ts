import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

const mockWebRtc = process.env.LINK_DESKTOP_E2E_MOCK_WEBRTC === "1";

export default defineConfig({
  plugins: [react()],
  root: ".",
  base: "./",
  resolve: {
    alias: mockWebRtc
      ? {
          "@telnyx/webrtc": fileURLToPath(new URL("./src/renderer/phone/webrtc-e2e-mock.ts", import.meta.url)),
        }
      : {},
  },
  build: {
    outDir: "dist/renderer",
    emptyOutDir: true,
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: false,
  },
});
