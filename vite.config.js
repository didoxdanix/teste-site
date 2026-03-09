import { defineConfig } from "vite";

export default defineConfig({
  server: {
    allowedHosts: ["godata.com.br", "www.godata.com.br"]
  }
});
