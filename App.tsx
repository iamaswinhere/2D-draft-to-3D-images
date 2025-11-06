import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ResultGallery } from './components/ResultGallery';
import { ViewSelector } from './components/ViewSelector';
import { PromptInput } from './components/PromptInput';
import { generate3DViews } from './services/geminiService';
import type { GeneratedImage, View } from './types';
import { VIEWS } from './constants';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedViews, setSelectedViews] = useState<View[]>(VIEWS.slice());
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [loadingViews, setLoadingViews] = useState<Record<View, boolean>>({});

  const resetState = () => {
    setFile(null);
    setPreviewUrl(null);
    setGeneratedImages([]);
    setError(null);
    setIsLoading(false);
    setLoadingViews({});
    setSelectedViews(VIEWS.slice());
    setAdditionalPrompt('');
  };

  const handleFileChange = (selectedFile: File | null) => {
    resetState();
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  const handleViewSelectionChange = (view: View, isSelected: boolean) => {
    setSelectedViews(prev => {
      if (isSelected) {
        // Add view and maintain original order
        const newViews = [...prev, view];
        return VIEWS.filter(v => newViews.includes(v));
      } else {
        return prev.filter(v => v !== view);
      }
    });
  };

  const handleGenerate = useCallback(async () => {
    if (!file || selectedViews.length === 0) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);
    
    const initialLoadingState = selectedViews.reduce((acc, view) => {
        acc[view] = true;
        return acc;
    }, {} as Record<View, boolean>);
    setLoadingViews(initialLoadingState);

    try {
      const onViewGenerated = (image: GeneratedImage) => {
        setGeneratedImages(prev => [...prev, image]);
        setLoadingViews(prev => ({...prev, [image.view]: false}));
      };

      await generate3DViews(file, onViewGenerated, selectedViews, additionalPrompt);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingViews({});
    }
  }, [file, selectedViews, additionalPrompt]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-lg md:text-xl text-gray-400 mb-8">
            Upload a 2D technical drawing or blueprint, and our AI will generate stunning 3D renderings from multiple perspectives.
          </p>
          
          <ImageUploader 
            onFileChange={handleFileChange} 
            previewUrl={previewUrl}
            isLoading={isLoading}
          />
          
          {previewUrl && !isLoading && generatedImages.length === 0 && (
            <>
              <PromptInput
                value={additionalPrompt}
                onChange={setAdditionalPrompt}
                disabled={isLoading}
              />
              <ViewSelector
                allViews={VIEWS}
                selectedViews={selectedViews}
                onSelectionChange={handleViewSelectionChange}
                disabled={isLoading}
              />
            </>
          )}

          {error && (
            <div className="mt-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
              <p><strong>Error:</strong> {error}</p>
            </div>
          )}

          {previewUrl && !isLoading && generatedImages.length === 0 && (
            <div className="text-center mt-6">
              <button
                onClick={handleGenerate}
                disabled={isLoading || selectedViews.length === 0}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:scale-100 disabled:opacity-50"
              >
                {selectedViews.length > 0 ? `Generate ${selectedViews.length} View(s)` : 'Select a View to Generate'}
              </button>
            </div>
          )}

          {(isLoading || generatedImages.length > 0) && (
             <ResultGallery 
              generatedImages={generatedImages}
              loadingViews={loadingViews}
              initialViews={selectedViews}
             />
          )}

        </div>
      </main>
    </div>
  );
};

export default App;