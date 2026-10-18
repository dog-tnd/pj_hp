// Tailwind CSS 3 を PostCSS プラグインとして読み込む（@astrojs/tailwind は Astro 6 以降に未対応のため）
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default {
  plugins: [tailwindcss(), autoprefixer()],
};
