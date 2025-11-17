import React, { useState, useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Header from './components/Header';
import UrlInput from './components/UrlInput';
import Storyboard from './components/Storyboard';
import LoadingSpinner from './components/LoadingSpinner';
import TrendingPages from './components/TrendingPages';
import TrendingTweets from './components/TrendingTweets';
import LogPanel from './components/LogPanel';
import { generateSceneDescriptions, generateImageForScene } from './services/geminiService';
import type { Scene, LogEntry } from './types';

const App: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [numScenes, setNumScenes] = useState<number>(6);
  const [artStyle, setArtStyle] = useState<string>('Cinematic');
  const [imageEngine, setImageEngine] = useState<'gemini-2.5-flash-image' | 'imagen-4.0-generate-001'>('gemini-2.5-flash-image');
  const [storyboard, setStoryboard] = useState<Scene[] | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showLogs, setShowLogs] = useState<boolean>(false);

  const isLoading = loadingMessage !== null;

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  }, []);

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    
    if (!newUrl) {
      setUrlError('URL cannot be empty.');
      return;
    }
    try {
      const parsedUrl = new URL(newUrl);
      if (parsedUrl.hostname !== 'en.wikipedia.org') {
        setUrlError('URL must be from en.wikipedia.org.');
        return;
      }
    } catch (_) {
      setUrlError('Please enter a valid URL.');
      return;
    }
    setUrlError(null);
  };

  const handleGenerateImage = useCallback(async (
    sceneIndex: number, 
    modelName: 'gemini-2.5-flash-image' | 'imagen-4.0-generate-001'
    ) => {
    let sceneDescription = '';
    
    setStoryboard(current => {
      if (!current) return null;
      sceneDescription = current[sceneIndex].description;
      const newStoryboard = [...current];
      newStoryboard[sceneIndex] = { ...newStoryboard[sceneIndex], isGenerating: true, error: false };
      return newStoryboard;
    });

    if (!sceneDescription || sceneDescription.startsWith('[AI failed')) {
      addLog(`Scene ${sceneIndex + 1} description is empty or a placeholder. Skipping image generation.`, 'error');
      setStoryboard(current => {
        if (!current) return null;
        const newStoryboard = [...current];
        newStoryboard[sceneIndex] = { ...newStoryboard[sceneIndex], isGenerating: false };
        return newStoryboard;
      });
      return;
    }

    addLog(`Generating image for scene ${sceneIndex + 1} using ${modelName}...`);
    try {
      const imageUrl = await generateImageForScene(sceneDescription, artStyle, modelName);
      addLog(`Successfully generated image for scene ${sceneIndex + 1}.`, 'success');
      setStoryboard(current => {
        if (!current) return null;
        const newStoryboard = [...current];
        newStoryboard[sceneIndex] = { ...newStoryboard[sceneIndex], imageUrl, isGenerating: false };
        return newStoryboard;
      });
    } catch (err) {
      let message = `Image Generation Error: An unexpected issue occurred for Scene ${sceneIndex + 1}.`;
      if (err instanceof Error) {
        if (err.message.toLowerCase().includes('blocked')) {
          message = `Image Generation Blocked (Scene ${sceneIndex + 1}): The description may have violated safety policies. Please revise the text and try again.`;
        } else {
          message = `Image Generation Error (Scene ${sceneIndex + 1}): ${err.message}.`;
        }
      }
      addLog(message, 'error');
      setError(message);
      setStoryboard(current => {
        if (!current) return null;
        const newStoryboard = [...current];
        newStoryboard[sceneIndex] = { ...newStoryboard[sceneIndex], error: true, isGenerating: false };
        return newStoryboard;
      });
    }
  }, [artStyle, addLog]);

  const handleGenerate = useCallback(async () => {
    setStoryboard(null);
    setError(null);
    setLoadingMessage("Initiating storyboard generation...");
    addLog('Starting storyboard generation...', 'info');

    try {
      addLog(`Fetching content from ${url}`, 'info');
      const descriptions = await generateSceneDescriptions(url, numScenes, (progress) => addLog(progress, 'info'));
      addLog(`Generated ${descriptions.length} scene descriptions.`, 'success');
      
      const initialScenes = descriptions.map(desc => ({
        description: desc,
        imageUrl: undefined,
        error: false,
        isGenerating: false,
      }));
      setStoryboard(initialScenes);
      setLoadingMessage(null);

      addLog(`Starting automatic image generation for all scenes using ${imageEngine}...`);
      for (let i = 0; i < initialScenes.length; i++) {
        // Initial generation uses the default model selected by the user
        await handleGenerateImage(i, imageEngine);
      }
      addLog('Initial image generation pass complete!', 'success');
    } catch (err) {
      let message = "An unexpected error occurred while generating the storyboard.";
      if (err instanceof Error) {
        message = `AI Generation Error: ${err.message}. Please check the URL and try again.`;
      }
      addLog(message, 'error');
      setError(message);
      setLoadingMessage(null);
    }
  }, [url, numScenes, imageEngine, handleGenerateImage, addLog]);

  const handleDescriptionChange = (newDescription: string, index: number) => {
    setStoryboard(current => {
      if (!current) return null;
      const newStoryboard = [...current];
      newStoryboard[index] = { ...newStoryboard[index], description: newDescription };
      return newStoryboard;
    });
  };

  const handleExportToPdf = async () => {
    addLog('Starting PDF export...', 'info');
    const sceneCards = Array.from(document.querySelectorAll<HTMLElement>('[data-scene-card]'));
    if (sceneCards.length === 0) {
      const msg = "No scenes found to export.";
      addLog(msg, 'error');
      setError(msg);
      return;
    }
    
    setIsExporting(true);
    setError(null);

    try {
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      for (let i = 0; i < sceneCards.length; i++) {
        const card = sceneCards[i];
        const canvas = await html2canvas(card, { scale: 2, backgroundColor: '#1e293b' });
        if (i > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, 277, 155.8);
      }
      const wikiTitle = url.split('/').pop()?.replace(/_/g, '-') || 'storyboard';
      pdf.save(`${wikiTitle}.pdf`);
      addLog('PDF exported successfully.', 'success');
    } catch (err) {
      let message = "PDF Export Error: Could not generate the PDF file.";
      if (err instanceof Error) message += ` Details: ${err.message}`;
      addLog(message, 'error');
      setError(message);
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleTrendingSelect = (pageTitle: string) => {
    const pageUrl = `https://en.wikipedia.org/wiki/${pageTitle}`;
    addLog(`Selected Wikipedia trend: "${pageTitle}"`, 'info');
    setUrl(pageUrl);
    setUrlError(null);
  };

  const handleTrendingTweetSelect = (topic: string) => {
    const pageUrl = `https://en.wikipedia.org/wiki/${topic.replace(/ /g, '_')}`;
    addLog(`Selected Twitter trend: "${topic}"`, 'info');
    setUrl(pageUrl);
    setUrlError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <Header />
           <button 
              onClick={() => setShowLogs(prev => !prev)}
              className="mt-4 bg-slate-700 hover:bg-slate-600 text-slate-300 font-mono text-xs px-3 py-2 rounded-md transition-colors"
              title="Toggle Activity Log"
            >
              {showLogs ? 'Hide Log' : 'Show Log'}
            </button>
        </div>
        
        <div className="mt-8">
          <UrlInput 
            url={url} onUrlChange={handleUrlChange} urlError={urlError}
            numScenes={numScenes} setNumScenes={setNumScenes}
            artStyle={artStyle} setArtStyle={setArtStyle}
            imageEngine={imageEngine} setImageEngine={setImageEngine}
            onSubmit={handleGenerate} isLoading={isLoading}
          />
        </div>

        <div className="mt-12">
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <LoadingSpinner />
              <p className="text-slate-300 text-lg animate-pulse">{loadingMessage}</p>
              <p className="text-slate-500 text-sm">This may take a minute or two, please be patient.</p>
            </div>
          )}

          {error && (
             <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg max-w-3xl mx-auto my-4 text-left">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-bold text-red-200">An Error Occurred</h4>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{error}</p>
                    {error.toLowerCase().includes('image generation') && (
                        <p className="text-sm mt-2 text-red-400/80">
                            You can edit the scene description and click the 'Regenerate Image' button on the specific card to try again.
                        </p>
                    )}
                  </div>
                </div>
              </div>
          )}
          
          {storyboard && <Storyboard scenes={storyboard} onDescriptionChange={handleDescriptionChange} onGenerateImage={handleGenerateImage} />}

          {storyboard && !isLoading && (
            <div className="text-center mt-8 md:mt-12">
              <button onClick={handleExportToPdf} disabled={isExporting} className="bg-emerald-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center mx-auto">
                {isExporting ? (<><LoadingSpinner /><span className="ml-3">Exporting...</span></>) : 'Export to PDF'}
              </button>
            </div>
          )}

          {!isLoading && !storyboard && !error && (
            <>
              <div className="flex flex-col md:flex-row gap-6 lg:gap-8 justify-center max-w-6xl mx-auto">
                <TrendingPages onSelect={handleTrendingSelect} />
                <TrendingTweets onSelect={handleTrendingTweetSelect} />
              </div>
              <div className="text-center text-slate-500 mt-8">
                <p>Select a trending topic or enter a Wikipedia URL above to begin.</p>
              </div>
            </>
          )}

        </div>
      </main>
      {showLogs && <LogPanel logs={logs} onClear={() => setLogs([])} />}
    </div>
  );
};

export default App;