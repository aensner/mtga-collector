import React from 'react';
import type { UploadedImage } from '../../types';

interface ImagePreviewProps {
  images: UploadedImage[];
  onRemove: (id: string) => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ images, onRemove }) => {
  if (images.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="heading-sm">
          Uploaded Images ({images.length})
        </h3>
        <span className="text-caption">
          {images.filter(i => i.processed).length} processed
        </span>
      </div>

      {/* Horizontal scrollable container */}
      <div
        className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {images.map((image) => (
          <div
            key={image.id}
            className="relative flex-shrink-0 group"
            style={{ scrollSnapAlign: 'start' }}
          >
            <div
              className="rounded-lg overflow-hidden"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                width: '200px',
              }}
            >
              <div className="relative">
                <img
                  src={image.preview}
                  alt={image.file.name}
                  className="w-full h-28 object-cover"
                />
                {/* Remove button */}
                <button
                  onClick={() => onRemove(image.id)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: 'var(--error)',
                    color: 'white',
                  }}
                  aria-label="Remove image"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-2">
                <p
                  className="text-caption truncate mb-1"
                  title={image.file.name}
                >
                  {image.file.name}
                </p>
                <div className="flex items-center justify-between">
                  {image.processed ? (
                    <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                      Processed
                    </span>
                  ) : (
                    <span className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                      Pending
                    </span>
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
