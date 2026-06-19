// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel";

// Vercel ビルド時のみ SSR プレビュー（/blog/preview）を有効化する。
// 本番（GitHub Pages）の静的ビルドには影響しない。
const ssrPreview = process.env.BUILD_TARGET === "vercel";

// /blog/preview（下書きSSRプレビュー）を、Vercelビルド時とローカルdev時のみ
// ルートとして注入する。本番(Pages)の静的ビルドには注入しないため、
// prerender=false のページが存在せずアダプタも不要になる。
function blogPreviewRoute() {
  return {
    name: "blog-preview-route",
    hooks: {
      "astro:config:setup": ({ command, injectRoute }) => {
        if (command === "dev" || ssrPreview) {
          injectRoute({
            pattern: "/blog/preview",
            entrypoint: "./src/blog-preview.astro",
          });
        }
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind(), blogPreviewRoute()],
  output: "static",
  site: "https://tus-tnd.com/",
  base: "",
  adapter: ssrPreview ? vercel() : undefined,
});
