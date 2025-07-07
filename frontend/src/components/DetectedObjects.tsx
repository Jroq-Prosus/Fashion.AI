
import React from 'react';
import { Search as SearchIcon } from 'lucide-react';

interface DetectedObjectsProps {
  image: string;
}

const DetectedObjects = ({ image }: DetectedObjectsProps) => {
  const detectedItems = [
    { id: 1, label: 'Red Sneakers', confidence: 95, x: 30, y: 60, w: 25, h: 20 },
    { id: 2, label: 'Denim Jacket', confidence: 88, x: 25, y: 20, w: 30, h: 35 },
    { id: 3, label: 'Black Bag', confidence: 92, x: 15, y: 45, w: 15, h: 18 },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Detected Fashion Items</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="relative">
            <img 
              src={image} 
              alt="Uploaded fashion" 
              className="w-full rounded-2xl shadow-lg"
            />
            {detectedItems.map((item) => (
              <div
                key={item.id}
                className="absolute border-2 border-purple-500 bg-purple-500/20 rounded"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  width: `${item.w}%`,
                  height: `${item.h}%`,
                }}
              >
                <div className="absolute -top-8 left-0 bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                  {item.label} ({item.confidence}%)
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Found Items</h3>
            {detectedItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-4 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">{item.label}</h4>
                  <span className="text-sm text-gray-500">{item.confidence}% match</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="w-full bg-gray-200 rounded-full h-2 mr-4">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                      style={{ width: `${item.confidence}%` }}
                    />
                  </div>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
                    <SearchIcon className="w-4 h-4" />
                    <span>Find Matches</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetectedObjects;
