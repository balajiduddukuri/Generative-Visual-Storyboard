import React, { useState, useEffect } from 'react';

interface TrendingPagesProps {
  onSelect: (title: string) => void;
}

interface TrendingArticle {
  article: string;
  views: number;
}

const TrendingPages: React.FC<TrendingPagesProps> = ({ onSelect }) => {
  const [articles, setArticles] = useState<TrendingArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const year = yesterday.getFullYear();
        const month = (yesterday.getMonth() + 1).toString().padStart(2, '0');
        const day = yesterday.getDate().toString().padStart(2, '0');
        
        const response = await fetch(`https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/${year}/${month}/${day}`);
        if (!response.ok) {
          throw new Error('Failed to fetch trending pages.');
        }
        const data = await response.json();
        const trendingArticles = data.items[0].articles
          .filter((article: any) => article.article !== 'Main_Page' && !article.article.startsWith('Special:'))
          .slice(0, 10);
        setArticles(trendingArticles);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center p-8 flex-1">
        <div className="w-8 h-8 border-2 border-slate-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-400 mt-3">Loading trending articles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-lg text-center flex-1 my-4">
        <p>Could not load trending articles: {error}</p>
      </div>
    );
  }
  
  return (
    <div className="w-full my-6 bg-slate-800/50 rounded-lg p-6 border border-slate-700 flex-1">
      <h2 className="text-2xl font-bold text-center text-slate-200 mb-4">Trending on Wikipedia</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {articles.map((article) => (
          <li key={article.article}>
            <button
              onClick={() => onSelect(article.article)}
              className="text-left w-full text-indigo-400 hover:text-indigo-300 hover:bg-slate-700/50 rounded-md p-2 transition-colors duration-200 flex justify-between items-center"
              title={article.article.replace(/_/g, ' ')}
            >
              <span className="truncate">{article.article.replace(/_/g, ' ')}</span>
              <span className="text-slate-500 text-sm font-mono ml-4 flex-shrink-0">
                {article.views.toLocaleString()} hits
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrendingPages;