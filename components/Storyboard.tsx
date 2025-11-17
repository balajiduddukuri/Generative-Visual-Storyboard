import React from 'react';
import SceneCard from './SceneCard';
import type { Scene } from '../types';

interface StoryboardProps {
  scenes: Scene[];
  onDescriptionChange: (description: string, index: number) => void;
  onGenerateImage: (index: number, modelName: 'gemini-2.5-flash-image' | 'imagen-4.0-generate-001') => void;
}

const Storyboard: React.FC<StoryboardProps> = ({ scenes, onDescriptionChange, onGenerateImage }) => {
  if (!scenes || scenes.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-12">
      {scenes.map((scene, index) => (
        <SceneCard 
            key={index} 
            scene={scene} 
            sceneNumber={index + 1}
            onDescriptionChange={(newDesc) => onDescriptionChange(newDesc, index)}
            onGenerateImage={(modelName) => onGenerateImage(index, modelName)}
        />
      ))}
    </div>
  );
};

export default Storyboard;