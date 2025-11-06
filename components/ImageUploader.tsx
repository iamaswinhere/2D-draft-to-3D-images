
import React, { useState, useCallback } from 'react';

interface ImageUploaderProps {
  onFileChange: (file: File | null) => void;
  previewUrl: string | null;
  isLoading: boolean;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);


export const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileChange, previewUrl, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (files && files[0]) {
      onFileChange(files[0]);
    }
  };

  const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [onFileChange]);
  
  const handleClear = () => {
    onFileChange(null);
  }

  const borderStyle = isDragging 
    ? 'border-indigo-500 ring-4 ring-indigo-500/30' 
    : 'border-gray-600 hover:border-indigo-500';

  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700/50">
      {previewUrl ? (
        <div className="relative group">
           <p className="text-lg font-semibold text-center mb-4">Your Uploaded Drafting</p>
          <div className="w-full aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
            <img src={previewUrl} alt="Drafting preview" className="max-w-full max-h-full object-contain" />
          </div>
          {!isLoading && (
            <button
                onClick={handleClear}
                className="absolute top-2 right-2 bg-gray-900/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"
                aria-label="Clear image"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
          )}
        </div>
      ) : (
        <div
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          className={`relative border-2 border-dashed ${borderStyle} rounded-xl p-8 text-center transition-all duration-300 ease-in-out cursor-pointer`}
        >
          <input
            type="file"
            id="file-upload"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => handleFileSelect(e.target.files)}
            accept="image/png, image/jpeg, image/webp"
          />
          <label htmlFor="file-upload" className="flex flex-col items-center justify-center space-y-4 cursor-pointer">
             <UploadIcon />
            <p className="text-gray-300">
              <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, or WEBP</p>
          </label>
        </div>
      )}
    </div>
  );
};
