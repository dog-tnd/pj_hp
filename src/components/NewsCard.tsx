import type { FC } from "react";

interface NewsCardProps {
  image: string;
  title: string;
  description: string;
  author: string;
  role: string;
  authorImage: string;
  date: string;
  url: string;
  // カードの幅・高さを上書きしたい場合に指定（未指定時は従来サイズ）
  sizeClass?: string;
  // 外部サイト（Zenn・Qiita など）の記事のとき、画像にバッジを重ねて新しいタブで開く（spec 008）
  external?: { label: string };
  // 外部サイトの記事の読み上げ用（例：「<タイトル>（Qiita の記事・新しいタブで開きます）」）
  ariaLabel?: string;
}

const NewsCard: FC<NewsCardProps> = ({
  image,
  title,
  description,
  author,
  role,
  authorImage,
  date,
  url, // URLプロパティを追加
  // 高さは「画像192 + タイトル2行56 + 説明3行72 + 余白・著者情報」が収まるよう 440px にしている。
  // タイトルや説明の行数を増やすときは、ここも合わせて広げないと下が隠れる
  sizeClass = "w-full max-w-sm custom-md:w-[390px] custom-md:max-w-[390px] h-[440px]",
  external,
  ariaLabel,
}) => {
  return (
    <a
      href={url}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener" : undefined}
      aria-label={ariaLabel}
      className={`${sizeClass} overflow-hidden bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col mx-auto`}
    >
      {/* Image Section */}
      <div className="relative h-48 w-full overflow-hidden shrink-0">
        <img
          src={image}
          alt="Card layout"
          className="object-cover w-full h-full"
        />
        {/* 外部サイトのバッジ（#70 で決めた見た目。デザインシステム「外部サイトの記事の印」）。
            画像の上に重ねるだけなので、カードの高さは変わらない。読み上げはリンクの aria-label で伝える */}
        {external && (
          <span aria-hidden="true">
            <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-sm font-medium text-white backdrop-blur-xs">
              {external.label}
            </span>
            <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 3h7v7" />
                <path d="M10 14L21 3" />
                <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
              </svg>
            </span>
          </span>
        )}
      </div>

      {/* Content Section with specific padding */}
      <div className="p-4 flex flex-col grow">
        {/* Title with 16px padding - 2行に制限 */}
        <h2
          className="text-xl font-bold mb-2 px-4 overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {title}
        </h2>
        {/* Description with 16px padding on sides - 3行に制限 */}
        <p
          className="text-gray-600 mb-3 px-4 overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {description}
        </p>
        {/* Footer Section with 16px bottom padding */}
        <div className="flex justify-between items-center px-4 pb-4 mt-auto">
          {/* User Info */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200">
              <img
                src={authorImage}
                alt={author}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-medium text-sm">{author}</p>
              <p className="text-xs text-gray-500">{role}</p>
            </div>
          </div>

          {/* Date */}
          <div className="text-[#38BDF8] text-sm">{date}</div>
        </div>
      </div>
    </a>
  );
};

export default NewsCard;

{
  /*

  使い方

<NewsCard
image="https://example.com/sample.jpg"
title="新しいプロジェクトが始まりました"
description="これは新しいプロジェクトの説明です..."
author="田中 太郎"
role="エンジニア"
authorImage="/author-image.jpg"
date="2024.10.01"
url="https://example.com/project" // URLプロパティを追加
client:load
/>

  */
}
