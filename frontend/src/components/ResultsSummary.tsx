
import React from 'react';
import { Check, Share, Search, Bookmark } from 'lucide-react';

const ResultsSummary = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Search Summary</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center justify-center space-x-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">6 product matches found</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">3 local stores available</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Matching styles: Urban, Minimal</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2">
            <Bookmark className="w-4 h-4" />
            <span>Save Search</span>
          </button>
          
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2">
            <Share className="w-4 h-4" />
            <span>Share Results</span>
          </button>
          
          <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2">
            <Search className="w-4 h-4" />
            <span>New Search</span>
          </button>
        </div>
        
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
          <div className="text-center">
            <h3 className="font-semibold text-gray-800 mb-2">AI Powered Results ✨</h3>
            <p className="text-sm text-gray-600">
              Our AI analyzed your preferences, current trends, and local availability to find the perfect matches. 
              Results are personalized based on your style profile and search history.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsSummary;
