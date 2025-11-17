import React from 'react';

interface TrendingTweetsProps {
  onSelect: (topic: string) => void;
}

const curatedTrends = [
  { topic: "NASA's Artemis Program", posts: 985_234 },
  { topic: "Latest breakthroughs in AI", posts: 876_543 },
  { topic: "Global Climate Change Summit", posts: 765_432 },
  { topic: "Discoveries in Deep Sea Exploration", posts: 654_321 },
  { topic: "Future of Electric Vehicles", posts: 543_210 },
  { topic: "Advancements in Quantum Computing", posts: 432_109 },
  { topic: "The Rise of Vertical Farming", posts: 321_098 },
  { topic: "Exploring the Human Genome", posts: 210_987 },
  { topic: "The History of Ancient Rome", posts: 109_876 },
  { topic: "The Silk Road's historical impact", posts: 98_765 },
];


const TrendingTweets: React.FC<TrendingTweetsProps> = ({ onSelect }) => {
  return (
    <div className="w-full my-6 bg-slate-800/50 rounded-lg p-6 border border-slate-700 flex-1">
      <h2 className="text-2xl font-bold text-center text-slate-200 mb-4">Trending on Twitter</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {curatedTrends.map((trend) => (
          <li key={trend.topic}>
            <button
              onClick={() => onSelect(trend.topic)}
              className="text-left w-full text-indigo-400 hover:text-indigo-300 hover:bg-slate-700/50 rounded-md p-2 transition-colors duration-200 flex justify-between items-center"
              title={trend.topic}
            >
              <span className="truncate">{trend.topic}</span>
              <span className="text-slate-500 text-sm font-mono ml-4 flex-shrink-0">
                {trend.posts.toLocaleString()} posts
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrendingTweets;