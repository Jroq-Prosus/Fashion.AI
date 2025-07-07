
import React from 'react';
import { Lightbulb, TrendingUp, Palette } from 'lucide-react';

interface ProductContextProps {
  query: string;
}

const ProductContext = ({ query }: ProductContextProps) => {
  const insights = [
    {
      icon: Lightbulb,
      title: 'Why Recommended',
      content: 'These items match your uploaded image style and current winter trends.',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      icon: TrendingUp,
      title: 'Trend Analysis',
      content: 'Urban minimalist styles are trending 15% higher this season.',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      icon: Palette,
      title: 'Style Match',
      content: 'Textures and materials align with your preference for premium fabrics.',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Insights</h3>
      
      {insights.map((insight, index) => {
        const Icon = insight.icon;
        return (
          <div key={index} className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${insight.bg}`}>
                <Icon className={`w-4 h-4 ${insight.color}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 mb-1">{insight.title}</h4>
                <p className="text-sm text-gray-600">{insight.content}</p>
              </div>
            </div>
          </div>
        );
      })}
      
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
        <h4 className="font-medium text-gray-800 mb-2">Confidence Score</h4>
        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-gray-200 rounded-full h-3">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full" style={{ width: '92%' }} />
          </div>
          <span className="text-sm font-medium text-gray-800">92%</span>
        </div>
        <p className="text-xs text-gray-600 mt-2">High confidence in style matching</p>
      </div>
    </div>
  );
};

export default ProductContext;
