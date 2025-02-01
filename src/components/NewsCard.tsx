import type { FC } from "react";

interface NewsCardProps {
  image: string;
  title: string;
  description: string;
  author: string;
  role: string;
  authorImage: string;
  date: string;
}

const NewsCard: FC<NewsCardProps> = ({
  image,
  title,
  description,
  author,
  role,
  authorImage,
  date,
}) => {
  return (
    <div className="w-full max-w-md overflow-hidden bg-white rounded-lg shadow-md">
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
    </div>
  );
};

export default NewsCard;
