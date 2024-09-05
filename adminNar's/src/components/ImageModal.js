// src/components/ImageModal.js
import React from 'react';

const ImageModal = ({ imageUrl, altText, onClose }) => {
  const handleCloseModal = (e) => {
    // Check if the user clicked outside the modal image
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleCloseModal}
    >
      <div className="bg-white p-4 rounded-lg max-w-3xl max-h-3xl overflow-auto relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <img
          src={imageUrl}
          alt={altText}
          className="max-w-full max-h-[80vh] object-contain"
        />
      </div>
    </div>
  );
};

export default ImageModal;