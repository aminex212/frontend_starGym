import { defineConfig, type Plugin } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import rsc from "@vitejs/plugin-rsc";
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer";

function vinextClientAssetsSidecar(): Plugin {
  return {
    name: "vinext-client-assets-sidecar",
    generateBundle() {
      if (this.environment.name !== "rsc") {
        return;
      }

      this.emitFile({
        type: "asset",
        fileName: "vinext-client-assets.js",
        source: "export default {};\n",
      });
    },
  };
}

export default defineConfig({
  plugins: [
    vinext({ rsc: false,
    images: { optimizer: imagesOptimizer() },
}),
    rsc({ enableActionEncryption: false }),
    vinextClientAssetsSidecar(),
    cloudflare({ viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] } }),
  ],
});