import React from 'react';
import Image from 'next/image';

const ProductCard = ({ product, onClick, delay }) => {
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return Array(5).fill(0).map((_, index) => {
      if (index < fullStars) {
        return <span key={index} className="text-yellow-400">★</span>;
      } else if (index === fullStars && hasHalfStar) {
        return <span key={index} className="text-yellow-400">½</span>;
      } else {
        return <span key={index} className="text-gray-300">☆</span>;
      }
    });
  };

  const truncateDescription = (description, wordLimit = 12) => {
    const words = description.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return description;
  };

  return (
    <div 
      className={`bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer 
                  transition-all duration-300 
                  opacity-0 animate-fadeUp
                  hover:shadow-xl hover:shadow-gray-400 transform hover:-translate-y-1
                  w-68 h-200`} // Adjusted width and height
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
      onClick={() => onClick(product)}
    >
      <div className="relative h-48 w-full overflow-hidden"> {/* Adjusted image container */}
        <Image
          src={product.image_url}
          alt={product.name}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
        />
      </div>
      <div className="p-4 flex flex-col justify-between h-48"> {/* Adjusted content area */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2 truncate">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-3"> {/* Using line-clamp for description */}
            {product.description}
          </p>
        </div>
        <div>
          <div className="flex items-center mb-2">
            {renderStars(product.rating)}
            <span className="text-gray-600 text-sm ml-1">({product.rating.toFixed(1)})</span>
          </div>
          <div className="text-lg font-medium text-gray-900">₱{product.price}</div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;