// @ts-check
import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
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

// src/dev-pages/*.astro を /dev/<ファイル名> として dev 時のみ注入する開発用テスト環境。
// dev 限定なので本番(Pages)にも Vercel にも一切含まれない。
// 確認用ページを増やしたいときは src/dev-pages/ に .astro を置くだけでよい。
function devPagesRoutes() {
  return {
    name: "dev-pages-routes",
    hooks: {
      "astro:config:setup": ({ command, injectRoute }) => {
        if (command !== "dev") return;

        const dir = fileURLToPath(new URL("./src/dev-pages/", import.meta.url));
        if (!existsSync(dir)) return;

        for (const file of readdirSync(dir)) {
          if (!file.endsWith(".astro")) continue;
          const name = file.replace(/\.astro$/, "");
          injectRoute({
            // index.astro は /dev を一覧ページにする
            pattern: name === "index" ? "/dev" : `/dev/${name}`,
            entrypoint: `./src/dev-pages/${file}`,
          });
        }
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    tailwind(),
    blogPreviewRoute(),
    devPagesRoutes(),
    // ビルドされた全ページ（microCMS の記事を含む）から sitemap を自動生成する
    sitemap({
      // 本番に存在しないルート（SSRプレビュー・dev限定ページ）は載せない
      filter: (page) =>
        !page.includes("/blog/preview") && !page.includes("/dev/"),
    }),
  ],
  output: "static",
  site: "https://tus-tnd.com/",
  base: "",
  adapter: ssrPreview ? vercel() : undefined,
});
