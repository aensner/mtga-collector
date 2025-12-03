import React from 'react';
import type { UploadedImage } from '../../types';

interface ImagePreviewProps {
  images: UploadedImage[];
  onRemove: (id: string) => void;
  processingIndex?: number;
  processingProgress?: number;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  images,
  onRemove,
  processingIndex = -1,
  processingProgress = 0
}) => {
  if (images.length === 0) return null;

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <h3 className="heading-sm mb-4">Uploaded files</h3>

      <div style={{ maxHeight: '300px', overflowY: 'auto' }} className="space-y-2 pr-2">
        {images.map((image, index) => {
          const isProcessing = index === processingIndex;
          const isProcessed = image.processed;

          return (
            <div
              key={image.id}
              className="flex items-center gap-4"
              style={{
                padding: '8px',
                borderRadius: '8px',
                background: isProcessing ? 'var(--bg-tertiary)' : 'transparent',
              }}
            >
              {/* Small Thumbnail - 40x40px fixed */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  minWidth: '40px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-primary)',
                }}
              >
                <img
                  src={image.preview}
                  alt=""
                  style={{
                    width: '40px',
                    height: '40px',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </div>

              {/* File Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: '4px',
                  }}
                  title={image.file.name}
                >
                  {image.file.name}
                </p>

                {/* Progress Bar when processing */}
                {isProcessing ? (
                  <div
                    style={{
                      height: '4px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${processingProgress}%`,
                        background: 'var(--accent-primary)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                ) : (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                    {isProcessed ? (
                      <span style={{ color: 'var(--success)' }}>Processed</span>
                    ) : (
                      `${(image.file.size / 1024 / 1024).toFixed(1)} MB`
                    )}
                  </p>
                )}
              </div>

              {/* Remove Button */}
              <button
                onClick={() => onRemove(image.id)}
                style={{
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                }}
                aria-label="Remove file"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
