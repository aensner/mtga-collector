import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import type { UploadedImage } from '../../types';

interface ImageDropzoneProps {
  onImagesUploaded: (images: UploadedImage[]) => void;
  compact?: boolean;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({ onImagesUploaded, compact = false }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages: UploadedImage[] = acceptedFiles.map((file) => ({
      id: `${file.name}-${Date.now()}`,
      file,
      preview: URL.createObjectURL(file),
      processed: false,
    }));

    onImagesUploaded(newImages);
  }, [onImagesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`dropzone ${isDragActive ? 'active' : ''}`}
      style={compact ? { padding: '24px 16px' } : {}}
    >
      <input {...getInputProps()} />
      <div className={`flex items-center gap-4 ${compact ? 'flex-row' : 'flex-col'}`}>
        {/* Upload Icon */}
        <div
          className={`
            rounded-xl flex items-center justify-center transition-all duration-300
            ${compact ? 'w-12 h-12' : 'w-16 h-16'}
          `}
          style={{
            background: isDragActive ? 'var(--accent-primary-light)' : 'var(--bg-tertiary)',
            transform: isDragActive ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          <svg
            className={`transition-colors duration-300 ${compact ? 'w-6 h-6' : 'w-8 h-8'}`}
            style={{ color: isDragActive ? 'var(--accent-primary)' : 'var(--text-muted)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        {/* Text Content */}
        <div className={compact ? 'text-left flex-1' : 'text-center'}>
          {isDragActive ? (
            <p
              className={`font-semibold ${compact ? 'text-sm' : 'text-lg'}`}
              style={{ color: 'var(--accent-primary)' }}
            >
              Drop your screenshots here
            </p>
          ) : (
            <>
              <p
                className={`font-semibold ${compact ? 'text-sm' : 'text-lg'}`}
                style={{ color: 'var(--text-primary)' }}
              >
                Drag & drop MTG Arena screenshots
              </p>
              <p
                className={`${compact ? 'text-xs mt-0.5' : 'text-sm mt-1'}`}
                style={{ color: 'var(--text-secondary)' }}
              >
                or <span style={{ color: 'var(--accent-primary)' }} className="cursor-pointer hover:underline">browse files</span>
              </p>
            </>
          )}
        </div>

        {/* Supported Formats - only show when not compact */}
        {!isDragActive && !compact && (
          <div className="flex items-center gap-2 mt-2">
            {['PNG', 'JPG', 'JPEG', 'WEBP'].map((format) => (
              <span
                key={format}
                className="px-2 py-1 text-xs font-medium rounded"
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-muted)',
                }}
              >
                {format}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
