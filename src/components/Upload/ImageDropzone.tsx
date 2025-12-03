import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import type { UploadedImage } from '../../types';

interface ImageDropzoneProps {
  onImagesUploaded: (images: UploadedImage[]) => void;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({ onImagesUploaded }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages: UploadedImage[] = acceptedFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
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
      style={{
        border: '2px dashed var(--border-primary)',
        borderRadius: '12px',
        padding: '24px 16px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        background: isDragActive ? 'var(--bg-tertiary)' : 'transparent',
        borderColor: isDragActive ? 'var(--accent-primary)' : 'var(--border-primary)',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <input {...getInputProps()} />

      {/* Upload Icon */}
      <div
        style={{
          width: '48px',
          height: '48px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isDragActive ? 'var(--accent-primary)' : 'var(--text-muted)'}
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
      </div>

      {/* Text */}
      <p style={{
        fontSize: '14px',
        fontWeight: 500,
        color: 'var(--text-primary)',
        marginBottom: '4px',
      }}>
        {isDragActive ? 'Drop files here' : 'Drag and Drop files to upload'}
      </p>

      {!isDragActive && (
        <>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-muted)',
            marginBottom: '16px',
          }}>
            or
          </p>

          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '8px 24px', fontSize: '14px' }}
          >
            Browse
          </button>

          <p style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginTop: '16px',
          }}>
            Supported files: PNG, JPG, WEBP
          </p>
        </>
      )}
    </div>
  );
};
