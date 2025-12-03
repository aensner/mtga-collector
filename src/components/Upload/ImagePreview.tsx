import React from 'react';
import type { UploadedImage } from '../../types';

interface ImagePreviewProps {
  images: UploadedImage[];
  onRemove: (id: string) => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ images, onRemove }) => {
  if (images.length === 0) return null;

  return (
    <div className="section">
      <div className="section-header">
        <h3 className="heading-sm">
          Uploaded Images ({images.length})
        </h3>
        <span className="text-caption">
          {images.filter(i => i.processed).length} processed
        </span>
      </div>

      {/* Horizontal scrollable container */}
      <div
        className="flex gap-4 overflow-x-auto pb-3 custom-scrollbar"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {images.map((image) => (
          <div
            key={image.id}
            className="relative flex-shrink-0 group"
            style={{ scrollSnapAlign: 'start' }}
          >
            <div
              className="card overflow-hidden"
              style={{ width: '220px' }}
            >
              {/* Image */}
              <div className="relative">
                <img
                  src={image.preview}
                  alt={image.file.name}
                  className="w-full h-32 object-cover"
                />
                {/* Remove button */}
                <button
                  onClick={() => onRemove(image.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  style={{
                    background: 'var(--error)',
                    color: 'white',
                  }}
                  aria-label="Remove image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Info */}
              <div className="p-3">
                <p
                  className="text-small truncate mb-2"
                  title={image.file.name}
                  style={{ color: 'var(--text-primary)' }}
                >
                  {image.file.name}
                </p>
                <div className="flex items-center justify-between">
                  {image.processed ? (
                    <span className="badge badge-success">Processed</span>
                  ) : (
                    <span className="badge badge-warning">Pending</span>
                  )}
                  <span className="text-caption">
                    {(image.file.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
