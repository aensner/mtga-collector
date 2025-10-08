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
      className={`
        border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
        ${isDragActive
          ? 'border-blue-500 bg-blue-500/10'
          : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
        }
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <svg
          className="w-16 h-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <div className="text-gray-300">
          {isDragActive ? (
            <p className="text-lg font-medium">Drop the images here...</p>
          ) : (
            <>
              <p className="text-lg font-medium">Drag & drop MTG Arena screenshots here</p>
              <p className="text-sm text-gray-500 mt-2">or click to select files</p>
              <p className="text-xs text-gray-600 mt-1">Supports PNG, JPG, JPEG, WEBP</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
