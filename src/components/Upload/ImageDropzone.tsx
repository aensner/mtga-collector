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
      className={`dropzone ${isDragActive ? 'active' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        {/* Upload Icon */}
        <div className={`
          w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300
          ${isDragActive
            ? 'bg-primary/20 scale-110'
            : 'bg-glass-white'
          }
        `}>
          <svg
            className={`w-10 h-10 transition-colors duration-300 ${
              isDragActive ? 'text-primary' : 'text-text-muted'
            }`}
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
        <div className="text-center">
          {isDragActive ? (
            <p className="text-lg font-semibold text-primary">
              Drop your screenshots here
            </p>
          ) : (
            <>
              <p className="text-lg font-semibold text-text-primary">
                Drag & drop MTG Arena screenshots
              </p>
              <p className="text-sm text-text-secondary mt-2">
                or <span className="text-primary cursor-pointer hover:underline">browse files</span>
              </p>
            </>
          )}
        </div>

        {/* Supported Formats */}
        {!isDragActive && (
          <div className="flex items-center gap-2 mt-2">
            {['PNG', 'JPG', 'JPEG', 'WEBP'].map((format) => (
              <span
                key={format}
                className="px-2 py-1 text-2xs font-medium text-text-muted bg-glass-white rounded-md"
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
