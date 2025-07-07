
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';

const SmartFilters = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['category', 'price']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const filterSections = [
    {
      id: 'category',
      title: 'Category',
      options: ['Outerwear', 'Tops', 'Bottoms', 'Accessories', 'Shoes'],
    },
    {
      id: 'style',
      title: 'Style',
      options: ['Urban', 'Minimal', 'Streetwear', 'Classic', 'Vintage'],
    },
    {
      id: 'material',
      title: 'Material',
      options: ['Cotton', 'Wool', 'Leather', 'Denim', 'Synthetic'],
    },
    {
      id: 'price',
      title: 'Price Range',
      options: ['Under $50', '$50-$100', '$100-$200', '$200+'],
    },
    {
      id: 'color',
      title: 'Color',
      options: ['Black', 'White', 'Blue', 'Red', 'Brown'],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">Smart Filters</h3>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 mb-4">
        <h4 className="font-medium text-gray-800 mb-3">Match Score</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Minimum similarity</span>
            <span>80%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            defaultValue="80"
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>
      
      <div className="space-y-3">
        {filterSections.map((section) => {
          const isExpanded = expandedSections.includes(section.id);
          return (
            <div key={section.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-800">{section.title}</span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                )}
              </button>
              
              {isExpanded && (
                <div className="px-4 pb-4 space-y-2">
                  {section.options.map((option, index) => (
                    <label key={index} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-800">Availability</h4>
        </div>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
            <span className="text-sm text-gray-700">Online only</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
            <span className="text-sm text-gray-700">Nearby stores</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SmartFilters;
