
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6 text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
        Generative Visual Storyboard
      </h1>
      <p className="text-slate-400 mt-2 text-lg">
        Transform any Wikipedia article into a cinematic storyboard.
      </p>
    </header>
  );
};

export default Header;
