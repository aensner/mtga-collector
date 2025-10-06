import React from 'react';
import { UploadedImage } from '../../types';

interface ImagePreviewProps {
  images: UploadedImage[];
  onRemove: (id: string) => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ images, onRemove }) => {
  if (images.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Uploaded Images ({images.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative group">
            <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
              <img
                src={image.preview}
                alt={image.file.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-3">
                <p className="text-sm text-gray-300 truncate">{image.file.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  {image.processed ? (
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                      Processed
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                      Pending
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {(image.file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onRemove(image.id)}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
