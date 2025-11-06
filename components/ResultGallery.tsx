import React from 'react';
import type { GeneratedImage, View } from '../types';

interface ResultGalleryProps {
  generatedImages: GeneratedImage[];
  loadingViews: Record<View, boolean>;
  initialViews: View[];
}

const SkeletonCard: React.FC<{ view: string }> = ({ view }) => (
    <div className="bg-gray-800 rounded-xl shadow-lg animate-pulse">
        <div className="w-full aspect-square bg-gray-700 rounded-t-xl"></div>
        <div className="p-4">
            <div className="h-6 bg-gray-700 rounded w-3/4"></div>
        </div>
    </div>
);

const ImageCard: React.FC<{ image: GeneratedImage }> = ({ image }) => {
    const handleDownload = () => {
      const link = document.createElement('a');
      link.href = image.imageUrl;
      // Sanitize the view name for the filename
      const fileName = `${image.view.toLowerCase().replace(/\s/g, '-')}-view.png`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-indigo-500/20 hover:scale-105">
            <div className="relative w-full aspect-square bg-black overflow-hidden">
                <img 
                    src={image.imageUrl} 
                    alt={`${image.view} view`} 
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                />
                 <button
                    onClick={handleDownload}
                    className="absolute top-2 right-2 bg-gray-900/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm hover:bg-indigo-600/70"
                    aria-label={`Download ${image.view} view`}
                    title={`Download ${image.view} view`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </button>
            </div>
            <div className="p-4 bg-gray-800/50">
                <h3 className="text-lg font-semibold text-center text-gray-200">{image.view} View</h3>
            </div>
        </div>
    );
};


export const ResultGallery: React.FC<ResultGalleryProps> = ({ generatedImages, loadingViews, initialViews }) => {
    const imagesMap = new Map(generatedImages.map(img => [img.view, img]));

    return (
        <div className="mt-12">
            <h2 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-cyan-300">Generated 3D Views</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {initialViews.map(view => {
                    const image = imagesMap.get(view);
                    if (image) {
                        return <ImageCard key={view} image={image} />;
                    }
                    if (loadingViews[view]) {
                        return <SkeletonCard key={view} view={view} />;
                    }
                    return null;
                })}
            </div>
        </div>
    );
};
