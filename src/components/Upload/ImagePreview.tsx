import React from 'react';
import type { UploadedImage } from '../../types';

interface ImagePreviewProps {
  images: UploadedImage[];
  onRemove: (id: string) => void;
  processingIndex?: number; // Which image is currently being processed (-1 = none)
  processingProgress?: number; // 0-100 progress for current image
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  images,
  onRemove,
  processingIndex = -1,
  processingProgress = 0
}) => {
  if (images.length === 0) return null;

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="heading-sm">Uploaded files</h3>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
        {images.map((image, index) => {
          const isProcessing = index === processingIndex;
          const isProcessed = image.processed;
          const isPending = !isProcessed && index > processingIndex;

          return (
            <div
              key={image.id}
              className="flex items-center gap-3 p-2 rounded-lg transition-colors"
              style={{
                background: isProcessing ? 'var(--bg-tertiary)' : 'transparent',
              }}
            >
              {/* Thumbnail */}
              <div
                className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
                style={{ border: '1px solid var(--border-primary)' }}
              >
                <img
                  src={image.preview}
                  alt={image.file.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* File Info & Progress */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-small truncate mb-1"
                  style={{ color: 'var(--text-primary)' }}
                  title={image.file.name}
                >
                  {image.file.name}
                </p>

                {/* Progress Bar */}
                {isProcessing && (
                  <div className="progress" style={{ height: '4px' }}>
                    <div
                      className="progress-bar transition-all duration-300"
                      style={{
                        width: `${processingProgress}%`,
                        background: 'var(--accent-primary)'
                      }}
                    />
                  </div>
                )}

                {/* Status Text */}
                {!isProcessing && (
                  <p className="text-caption" style={{ color: 'var(--text-muted)' }}>
                    {isProcessed ? (
                      <span style={{ color: 'var(--success)' }}>Processed</span>
                    ) : isPending ? (
                      'Pending'
                    ) : (
                      `${(image.file.size / 1024 / 1024).toFixed(1)} MB`
                    )}
                  </p>
                )}
              </div>

              {/* Remove Button */}
              <button
                onClick={() => onRemove(image.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg-tertiary)]"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Remove file"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
