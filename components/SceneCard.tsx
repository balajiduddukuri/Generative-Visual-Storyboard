import React, { useState, useEffect } from 'react';
import type { Scene } from '../types';

interface SceneCardProps {
  scene: Scene;
  sceneNumber: number;
  onDescriptionChange: (newDescription: string) => void;
  onGenerateImage: (modelName: 'gemini-2.5-flash-image' | 'imagen-4.0-generate-001') => void;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene, sceneNumber, onDescriptionChange, onGenerateImage }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageEngine, setImageEngine] = useState<'gemini-2.5-flash-image' | 'imagen-4.0-generate-001'>('gemini-2.5-flash-image');

  useEffect(() => {
    // Reset loaded state when the image URL changes
    setIsImageLoaded(false);
  }, [scene.imageUrl]);


  return (
    <div 
      className="bg-slate-800 rounded-lg overflow-hidden shadow-lg flex flex-col transition-all duration-300"
      data-scene-card="true"
    >
      <div className="aspect-video bg-slate-700/50 relative flex items-center justify-center">
        {scene.isGenerating ? (
           <div className="text-center p-4">
              <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-400 mx-auto"></div>
              <p className="mt-3 text-sm text-slate-400 animate-pulse">Generating image...</p>
           </div>
        ) : scene.error ? (
          <div className="text-center p-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-2 text-sm text-slate-400">Image generation failed.</p>
          </div>
        ) : scene.imageUrl ? (
          <>
            {!isImageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-8 h-8 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <img
              src={scene.imageUrl}
              alt={`Scene ${sceneNumber}`}
              className={`w-full h-full object-cover transition-opacity duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setIsImageLoaded(true)}
              onError={() => setIsImageLoaded(false)}
            />
          </>
        ) : (
            <div className="text-center p-4 text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-sm">Image not generated</p>
            </div>
        )}
      </div>
      <div className="p-4 md:p-6 flex-grow flex flex-col">
        <h3 className="text-lg font-semibold text-indigo-400 mb-2">Scene {sceneNumber}</h3>
        <textarea
            className="w-full flex-grow bg-slate-800 text-slate-300 text-sm leading-relaxed p-2 border border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none transition resize-none disabled:opacity-70"
            value={scene.description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={5}
            disabled={scene.isGenerating}
            aria-label={`Description for scene ${sceneNumber}`}
        />
        <div className="mt-4">
          <label htmlFor={`engine-select-${sceneNumber}`} className="block text-xs font-medium text-slate-400 mb-1">
            Image Engine
          </label>
          <select
            id={`engine-select-${sceneNumber}`}
            value={imageEngine}
            onChange={(e) => setImageEngine(e.target.value as any)}
            disabled={scene.isGenerating}
            className="w-full bg-slate-700 text-slate-200 border border-slate-600 rounded-lg pl-3 pr-8 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-200 disabled:opacity-50 appearance-none bg-no-repeat bg-right-2"
            style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`}}
          >
            <option value="gemini-2.5-flash-image">Gemini Flash Image</option>
            <option value="imagen-4.0-generate-001">Imagen 4</option>
          </select>
        </div>
        <button
            onClick={() => onGenerateImage(imageEngine)}
            disabled={scene.isGenerating || !scene.description.trim() || scene.description.startsWith('[AI failed')}
            className="mt-4 bg-indigo-600 text-white font-semibold px-4 py-2 text-sm rounded-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center w-full"
        >
            {scene.isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
              ) : (scene.imageUrl ? 'Regenerate Image' : 'Generate Image')}
        </button>
      </div>
    </div>
  );
};

export default SceneCard;