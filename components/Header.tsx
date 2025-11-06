
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl md:text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
          2D Drafting to 3D Image Generator
        </h1>
        <p className="text-center text-sm text-gray-500 mt-1">Powered by Gemini</p>
      </div>
    </header>
  );
};
