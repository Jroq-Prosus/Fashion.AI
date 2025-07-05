import React from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, Eye, Sparkles, TrendingUp } from 'lucide-react';
import { SearchResult, SearchMode } from '../App';

interface ResultsDisplayProps {
  results: SearchResult[];
  uploadedImage?: string | null;
  searchMode: SearchMode;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results,
  uploadedImage,
  searchMode
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12"
    >
      {/* Results Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              AI Style Matches
            </h2>
            <p className="text-gray-600">
              {results.length} personalized recommendations based on your {searchMode}
            </p>
          </div>
        </div>
        
        {uploadedImage && (
          <div className="bg-white rounded-lg p-4 border border-gray-200 inline-block">
            <p className="text-sm text-gray-600 mb-2">Your reference image:</p>
            <img
              src={uploadedImage}
              alt="Your style reference"
              className="w-24 h-24 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      {/* AI Analysis Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 border border-blue-100"
      >
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Style Analysis</h3>
            <p className="text-gray-700 leading-relaxed">
              Based on your input, I've detected a preference for {searchMode === 'image' ? 'sophisticated and elegant pieces' : 'casual yet refined fashion'}. 
              The AI identified key style elements including color harmony, pattern matching, and current trend alignment. 
              These recommendations are curated to complement your existing style while introducing fresh, on-trend pieces.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Results Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result, index) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ y: -8 }}
            className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
          >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden">
              <img
                src={result.image}
                alt={result.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              
              {/* Match Percentage */}
              <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {result.match}% Match
              </div>
              
              {/* Quick Actions */}
              <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                </button>
                <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              {/* Category Badge */}
              <div className="absolute bottom-4 left-4">
                <span className="bg-white/90 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                  {result.category}
                </span>
              </div>
            </div>
            
            {/* Product Details */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">
                  {result.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ${result.price}
                  </span>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600">(4.2)</span>
                  </div>
                </div>
              </div>
              
              {/* AI Style Analysis */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700 font-medium mb-1">AI Style Insight:</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {result.styleAnalysis}
                </p>
              </div>
              
              {/* Detected Items */}
              <div className="flex flex-wrap gap-2">
                {result.detectedItems.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
              
              {/* Add to Cart Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-gray-800 hover:to-gray-600 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Show More Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center mt-12"
      >
        <button className="px-8 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-300">
          Show More Results
        </button>
      </motion.div>
    </motion.div>
  );
};

export default ResultsDisplay;