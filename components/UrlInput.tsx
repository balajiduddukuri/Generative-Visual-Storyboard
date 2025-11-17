import React from 'react';

interface UrlInputProps {
  url: string;
  onUrlChange: (url: string) => void;
  urlError: string | null;
  numScenes: number;
  setNumScenes: (num: number) => void;
  artStyle: string;
  setArtStyle: (style: string) => void;
  imageEngine: 'gemini-2.5-flash-image' | 'imagen-4.0-generate-001';
  setImageEngine: (engine: 'gemini-2.5-flash-image' | 'imagen-4.0-generate-001') => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const UrlInput: React.FC<UrlInputProps> = ({ 
  url, onUrlChange, urlError, 
  numScenes, setNumScenes, 
  artStyle, setArtStyle, 
  imageEngine, setImageEngine,
  onSubmit, isLoading 
}) => {
  
  const artStyles = ['Cinematic', 'Photorealistic', 'Anime', 'Watercolor', 'Cyberpunk', 'Fantasy', 'Minimalist'];
  const sceneOptions = Array.from({ length: 11 }, (_, i) => i + 2); // Creates an array [2, 3, ..., 12]

  return (
    <div className="flex flex-col gap-3 w-full max-w-5xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-3 items-start">
          <div className="w-full lg:flex-grow">
            <input
                type="url"
                value={url}
                onChange={(e) => onUrlChange(e.target.value)}
                placeholder="e.g., https://en.wikipedia.org/wiki/Dune_(novel)"
                className={`w-full bg-slate-800 text-slate-200 border rounded-lg px-4 py-3 focus:ring-2 focus:outline-none transition duration-200 disabled:opacity-50 ${urlError ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-indigo-500'}`}
                disabled={isLoading}
                aria-label="Wikipedia URL"
                aria-invalid={!!urlError}
                aria-describedby="url-error"
            />
            {urlError && <p id="url-error" className="text-red-400 text-sm mt-2">{urlError}</p>}
          </div>
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center justify-center gap-3 flex-shrink-0">
              {/* This is a container for all dropdowns */}
          </div>
          <button
            onClick={onSubmit}
            disabled={isLoading || !url || !!urlError}
            className="w-full lg:w-auto flex-shrink-0 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center"
          >
            Generate Storyboard
          </button>
      </div>
       {/* Moved dropdowns below the main input for better responsive layout */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="w-full flex items-center gap-2">
                  <label htmlFor="art-style" className="text-slate-400 font-medium whitespace-nowrap">
                  Style:
                  </label>
                  <select
                      id="art-style"
                      value={artStyle}
                      onChange={(e) => setArtStyle(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-slate-800 text-slate-200 border border-slate-600 rounded-lg pl-3 pr-8 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-200 disabled:opacity-50 appearance-none bg-no-repeat bg-right-2"
                      style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`}}
                  >
                      {artStyles.map(style => <option key={style} value={style}>{style}</option>)}
                  </select>
            </div>
            <div className="w-full flex items-center gap-2">
                  <label htmlFor="num-scenes" className="text-slate-400 font-medium whitespace-nowrap">
                  Scenes:
                  </label>
                  <select
                      id="num-scenes"
                      value={numScenes}
                      onChange={(e) => setNumScenes(parseInt(e.target.value, 10))}
                      disabled={isLoading}
                      className="w-full bg-slate-800 text-slate-200 border border-slate-600 rounded-lg pl-3 pr-8 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-200 disabled:opacity-50 appearance-none bg-no-repeat bg-right-2"
                      style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`}}
                      aria-label="Number of scenes"
                  >
                      {sceneOptions.map(num => <option key={num} value={num}>{num}</option>)}
                  </select>
            </div>
             <div className="w-full flex items-center gap-2">
                  <label htmlFor="image-engine" className="text-slate-400 font-medium whitespace-nowrap">
                  Engine:
                  </label>
                  <select
                      id="image-engine"
                      value={imageEngine}
                      onChange={(e) => setImageEngine(e.target.value as any)}
                      disabled={isLoading}
                      className="w-full bg-slate-800 text-slate-200 border border-slate-600 rounded-lg pl-3 pr-8 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-200 disabled:opacity-50 appearance-none bg-no-repeat bg-right-2"
                      style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`}}
                      aria-label="Image generation engine"
                  >
                      <option value="gemini-2.5-flash-image">Gemini Flash</option>
                      <option value="imagen-4.0-generate-001">Imagen 4</option>
                  </select>
            </div>
      </div>
    </div>
  );
};

export default UrlInput;