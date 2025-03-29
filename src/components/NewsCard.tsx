import type { FC } from "react";

interface NewsCardProps {
  image: string;
  title: string;
  description: string;
  author: string;
  role: string;
  authorImage: string;
  date: string;
  url: string; // URLプロパティを追加
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
}) => {
  return (
    <a
      href={url}
      className="block w-full max-w-md overflow-hidden bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
    >
      {/* Image Section */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={image}
          alt="Card layout"
          className="object-cover w-full h-full"
        />
      </div>

      {/* Content Section with specific padding */}
      <div className="p-4">
        {/* Title with 16px padding */}
        <h2 className="text-xl font-bold mb-4 px-4">{title}</h2>
        {/* Description with 16px padding on sides */}
        <p className="text-gray-600 mb-4 px-4">{description}</p>
        {/* Footer Section with 16px bottom padding */}
        <div className="flex justify-between items-center px-4 pb-4">
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
