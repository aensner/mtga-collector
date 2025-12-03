import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import type { UploadedImage } from '../../types';

interface ImageDropzoneProps {
  onImagesUploaded: (images: UploadedImage[]) => void;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({ onImagesUploaded }) => {
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
      className={`dropzone h-full min-h-64 ${isDragActive ? 'active' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center h-full text-center">
        {/* Upload Icon */}
        <div
          className="w-12 h-12 mb-4 rounded-xl flex items-center justify-center transition-all duration-300"
          style={{
            background: isDragActive ? 'var(--accent-primary-light)' : 'var(--bg-tertiary)',
            transform: isDragActive ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          <svg
            className="w-6 h-6 transition-colors duration-300"
            style={{ color: isDragActive ? 'var(--accent-primary)' : 'var(--text-muted)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
        </div>

        {/* Text Content */}
        {isDragActive ? (
          <p
            className="font-medium text-sm"
            style={{ color: 'var(--accent-primary)' }}
          >
            Drop files here
          </p>
        ) : (
          <>
            <p
              className="font-medium text-sm mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              Drag and Drop files to upload
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              or
            </p>
            <button
              type="button"
              className="btn btn-primary px-6 py-2 text-sm"
            >
              Browse
            </button>
          </>
        )}

        {/* Supported Formats */}
        {!isDragActive && (
          <p className="text-caption mt-4" style={{ color: 'var(--text-muted)' }}>
            Supported files: PNG, JPG, WEBP
          </p>
        )}
      </div>
    </div>
  );
};
